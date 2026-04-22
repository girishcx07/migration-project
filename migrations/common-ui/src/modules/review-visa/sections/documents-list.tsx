"use client";

import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import DragAndResizeModal from "@workspace/common-ui/components/drag-and-resize-modal";
import { NoDataCard } from "@workspace/common-ui/components/no-data-card";
import PdfViewer from "@workspace/common-ui/components/pdf-viewer";
import { queryClient } from "@workspace/common-ui/lib/react-query";
import { orpc } from "@workspace/orpc/lib/orpc";
import { ApplicantRequiredDocument } from "@workspace/types/review";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { CircleCheck, Info } from "lucide-react";
import { memo, useEffect, useMemo, useState } from "react";
import { ConfirmationDialog } from "../components/confirmation-dialog";
import { DocumentCard } from "../components/document-card";
import { DocumentEditor } from "../components/document-editor";
import DocumentImage from "../components/document-image";
import DocumentPoolModal from "../components/document-pool-modal";
import {
  ActionType,
  useApplicationState,
} from "../context/review-visa-context";
import { useSaveApplicanForm } from "@workspace/common-ui/hooks/global-queries";
import { useIsMobile } from "@workspace/common-ui/hooks/use-is-mobile";
import { MobileDocumentPreview } from "../../../components/mobile-document-preview";

const DocumentsList = memo(() => {
  const [isOpenEditor, setIsOpenEditor] = useState(false);
  const [isOpenDragAndResize, setIsOpenDragAndResize] = useState(false);
  const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false);
  const [isDeleteDocument, setIsDeleteDocument] = useState(false);

  const { mutateAsync: saveApplicantForm } = useSaveApplicanForm();

  const isMobile = useIsMobile();

  const {
    activeApplicantId,
    setActionType,
    setIsDocumentPoolOpen,
    isDocumentPoolOpen,
    setSelectedDocument,
    selectedDocument,
    getActiveApplicant,
    updateApplicant,
    setApplicationReadiness,
    applicationId,
    setApplicationDetails,
    setIsDocumentSectionError,
    getVisaFormValues,
  } = useApplicationState();

  const { data, isFetching } = useSuspenseQuery(
    orpc.visa.getApplicantDocData.queryOptions({
      input: {
        applicantId: activeApplicantId!,
        applicationId: applicationId,
      },
    }),
  );

  const docPoolData = data?.data;

  const { mutate: deleteDocument, isPending } = useMutation(
    orpc.visa.removeApplicantDocument.mutationOptions({
      onSuccess: async (data) => {
        if (data?.status === "success") {
          await queryClient.invalidateQueries({
            queryKey: orpc.visa.getApplicantDocData.key(),
          });
          if (selectedDocument?.doc_snap?.[0]?.ocr_required) {
            queryClient.removeQueries({
              queryKey: orpc.visa.getVisaFormForApplicant.key(),
            });
            queryClient.invalidateQueries({
              queryKey: orpc.visa.getVisaFormForApplicant.key(),
            });
          }
          setSelectedDocument(null);
          setIsDeleteDocument(false);
        }
      },
    }),
  );

  const handleDeleteDocument = async () => {
    setIsOpenDragAndResize(false);

    const { formValues, ...formData } = getVisaFormValues();

    await saveApplicantForm({
      applicantId: activeApplicantId!,
      applicationId: applicationId,
      formData,
    });

    deleteDocument({
      applicant_id: activeApplicantId!,
      document_id: selectedDocument?.doc_id!,
      application_id: applicationId,
    });
  };

  const requiredDocs = docPoolData?.applicant_doc?.required_documents || [];
  const additionalDocs = docPoolData?.applicant_doc?.additional || [];

  const uploadedDocuments: ApplicantRequiredDocument[] = useMemo(
    () => [...requiredDocs, ...additionalDocs],
    [requiredDocs, additionalDocs],
  );

  const totalDocs =
    uploadedDocuments?.filter((doc) => !!doc?.doc_snap?.[0]?.mandatory)
      .length || 0;

  const totalUploadedDocs = uploadedDocuments.filter(
    (doc) =>
      doc.doc_snap?.[0]?.status === "uploaded" &&
      !!doc?.doc_snap?.[0]?.doc_url &&
      doc?.doc_snap?.[0]?.mandatory,
  ).length;

  useEffect(() => {
    if (!totalDocs) {
      setIsDocumentSectionError(false);
      return;
    }
    setIsDocumentSectionError(totalDocs !== totalUploadedDocs);
  }, [setIsDocumentSectionError, totalDocs, totalUploadedDocs]);

  // console.log("uploadedDocuments", uploadedDocuments);

  const handleActionClick = (
    actionType: ActionType,
    document?: ApplicantRequiredDocument,
  ) => {
    const validActions: ActionType[] = [
      "delete",
      "replace",
      "edit",
      "add",
      "preview",
    ];

    if (!validActions.includes(actionType)) return;

    setActionType(actionType);
    if (document) setSelectedDocument(document);

    switch (actionType) {
      case "edit":
        setIsOpenEditor(true);
        break;
      case "preview":
        const isPdf = document?.doc_snap?.[0]?.doc_file_name
          ?.toLowerCase()
          .endsWith(".pdf");

        if (isPdf) {
          window.open(document?.doc_snap?.[0]?.doc_url || "", "_blank");
        } else if (isMobile) {
          setIsMobilePreviewOpen(true);
        } else {
          setIsOpenDragAndResize(true);
        }
        break;
      case "delete":
        setIsDeleteDocument(true);
        break;
      default:
        setIsDocumentPoolOpen(true);
    }
  };

  useEffect(() => {
    if (isFetching || !activeApplicantId) {
      return;
    }

    setApplicationReadiness((prev) => ({ ...prev, hasDocuments: true }));
    updateApplicant(activeApplicantId, {
      documentsList: uploadedDocuments,
      hasLoadedDocuments: true,
    });

    // Sync profile photo only when a photo doc is present and URL changed.
    setApplicationDetails((prev) => {
      const applicants = prev?.applicants || [];

      const updatedApplicants = applicants.map((applicant) => {
        if (applicant._id === activeApplicantId) {
          const photoDocument = uploadedDocuments.find(
            (doc) => doc.doc_type === "photo",
          );
          const docSnap = photoDocument?.doc_snap?.[0];

          const nextProfileUrl = docSnap?.doc_url || docSnap?.doc_thumbnail;
          const hasPhotoDocument = !!photoDocument;

          // Photo removed or unavailable: clear cached profile URL.
          if (!hasPhotoDocument || !nextProfileUrl) {
            if (!applicant.applicant_profile_url) {
              return applicant;
            }

            return {
              ...applicant,
              applicant_profile_url: "",
            };
          }

          if (applicant.applicant_profile_url === nextProfileUrl) {
            return applicant;
          }

          return {
            ...applicant,
            applicant_profile_url: nextProfileUrl,
          };
        }
        return applicant;
      });

      return { ...prev, applicants: updatedApplicants };
    });
  }, [
    activeApplicantId,
    isFetching,
    setApplicationDetails,
    setApplicationReadiness,
    updateApplicant,
    uploadedDocuments,
  ]);

  const applicantName = getActiveApplicant()?.name;

  return (
    <Card className="h-full gap-0 overflow-hidden p-0">
      <CardHeader className="hidden bg-gray-100 py-4 md:block">
        <CardTitle>
          <div className="relative flex items-center justify-between gap-3">
            <div className="text-md">Documents</div>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger type="button">
                  <div
                    className={`min-w-8 rounded-full p-1 text-center text-xs text-white ${
                      totalDocs === totalUploadedDocs
                        ? "bg-green-500"
                        : "bg-yellow-500"
                    }`}
                  >
                    {totalUploadedDocs}/{totalDocs}
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  className="max-h-[250px] overflow-auto border border-slate-200 bg-white text-black shadow"
                  arrowClassName="bg-white fill-white"
                >
                  <div className="text-sm">
                    <p className="font-semibold">Document Upload Progress</p>
                    <p className="text-xs text-slate-500">
                      You have uploaded {totalUploadedDocs} of {totalDocs}{" "}
                      required documents
                    </p>
                    <div className="my-2 space-y-1">
                      {uploadedDocuments?.map((doc, index) => {
                        const snap = doc.doc_snap?.[0];
                        const isValid =
                          snap?.status === "uploaded" && snap.doc_url !== "";
                        return (
                          <div
                            key={index}
                            className="flex items-center justify-between gap-2 text-xs leading-6"
                          >
                            <span>
                              {index + 1}. {doc.doc_display_name}
                              {doc?.doc_snap[0]?.mandatory && (
                                <span className="text-red-500">*</span>
                              )}
                            </span>
                            {isValid ? (
                              <CircleCheck
                                size={18}
                                className="rounded-full bg-green-500 text-center text-white"
                              />
                            ) : (
                              <Info
                                size={18}
                                className="rounded-full bg-yellow-500 text-center text-white"
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="visa_card_body h-full px-0 md:pb-12">
        <div className="h-full overflow-y-auto p-4">
          <div className="space-y-4">
            {!data && <NoDataCard title="Documents are not available" />}
            {uploadedDocuments.map((document, i) => (
              <DocumentCard
                onActionClick={handleActionClick}
                onPreview={handleActionClick}
                document={document}
                index={i}
                totalDocs={uploadedDocuments?.length}
                key={document.doc_id}
                closeDeager={() => setIsOpenDragAndResize(false)}
              />
            ))}
          </div>

          {/* Document Pool Modal */}
          {isDocumentPoolOpen && (
            <DocumentPoolModal uploadedDocuments={uploadedDocuments!} />
          )}

          {/* Document Pool Modal */}
          <DragAndResizeModal
            open={isOpenDragAndResize}
            onOpenChange={setIsOpenDragAndResize}
            name="drag-and-resize-modal"
            ratio={"4:3"}
            title={
              applicantName ? (
                <div className="truncate">
                  <span className="text-primary">{applicantName}</span> - &nbsp;
                  {selectedDocument?.doc_display_name}
                </div>
              ) : (
                ""
              )
            }
          >
            {selectedDocument?.doc_snap[0]?.doc_file_name
              ?.toLowerCase()
              .endsWith(".pdf") ? (
              // <div className="flex h-full w-full items-center justify-center text-lg font-semibold">
              <PdfViewer
                pdfUrl={selectedDocument?.doc_snap[0]?.doc_url || ""}
              />
            ) : (
              // </div>
              <DocumentImage
                alt="document"
                src={selectedDocument?.doc_snap[0]?.doc_url || ""}
                onError={() => console.log("error loading image")}
                height={650}
                width={850}
                className="h-full max-h-full w-full max-w-full object-contain object-center drop-shadow-md"
              />
            )}
          </DragAndResizeModal>

          <MobileDocumentPreview
            isOpen={isMobilePreviewOpen}
            setIsOpen={setIsMobilePreviewOpen}
            imageUrl={selectedDocument?.doc_snap[0]?.doc_url || ""}
            title={selectedDocument?.doc_display_name}
          />

          {/* Document Pool Modal */}
          <DocumentEditor isOpen={isOpenEditor} setIsOpen={setIsOpenEditor} />

          {/* Document Pool Modal */}
          <ConfirmationDialog
            open={isDeleteDocument}
            onOpenChange={setIsDeleteDocument}
            onConfirm={handleDeleteDocument}
            isLoading={isPending}
            title="Confirmation"
            description="Are you sure you want to delete this document?"
            variant="destructive"
            confirmText="Delete"
          />

          {/* Add Document Button */}
          {activeApplicantId && (
            <div className="md:mb-0">
              <Button
                type="button"
                variant={"outline"}
                className="border-primary text-primary hover:text-primary/90 my-2 w-full"
                onClick={() => handleActionClick("add")}
              >
                Add Document+
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

export default DocumentsList;

export const DocumentsListSkeleton = () => {
  return (
    <Card className="h-full gap-0 overflow-hidden p-0">
      <CardHeader className="block bg-gray-100 py-4">
        <CardTitle>
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-24 bg-gray-200" /> {/* Document Title */}
            <Skeleton className="h-6 w-12 rounded-full bg-gray-200" />{" "}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="h-full px-0 pb-12">
        <div className="h-full space-y-4 overflow-y-auto p-4">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="w-full rounded-lg border border-gray-200 bg-gray-100 shadow-sm"
            >
              <div className="flex items-center justify-between px-4 py-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-6 rounded-full bg-gray-200" />{" "}
                  <Skeleton className="h-5 w-32 bg-gray-200" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-16 rounded-md bg-gray-200" />{" "}
                  <Skeleton className="h-6 w-6 rounded-md bg-gray-200" />{" "}
                </div>
              </div>
              <div className="relative min-h-[250px] flex-1">
                <Skeleton className="absolute inset-0 h-full w-full rounded-t-none bg-gray-200" />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <Skeleton className="h-10 w-full rounded-md bg-gray-200" />
        </div>
      </CardContent>
    </Card>
  );
};
