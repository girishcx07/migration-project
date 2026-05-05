import type {
  ModuleBootstrap,
  ModuleFlow,
  ModuleName,
} from "@/lib/module-registry";

import { getRequestHost } from "@/server/request";

export function getModuleBootstrap(
  moduleName: ModuleName,
  flow: ModuleFlow,
): ModuleBootstrap {
  return {
    module: moduleName,
    flow,
    host: getRequestHost(),
    pathname: `/${moduleName}/${flow}`,
    moduleTypeHeader: moduleName,
  };
}
