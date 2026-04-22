import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useSaveApplicanForm } from "@workspace/common-ui/hooks/global-queries";
import { orpc } from "@workspace/orpc/lib/orpc";
import {
  DocumentPoolCardType,
  OptionType
} from "@workspace/types/review";
import { Button } from "@workspace/ui/components/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import clsx from "clsx";
import { FileText, ImageOff, InfoIcon, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  ActionType,
  useApplicationState,
} from "../context/review-visa-context";
import { ConfirmationDialog } from "./confirmation-dialog";
import DocumentImage from "./document-image";
import { toast } from "sonner";

interface DocumentPoolCardProps {
  index: number;
  document: DocumentPoolCardType;
  selectedDocumentType: OptionType | undefined;
  format: string[];
}

export const DocumentPoolCard: React.FC<DocumentPoolCardProps> = ({
  index,
  document,
  selectedDocumentType,
  format,
}) => {
  const queryClient = useQueryClient();

  const [isLinkingDoc, setIsLinkingDoc] = useState(false);

  const [isOpenDeleteDoc, setIsOpenDeleteDoc] = useState(false);
  const {
    selectedDocument,
    activeApplicantId,
    setIsDocumentPoolOpen,
    setSelectedDocument,
    actionType,
    applicationId,
    getVisaFormValues,
  } = useApplicationState();
  const { mutateAsync: saveVisaForm } = useSaveApplicanForm();

  const { mutateAsync: linkExistingDoc } = useMutation(orpc.visa.linkApplicantsDocument.mutationOptions());


  const { mutateAsync: linkNewDoc } = useMutation(orpc.visa.linkApplicantDocumentNew.mutationOptions());


  const { mutateAsync: deleteDocumentFromPool, isPending: isPendingDeleteDocFromPool, } = useMutation(orpc.visa.deleteDocumentFromPool.mutationOptions());

  const handleClick = async () => {
    setIsLinkingDoc(true);

    const actions: ActionType[] = ["replace", "link", "replace"];
    if (actionType === "add" && !selectedDocumentType) return;
    if (actions.includes(actionType!) && !selectedDocument) return;

    const { formValues, ...formData } = getVisaFormValues();

    await saveVisaForm({
      applicationId,
      formData,
      applicantId: activeApplicantId!,
    });

    if (actionType === "add") {
      await linkNewDoc({
        doc_type: selectedDocumentType?.doc_type!,
        doc_ocr: document.ocr,
        file_name: document.file_name,
        mime_type: document.mime_type,
        doc_description: selectedDocumentType?.doc_description || "",
        ocr_required: selectedDocumentType?.ocr_required as boolean,
        rpa_doc_name: selectedDocumentType?.rpa_doc_name!,
        vault: selectedDocumentType?.vault!,
        applicant_id: activeApplicantId!,
      });
    } else {
      await linkExistingDoc({
        applicant_id: activeApplicantId!,
        doc_type: selectedDocument?.doc_type!,
        file_name: document.file_name,
        mime_type: document.mime_type,
        doc_ocr: document.ocr,
      });
    }

    setIsDocumentPoolOpen(false);
    setIsLinkingDoc(false);
    setSelectedDocument(null)
    queryClient.invalidateQueries({
      queryKey: orpc.visa.getApplicantDocData.key(),
    });


    if (selectedDocumentType?.ocr_required || selectedDocument?.doc_snap[0]?.ocr_required) {
      queryClient.removeQueries({
        queryKey: orpc.visa.getVisaFormForApplicant.key(),
      });

      queryClient.invalidateQueries({
        queryKey: orpc.visa.getVisaFormForApplicant.key(),
      });


    }

  };


  const handleDeleteDocFromPool = () => {
    deleteDocumentFromPool({
      file_name: document.file_name,
      applicationId: applicationId!,
    }, {
      onError: (error) => {
        toast.error(error.message);
      },
      onSuccess: () => {
        setIsOpenDeleteDoc(false);
        queryClient.invalidateQueries({
          queryKey: orpc.visa.getApplicationDocumentsPool.key(),
        });
      },
    });
  };

  const isInUse = document.applicant_ids && document.applicant_ids.length > 0;


  console.log("documentformat", format, document.mime_type, format.includes(document?.mime_type))

  return (
    <div className="mb-3">
      <div
        key={index}
        className="flex min-h-[240px] w-full flex-col items-center justify-center gap-2 rounded-xl border-2 bg-white p-2"
      >
        <div className="mt-0 flex w-full items-center justify-between gap-1 text-sm text-gray-600">
          <span className="w-full truncate">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild className="w-full truncate">
                  <p autoFocus={false}>
                    {document?.original_file_name as string}
                  </p>
                </TooltipTrigger>
                <TooltipContent
                  arrowClassName="bg-white fill-white border-b border-r"
                  className="border bg-white text-gray-500 shadow-sm"
                >
                  {document?.original_file_name as string}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </span>

          <Trash2
            // height={15}
            // width={15}
            size={15}
            className="flex shrink-0 cursor-pointer text-red-500"
            onClick={() => setIsOpenDeleteDoc(true)}
          />
        </div>
        <div
          className={clsx(
            "relative flex h-full max-h-[150px] w-full grow items-center overflow-hidden rounded-md border text-center",
            {
              "pointer-events-none cursor-not-allowed opacity-50":
                !format.includes(document?.mime_type),
            },
          )}
        >
          {isInUse && <InUseBadge />}
          {document?.mime_type === "pdf" ? (
            <div className="flex h-full w-full items-center justify-center">
              <span className="absolute top-1 right-1 z-10 rounded bg-red-500 px-2 text-xs text-white">
                PDF
              </span>
              <FileText className="text-red-500" height={105} width={105} />
            </div>
          ) : (
            <>
              {!document?.is_valid && (
                <Popover>
                  <PopoverTrigger className="absolute top-0 right-0 z-10">
                    <InfoIcon fill="red" className="size-4 text-white" />
                  </PopoverTrigger>
                  <PopoverContent className="border-border w-[150px] p-2 text-sm text-red-500">
                    {document?.error_message || "Image too small or unclear"}
                  </PopoverContent>
                </Popover>
              )}
              <DocumentImage
                src={document?.file as string}
                alt="passport"
                className="h-full max-h-[150px] w-full object-contain object-center"
                width={250}
                height={250}
                fallbackRender={
                  <div className="flex h-full w-full items-center justify-center bg-gray-50">
                    <ImageOff
                      strokeWidth={2}
                      className="h-16 w-16 text-gray-300"
                    />
                  </div>
                }
              />
            </>
          )}
        </div>
        <Button
          variant="default"
          className="h-7 w-full text-xs"
          onClick={handleClick}
          disabled={!format.includes(document?.mime_type)}
          isLoading={isLinkingDoc}
        >
          {isInUse ? "Use Again" : "Select"}
        </Button>
      </div>
      <ConfirmationDialog
        open={isOpenDeleteDoc}
        onOpenChange={setIsOpenDeleteDoc}
        variant="destructive"
        onConfirm={handleDeleteDocFromPool}
        confirmText="Delete"
        title="Confirmation"
        description="Are you sure you want to delete this document?"
        isLoading={isPendingDeleteDocFromPool}
      />
    </div>
  );
};

const InUseBadge = () => {
  return (
    <span className="absolute top-1 left-1 z-10 rounded bg-green-500 px-2 text-xs text-white">
      In Use
    </span>
  );
};
