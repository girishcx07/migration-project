export function QrVisaEntrySkeleton() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-[radial-gradient(circle_at_top,#f0fdfa,transparent_55%),linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-6 py-16">
      <section className="w-full max-w-3xl animate-pulse rounded-[28px] border border-slate-200 bg-white/90 p-8 shadow-[0_30px_80px_-45px_rgba(15,23,42,0.35)] backdrop-blur md:p-10">
        <div className="mb-8 flex items-start justify-between gap-6">
          <div className="w-full space-y-3">
            <div className="h-4 w-24 rounded-full bg-slate-200" />
            <div className="space-y-2">
              <div className="h-10 w-2/3 rounded-2xl bg-slate-200" />
              <div className="h-4 w-full rounded-full bg-slate-100" />
              <div className="h-4 w-4/5 rounded-full bg-slate-100" />
            </div>
          </div>
          <div className="hidden h-10 w-20 rounded-full bg-slate-200 md:block" />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <DetailSkeleton />
          <DetailSkeleton />
          <DetailSkeleton />
        </div>
      </section>
    </main>
  );
}

function DetailSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="h-3 w-20 rounded-full bg-slate-200" />
      <div className="mt-3 h-5 w-full rounded-full bg-slate-200" />
      <div className="mt-2 h-5 w-3/4 rounded-full bg-slate-100" />
    </div>
  );
}
