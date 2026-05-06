import { getModuleFromPath } from "@/server/route-params";

export default function Component() {
  const module = getModuleFromPath();
  return <div>{module} test</div>;
}
