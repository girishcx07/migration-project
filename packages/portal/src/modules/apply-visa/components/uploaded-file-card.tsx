import { FileText, Info, Trash2 } from "lucide-react";

import type { UploadedDocumentImage } from "@repo/types/new-visa";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@repo/ui/components/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";

export function UploadedFileCard({
  file,
  onDelete,
}: Readonly<{
  file: UploadedDocumentImage;
  onDelete: () => void;
}>) {
  const isPdf =
    file.file_name.toLowerCase().endsWith(".pdf") ||
    file.mime_type === "application/pdf" ||
    file.file_type === "application/pdf";
  const hasError = !file.is_valid && !isPdf;
  const errorMessage = Array.isArray(file.error_message)
    ? (file.error_message as string[]).join(", ")
    : (file.error_message ?? "Image too small or unclear");

  return (
    <div className="bg-card flex h-[220px] min-w-0 flex-col overflow-hidden rounded-lg border p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-2">
        <Tooltip>
          <TooltipTrigger
            render={
              <p className="truncate text-left text-sm">
                {file.original_file_name || file.file_name}
              </p>
            }
          />
          <TooltipContent className="border bg-white text-gray-500 shadow-sm">
            {file.original_file_name || file.file_name}
          </TooltipContent>
        </Tooltip>
        <AlertDialog>
          <AlertDialogTrigger render={<button type="button" />}>
            <Trash2 className="size-4 cursor-pointer text-red-500" />
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this document?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-500 hover:bg-red-600"
                onClick={onDelete}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {isPdf ? (
        <div className="relative flex h-36 w-full items-center justify-center rounded-md border bg-white">
          <span className="absolute top-1 right-1 rounded bg-red-500 px-2 text-xs text-white">
            PDF
          </span>
          <FileText className="size-20 text-red-500" />
        </div>
      ) : (
        <div className="relative flex h-36 w-full items-center justify-center overflow-hidden rounded-md border bg-white">
          {hasError ? (
            <Tooltip>
              <TooltipTrigger
                render={
                  <div className="absolute top-0 right-0 z-10 cursor-pointer">
                    <Info fill="red" className="size-4 text-white" />
                  </div>
                }
              />
              <TooltipContent className="max-w-56 border bg-white text-red-500 shadow-sm">
                {errorMessage}
              </TooltipContent>
            </Tooltip>
          ) : null}
          <img
            alt={file.file_name}
            className="h-full w-full object-contain object-center p-1"
            loading="lazy"
            src={file.file_thumbnail || file.file}
          />
        </div>
      )}
    </div>
  );
}
