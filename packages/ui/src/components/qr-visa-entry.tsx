"use client";

type QrVisaEntryProps = {
  brand: string;
  brandColor?: string;
  currency: string;
  description?: string;
  domainHost: string;
  host: string;
  title?: string;
};

export function QrVisaEntry(props: QrVisaEntryProps) {
  const accent = props.brandColor?.trim() || "#0f766e";

  return (
    <main className="flex min-h-svh items-center justify-center bg-[radial-gradient(circle_at_top,#f0fdfa,transparent_55%),linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-6 py-16">
      <section className="w-full max-w-3xl rounded-[28px] border border-slate-200 bg-white/90 p-8 shadow-[0_30px_80px_-45px_rgba(15,23,42,0.35)] backdrop-blur md:p-10">
        <div className="mb-8 flex items-start justify-between gap-6">
          <div className="space-y-3">
            <p
              className="text-sm font-medium tracking-[0.3em] text-slate-500 uppercase"
              style={{ color: accent }}
            >
              QR Visa
            </p>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
                {props.title?.trim() || props.brand}
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
                {props.description?.trim() ||
                  "Enterprise host resolution is active for this route. Both app shells can use the same backend entrypoint now."}
              </p>
            </div>
          </div>
          <div
            className="hidden rounded-full px-4 py-2 text-sm font-medium text-white md:block"
            style={{ backgroundColor: accent }}
          >
            {props.currency}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <DetailCard label="Brand" value={props.brand} />
          <DetailCard label="Host" value={props.host} />
          <DetailCard label="Domain Host" value={props.domainHost} />
        </div>
      </section>
    </main>
  );
}

function DetailCard(props: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-medium tracking-[0.24em] text-slate-500 uppercase">
        {props.label}
      </p>
      <p className="mt-2 text-sm font-medium break-all text-slate-950">
        {props.value}
      </p>
    </div>
  );
}
