import { ApplicantRequiredDocument } from "@workspace/types/review";
import { Badge } from "@workspace/ui/components/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import {
  EyeIcon,
  FilePenLine,
  FileTextIcon,
  InfoIcon,
  MenuIcon,
  ReplaceIcon,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { ActionType } from "../context/review-visa-context";
import DocumentImage from "./document-image";
import { DocumentUpload } from "./document-upload";


interface DocumentCardProps {
  document: ApplicantRequiredDocument;
  totalDocs: number;
  index: number;
  onActionClick: (
    action: ActionType,
    document: ApplicantRequiredDocument,
  ) => void;
  onPreview: (action: ActionType, document: ApplicantRequiredDocument) => void;
  closeDeager: (value: boolean) => void;
}

export const DocumentCard = ({
  document,
  totalDocs,
  index,
  onActionClick,
  onPreview,
  closeDeager
}: DocumentCardProps) => {
  const [isInfo, setIsInfo] = useState(false);
  const snap = document.doc_snap?.[0];
  const isUploaded = snap?.status === "uploaded" && snap.doc_url;
  const format = snap?.doc_specification?.format || ["jpg", "png"];

  console.log("document", document?.doc_display_name);

  return (
    <>
      <div className="w-full rounded-lg border border-gray-200 bg-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-4 py-2">
          <p className="truncate text-sm">
            <span className="inline-block min-h-[20px] min-w-[20px] rounded-full bg-black p-1 text-center text-[9px] font-semibold text-white">
              {index + 1}/{totalDocs}
            </span>{" "}
            &nbsp;
            {snap?.mandatory && <span className="text-red-500">*</span>}
            {document.doc_display_name}
            {!snap?.mandatory && (
              <span className="text-xs text-slate-500">&nbsp;(optional)</span>
            )}
          </p>
          <div className="flex items-center gap-2">
            <RenderDocsBadge format={format} />
            <InfoIcon
              className="text-muted-foreground cursor-pointer"
              onClick={() => setIsInfo(true)}
            />
            {isUploaded && (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger className="outline-none">
                    <MenuIcon className="cursor-pointer" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {!snap?.doc_file_name?.endsWith("pdf") && (
                      <DropdownMenuItem
                        className="flex cursor-pointer items-center gap-3"
                        onClick={() => onActionClick("edit", document)}
                      >
                        <FilePenLine className="text-gray-500" /> Edit
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      className="flex cursor-pointer items-center gap-3"
                      onClick={() => onActionClick("replace", document)}
                    >
                      <ReplaceIcon className="text-gray-500" /> Replace
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="flex cursor-pointer items-center gap-3"
                      onClick={() => onActionClick("delete", document)}
                    >
                      <Trash2 className="text-red-500" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>
        <div className="overflow-hidden rounded-lg rounded-t-none bg-white">
          {isUploaded ? (
            <>
              {snap.doc_file_name?.endsWith("pdf") ? (
                <div
                  className="group relative flex min-h-[250px] flex-col items-center justify-center border bg-blue-50 shadow-xl"
                  onClick={() => onPreview("preview", document)}
                >
                  <FileTextIcon className="h-32 w-32 text-red-500" />
                  <div
                    className="bg-opacity-10 absolute inset-0 hidden items-center justify-center bg-white/40 opacity-0 transition-opacity group-hover:opacity-100 md:flex"
                    onClick={() => onPreview("preview", document)}
                    tabIndex={0}
                    role="button"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        onPreview("preview", document);
                      }
                    }}
                  >
                    <div className="flex cursor-pointer items-center gap-2 rounded border bg-white px-3 py-2 text-sm shadow-md">
                      <EyeIcon
                        width={20}
                        height={20}
                        className="text-primary"
                      />
                      <div>View Document</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="group relative flex h-[260px] w-full items-center justify-center overflow-hidden border bg-white shadow-xl">
                  {/* {!document?.is_valid && (
                    <Popover>
                      <PopoverTrigger className="absolute top-0 right-0 z-10">
                        <InfoIcon fill="red" className="size-4 text-white" />
                      </PopoverTrigger>
                      <PopoverContent className="border-border w-[150px] p-2 text-sm text-red-500">
                        {document?.error_message || "Image too small or unclear"}
                      </PopoverContent>
                    </Popover>
                  )} */}
                  <DocumentImage
                    alt="document"
                    src={snap.doc_url}
                    onError={() => console.log("error loading image")}
                    height={190}
                    width={230}
                    className="h-full w-full object-contain object-center p-1 drop-shadow-md"
                    onClick={() => onPreview("preview", document)}
                  />
                  <div
                    className="bg-opacity-10 absolute inset-0 hidden items-center justify-center bg-white/40 opacity-0 transition-opacity group-hover:opacity-100 md:flex"
                    onClick={() => onPreview("preview", document)}
                  >
                    <div className="flex cursor-pointer items-center gap-2 rounded border bg-white px-3 py-2 text-sm shadow-md">
                      <EyeIcon
                        width={20}
                        height={20}
                        className="text-primary"
                      />
                      <div>View Document</div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <DocumentUpload document={document} format={format} closeDeager={closeDeager} />
          )}
        </div>
      </div>

      <Dialog open={isInfo} onOpenChange={setIsInfo}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{document?.doc_display_name}</DialogTitle>
            <DialogDescription className="font-semibold">
              {document?.doc_short_description}
            </DialogDescription>

            <DialogDescription>{document?.doc_description}</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
};

interface RenderDocsBadgeProps {
  format?: string[];
}

// const RenderDocsBadge: React.FC<RenderDocsBadgeProps> = ({ format }) => {
//   if (!format?.length) return null;
//   const badgeText = format.join(", ").toUpperCase();
//   return (
//     <TooltipProvider>
//       <Tooltip>
//         <TooltipTrigger type="button" className="flex">
//           <Badge className="bg-primary/90 text-[10px] tracking-wide">
//             {format.length > 2
//               ? `${format.slice(0, 1).join(", ").toUpperCase()}, +${format.length - 1} more`
//               : badgeText}
//           </Badge>
//         </TooltipTrigger>
//         <TooltipContent
//           arrowClassName="bg-white fill-white"
//           className="border border-slate-100 bg-white text-slate-500 shadow-md"
//         >
//           <p>Supported file types: {badgeText}</p>
//         </TooltipContent>
//       </Tooltip>
//     </TooltipProvider>
//   );
// };

const RenderDocsBadge: React.FC<RenderDocsBadgeProps> = ({ format }) => {
  if (!format?.length) return null;
  const badgeText = format.join(", ").toUpperCase();

  const badgeContent =
    format.length > 2
      ? `${format.slice(0, 1).join(", ").toUpperCase()}, +${format.length - 1} more`
      : badgeText;

  return (
    <>
      {/* Desktop: Tooltip */}
      <div className="hidden md:flex">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger type="button" className="flex">
              <Badge className="bg-primary/90 cursor-pointer text-[10px] tracking-wide">
                {badgeContent}
              </Badge>
            </TooltipTrigger>
            <TooltipContent
              arrowClassName="bg-white fill-white"
              className="border border-slate-100 bg-white text-slate-500 shadow-md"
            >
              <p>Supported file types: {badgeText}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Mobile: Dialog */}
      <div className="flex md:hidden">
        <Dialog>
          <DialogTrigger asChild>
            <Badge className="bg-primary/90 cursor-pointer text-[10px] tracking-wide">
              {badgeContent}
            </Badge>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Supported file types</DialogTitle>
            </DialogHeader>
            <p>{badgeText}</p>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};
