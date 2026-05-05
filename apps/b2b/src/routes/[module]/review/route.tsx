import { FlowPage } from "@/components/flow-page";
import { getModuleBootstrap } from "@/server/module-bootstrap";
import { getModuleFromPath } from "@/server/route-params";

export default function Component() {
  const module = getModuleFromPath();
  const bootstrap = getModuleBootstrap(module, "review");

  return (
    <FlowPage
      bootstrap={bootstrap}
      description="Review route mounted as a static child path under the module."
      title="Review"
    />
  );
}
