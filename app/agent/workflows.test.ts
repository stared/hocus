import type { PrebuildEvent, Prisma } from "@prisma/client";
import { WorkspaceStatus } from "@prisma/client";
import { PrebuildEventStatus, VmTaskStatus } from "@prisma/client";
import { SshKeyPairType } from "@prisma/client";
import { TestWorkflowEnvironment } from "@temporalio/testing";
import type { LogEntry } from "@temporalio/worker";
import { Worker, Runtime, DefaultLogger } from "@temporalio/worker";
import { v4 as uuidv4 } from "uuid";
import { config } from "~/config";
import { generateTemporalCodeBundle } from "~/temporal/bundle";
import { printErrors } from "~/test-utils";
import { TESTS_PRIVATE_SSH_KEY, TESTS_REPO_URL } from "~/test-utils/constants";
import { provideDb } from "~/test-utils/db.server";
import { Token } from "~/token";
import { TEST_USER_PRIVATE_SSH_KEY } from "~/user/test-constants";
import { createTestUser } from "~/user/test-utils";
import { groupBy, unwrap, waitForPromises, formatBranchName } from "~/utils.shared";

import type { Activities } from "./activities/list";
import { createActivities } from "./activities/list";
import type { AgentInjector } from "./agent-injector";
import { createAgentInjector } from "./agent-injector";
import { HOST_PERSISTENT_DIR } from "./constants";
import { execSshCmdThroughProxy } from "./test-utils";
import { doesFileExist, retry, sleep } from "./utils";
import {
  runBuildfsAndPrebuilds,
  runAddProjectAndRepository,
  runCreateWorkspace,
  runStartWorkspace,
  runStopWorkspace,
  runDeleteWorkspace,
  runArchivePrebuild,
  runDeleteRemovablePrebuilds,
} from "./workflows";

const provideActivities = (
  testFn: (args: {
    activities: Activities;
    runId: string;
    db: Prisma.NonTransactionClient;
    injector: AgentInjector;
  }) => Promise<void>,
): (() => Promise<void>) => {
  const injector = createAgentInjector({
    [Token.Logger]: function () {
      return new DefaultLogger("ERROR");
    } as unknown as any,
    [Token.Config]: {
      ...config,
      agent: () => ({
        ...config.agent(),
        /**
         * It's a regular buildfs root fs but with docker cache.
         * I generated it manually, by executing a buildfs workflow
         * with the regular buildfs root fs and then copying the
         * resulting drive to the test-buildfs.ext4 file.
         * I also shrank it with `resize2fs -M`.
         * The tests will also work with a regular buildfs root fs,
         * but they will be slower.
         */
        // TODO: build it automatically in a Hocus prebuild
        // buildfsRootFs: "/srv/jailer/resources/test-buildfs.ext4",
      }),
    },
  });
  const runId = uuidv4();
  return printErrors(
    provideDb(async (db) =>
      testFn({ activities: await createActivities(injector, db), runId, db, injector }),
    ),
  );
};

let testEnv: TestWorkflowEnvironment;
let workflowBundle: any;

beforeAll(async () => {
  // Use console.log instead of console.error to avoid red output
  // Filter INFO log messages for clearer test output
  Runtime.install({
    logger: new DefaultLogger("WARN", (entry: LogEntry) => {
      const error = entry.meta?.error;
      const msg = "Workspace is not in WORKSPACE_STATUS_STOPPED state";
      if (error?.stack?.includes(msg) || error?.cause?.stack?.includes(msg)) {
        // there is a test case where we expect this error,
        // so in order not to pollute the test output with it,
        // we suppress it
        return;
      }

      // eslint-disable-next-line no-console
      console.log(`[${entry.level}]`, entry.message, entry.meta);
    }),
  });

  testEnv = await TestWorkflowEnvironment.createTimeSkipping({
    client: {
      dataConverter: {
        payloadConverterPath: require.resolve("~/temporal/data-converter"),
      },
    },
  });
  workflowBundle = await generateTemporalCodeBundle();
});

afterAll(async () => {
  await testEnv?.teardown();
});

test.concurrent("HOST_PERSISTENT_DIR has no trailing slash", async () => {
  expect(HOST_PERSISTENT_DIR).not.toMatch(/\/$/);
});

test.concurrent(
  "runBuildfsAndPrebuilds",
  provideActivities(async ({ activities, injector, db }) => {
    let isGetWorkspaceInstanceStatusMocked = true;
    const { client, nativeConnection } = testEnv;
    const worker = await Worker.create({
      connection: nativeConnection,
      taskQueue: "test",
      workflowsPath: require.resolve("./workflows"),
      activities: {
        ...activities,
        getWorkspaceInstanceStatus: async (workspaceInstanceId: bigint) => {
          if (isGetWorkspaceInstanceStatusMocked) {
            await sleep(100);
            return "on";
          } else {
            return activities.getWorkspaceInstanceStatus(workspaceInstanceId);
          }
        },
      },
      dataConverter: {
        payloadConverterPath: require.resolve("~/temporal/data-converter"),
      },
      workflowBundle,
    });

    const gitService = injector.resolve(Token.GitService);
    const agentGitService = injector.resolve(Token.AgentGitService);
    const projectService = injector.resolve(Token.ProjectService);
    const sshKeyService = injector.resolve(Token.SshKeyService);
    const pair = await sshKeyService.createSshKeyPair(
      db,
      TESTS_PRIVATE_SSH_KEY,
      SshKeyPairType.SSH_KEY_PAIR_TYPE_SERVER_CONTROLLED,
    );
    const repo = await db.$transaction((tdb) =>
      gitService.addGitRepository(tdb, TESTS_REPO_URL, pair.id),
    );
    const updates = await agentGitService.updateBranches(db, repo.id);
    const projects = await db.$transaction((tdb) =>
      waitForPromises(
        [
          { name: "test1", path: "/" },
          { name: "test2", path: "inner-project" },
        ].map(({ name, path }) =>
          projectService.createProject(tdb, {
            gitRepositoryId: repo.id,
            rootDirectoryPath: path,
            name: name,
          }),
        ),
      ),
    );
    const testBranchExpectedResults = [
      {
        testCases: [
          {
            project: projects[0],
            buildfsStatus: VmTaskStatus.VM_TASK_STATUS_SUCCESS,
            prebuildStatus: PrebuildEventStatus.PREBUILD_EVENT_STATUS_SUCCESS,
          },
          {
            project: projects[1],
            buildfsStatus: VmTaskStatus.VM_TASK_STATUS_SUCCESS,
            prebuildStatus: PrebuildEventStatus.PREBUILD_EVENT_STATUS_SUCCESS,
          },
        ],
      },
      {
        testCases: [
          {
            project: projects[0],
            buildfsStatus: VmTaskStatus.VM_TASK_STATUS_SUCCESS,
            prebuildStatus: PrebuildEventStatus.PREBUILD_EVENT_STATUS_ERROR,
          },
          {
            project: projects[1],
            buildfsStatus: null,
            prebuildStatus: PrebuildEventStatus.PREBUILD_EVENT_STATUS_SUCCESS,
          },
        ],
      },
      {
        testCases: [
          {
            project: projects[0],
            buildfsStatus: VmTaskStatus.VM_TASK_STATUS_ERROR,
            prebuildStatus: PrebuildEventStatus.PREBUILD_EVENT_STATUS_CANCELLED,
          },
          {
            project: projects[1],
            buildfsStatus: null,
            prebuildStatus: PrebuildEventStatus.PREBUILD_EVENT_STATUS_SUCCESS,
          },
        ],
      },
    ] as const;
    const testBranches = [
      "refs/heads/run-buildfs-and-prebuilds-test-1",
      "refs/heads/run-buildfs-and-prebuilds-test-2",
      "refs/heads/run-buildfs-and-prebuilds-test-3-error",
    ].map((name) => unwrap(updates.newGitBranches.find((b) => b.name === name)));
    await worker.runUntil(async () => {
      const branchesByGitObjectId = groupBy(
        testBranches,
        (b) => b.gitObjectId,
        (b) => b,
      );
      const git = Array.from(branchesByGitObjectId.entries()).map(([gitObjectId, branches]) => ({
        objectId: gitObjectId,
        branchIds: branches.map((b) => b.id),
      }));
      const prebuildEvents: PrebuildEvent[] = [];
      for (const p of projects) {
        const { created } = await activities.getOrCreatePrebuildEvents({
          projectId: p.id,
          git,
        });
        prebuildEvents.push(...created);
      }

      await client.workflow.execute(runBuildfsAndPrebuilds, {
        workflowId: uuidv4(),
        taskQueue: "test",
        retry: { maximumAttempts: 1 },
        args: [prebuildEvents.map((e) => e.id)],
      });

      for (const i of testBranches.keys()) {
        const branch = testBranches[i];
        for (const { project, buildfsStatus, prebuildStatus } of testBranchExpectedResults[i]
          .testCases) {
          const prebuildEvents = await db.prebuildEvent.findMany({
            where: {
              gitObjectId: branch.gitObjectId,
              projectId: project.id,
            },
            include: {
              buildfsEvent: {
                include: {
                  vmTask: true,
                },
              },
            },
          });
          expect(prebuildEvents.length).toBe(1);
          const prebuildEvent = prebuildEvents[0];
          expect(prebuildEvent.status).toBe(prebuildStatus);
          if (buildfsStatus != null) {
            expect(prebuildEvent.buildfsEvent?.vmTask?.status).toBe(buildfsStatus);
          } else {
            expect(prebuildEvent.buildfsEvent).toBeNull();
          }
        }
      }

      const project = await db.project.findUniqueOrThrow({
        where: {
          id: projects[0].id,
        },
        include: {
          prebuildEvents: {
            include: {
              gitBranchLinks: {
                include: {
                  gitBranch: true,
                },
              },
            },
          },
        },
      });
      const prebuildEvent = unwrap(
        project.prebuildEvents.find(
          (e) => e.gitBranchLinks.find((l) => l.gitBranchId === testBranches[0].id) != null,
        ),
      );
      const testUser = await createTestUser(db);
      const workspace = await client.workflow.execute(runCreateWorkspace, {
        workflowId: uuidv4(),
        taskQueue: "test",
        retry: { maximumAttempts: 1 },
        args: [
          {
            name: "Test Workspace 😄",
            prebuildEventId: prebuildEvent.id,
            gitBranchId: testBranches[0].id,
            externalId: uuidv4(),
            userId: testUser.id,
            startWorkspace: false,
          },
        ],
      });
      const startWorkspace = () =>
        client.workflow.execute(runStartWorkspace, {
          workflowId: uuidv4(),
          taskQueue: "test",
          retry: { maximumAttempts: 1 },
          args: [workspace.id],
        });
      const stopWorkspace = () =>
        client.workflow.execute(runStopWorkspace, {
          workflowId: uuidv4(),
          taskQueue: "test",
          retry: { maximumAttempts: 1 },
          args: [workspace.id],
        });

      const workspaceInstance1 = await startWorkspace();
      const execInInstance1 = async (cmd: string) => {
        const cmdBash = `bash -c '${cmd}'`;
        return await execSshCmdThroughProxy({
          vmIp: workspaceInstance1.vmIp,
          privateKey: TEST_USER_PRIVATE_SSH_KEY,
          cmd: cmdBash,
        });
      };
      const sshOutput = await execInInstance1("cat /home/hocus/dev/project/proxy-test.txt");
      expect(sshOutput.stdout.toString()).toEqual("hello from the tests repository!\n");
      const cdRepo = "cd /home/hocus/dev/project &&";
      const [gitName, gitEmail] = await waitForPromises(
        ["user.name", "user.email"].map((item) =>
          execInInstance1(`${cdRepo} git config --global ${item}`).then((o) =>
            o.stdout.toString().trim(),
          ),
        ),
      );
      expect(gitName).toEqual(testUser.gitConfig.gitUsername);
      expect(gitEmail).toEqual(testUser.gitConfig.gitEmail);
      const gitBranchName = await execInInstance1(`${cdRepo} git branch --show-current`).then((o) =>
        o.stdout.toString().trim(),
      );
      expect(gitBranchName).toEqual(formatBranchName(testBranches[0].name));

      await stopWorkspace();

      const workspaceInstance2 = await startWorkspace();
      const firecrackerService2 = injector.resolve(Token.FirecrackerService)(
        workspaceInstance2.firecrackerInstanceId,
      );
      await firecrackerService2.shutdownVM();
      await stopWorkspace();

      const workspaceInstance3 = await startWorkspace();
      try {
        await startWorkspace();
        throw new Error("Expected startWorkspace to fail");
      } catch (err) {
        expect((err as any)?.cause?.cause?.message).toMatch(
          /Workspace is not in WORKSPACE_STATUS_STOPPED state/,
        );
      }
      const firecrackerService3 = injector.resolve(Token.FirecrackerService)(
        workspaceInstance3.firecrackerInstanceId,
      );
      await firecrackerService3.shutdownVM();
      await firecrackerService3.tryDeleteVmDir();
      await stopWorkspace();

      const workspaceInstance4 = await startWorkspace();
      isGetWorkspaceInstanceStatusMocked = false;
      const firecrackerService4 = injector.resolve(Token.FirecrackerService)(
        workspaceInstance4.firecrackerInstanceId,
      );
      await firecrackerService4.shutdownVM();
      await sleep(1000);
      const waitForStatus = (statuses: WorkspaceStatus[]) =>
        retry(
          async () => {
            const workspace4 = await db.workspace.findUniqueOrThrow({
              where: {
                id: workspace.id,
              },
            });
            // the monitoring workflow should have stopped the workspace
            expect(statuses.includes(workspace4.status)).toBe(true);
          },
          10,
          1000,
        );
      await waitForStatus([
        WorkspaceStatus.WORKSPACE_STATUS_PENDING_STOP,
        WorkspaceStatus.WORKSPACE_STATUS_STOPPED,
      ]);
      await waitForStatus([WorkspaceStatus.WORKSPACE_STATUS_STOPPED]);
      await retry(
        async () => {
          const monitoringWorkflowInfo = await client.workflow
            .getHandle(workspaceInstance4.monitoringWorkflowId)
            .describe();
          expect(monitoringWorkflowInfo.status.name).toBe("COMPLETED");
        },
        5,
        3000,
      );
      const workspaceWithFiles = await db.workspace.findUniqueOrThrow({
        where: {
          id: workspace.id,
        },
        include: {
          projectFile: true,
          rootFsFile: true,
        },
      });
      await client.workflow.execute(runDeleteWorkspace, {
        workflowId: uuidv4(),
        taskQueue: "test",
        retry: { maximumAttempts: 1 },
        args: [{ workspaceId: workspace.id }],
      });
      expect(await doesFileExist(workspaceWithFiles.projectFile.path)).toBe(false);
      expect(await doesFileExist(workspaceWithFiles.rootFsFile.path)).toBe(false);
      const workspaceAfterDelete = await db.workspace.findUnique({
        where: {
          id: workspace.id,
        },
      });
      expect(workspaceAfterDelete).toBeNull();

      const successfulPrebuildEvents = await db.prebuildEvent.findMany({
        where: {
          status: PrebuildEventStatus.PREBUILD_EVENT_STATUS_SUCCESS,
        },
        include: {
          prebuildEventFiles: {
            include: {
              projectFile: true,
              fsFile: true,
            },
          },
        },
      });
      await waitForPromises(
        successfulPrebuildEvents.map(async (e) => {
          const doPrebuildFilesExist: () => Promise<boolean[]> = () =>
            waitForPromises(
              [e.prebuildEventFiles[0].projectFile, e.prebuildEventFiles[0].fsFile].map((f) =>
                doesFileExist(f.path),
              ),
            );
          expect(await doPrebuildFilesExist()).toEqual([true, true]);
          await client.workflow.execute(runArchivePrebuild, {
            workflowId: uuidv4(),
            taskQueue: "test",
            retry: { maximumAttempts: 1 },
            args: [{ prebuildEventId: e.id }],
          });
          expect(await doPrebuildFilesExist()).toEqual([false, false]);
          const prebuildEvent = await db.prebuildEvent.findUniqueOrThrow({
            where: {
              id: e.id,
            },
          });
          expect(prebuildEvent.status).toBe(PrebuildEventStatus.PREBUILD_EVENT_STATUS_ARCHIVED);
        }),
      );
      await db.prebuildEvent.updateMany({
        where: {
          id: {
            in: successfulPrebuildEvents.map((e) => e.id),
          },
        },
        data: {
          createdAt: new Date(0),
        },
      });
      await waitForPromises(
        projects.map((p) =>
          client.workflow.execute(runDeleteRemovablePrebuilds, {
            workflowId: uuidv4(),
            taskQueue: "test",
            retry: { maximumAttempts: 1 },
            args: [p.id],
          }),
        ),
      );
      const successfulPrebuildEventsAfterDelete = await db.prebuildEvent.findMany({
        where: {
          id: {
            in: successfulPrebuildEvents.map((e) => e.id),
          },
        },
      });
      expect(successfulPrebuildEventsAfterDelete).toEqual([]);
    });
  }),
);

test.concurrent(
  "runAddProjectAndRepository",
  provideActivities(async ({ activities }) => {
    const { client, nativeConnection } = testEnv;
    const worker = await Worker.create({
      connection: nativeConnection,
      taskQueue: "test",
      workflowsPath: require.resolve("./workflows"),
      activities,
      dataConverter: {
        payloadConverterPath: require.resolve("~/temporal/data-converter"),
      },
      workflowBundle,
    });

    await worker.runUntil(async () => {
      const runWorkflow = () =>
        client.workflow.execute(runAddProjectAndRepository, {
          workflowId: uuidv4(),
          taskQueue: "test",
          retry: { maximumAttempts: 1 },
          args: [
            {
              gitRepositoryUrl: TESTS_REPO_URL,
              projectName: "Test",
              projectWorkspaceRoot: "/",
            },
          ],
        });
      const { project, gitRepository } = await runWorkflow();
      expect(project.name).toBe("Test");
      expect(project.rootDirectoryPath).toBe("/");
      expect(gitRepository.url).toBe(TESTS_REPO_URL);

      const { project: project2, gitRepository: gitRepository2 } = await runWorkflow();
      expect(project2.id).not.toBe(project.id);
      expect(gitRepository2.id).toBe(gitRepository.id);
    });
  }),
);
