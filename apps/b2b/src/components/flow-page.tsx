import type { ModuleBootstrap } from "@/lib/module-registry";

import { ModuleShell } from "@/components/module-shell";
import { getDisplayLabel } from "@/lib/module-registry";

export function FlowPage({
  bootstrap,
  title,
  description,
}: {
  bootstrap: ModuleBootstrap;
  title: string;
  description: string;
}) {
  return (
    <ModuleShell bootstrap={bootstrap}>
      <div className="space-y-4">
        <div className="rounded border border-zinc-200 bg-white p-4">
          <p className="text-xs tracking-[0.18em] text-zinc-500 uppercase">
            Active flow
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-zinc-900">{title}</h2>
          <p className="mt-2 text-sm text-zinc-600">{description}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded border border-zinc-200 bg-white p-4 text-sm text-zinc-700">
            <p className="font-medium text-zinc-900">Current path</p>
            <p className="mt-1">{bootstrap.pathname}</p>
          </div>
          <div className="rounded border border-zinc-200 bg-white p-4 text-sm text-zinc-700">
            <p className="font-medium text-zinc-900">Route state</p>
            <p className="mt-1">Module: {bootstrap.module}</p>
            <p>Flow: {getDisplayLabel(bootstrap.flow)}</p>
          </div>
        </div>
      </div>
    </ModuleShell>
  );
}
