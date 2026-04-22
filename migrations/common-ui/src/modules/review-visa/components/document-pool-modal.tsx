"use client";

import { useQuery } from "@tanstack/react-query";
import AutoSelect from "@workspace/common-ui/components/auto-select";
import Dragger from "@workspace/common-ui/components/dragger";
import { queryClient } from "@workspace/common-ui/lib/react-query";
import { cn, convertToJpeg } from "@workspace/common-ui/lib/utils";
import { orpc } from "@workspace/orpc/lib/orpc";
import {
  ApplicantRequiredDocument,
  DocumentPoolCardType,
  DocumentsPool,
  OptionType,
} from "@workspace/types/review";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Loader2Icon } from "lucide-react";
import { useState } from "react";
import { useApplicationState } from "../context/review-visa-context";
import { useUploadAndExtractDocumentsForApplication } from "../hooks/use-upload-and-extract-document-for-application";
import { DocumentPoolCard } from "./document-pool-card";
import { useIsMobile } from "@workspace/common-ui/hooks/use-is-mobile";
import { MobileDocumentEditor } from "../../../components/mobile-document-editor";
import { MAX_UPLOAD_DOCUMENT_SIZE } from "@workspace/common/constants";

interface DocumentPoolModalProps {
  uploadedDocuments: ApplicantRequiredDocument[];
}

const DocumentPoolModal = ({ uploadedDocuments }: DocumentPoolModalProps) => {
  const [selectedDocumentType, setSelectedDocumentType] = useState<
    OptionType | undefined
  >();
  const {
    actionType,
    isDocumentPoolOpen,
    setIsDocumentPoolOpen,
    selectedDocument,
    getActiveApplicant,
    setSelectedDocument,
    setActionType,
    applicationDetails: applicationData,
    applicationId,
  } = useApplicationState();

  const destinationCode = applicationData?.application?.travelling_to;

  // Fetch document types based on destination
  const { data, isLoading: isDocumentTypesLoading } = useQuery(
    orpc.visa.getDocumentTypes.queryOptions({
      input: {
        destinationCode: destinationCode,
      },
      enabled: !!destinationCode && isDocumentPoolOpen && actionType === "add",
    }),
  );

  const documentTypesData = data?.data;

  // Fetch documents pool
  const { data: docPoolData, isLoading: isDocumentsLoading } = useQuery(
    orpc.visa.getApplicationDocumentsPool.queryOptions({
      input: { applicationId: applicationId },
      enabled: isDocumentPoolOpen,
    }),
  );

  const documentsData = docPoolData?.data;

  const documentPoolData = documentsData?.documents_pool.sort((a, b) => {
    const getRank = (doc: DocumentsPool) => {
      if (doc?.applicant_ids?.length > 1) return 2;
      if (doc?.applicant_ids?.length === 1) return 1;
      return 0;
    };
    return getRank(a) - getRank(b);
  });

  const isMobile = useIsMobile();
  const [mobileCropFile, setMobileCropFile] = useState<File | null>(null);
  const [isMobileEditorOpen, setIsMobileEditorOpen] = useState(false);

  // Handle file upload
  const { handleUploadFile, isPending } =
    useUploadAndExtractDocumentsForApplication({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.visa.getApplicationDocumentsPool.key(),
        });
      },
    });

  const handleDraggerChange = async (files: File[]) => {
    const processedFiles: File[] = [];
    for (const file of files) {
      if (file.type === "application/pdf") {
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

    // If on mobile and it's a single image, intercept and open MobileDocumentEditor
    if (
      isMobile &&
      processedFiles.length === 1 &&
      processedFiles[0]?.type.startsWith("image/")
    ) {
      setMobileCropFile(processedFiles[0]!);
      setIsMobileEditorOpen(true);
      return;
    }

    handleUploadFile(processedFiles);
  };

  const handleMobileSave = (croppedFile: File) => {
    handleUploadFile([croppedFile]);
  };

  const extensionToMime: Record<string, string> = {
    png: "image/png",
    jpeg: "image/jpeg",
    jpg: "image/jpeg",
    jfif: "image/jpeg",
    pdf: "application/pdf",
  };

  const applicantName = getActiveApplicant()?.name;

  const generateAcceptObject = (extensions: string[]) =>
    extensions.reduce(
      (acc, ext) => {
        const mime = extensionToMime[ext];
        if (mime) {
          acc[mime] = [...(acc[mime] || []), `.${ext}`];
        }
        return acc;
      },
      {} as Record<string, string[]>,
    );

  const requiredFormats: string[] =
    actionType === "add"
      ? selectedDocumentType?.doc_specification?.format || []
      : selectedDocument?.doc_snap[0]?.doc_specification?.format || [];

  const fileTypes =
    selectedDocument?.doc_snap[0]?.doc_specification?.format || [];

  const acceptFormats = generateAcceptObject(requiredFormats);

  const handleClose = () => {
    setIsDocumentPoolOpen(false);
    setSelectedDocumentType(undefined);
    setSelectedDocument(null);
    setActionType(null);
  };

  const uploadedTypes = new Set(uploadedDocuments.map((doc) => doc.doc_type));

  const options: OptionType[] =
    documentTypesData?.data
      ?.filter((docType) => !uploadedTypes.has(docType.doc_name))
      .map((x) => ({
        label: x.doc_display_name,
        value: x.doc_name,
        ...x,
      })) || [];

  return (
    <Dialog open={isDocumentPoolOpen} onOpenChange={handleClose}>
      <DialogContent className="min-h-[80vh] min-w-[85vw]">
        <DialogHeader>
          <DialogTitle>Document Pool</DialogTitle>

          <div className="mt-4 flex h-full flex-col space-y-4">
            {["replace", "link"].includes(actionType || "") && (
              <DialogDescription>
                Select the
                {actionType === "add" ? (
                  <b>&nbsp;{selectedDocumentType?.doc_display_name}</b>
                ) : (
                  <b>&nbsp;{selectedDocument?.doc_display_name}</b>
                )}{" "}
                for <b>{applicantName}</b>.
                {fileTypes.length > 0 && (
                  <>
                    (
                    {fileTypes?.map((i, ind) => (
                      <span key={ind} className="uppercase">
                        {i}
                        {ind + 1 !== fileTypes.length && ", "}
                      </span>
                    ))}
                    )
                  </>
                )}
              </DialogDescription>
            )}

            {!["replace", "link"].includes(actionType || "") && (
              <AutoSelect
                options={options}
                value={selectedDocumentType}
                isLoading={isDocumentTypesLoading}
                placeholder="Select Document Type"
                onChange={(value: unknown) =>
                  setSelectedDocumentType(value as OptionType)
                }
                className="w-full md:w-[300px]"
              />
            )}

            {selectedDocumentType || selectedDocument ? (
              <div className="grid h-full grid-cols-2 gap-3 md:max-h-[65vh] md:grid-cols-3">
                {/* Document List Wrapper */}
                <div className="relative col-span-2 max-h-[60vh] md:max-h-[65vh]">
                  {/* Loader Overlay */}
                  {isPending && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-xl bg-white/70 backdrop-blur-sm">
                      <Loader2Icon
                        className="text-primary mb-2 animate-spin"
                        size={28}
                      />
                      <p className="text-primary text-sm font-medium">
                        Loading...
                      </p>
                    </div>
                  )}

                  {/* Actual Document List */}
                  <div
                    className={cn(
                      "grid h-full grid-cols-1 grid-rows-[1fr] gap-2 overflow-y-auto rounded-xl border-2 p-2 md:grid-cols-3 md:grid-rows-none md:gap-x-2",
                      "transition-opacity duration-200",
                      isPending
                        ? "pointer-events-none opacity-60 select-none"
                        : "opacity-100",
                    )}
                  >
                    {isDocumentsLoading ? (
                      <DocumentPoolSkeleton />
                    ) : documentPoolData?.length === 0 ? (
                      <p className="text-muted-foreground col-span-3 text-center text-sm">
                        No documents found.
                      </p>
                    ) : (
                      documentPoolData?.map(
                        (document: DocumentPoolCardType, index) => (
                          <DocumentPoolCard
                            document={document}
                            index={index}
                            key={document.file_name + index}
                            selectedDocumentType={selectedDocumentType}
                            format={requiredFormats}
                          />
                        ),
                      )
                    )}
                  </div>
                </div>

                {/* Upload Area (Desktop) */}
                <div className="relative hidden rounded-xl border bg-gray-50 p-2 md:block">
                  {isPending && (
                    <div className="bg-primary absolute right-2 bottom-2 left-2 z-10 flex items-center gap-2 rounded-b-xl p-2 text-xs text-white">
                      <Loader2Icon className="animate-spin" /> Uploading
                      Documents
                    </div>
                  )}
                  <Dragger
                    className="h-full"
                    uploadOptions={{
                      accept: acceptFormats,
                      maxSize: MAX_UPLOAD_DOCUMENT_SIZE,
                      onDrop: handleDraggerChange,
                    }}
                  />
                </div>

                {/* Upload Area (Mobile) */}
                <div className="min-w-[80vw] md:hidden">
                  <Dragger
                    type="button"
                    uploadOptions={{
                      accept: acceptFormats,
                      maxSize: MAX_UPLOAD_DOCUMENT_SIZE,
                      onDrop: handleDraggerChange,
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground">
                Please select the document from above dropdown!
              </div>
            )}
          </div>
        </DialogHeader>
      </DialogContent>

      <MobileDocumentEditor
        isOpen={isMobileEditorOpen}
        setIsOpen={setIsMobileEditorOpen}
        file={mobileCropFile}
        onSave={handleMobileSave}
        title="Edit Pool Document"
      />
    </Dialog>
  );
};

export default DocumentPoolModal;

const DocumentPoolSkeleton = () => {
  const arr = Array.from({ length: 6 });
  return arr.map((_, index) => (
    <Skeleton
      className="h-full min-h-[240px] w-full rounded-xl border-2"
      key={index}
    />
  ));
};
