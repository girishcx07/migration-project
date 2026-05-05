import type { ModuleName } from "@/lib/module-registry";
import { redirect } from "react-router";

import { defaultModuleName, isModuleName } from "@/lib/module-registry";
import { getRequestUrl } from "@/server/request";

export function getModuleFromPath(): ModuleName {
  const moduleName =
    getRequestUrl()
      .pathname.split("/")
      .find((segment) => segment.length > 0) ?? "";

  if (!isModuleName(moduleName)) {
    throw redirect(`/${defaultModuleName}`);
  }

  return moduleName;
}
