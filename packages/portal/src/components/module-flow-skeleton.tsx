import { Skeleton } from "@repo/ui/components/skeleton";

export function ModuleFlowSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div className="space-y-2">
            <Skeleton className="h-3 w-36" />
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-4 w-64 max-w-[70vw]" />
          </div>
          <div className="hidden space-y-2 sm:block">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-6 py-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="space-y-3">
          <Skeleton className="h-3 w-20" />
          <div className="flex flex-wrap gap-2 lg:flex-col">
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-28" />
          </div>
        </aside>

        <section className="space-y-4">
          <div className="space-y-3 rounded border border-zinc-200 bg-white p-4">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-7 w-48 max-w-full" />
            <Skeleton className="h-4 w-96 max-w-full" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-24 rounded border border-zinc-200 bg-white" />
            <Skeleton className="h-24 rounded border border-zinc-200 bg-white" />
          </div>

          <Skeleton className="h-28 rounded border border-dashed border-zinc-300 bg-white" />
        </section>
      </main>
    </div>
  );
}
