import { getModuleFromPath } from "@/server/route-params";
import { ModuleInitializeClient } from "./initialize-client";

export default function Component() {
  const module = getModuleFromPath();

  return <ModuleInitializeClient module={module} />;
}
