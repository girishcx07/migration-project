import { useState } from "react";

import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";

type FileField = {
  id: string;
  label: string;
  hint: string;
};

const FILE_FIELDS: FileField[] = [
  {
    id: "passport",
    label: "Passport (bio page)",
    hint: "JPG, PNG or PDF — max 5MB",
  },
  {
    id: "photo",
    label: "Recent Photograph",
    hint: "White background, JPG — max 2MB",
  },
  {
    id: "itr",
    label: "Income Tax Return",
    hint: "Last 2 years, PDF — max 5MB",
  },
];

/**
 * Step 3 — Upload Documents (final step)
 * No `next` needed. Calls an onSubmit prop passed from the layout
 * so the parent app (Next.js or TanStack) decides what happens after submit.
 */
export function VisaDocumentsUpload({ onSubmit }: { onSubmit?: () => void }) {
  const [uploaded, setUploaded] = useState<Record<string, string>>({});

  const handleFile = (id: string, file: File | undefined) => {
    if (!file) return;
    setUploaded((prev) => ({ ...prev, [id]: file.name }));
  };

  const allUploaded = FILE_FIELDS.every((f) => uploaded[f.id]);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-slate-500">
        Upload the required documents to complete your application.
      </p>

      {FILE_FIELDS.map((field) => (
        <div key={field.id} className="flex flex-col gap-1">
          <label
            htmlFor={field.id}
            className="text-sm font-medium text-slate-700"
          >
            {field.label}
          </label>
          <div
            className={cn(
              "flex items-center justify-between rounded-md border px-3 py-2",
              uploaded[field.id]
                ? "border-green-400 bg-green-50"
                : "border-slate-200",
            )}
          >
            <span className="max-w-[60%] truncate text-xs text-slate-500">
              {uploaded[field.id] ?? field.hint}
            </span>
            <label
              htmlFor={field.id}
              className="cursor-pointer rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200"
            >
              {uploaded[field.id] ? "Replace" : "Upload"}
              <input
                id={field.id}
                type="file"
                className="sr-only"
                onChange={(e) => handleFile(field.id, e.target.files?.[0])}
              />
            </label>
          </div>
        </div>
      ))}

      {allUploaded && (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">
          All documents uploaded — ready to submit.
        </div>
      )}

      <Button
        onClick={onSubmit}
        disabled={!allUploaded}
        className="mt-2 bg-green-600 hover:bg-green-700 disabled:opacity-50"
      >
        Submit Application
      </Button>
    </div>
  );
}
