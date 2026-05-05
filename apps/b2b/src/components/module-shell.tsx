import type { ModuleBootstrap } from "@/lib/module-registry";
import type { ReactNode } from "react";

export function ModuleShell({
  children,
}: {
  bootstrap: ModuleBootstrap;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950">
      <main>{children}</main>
    </div>
  );
}
