import { cn } from "@repo/ui/lib/utils";

type VisaColCardProps = {
  title: string;
  idx: number;
  /** Completed = green badge, active = black, future = muted */
  state: "active" | "completed" | "future";
  children: React.ReactNode;
};

export function VisaColCard({ title, idx, state, children }: VisaColCardProps) {
  return (
    <div className="flex h-full min-h-0 flex-col rounded-md border border-slate-200 bg-white shadow-sm">
      <div className="flex shrink-0 items-center gap-3 p-4">
        <span
          className={cn(
            "flex size-6 items-center justify-center rounded-full text-xs font-medium text-white",
            state === "completed" && "bg-green-600",
            state === "active" && "bg-black",
            state === "future" && "bg-slate-300",
          )}
        >
          {idx}
        </span>
        <h2 className="text-md m-0 font-semibold text-slate-900 md:text-xl">
          {title}
        </h2>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4">
        <div className="h-full shrink-0 overflow-y-auto bg-slate-50">
          <div className="mx-auto my-2 w-full max-w-md px-4">{children}</div>
        </div>
      </div>
    </div>
  );
}
