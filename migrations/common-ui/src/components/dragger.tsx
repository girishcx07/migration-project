import { UploadCloud } from "lucide-react";
import React, { memo } from "react";
import {
  DropEvent,
  DropzoneOptions,
  FileRejection,
  useDropzone,
} from "react-dropzone";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { cn } from "@workspace/ui/lib/utils";
import { toast } from "sonner";
import { useIsMobile } from "../hooks/use-is-mobile";

interface Props {
  uploadOptions?: DropzoneOptions;
  children?: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  type?: "button" | "dragger";
}

const MAX_FILE_SIZE = 21 * 1024 * 1024; // 20 MB

const Dragger: React.FC<Props> = memo(
  ({ uploadOptions, children, className = "", type = "dragger", onClick }) => {
    const isMobile = useIsMobile();

    const maxSize = uploadOptions?.maxSize || MAX_FILE_SIZE;

    const { getRootProps, getInputProps } = useDropzone({
      maxSize,
      ...uploadOptions,
      onDropRejected: (fileRejections: FileRejection[], event: DropEvent) => {
        const isFileTooLarge = fileRejections[0]?.errors.some(
          (e) => e.code === "file-too-large",
        );

        const isInvalidFileType = fileRejections[0]?.errors.some(
          (e) => e.code === "file-invalid-type",
        );

        uploadOptions?.onDropRejected?.(fileRejections, event);

        if (isInvalidFileType) {
          toast("Invalid Document", {
            description: `Unsupported file format. Supported formats: ${Object.values(
              uploadOptions?.accept || {},
            )
              .flat()
              .map((ext) => (ext as string).replace(/^\./, "")) // remove leading dot
              .join(", ")}`,
          });
        } else if (isFileTooLarge) {
          toast("Invalid Document", {
            description:
              "File size exceeds the limit of " +
              ((uploadOptions?.maxSize || 20) / (1024 * 1024)).toFixed() +
              " MB",
          });
        }

        console.log("uploadOptions", fileRejections);

        // toast("Invalid Document", {
        //   description: "  File size exceeds the limit of 20MB",
        // });
      },
    });

    const fileFormats = uploadOptions?.accept
      ? Object.values(uploadOptions.accept)
          .flat()
          .map((ext) => ext.replace(/^\./, "")) // remove leading dot
          .join(", ")
      : "Any";
    // console.log("uploadOptions", uploadOptions, fileFormats);

    if (type === "button") {
      return (
        <div className={cn("w-full", className)}>
          <input
            type="file"
            {...getInputProps()}
            className="hidden"
            id="upload-button-file"
          />
          <label
            {...getRootProps({
              onClick: (e) => {
                // e.stopPropagation();
                e.preventDefault();
              },
            })}
            className={cn(
              "relative flex w-full flex-col items-center justify-center",
              className,
            )}
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
            onClick: (e) => {
              // e.stopPropagation();
              e.preventDefault();
            },
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
              <div className="mx-auto max-w-min rounded-md">
                <UploadCloud
                  size={35}
                  className="text-muted-foreground mx-auto"
                />
              </div>

              <p className="mt-1 text-sm text-gray-600">
                <span className="font-semibold">
                  {/* Select a file or drag and drop here */}
                  {isMobile
                    ? "Select files to upload"
                    : " Click OR Drag-n-Drop"}
                </span>
              </p>

              {!!Object.keys(uploadOptions?.accept || {})?.length && (
                <p className="text-xs text-gray-500 uppercase">
                  {/* Supported file types:{" "} */}
                  {/* {Object.values(uploadOptions?.accept || {})
                      .flat()
                      .join(" , ")} */}
                  {Object.values(uploadOptions?.accept || {})
                    .flat()
                    .map((ext) => ext.replace(/^\./, "")) // remove leading dot
                    .join(", ")}
                  <span className="capitalize">
                    , max file size: {(maxSize / (1024 * 1024)).toFixed()} MB
                  </span>
                </p>
              )}
              <div className="my-1 flex items-center justify-center">
                <Button
                  type="button"
                  variant={"outline"}
                  className="border-primary text-primary bg-primary/5 hover:bg-primary/10 hover:text-primary"
                >
                  {/* Upload a file */}
                  Select Files
                </Button>
              </div>
            </div>
          )}
        </label>

        <Input
          id="dropzone-file"
          accept="image/png, image/jpeg"
          type="file"
          className="hidden"
          {...getInputProps()}
        />
      </div>
    );
  },
);

Dragger.displayName = "Dragger";

export default Dragger;
