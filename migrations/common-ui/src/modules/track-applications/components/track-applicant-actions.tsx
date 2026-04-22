import { useMutation, useQueryClient } from "@tanstack/react-query";
// markAsFixed legacy import removed
import { ExtendVisaSVG } from "@workspace/common-ui/components/icons";
import { getCookie } from "@workspace/common-ui/lib/utils";
import { orpc } from "@workspace/orpc/lib/orpc";
import { TrackApplicantActionsProps } from "@workspace/types/track-application";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
  Check,
  EllipsisVertical,
  FilePenLine,
  RefreshCcw,
  X,
} from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import UpdateFileNumber from "./applicant-actions/update-file-number";
import PromptModal from "./promt-modal";

const TrackApplicantActions = ({
  applicantStatus,
  applicant,
  applicationData,
}: TrackApplicantActionsProps) => {
  const [fileNumber, setFileNumber] = useState("");
  const [promptInfo, setPromptInfo] = useState({
    isOpen: false,
    title: "",
    description: "",
    submitText: "Confirm",
    cancelText: "Cancel",
    isCTA: true,
    onSubmit: () => {},
    onCancel: () => {},
    content: null as React.ReactNode,
  });

  const queryClient = useQueryClient();

  // Permissions
  const permissions = {
    canCancelVisa: false,
    canExtendVisa: false,
    canResubmit: false,
    canUpdateFileNumber: false,
    canMarkFixed: false,
  };

  // Conditions
  const isInQueue = applicantStatus?.title === "in_queue";
  const host = getCookie("host");
  const userId = getCookie("user_id");
  const isSubmitted =
    applicationData?.application_state === "application_submitted";
  const isHostValid =
    applicationData?.target_host == null ||
    applicationData.target_host === host;

  const isUpdateFileNumber = isInQueue && isSubmitted && isHostValid;
  const isMarkAsFixed = isInQueue;

  // Check if any action is available
  const hasActions = false;
  // permissions.canCancelVisa ||
  // permissions.canExtendVisa ||
  // permissions.canResubmit ||
  // (permissions.canUpdateFileNumber && isUpdateFileNumber) ||
  // (permissions.canMarkFixed && isMarkAsFixed);

  const refreshTabData = async () => {
    console.log("fileNumber update refreshTabData");
    queryClient.invalidateQueries({
      queryKey: orpc.visa.getTrackVisaApplicationsData.key(),
    });
  };

  const { mutate: mutateMarkAsFixed, isPending: isMarkingAsFixed } =
    useMutation(
      orpc.visa.markAsFixed.mutationOptions({
        onSuccess: (data) => {
          if (data.status === "success") {
            refreshTabData();
            toast.success(
              (data.data as any)?.msg ||
                "Applicant marked as fixed successfully.",
            );
            setPromptInfo((prev) => ({ ...prev, isOpen: false }));
          } else {
            toast.error(
              (data.data as any)?.msg || "Failed to mark applicant as fixed.",
            );
          }
        },
        onError: (error) => {
          console.error("Error marking applicant as fixed:", error);
          toast.error("Failed to mark applicant as fixed.");
          setPromptInfo((prev) => ({ ...prev, isOpen: false }));
        },
      }),
    );

  const handleMarkAsFixed = async () => {
    mutateMarkAsFixed({
      applicantId: applicant?._id || "",
      applicationId: applicationData?._id || "",
    });
  };

  const onClickUpdateFileNumber = () => {
    setPromptInfo({
      isOpen: true,
      title: "Update File Number",
      description: "",
      onSubmit: () => {},
      onCancel: () => {
        setFileNumber(""); // Reset file number on cancel
        setPromptInfo((prev) => ({ ...prev, isOpen: false })); // Close the prompt
      },
      submitText: "Update",
      cancelText: "Cancel",
      isCTA: false,
      content: (
        <UpdateFileNumber
          applicant_id={applicant?._id}
          onClose={() => setPromptInfo((prev) => ({ ...prev, isOpen: false }))}
        />
      ),
    });
  };

  const onClickMarkAsFixed = () => {
    setPromptInfo({
      isOpen: true,
      title: "Mark As Fixed",
      description: "",
      onSubmit: handleMarkAsFixed,
      onCancel: () => setPromptInfo((prev) => ({ ...prev, isOpen: false })), // Close the prompt
      submitText: "Yes",
      cancelText: "No",
      isCTA: true,
      content: (
        <span className="text-muted-foreground text-sm">
          Are you sure you want to mark this applicant as fixed?
        </span>
      ),
    });
  };

  if (!hasActions) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <EllipsisVertical className="cursor-pointer" width={17} height={17} />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="mr-2 w-50"
          onClick={(e) => e.stopPropagation()}
        >
          {permissions.canCancelVisa && (
            <DropdownMenuItem>
              <X color="red" />
              Cancel Visa
            </DropdownMenuItem>
          )}
          {permissions.canExtendVisa && (
            <DropdownMenuItem>
              <ExtendVisaSVG />
              Extend Visa
            </DropdownMenuItem>
          )}
          {permissions.canResubmit && (
            <DropdownMenuItem>
              <RefreshCcw />
              Resubmit
            </DropdownMenuItem>
          )}
          {permissions.canUpdateFileNumber && isUpdateFileNumber && (
            <DropdownMenuItem onClick={onClickUpdateFileNumber}>
              <FilePenLine />
              Update File Number
            </DropdownMenuItem>
          )}
          {permissions.canMarkFixed && isMarkAsFixed && (
            <DropdownMenuItem onClick={onClickMarkAsFixed}>
              <Check />
              Mark As Fixed
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {promptInfo.isOpen && (
        <PromptModal
          open={promptInfo.isOpen}
          title={promptInfo.title || "Confirm Action"}
          description={promptInfo.description || ""}
          onCancel={promptInfo.onCancel || (() => {})}
          onSubmit={promptInfo.onSubmit || (() => {})}
          isCTA={promptInfo.isCTA}
          submitText={promptInfo.submitText || "Confirm"}
          cancelText={promptInfo.cancelText || "Cancel"}
        >
          {promptInfo.content || null}
        </PromptModal>
      )}
    </>
  );
};

export default TrackApplicantActions;
