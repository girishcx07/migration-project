"use client";

import { UploadCloud } from "lucide-react";
import * as React from "react";
import {
  type DropEvent,
  type DropzoneOptions,
  type FileRejection,
  useDropzone,
} from "react-dropzone";
import { toast } from "sonner";

import { Button } from "@acme/ui/components/button";
import { Input } from "@acme/ui/components/input";
import { cn } from "@acme/ui/lib/utils";

interface Props {
  uploadOptions?: DropzoneOptions;
  children?: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  type?: "button" | "dragger";
}

const DEFAULT_MAX_FILE_SIZE = 21 * 1024 * 1024;

const Dragger: React.FC<Props> = React.memo(
  ({ uploadOptions, children, className = "", type = "dragger", onClick }) => {
    const maxSize = uploadOptions?.maxSize ?? DEFAULT_MAX_FILE_SIZE;

    const { getRootProps, getInputProps } = useDropzone({
      maxSize,
      ...uploadOptions,
      onDropRejected: (fileRejections: FileRejection[], event: DropEvent) => {
        const isFileTooLarge = fileRejections[0]?.errors.some(
          (error) => error.code === "file-too-large",
        );
        const isInvalidFileType = fileRejections[0]?.errors.some(
          (error) => error.code === "file-invalid-type",
        );

        uploadOptions?.onDropRejected?.(fileRejections, event);

        if (isInvalidFileType) {
          toast("Invalid Document", {
            description: `Unsupported file format. Supported formats: ${Object.values(
              uploadOptions?.accept ?? {},
            )
              .flat()
              .map((ext) => String(ext).replace(/^\./, ""))
              .join(", ")}`,
          });
        } else if (isFileTooLarge) {
          toast("Invalid Document", {
            description: `File size exceeds the limit of ${(maxSize / (1024 * 1024)).toFixed()} MB`,
          });
        }
      },
    });

    if (type === "button") {
      return (
        <div className={cn("w-full", className)}>
          <input {...getInputProps()} className="hidden" id="upload-button-file" />
          <label
            {...getRootProps({
              onClick: (event) => event.preventDefault(),
            })}
            className={cn("relative flex w-full items-center justify-center", className)}
          >
            <Button type="button" className="w-full">
              <UploadCloud className="mr-2" />
              Upload Documents
            </Button>
          </label>
        </div>
      );
    }

    return (
      <div className={cn(className)} onClick={onClick}>
        <label
          {...getRootProps({
            onClick: (event) => event.preventDefault(),
          })}
          className={cn(
            "relative flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-2 hover:bg-gray-100",
            className,
          )}
        >
          {children ? (
            children
          ) : (
            <div className="text-center">
              <UploadCloud size={35} className="text-muted-foreground mx-auto" />
              <p className="mt-1 text-sm text-gray-600">
                <span className="font-semibold">Click OR Drag-n-Drop</span>
              </p>
              {!!Object.keys(uploadOptions?.accept ?? {}).length && (
                <p className="text-xs text-gray-500 uppercase">
                  {Object.values(uploadOptions?.accept ?? {})
                    .flat()
                    .map((ext) => String(ext).replace(/^\./, ""))
                    .join(", ")}
                  <span className="capitalize">
                    {`, max file size: ${(maxSize / (1024 * 1024)).toFixed()} MB`}
                  </span>
                </p>
              )}
              <div className="my-1 flex items-center justify-center">
                <Button
                  type="button"
                  variant="outline"
                  className="border-primary text-primary bg-primary/5 hover:bg-primary/10 hover:text-primary"
                >
                  Select Files
                </Button>
              </div>
            </div>
          )}
        </label>

        <Input type="file" className="hidden" {...getInputProps()} />
      </div>
    );
  },
);

Dragger.displayName = "Dragger";

export default Dragger;
