import { redirect } from "react-router";

import { getModuleDefinition } from "@/lib/module-registry";
import { getModuleFromPath } from "@/server/route-params";

export function loader() {
  const module = getModuleFromPath();
  const definition = getModuleDefinition(module);

  return redirect(`/${module}/${definition.initializationPath}`);
}

export default function Component() {
  return null;
}
