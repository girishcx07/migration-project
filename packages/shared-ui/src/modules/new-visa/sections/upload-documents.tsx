"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Check,
  ChevronsDown,
  ChevronsUp,
  Clipboard,
  FileTextIcon,
  Info,
  LoaderCircle,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";

import type {
  Demand,
  RequiredDocument,
  UploadedDocumentImage,
} from "@acme/types/new-visa";
import { useTRPC } from "@acme/api/react";
import Dragger from "@acme/shared-ui/components/dragger";
import useCopyToClipboard from "@acme/shared-ui/hooks/use-copy-to-clipboard";
import { useIsMobile } from "@acme/shared-ui/hooks/use-is-mobile";
import {
  convertToJpeg,
  createDocString,
} from "@acme/shared-ui/lib/new-visa-utils";
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
} from "@acme/ui/components/alert-dialog";
import { Button } from "@acme/ui/components/button";
import { Card, CardContent } from "@acme/ui/components/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@acme/ui/components/dialog";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@acme/ui/components/hover-card";
import { ScrollArea } from "@acme/ui/components/scroll-area";
import { Skeleton } from "@acme/ui/components/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@acme/ui/components/tooltip";

import { useVisaColumn } from "../context/visa-columns-context";
import { useUploadDocuments } from "../hooks/use-upload-documents";

const ACCEPTED_FILE_MIME_TYPES = {
  "image/jpeg": [".jpg", ".jpeg", ".jfif"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "application/pdf": [".pdf"],
} as const;

const MAX_UPLOAD_DOCUMENT_SIZE = 20 * 1024 * 1024;

export default function UploadDocuments() {
  const trpc = useTRPC();
  const isMobile = useIsMobile();
  const {
    data: { visaOffer, uploadedDocuments, visaApplication },
    columnNumber,
    setUploadedDocuments,
    setUploadingDocuments,
  } = useVisaColumn();

  const [isProcessingDrop, setIsProcessingDrop] = useState(false);
  const [isShowMore, setIsShowMore] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const { handleUploadFile, cancelAllUploads, isPending } = useUploadDocuments({
    onSuccess: (docs) => {
      setUploadedDocuments((prev) => [...prev, ...docs]);
    },
    // onCancel: () => {
    //   toast("Upload cancelled", {
    //     description: "The upload process has been cancelled.",
    //   });
    // },
  });

  const payload = {
    travelling_to_identity: visaOffer?.travelling_to_identity as string,
    visa_id: visaOffer?.visa_details?.visa_id as string,
  };

  const { data: documentsData, isFetching } = useQuery({
    ...trpc.newVisa.getVisaDocuments.queryOptions(payload),
    enabled:
      !!payload.travelling_to_identity &&
      !!payload.visa_id &&
      columnNumber === 3,
  });

  const requiredDocsArr = documentsData?.required_documents as
    | RequiredDocument[]
    | undefined;
  const demandArr = documentsData?.evaluate?.map((item) => item.demand?.[0]) as
    | Demand[]
    | undefined;

  const { isCopied, copyToClipboard } = useCopyToClipboard();
  const [isDocDialogOpen, setDocDialogOpen] = useState(false);
  const [docInfo, setDocInfo] = useState<VisaDocument | null>(null);

  useEffect(() => {
    setUploadingDocuments(isPending || isProcessingDrop);
  }, [isPending, isProcessingDrop, setUploadingDocuments]);

  useEffect(() => {
    if (columnNumber !== 3) {
      cancelAllUploads();

      if (uploadedDocuments?.length) {
        setUploadedDocuments([]);
      }
    }
  }, [cancelAllUploads, columnNumber, setUploadedDocuments, uploadedDocuments]);

  useEffect(() => {
    if (!contentRef.current) {
      return;
    }

    const element = contentRef.current;
    setIsOverflowing(element.scrollHeight > element.clientHeight);
  }, [demandArr, isFetching, requiredDocsArr]);

  const handleDraggerChange = async (files: File[]) => {
    setIsProcessingDrop(true);
    const processedFiles: File[] = [];

    for (const file of files) {
      if (file.type === "application/pdf") {
        processedFiles.push(file);
      } else {
        processedFiles.push(await convertToJpeg(file));
      }
    }

    await handleUploadFile(
      processedFiles,
      visaApplication.nationality?.cioc as string,
      visaOffer?.visa_details?.visa_id as string,
    );
    setIsProcessingDrop(false);
  };

  const handleCopy = () => {
    const required = createDocString(requiredDocsArr ?? [], false);
    const additional = createDocString(demandArr ?? [], true);
    copyToClipboard(`${required}\n${additional}`);
  };

  const handleInfoClick = (doc: VisaDocument) => {
    setDocInfo(doc);
    setDocDialogOpen(true);
  };

  const hasDocumentsError = uploadedDocuments?.some(
    (doc) => !doc.is_valid && doc.file_type !== "application/pdf",
  );

  return (
    <>
      <div
        className={`flex h-full flex-col gap-2 py-2 ${isShowMore ? "" : "overflow-hidden"}`}
      >
        <div
          className={`relative flex-1 px-6 ${isShowMore ? "h-auto max-h-none overflow-visible" : "max-h-[350px] overflow-y-auto"}`}
        >
          <Card ref={contentRef} className="h-full gap-2 overflow-hidden py-0">
            <div className="text-md flex items-center justify-between rounded bg-gray-100 p-2 font-semibold text-black">
              Documents
              {!isCopied ? (
                <Clipboard
                  onClick={handleCopy}
                  className="h-5 w-5 cursor-pointer"
                />
              ) : (
                <span className="flex items-center text-xs text-green-500">
                  <Check className="mr-1 h-4 w-4" /> Copied
                </span>
              )}
            </div>

            <CardContent className="min-h-32 pb-9">
              {isFetching ? (
                <UploadDocumentsSkeleton />
              ) : !requiredDocsArr?.length ? (
                <p>No Data Found!</p>
              ) : (
                <>
                  <DocSection
                    title="Required Documents"
                    documents={requiredDocsArr}
                    onInfoClick={handleInfoClick}
                  />
                  {demandArr?.length ? (
                    <DocSection
                      title="Additional Documents"
                      documents={demandArr}
                      onInfoClick={handleInfoClick}
                    />
                  ) : null}
                </>
              )}
            </CardContent>
          </Card>

          {isOverflowing ? (
            <div
              className="absolute right-1/2 bottom-0 z-50 flex translate-x-1/2 cursor-pointer items-center gap-2 rounded-sm bg-gray-200 p-2 py-1 hover:bg-gray-300"
              onClick={() => setIsShowMore((prev) => !prev)}
            >
              <span className="text-sm">
                {isShowMore ? "Show Less" : "Show More"}
              </span>
              {isShowMore ? (
                <ChevronsUp size={14} />
              ) : (
                <ChevronsDown size={14} />
              )}
            </div>
          ) : null}
        </div>

        <div
          className={`sticky right-0 left-0 w-full border-t bg-white px-6 pt-2 pb-3 ${isShowMore ? "" : "bottom-0"}`}
        >
          <Dragger
            uploadOptions={{
              accept: ACCEPTED_FILE_MIME_TYPES,
              multiple: true,
              maxSize: MAX_UPLOAD_DOCUMENT_SIZE,
              onDrop: (files) => {
                void handleDraggerChange(files);
              },
              onDropRejected: () => {
                setIsProcessingDrop(false);
              },
            }}
          />

          {isPending ? (
            <div className="my-2 flex items-center gap-2 text-xs text-slate-500">
              Uploading documents{" "}
              <LoaderCircle className="text-primary h-5 w-5 animate-spin" />
            </div>
          ) : null}

          {uploadedDocuments?.length ? (
            <Dialog>
              <DialogTrigger>
                <Button
                  type="button"
                  variant="outline"
                  className="bg-primary/10 hover:bg-primary/20 border-primary text-primary hover:text-primary relative my-3 w-full"
                >
                  View Uploaded Documents
                  <span className="border-primary relative ml-2 flex min-h-6 min-w-6 items-center justify-center rounded-full border px-2 py-0.5">
                    {uploadedDocuments.length}
                    {hasDocumentsError ? (
                      <Info
                        fill="red"
                        className="absolute -top-1 -right-1 size-4 text-white"
                      />
                    ) : null}
                  </span>
                </Button>
              </DialogTrigger>

              <DialogContent className="h-[75vh] min-w-[60vw] overflow-hidden sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Uploaded Documents</DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-[60vh] overflow-hidden">
                  <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {uploadedDocuments.map((file, index) => (
                      <UploadedFileCard
                        key={index}
                        file={file}
                        onDelete={() =>
                          setUploadedDocuments(
                            uploadedDocuments.filter(
                              (_, itemIndex) => itemIndex !== index,
                            ),
                          )
                        }
                      />
                    ))}
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>
          ) : null}
        </div>
      </div>

      <Dialog open={isDocDialogOpen} onOpenChange={setDocDialogOpen}>
        <DialogContent className="sm:min-h-32 sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{docInfo?.doc_display_name}</DialogTitle>
            <DialogDescription>
              {docInfo?.doc_short_description}
            </DialogDescription>
          </DialogHeader>
          <p className="text-xs text-black">{docInfo?.doc_description}</p>
        </DialogContent>
      </Dialog>
    </>
  );
}

type VisaDocument = RequiredDocument | Demand;

function DocSection<T extends VisaDocument>({
  title,
  documents,
  onInfoClick,
}: {
  title: string;
  documents: T[];
  onInfoClick: (doc: T) => void;
}) {
  return (
    <div className="mb-3">
      <p className="text-primary mb-2 text-sm font-semibold">{title}</p>
      <ol className="ml-3 list-decimal space-y-2 marker:text-black">
        {documents.map((doc) => (
          <li key={doc.doc_id} className="text-sm">
            <div className="flex items-center justify-between">
              <div>
                {doc.doc_display_name}
                {"doc_snap" in doc && doc.doc_snap?.[0]?.mandatory ? (
                  <span className="text-red-500">*</span>
                ) : null}
              </div>
              <Info
                className="h-4 w-4 cursor-pointer"
                onClick={() => onInfoClick(doc)}
              />
            </div>
            <div className="text-[12px] text-gray-500">
              {doc.doc_short_description}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function UploadedFileCard({
  file,
  onDelete,
}: {
  file: UploadedDocumentImage;
  onDelete: () => void;
}) {
  const isMobile = useIsMobile();
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const errorMessages = Array.isArray(file.error_message as unknown)
    ? (file.error_message as unknown as string[])
    : [file.error_message ?? "Image too small or unclear"];

  const handleDelete = () => {
    setIsLoading(true);
    onDelete();
    setTimeout(() => setIsLoading(false), 500);
  };

  return (
    <div className="max-h-72 overflow-hidden rounded-lg border bg-gray-200/75 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="truncate">
          <Tooltip>
            <TooltipTrigger className="w-full truncate text-left">
              <p>{file.original_file_name}</p>
            </TooltipTrigger>
            <TooltipContent className="border bg-white text-gray-500 shadow-sm">
              {file.original_file_name}
            </TooltipContent>
          </Tooltip>
        </span>
        <AlertDialog>
          <AlertDialogTrigger>
            <button type="button">
              <Trash2Icon size={15} className="cursor-pointer text-red-500" />
            </button>
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
                onClick={handleDelete}
                disabled={isLoading}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      {file.file_name?.endsWith(".pdf") ? (
        <div className="relative flex h-32 w-full items-center justify-center rounded-md border bg-white">
          <span className="absolute top-1 right-1 z-10 rounded bg-red-500 px-2 text-xs text-white">
            PDF
          </span>
          <FileTextIcon className="text-red-500" height={105} width={105} />
        </div>
      ) : (
        <div className="relative flex h-32 w-full items-center justify-center overflow-hidden rounded-md border bg-white">
          {!file.is_valid ? (
            isMobile ? (
              <>
                <div
                  className="absolute top-0 right-0 z-10 cursor-pointer"
                  onClick={() => setShowError((prev) => !prev)}
                >
                  <Info fill="red" className="size-4 text-white" />
                </div>
                {showError ? (
                  <div className="absolute top-6 right-0 z-50 w-56 rounded-md border bg-white p-2 text-sm text-red-500 shadow-md">
                    {errorMessages.length > 1 ? (
                      <ul className="list-disc pl-4">
                        {errorMessages.map((error) => (
                          <li key={error}>{error}</li>
                        ))}
                      </ul>
                    ) : (
                      errorMessages[0]
                    )}
                  </div>
                ) : null}
              </>
            ) : (
              <HoverCard>
                <HoverCardTrigger>
                  <div className="absolute top-0 right-0 z-10 cursor-pointer">
                    <Info fill="red" className="size-4 text-white" />
                  </div>
                </HoverCardTrigger>
                <HoverCardContent
                  side="top"
                  align="end"
                  className="border-border w-56 p-2 text-sm text-red-500"
                >
                  {errorMessages.length > 1 ? (
                    <ul className="list-disc pl-4">
                      {errorMessages.map((error) => (
                        <li key={error}>{error}</li>
                      ))}
                    </ul>
                  ) : (
                    errorMessages[0]
                  )}
                </HoverCardContent>
              </HoverCard>
            )
          ) : null}
          <img
            src={file.file}
            alt={file.file_name}
            loading="lazy"
            className="h-full w-full object-contain object-center p-1"
          />
        </div>
      )}
    </div>
  );
}

export function UploadDocumentsSkeleton() {
  return (
    <div className="mb-3 space-y-3">
      {[...Array(6)].map((_, index) => (
        <Skeleton
          key={index}
          className={`h-4 ${index % 2 === 0 ? "w-[250px]" : "w-[200px]"}`}
        />
      ))}
    </div>
  );
}
