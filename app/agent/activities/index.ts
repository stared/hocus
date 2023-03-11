import type { Prisma } from "@prisma/client";

import type { AgentInjector } from "../agent-injector";

import type { AddProjectAndRepositoryActivity } from "./add-project-and-repository";
import { addProjectAndRepository } from "./add-project-and-repository";
import type { BuildfsActivity } from "./buildfs";
import { buildfs } from "./buildfs";
import type { CancelPrebuildsActivity } from "./cancel-prebuilds";
import { cancelPrebuilds } from "./cancel-prebuilds";
import type { ChangePrebuildEventStatusActivity } from "./change-prebuild-event-status";
import { changePrebuildEventStatus } from "./change-prebuild-event-status";
import type { CheckoutAndInspectActivity } from "./checkout-and-inspect";
import { checkoutAndInspect } from "./checkout-and-inspect";
import type { CreatePrebuildEventsActivity } from "./create-prebuild-events";
import { createPrebuildEvents } from "./create-prebuild-events";
import type { CreatePrebuildFilesActivity } from "./create-prebuild-files";
import { createPrebuildFiles } from "./create-prebuild-files";
import type { CreateWorkspaceActivity } from "./create-workspace";
import { createWorkspace } from "./create-workspace";
import type { DeleteWorkspaceActivity } from "./delete-workspace";
import { deleteWorkspace } from "./delete-workspace";
import type { FetchRepositoryActivity } from "./fetch-repository";
import { fetchRepository } from "./fetch-repository";
import type { GetDefaultBranchActivity } from "./get-default-branch";
import { getDefaultBranch } from "./get-default-branch";
import type { GetOrCreateBuildfsEventsActivity } from "./get-or-create-buildfs-events";
import { getOrCreateBuildfsEvents } from "./get-or-create-buildfs-events";
import type { GetProjectsAndGitObjectsActivity } from "./get-projects-and-git-objects";
import { getProjectsAndGitObjects } from "./get-projects-and-git-objects";
import type { GetRepositoryProjectsActivity } from "./get-repository-projects";
import { getRepositoryProjects } from "./get-repository-projects";
import type { GetWorkspaceInstanceStatusActivity } from "./get-workspace-instance-status";
import { getWorkspaceInstanceStatus } from "./get-workspace-instance-status";
import type { PrebuildActivity } from "./prebuild";
import { prebuild } from "./prebuild";
import type { StartWorkspaceActivity } from "./start-workspace";
import { startWorkspace } from "./start-workspace";
import type { StopWorkspaceActivity } from "./stop-workspace";
import { stopWorkspace } from "./stop-workspace";
import type { UpdateGitBranchesAndObjectsActivity } from "./update-git-branches-and-objects";
import { updateGitBranchesAndObjects } from "./update-git-branches-and-objects";

export interface Activities {
  fetchRepository: FetchRepositoryActivity;
  buildfs: BuildfsActivity;
  checkoutAndInspect: CheckoutAndInspectActivity;
  prebuild: PrebuildActivity;
  cancelPrebuilds: CancelPrebuildsActivity;
  changePrebuildEventStatus: ChangePrebuildEventStatusActivity;
  createWorkspace: CreateWorkspaceActivity;
  startWorkspace: StartWorkspaceActivity;
  stopWorkspace: StopWorkspaceActivity;
  getProjectsAndGitObjects: GetProjectsAndGitObjectsActivity;
  getOrCreateBuildfsEvents: GetOrCreateBuildfsEventsActivity;
  createPrebuildEvents: CreatePrebuildEventsActivity;
  createPrebuildFiles: CreatePrebuildFilesActivity;
  getWorkspaceInstanceStatus: GetWorkspaceInstanceStatusActivity;
  addProjectAndRepository: AddProjectAndRepositoryActivity;
  updateGitBranchesAndObjects: UpdateGitBranchesAndObjectsActivity;
  getDefaultBranch: GetDefaultBranchActivity;
  getRepositoryProjects: GetRepositoryProjectsActivity;
  deleteWorkspace: DeleteWorkspaceActivity;
}

export interface ActivityArgs {
  injector: AgentInjector;
  db: Prisma.NonTransactionClient;
}

export type ActivitiesCreateFns = {
  [K in keyof Activities]: (args: ActivityArgs) => Activities[K];
};

export const createActivities = async (
  injector: AgentInjector,
  db: Prisma.NonTransactionClient,
): Promise<Activities> => {
  const fns: ActivitiesCreateFns = {
    fetchRepository,
    buildfs,
    checkoutAndInspect,
    prebuild,
    cancelPrebuilds,
    changePrebuildEventStatus,
    createWorkspace,
    startWorkspace,
    stopWorkspace,
    getProjectsAndGitObjects,
    getOrCreateBuildfsEvents,
    createPrebuildEvents,
    createPrebuildFiles,
    getWorkspaceInstanceStatus,
    addProjectAndRepository,
    getRepositoryProjects,
    updateGitBranchesAndObjects,
    getDefaultBranch,
    deleteWorkspace,
  };

  return Object.fromEntries(
    Object.entries(fns).map(([name, fn]) => {
      return [name, fn({ injector, db })] as const;
    }),
  ) as any;
};