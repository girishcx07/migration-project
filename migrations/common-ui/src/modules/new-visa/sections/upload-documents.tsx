import { useQuery } from "@tanstack/react-query";
import {
  Demand,
  RequiredDocument,
  UploadedDocumentImage,
} from "@workspace/types/new-visa";

import Dragger from "@workspace/common-ui/components/dragger";
import { ACCEPTED_FILE_MIME_TYPES } from "@workspace/common-ui/constants";
import useCopyToClipboard from "@workspace/common-ui/hooks/use-copy-to-clipboard";
import { convertToJpeg, createDocString } from "@workspace/common-ui/lib/utils";
import { orpc } from "@workspace/orpc/lib/orpc";
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
} from "@workspace/ui/components/alert-dialog";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Skeleton } from "@workspace/ui/components/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
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
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { RaffApplicationSection } from "../components/raff-application-section";
import { useVisaColumn } from "../context/visa-columns-context";
import { useUploadDocuments } from "../hooks/use-upload-documents";
import { useRouteContext } from "@workspace/common-ui/context/route-context";
import { useIsMobile } from "@workspace/common-ui/hooks/use-is-mobile";
import { MobileDocumentEditor } from "../../../components/mobile-document-editor";
import { MAX_UPLOAD_DOCUMENT_SIZE } from "@workspace/common/constants";
import { ocrSchema } from "@workspace/orpc/schemas/new-visa";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@workspace/ui/components/hover-card";

const UploadDocuments = () => {
  const {
    data: { visaOffer, uploadedDocuments, visaApplication },
    columnNumber,
    setUploadedDocuments,
    setUploadingDocuments,
  } = useVisaColumn();

  const { workflow } = useRouteContext();

  const isValidDocument = uploadedDocuments?.some((doc) => doc.is_valid);

  const [isProcessingDrop, setIsProcessingDrop] = useState(false);
  const [isShowMore, setIsShowMore] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const isMobile = useIsMobile();
  const [mobileCropFile, setMobileCropFile] = useState<File | null>(null);
  const [isMobileEditorOpen, setIsMobileEditorOpen] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);

  const { handleUploadFile, cancelAllUploads, isPending } = useUploadDocuments({
    onSuccess: (docs) => {
      setUploadedDocuments((prev) => [...prev, ...docs]);
    },
    onFailure: () => { },
    onCancel: () => {
      toast("Upload cancelled", {
        description: "The upload process has been cancelled.",
      });
    },
  });

  console.log("uploadedDocuments,", {
    uploadedDocuments,
  });

  const handleDraggerChange = async (files: File[]) => {
    setIsProcessingDrop(true);
    const processedFiles: File[] = [];

    for (const file of files) {
      if (file.type === "application/pdf") {
        // keep PDF as is
        processedFiles.push(file);
      } else {
        try {
          const converted = await convertToJpeg(file);
          processedFiles.push(converted);
        } catch (error) {
          console.error("Image conversion failed:", error);
        }
      }
    }
    console.log("processedFiles", processedFiles);

    // If on mobile and it's a single image, intercept and open MobileDocumentEditor
    if (
      isMobile &&
      processedFiles.length === 1 &&
      processedFiles[0]?.type.startsWith("image/")
    ) {
      setMobileCropFile(processedFiles[0]!);
      setIsMobileEditorOpen(true);
      setIsProcessingDrop(false);
      return;
    }

    handleUploadFile(
      processedFiles,
      visaApplication.nationality?.cioc as string,
      visaOffer?.visa_details?.visa_id as string,
    );
    setIsProcessingDrop(false);
  };

  const handleMobileSave = (croppedFile: File) => {
    handleUploadFile(
      [croppedFile],
      visaApplication.nationality?.cioc as string,
      visaOffer?.visa_details?.visa_id as string,
    );
  };

  useEffect(() => {
    setUploadingDocuments(isPending || isProcessingDrop || isMobileEditorOpen);
  }, [isPending, isProcessingDrop, isMobileEditorOpen, setUploadingDocuments]);

  //   payload generation
  const payload = {
    visa_id: visaOffer?.visa_details?.visa_id as string,
    travelling_to_identity: visaOffer?.travelling_to_identity as string,
  };

  const isQueryEnabled =
    !!payload.travelling_to_identity && !!payload.visa_id && columnNumber === 3;

  const { data: documentsData, isFetching } = useQuery({
    ...orpc.visa.getVisaDocuments.queryOptions({
      input: payload,
    }),
    enabled: isQueryEnabled, // ✅ override runtime option safely
  });
  const data = documentsData?.data;

  const { isCopied, copyToClipboard } = useCopyToClipboard();

  const [isDocDialogOpen, setDocDialogOpen] = useState(false);
  const [docInfo, setDocInfo] = useState<VisaDocument | null>(null);

  const requiredDocsArr = data?.required_documents as RequiredDocument[];
  const demandArr = data?.evaluate?.map((a) => a.demand?.[0]) as Demand[];

  useEffect(() => {
    if (columnNumber !== 3) {
      cancelAllUploads();

      // Clear uploaded files
      if (uploadedDocuments && uploadedDocuments.length > 0) {
        setUploadedDocuments([]);
      }
    }
  }, [columnNumber]);

  const handleCopy = () => {
    const required = createDocString(requiredDocsArr, false);
    const additional = createDocString(demandArr, true);
    copyToClipboard(`${required}\n${additional}`);
  };

  const handleInfoClick = (doc: VisaDocument) => {
    setDocInfo(doc);
    setDocDialogOpen(true);
  };

  // Detect overflow when content changes
  useEffect(() => {
    if (!contentRef.current) return;

    const el = contentRef.current;
    console.log("scrollHeight", {
      scrollHeight: el.scrollHeight,
      newscrollHeight: el.scrollHeight,
      clientHeight: el.clientHeight,
      showButton: el.scrollHeight > el.clientHeight,
    });
    // scrollHeight > clientHeight means content is overflowing
    if (el.scrollHeight > el.clientHeight) {
      setIsOverflowing(true);
    } else {
      setIsOverflowing(false);
    }
  }, [requiredDocsArr, demandArr, isFetching]);

  const hasDocumentsError = uploadedDocuments?.some(
    (doc) => !doc?.is_valid && doc?.file_type !== "application/pdf" 
  );

  // const moduleType = getCookie("module_type");

  return (
    <>
      <div
        className={`flex h-full flex-col gap-2 py-2 ${isShowMore ? "" : "overflow-hidden"} `}
      >
        {workflow === "evm" && (
          <div className="mb-3 px-6">
            <RaffApplicationSection />
          </div>
        )}
        {/* Scrollable Documents Section */}
        <div
          className={`relative flex-1 px-6 ${isShowMore ? "h-auto max-h-none overflow-visible" : "max-h-[350px] overflow-y-auto"}`}
        >
          <Card
            ref={contentRef}
            className={`h-full gap-2 overflow-hidden py-0`}
          >
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
              ) : requiredDocsArr?.length === 0 ? (
                <p>No Data Found!</p>
              ) : (
                <>
                  <DocSection<RequiredDocument>
                    title="Required Documents"
                    documents={requiredDocsArr}
                    onInfoClick={handleInfoClick}
                  />
                  {demandArr?.length > 0 && (
                    <DocSection<Demand>
                      title="Additional Documents"
                      documents={demandArr}
                      onInfoClick={handleInfoClick}
                    />
                  )}
                </>
              )}
            </CardContent>
          </Card>
          {isOverflowing && (
            <div
              className="absolute right-1/2 bottom-0 z-50 flex translate-x-1/2 cursor-pointer items-center gap-2 rounded-sm bg-gray-200 p-2 py-1 hover:bg-gray-300"
              onClick={() => setIsShowMore(!isShowMore)}
            >
              <span className="text-sm">
                {isShowMore ? "Show Less" : "Show More"}
              </span>{" "}
              {isShowMore ? (
                <ChevronsUp size={14} />
              ) : (
                <ChevronsDown size={14} />
              )}
            </div>
          )}
        </div>

        {/* Sticky Dragger Section */}
        <div
          className={`sticky right-0 left-0 w-full border-t bg-white px-6 pt-2 pb-3 ${isShowMore ? "" : "bottom-0"} `}
        >
          <Dragger
            uploadOptions={{
              // accept: {
              //   "image/jpeg": ["jpg", "jpeg", "jfif"],
              //   "image/png": ["png"],
              //   "application/pdf": ["pdf"],
              //   "image/webp": ["webp"],
              //   "image/heic": ["heic"],
              //   "image/heif": ["heif"],
              // },
              accept: ACCEPTED_FILE_MIME_TYPES,
              multiple: true,
              maxSize: MAX_UPLOAD_DOCUMENT_SIZE,
              onError: (err) => {
                console.log("error >>", err);
              },
              onDrop: (files) => {
                handleDraggerChange(files);
              },
              onDropRejected: (fileRejections) => {
                setIsProcessingDrop(false);
              },
            }}
          />

          {/* Uploading Loader */}
          {isPending && (
            <div className="my-2 flex items-center gap-2 text-xs text-slate-500">
              Uploading documents{" "}
              <LoaderCircle className="text-primary h-5 w-5 animate-spin" />
            </div>
          )}

          {/* Uploaded Documents Button */}
          {uploadedDocuments && uploadedDocuments?.length > 0 && (
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="bg-primary/10 hover:bg-primary/20 border-primary text-primary hover:text-primary relative my-3 w-full"
                >
                  View Uploaded Documents
                  <span className="border-primary relative ml-2 flex min-h-6 min-w-6 items-center justify-center rounded-full border px-2 py-0.5">
                    {uploadedDocuments.length}

                    {hasDocumentsError && (
                      <Info
                        fill="red"
                        className="absolute -top-1 -right-1 size-4 text-white"
                      />
                    )}
                  </span>
                </Button>
              </DialogTrigger>

              <DialogContent className="h-[75vh] min-w-[60vw] overflow-hidden sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Uploaded Documents</DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-[60vh] overflow-hidden">
                  <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {uploadedDocuments?.map((file, i) => (
                      <UploadedFileCard
                        key={i}
                        file={file}
                        onDelete={() =>
                          setUploadedDocuments(
                            uploadedDocuments.filter((_, index) => index !== i),
                          )
                        }
                      />
                    ))}
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
      {/* Document Info Dialog */}
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

      <MobileDocumentEditor
        isOpen={isMobileEditorOpen}
        setIsOpen={setIsMobileEditorOpen}
        file={mobileCropFile}
        onSave={handleMobileSave}
        title="Edit Uploaded Document"
      />
    </>
  );
};

export default UploadDocuments;

type VisaDocument = RequiredDocument | Demand;

interface DocSectionProps<T extends VisaDocument> {
  title: string;
  documents: T[];
  onInfoClick: (doc: T) => void;
}

const DocSection = <T extends VisaDocument>({
  title,
  documents,
  onInfoClick,
}: DocSectionProps<T>) => (
  <div className="mb-3">
    <p className="text-primary mb-2 text-sm font-semibold">{title}</p>
    <ol className="ml-3 list-decimal space-y-2 marker:text-black">
      {documents?.map((doc) => (
        <li key={doc.doc_id} className="text-sm">
          <div className="flex items-center justify-between">
            <div>
              {doc.doc_display_name}
              {"doc_snap" in doc && doc.doc_snap?.[0]?.mandatory && (
                <span className="text-red-500">*</span>
              )}
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

const UploadedFileCard = ({
  file,
  onDelete,
}: {
  file: UploadedDocumentImage;
  onDelete: () => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);

  const isMobile = useIsMobile()

  const isArrayOfError = Array.isArray(file?.error_message)


  console.log("UploadedFileCard file", file)
  const handleDelete = () => {
    setIsLoading(true);
    onDelete();
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };
  return (
    <div className="max-h-72 overflow-hidden rounded-lg border bg-gray-200/75 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="truncate">
          <Tooltip>
            <TooltipTrigger asChild className="w-full truncate text-left">
              <p autoFocus={false}>{file?.original_file_name as string}</p>
            </TooltipTrigger>
            <TooltipContent
              arrowClassName="bg-white w-full fill-white border-b border-r"
              className="border bg-white text-gray-500 shadow-sm"
            >
              {file?.original_file_name as string}
            </TooltipContent>
          </Tooltip>
        </span>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button>
              <Trash2Icon size={15} className="cursor-pointer text-red-500" />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
              <AlertDialogDescription>
                <div>
                  <div>Are you sure you want to delete this document?</div>
                </div>
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
          {!file?.is_valid && (

            isMobile ?
              // (<Popover>
              //   <PopoverTrigger className="absolute top-0 right-0 z-10">
              //     <Info fill="red" className="size-4 text-white" />
              //   </PopoverTrigger>
              //   <PopoverContent className="border-border p-2 text-sm text-red-500">
              //     {

              //       isArrayOfError ?
              //         <ul className="list-disc pl-4">
              //           {
              //             Array.isArray(file?.error_message) && file?.error_message?.map((error: string) => {
              //               return (
              //                 <li key={error}>{error}</li>
              //               )
              //             })
              //           }
              //         </ul>
              //         : file?.error_message || "Image too small or unclear"}
              //   </PopoverContent>
              // </Popover>)
              (
                <>
                  <div
                    className="absolute top-0 right-0 z-10 cursor-pointer"
                    onClick={() => setShowError((prev) => !prev)}
                  >
                    <Info fill="red" className="size-4 text-white" />
                  </div>

                  {showError && (
                    <div className="absolute top-6 right-0 z-50 w-56 rounded-md border bg-white p-2 text-sm text-red-500 shadow-md">
                      {
                        isArrayOfError ? (
                          <ul className="list-disc pl-4">
                            {
                              Array.isArray(file?.error_message) &&
                              file?.error_message?.map((error: string) => (
                                <li key={error}>{error}</li>
                              ))
                            }
                          </ul>
                        ) : (
                          file?.error_message || "Image too small or unclear"
                        )
                      }
                    </div>
                  )}
                </>
              ) :
              (<HoverCard openDelay={100} closeDelay={100}>
                <HoverCardTrigger asChild>
                  <div className="absolute top-0 right-0 z-10 cursor-pointer">
                    <Info fill="red" className="size-4 text-white" />
                  </div>
                </HoverCardTrigger>

                <HoverCardContent
                  side="top"
                  align="end"
                  className="border-border w-56 p-2 text-sm text-red-500"
                >
                  {
                    isArrayOfError ? (
                      <ul className="list-disc pl-4">
                        {
                          Array.isArray(file?.error_message) &&
                          file?.error_message?.map((error: string) => (
                            <li key={error}>{error}</li>
                          ))
                        }
                      </ul>
                    ) : (
                      file?.error_message || "Image too small or unclear"
                    )
                  }
                </HoverCardContent>
              </HoverCard>)
          )}
          <img
            src={file.file}
            alt={file.file_name}
            loading="lazy"
            className="h-full w-full object-contain object-center p-1"
          />
        </div >
      )
      }
    </div >
  );
};

export const UploadDocumentsSkeleton = () => (
  <div className="mb-3 space-y-3">
    {[...Array(6)].map((_, i) => (
      <Skeleton
        key={i}
        className={`h-4 ${i % 2 === 0 ? "w-[250px]" : "w-[200px]"}`}
      />
    ))}
  </div>
);
