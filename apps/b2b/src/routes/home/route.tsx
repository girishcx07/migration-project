import { redirect } from "react-router";

import { defaultModuleName } from "@/lib/module-registry";

export function loader() {
  return redirect(`/${defaultModuleName}`);
}
