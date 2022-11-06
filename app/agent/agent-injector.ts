import { DefaultLogger } from "@temporalio/worker";
import { createInjector, Scope } from "typed-inject";
import { config } from "~/config";
import { Token } from "~/token";

import { factoryFirecrackerService } from "./firecracker.service";
import { LowLevelStorageService, StorageService } from "./storage/storage.service";

export const createAgentInjector = () =>
  createInjector()
    .provideValue(Token.Config, config)
    .provideClass(Token.Logger, DefaultLogger, Scope.Transient)
    .provideClass(Token.LowLevelStorageService, LowLevelStorageService)
    .provideClass(Token.StorageService, StorageService)
    .provideFactory(Token.FirecrackerService, factoryFirecrackerService);
export type AgentInjector = ReturnType<typeof createAgentInjector>;