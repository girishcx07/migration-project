import { useState } from "react";
import {
  Check,
  ChevronsDown,
  ChevronsUp,
  Clipboard,
  Info,
  LoaderCircle,
} from "lucide-react";

import type { Demand, UploadedDocumentFiles } from "@repo/types/new-visa";
import { Button } from "@repo/ui/components/button";
import { Card, CardFooter } from "@repo/ui/components/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/dialog";
import { ScrollArea } from "@repo/ui/components/scroll-area";
import { Skeleton } from "@repo/ui/components/skeleton";
import { cn } from "@repo/ui/lib/utils";

import type { ApplyVisaActions } from "../types";
import type { VisaDocument } from "../types/apply-visa.types";
import { DocumentDragger } from "../../../components/document-dragger";
import { MobileDocumentEditor } from "../../../components/mobile-document-editor";
import {
  DOCUMENT_DROPZONE_ACCEPT,
  DOCUMENT_UPLOAD_REQUIREMENTS,
  MAX_DOCUMENT_UPLOAD_SIZE,
} from "../constants/document-upload.constants";
import { getAdditionalDocuments } from "../utils/document.utils";
import { DocSection } from "./doc-section";
import { DocumentsEmptyState } from "./documents-empty-state";
import { UploadedFileCard } from "./uploaded-file-card";

export function DocumentsPanel({
  documents,
  documentsLoading,
  enableCropEditor,
  onUpload,
  wrapSection,
  uploadedDocuments,
  uploadPending,
  removeDocument,
}: Readonly<{
  documents: Awaited<ReturnType<ApplyVisaActions["getVisaDocuments"]>> | null;
  documentsLoading: boolean;
  enableCropEditor: boolean;
  onUpload: (files: File[]) => void;
  wrapSection?: React.ReactNode;
  uploadedDocuments: UploadedDocumentFiles;
  uploadPending: boolean;
  removeDocument: (index: number) => void;
}>) {
  const [showAllDocs, setShowAllDocs] = useState(false);
  const [docInfo, setDocInfo] = useState<VisaDocument | null>(null);
  const [copied, setCopied] = useState(false);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [isCropEditorOpen, setIsCropEditorOpen] = useState(false);

  const requiredDocuments = documents?.data?.required_documents ?? [];
  const additionalDocuments = getAdditionalDocuments(
    documents?.data?.evaluate as { demand: Demand[] }[] | undefined,
  );
  const listedDocuments = [...requiredDocuments, ...additionalDocuments];
  const hasDocumentError = uploadedDocuments.some(
    (document) =>
      !document.is_valid && document.file_type !== "application/pdf",
  );
  const shouldShowToggle =
    requiredDocuments.length + additionalDocuments.length > 5;

  const submitFiles = (files: File[]) => {
    if (!files.length) return;

    if (
      enableCropEditor &&
      files.length === 1 &&
      files[0]?.type.startsWith("image/")
    ) {
      setCropFile(files[0]);
      setIsCropEditorOpen(true);
      return;
    }

    onUpload(files);
  };

  const copyDocuments = async () => {
    const required = requiredDocuments
      .map((document, index) => `${index + 1}. ${document.doc_display_name}`)
      .join("\n");
    const additional = additionalDocuments
      .map((document, index) => `${index + 1}. ${document.doc_display_name}`)
      .join("\n");

    await navigator.clipboard.writeText(
      [required, additional].filter(Boolean).join("\n"),
    );
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <>
      <Card className="flex h-full min-h-0 flex-col gap-0 overflow-hidden rounded-lg py-0 shadow-sm">
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="space-y-3 px-2 py-2 md:px-6">
            {wrapSection}

            <section className="bg-card overflow-hidden rounded-lg border shadow-sm">
              <div className="text-foreground flex items-center justify-between gap-3 border-b px-4 py-3 text-base font-semibold">
                <span>Documents</span>
                <button
                  className="hover:bg-muted inline-flex size-8 items-center justify-center rounded-lg"
                  onClick={copyDocuments}
                  type="button"
                >
                  {copied ? (
                    <span className="flex items-center text-xs text-green-600">
                      <Check className="mr-1 size-4" /> Copied
                    </span>
                  ) : (
                    <Clipboard className="size-5 cursor-pointer" />
                  )}
                </button>
              </div>
              <div
                className={cn(
                  "relative p-4",
                  shouldShowToggle &&
                    !showAllDocs &&
                    "max-h-[250px] overflow-hidden",
                )}
              >
                {documentsLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <Skeleton
                        className={cn(
                          "h-4",
                          index % 2 === 0 ? "w-[250px]" : "w-[200px]",
                        )}
                        key={index}
                      />
                    ))}
                  </div>
                ) : listedDocuments.length === 0 ? (
                  <DocumentsEmptyState
                    description="The selected visa offer does not have document requirements available yet."
                    title="No document list available"
                  />
                ) : (
                  <>
                    <DocSection
                      documents={requiredDocuments}
                      onInfoClick={setDocInfo}
                      title="Required Documents"
                    />
                    <DocSection
                      documents={additionalDocuments}
                      onInfoClick={setDocInfo}
                      title="Additional Documents"
                    />
                  </>
                )}
                {shouldShowToggle && !showAllDocs ? (
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center bg-gradient-to-t from-white to-transparent px-4 pt-14 pb-3">
                    <button
                      className="bg-background hover:bg-muted pointer-events-auto flex h-8 items-center gap-2 rounded-lg border px-3 text-sm shadow-sm"
                      onClick={() => setShowAllDocs(true)}
                      type="button"
                    >
                      Show More
                      <ChevronsDown size={14} />
                    </button>
                  </div>
                ) : null}
              </div>
              {shouldShowToggle && showAllDocs ? (
                <div className="flex justify-center px-4 pb-3">
                  <button
                    className="bg-background hover:bg-muted flex h-8 items-center gap-2 rounded-lg border px-3 text-sm shadow-sm"
                    onClick={() => setShowAllDocs(false)}
                    type="button"
                  >
                    Show Less
                    <ChevronsUp size={14} />
                  </button>
                </div>
              ) : null}
            </section>
          </div>
        </div>

        <CardFooter className="shrink-0 border-t bg-white p-0">
          <div className="w-full px-2 pt-2 pb-3 md:px-6">
            <DocumentDragger
              uploadOptions={{
                accept: DOCUMENT_DROPZONE_ACCEPT,
                maxSize: MAX_DOCUMENT_UPLOAD_SIZE,
                multiple: true,
                onDrop: submitFiles,
              }}
            >
              <span className="text-primary text-2xl leading-none">+</span>
              <span className="text-sm font-medium">Upload documents</span>
              <span className="text-muted-foreground text-xs">
                Drag files here or browse from your device
              </span>
              <span className="text-muted-foreground text-xs">
                {DOCUMENT_UPLOAD_REQUIREMENTS}
              </span>
            </DocumentDragger>

            {uploadPending ? (
              <div className="my-2 flex items-center gap-2 text-xs text-slate-500">
                Uploading documents
                <LoaderCircle className="text-primary size-5 animate-spin" />
              </div>
            ) : null}

            {uploadedDocuments.length > 0 ? (
              <Dialog>
                <DialogTrigger
                  render={
                    <Button
                      className="bg-primary/10 hover:bg-primary/20 border-primary text-primary hover:text-primary relative my-3 w-full"
                      type="button"
                      variant="outline"
                    />
                  }
                >
                  View Uploaded Documents
                  <span className="border-primary relative ml-2 flex min-h-6 min-w-6 items-center justify-center rounded-full border px-2 py-0.5">
                    {uploadedDocuments.length}
                    {hasDocumentError ? (
                      <Info
                        fill="red"
                        className="absolute -top-1 -right-1 size-4 text-white"
                      />
                    ) : null}
                  </span>
                </DialogTrigger>
                <DialogContent className="flex h-[75vh] w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] flex-col overflow-hidden p-4 sm:w-[92vw] sm:max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>Uploaded Documents</DialogTitle>
                    <DialogDescription>
                      Review, validate, or remove uploaded files before
                      proceeding.
                    </DialogDescription>
                  </DialogHeader>
                  <ScrollArea className="min-h-0 flex-1 pr-3">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {uploadedDocuments.map((file, index) => (
                        <UploadedFileCard
                          file={file}
                          key={`${file.file_name}-${index}`}
                          onDelete={() => removeDocument(index)}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            ) : null}
          </div>
        </CardFooter>
      </Card>

      <Dialog open={Boolean(docInfo)} onOpenChange={() => setDocInfo(null)}>
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
        file={cropFile}
        isOpen={isCropEditorOpen}
        onSave={(croppedFile) => {
          onUpload([croppedFile]);
          setCropFile(null);
        }}
        setIsOpen={(open) => {
          setIsCropEditorOpen(open);
          if (!open) setCropFile(null);
        }}
        title="Edit Uploaded Document"
      />
    </>
  );
}
