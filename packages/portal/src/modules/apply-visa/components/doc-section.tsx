import { Info } from "lucide-react";

import type { VisaDocument } from "../types/apply-visa.types";

export function DocSection<T extends VisaDocument>({
  documents,
  onInfoClick,
  title,
}: Readonly<{
  documents: T[];
  onInfoClick: (document: T) => void;
  title: string;
}>) {
  if (!documents.length) return null;

  return (
    <div className="mb-3">
      <p className="text-primary mb-2 text-sm font-semibold">{title}</p>
      <ol className="ml-3 list-decimal space-y-2 marker:text-black">
        {documents.map((document) => (
          <li className="text-sm" key={document.doc_id}>
            <div className="flex items-center justify-between gap-3">
              <span>
                {document.doc_display_name}
                {"doc_snap" in document &&
                document.doc_snap.some((snap) => snap.mandatory) ? (
                  <span className="text-red-500">*</span>
                ) : null}
              </span>
              <button onClick={() => onInfoClick(document)} type="button">
                <Info className="size-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500">
              {document.doc_short_description}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}
