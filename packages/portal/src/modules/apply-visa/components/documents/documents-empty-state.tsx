import { FileText } from "lucide-react";

export function DocumentsEmptyState({
  description,
  title,
}: Readonly<{
  description: string;
  title: string;
}>) {
  return (
    <div className="bg-muted/30 flex min-h-28 flex-col items-center justify-center rounded-lg border border-dashed px-4 py-6 text-center">
      <FileText className="text-muted-foreground mb-2 size-7" />
      <p className="text-sm font-medium text-slate-900">{title}</p>
      <p className="text-muted-foreground mt-1 max-w-sm text-xs">
        {description}
      </p>
    </div>
  );
}
