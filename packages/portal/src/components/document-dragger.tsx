"use client";

import type { ReactNode } from "react";
import { UploadCloud } from "lucide-react";
import type {
  DropEvent,
  DropzoneOptions,
  FileRejection,
} from "react-dropzone";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";

const DEFAULT_MAX_FILE_SIZE = 20 * 1024 * 1024;

function formatAccept(accept?: DropzoneOptions["accept"]) {
  const extensions = Object.values(accept ?? {})
    .flat()
    .map((extension) => extension.replace(/^\./, "").toUpperCase());

  return extensions.length ? extensions.join(", ") : "Any file";
}

export function DocumentDragger({
  children,
  className,
  disabled,
  uploadOptions,
}: Readonly<{
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
  uploadOptions?: DropzoneOptions;
}>) {
  const maxSize = uploadOptions?.maxSize ?? DEFAULT_MAX_FILE_SIZE;

  const { getInputProps, getRootProps, isDragActive } = useDropzone({
    maxSize,
    multiple: true,
    ...uploadOptions,
    disabled: Boolean(disabled) || Boolean(uploadOptions?.disabled),
    onDropRejected: (fileRejections: FileRejection[], event: DropEvent) => {
      const firstRejection = fileRejections[0];
      const isFileTooLarge = firstRejection?.errors.some(
        (error) => error.code === "file-too-large",
      );
      const isInvalidFileType = firstRejection?.errors.some(
        (error) => error.code === "file-invalid-type",
      );

      uploadOptions?.onDropRejected?.(fileRejections, event);

      if (isInvalidFileType) {
        toast("Invalid document", {
          description: `Supported formats: ${formatAccept(uploadOptions?.accept)}`,
        });
      } else if (isFileTooLarge) {
        toast("Invalid document", {
          description: `File size exceeds ${(maxSize / (1024 * 1024)).toFixed()} MB`,
        });
      }
    },
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-primary/40 bg-primary/5 hover:bg-primary/10 focus-visible:border-ring focus-visible:ring-ring/50 flex min-h-28 w-full cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed p-4 text-center outline-none transition focus-visible:ring-3",
        isDragActive && "border-primary bg-primary/10",
        disabled && "pointer-events-none opacity-60",
        className,
      )}
    >
      <input {...getInputProps()} />
      {children ?? (
        <>
          <UploadCloud className="text-primary size-7" />
          <span className="mt-2 text-sm font-medium">Upload documents</span>
          <span className="text-muted-foreground mt-1 text-xs">
            Drag files here or browse from your device
          </span>
          <span className="text-muted-foreground mt-1 text-xs">
            {formatAccept(uploadOptions?.accept)}, max file size:{" "}
            {(maxSize / (1024 * 1024)).toFixed()} MB
          </span>
          <Button className="mt-3" type="button" variant="outline">
            Select Files
          </Button>
        </>
      )}
    </div>
  );
}
