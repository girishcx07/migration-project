"use client";

import fallbackUser from "@workspace/common-ui/assets/img/fallback_user.png";
import { FallbackImage } from "@workspace/common-ui/components/fallback-image";
import { GROUP_RELATION_DATA } from "@workspace/common-ui/constants/track-applications";
import { getApplicantName, getApplicantState, getBookingStatusNew, getPassportNumber, getStaticImageFromPath } from "@workspace/common-ui/lib/utils";
import { client } from "@workspace/orpc/lib/orpc";
import {
  TrackApplicant,
  TrackApplication,
} from "@workspace/types/track-application";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import PromptModal from "../../track-applications/components/promt-modal";

interface TrackApplicantCardProps {
  index: number;
  applicationData: TrackApplication;
  applicant: TrackApplicant;
}

export const ApplicantCard = ({
  index,
  applicant,
  applicationData,
}: TrackApplicantCardProps) => {

  const [isViewDecision, setIsViewDecision] = useState(false);

  const applicantFullName = getApplicantName(applicant);
  const fallbackUserImage = getStaticImageFromPath(fallbackUser);
  const passportNumber = getPassportNumber(applicant);

  const handleDownloadVisa = async () => {
    try {
      const response = await client.visa.downloadApplicantVisa({
        applicant_id: applicant._id,
        application_id: applicationData?._id,
        document_name: applicant?.evisa?.visa_file_name,
      });

      if (response?.status === "success") {
        toast.success("Visa downloaded successfully.");
        const document_url = response?.data?.document_url;
        if (document_url) window.open(document_url);
      } else {
        toast.error(
          response?.msg || "Failed to download visa. Please try again.",
        );
      }
    } catch (error) {
      toast.error("An error occurred while downloading the visa.");
      console.log(error);
    }
  };

  const handleDownloadInsurance = async () => {
    try {
      const response = await client.visa.downloadBundledInsurance({
        applicant_id: applicant._id,
        application_id: applicationData._id,
      });
      if (response?.status === "success") {
        toast.success("Insurance downloaded successfully.");
        const document_url = response?.data?.insurance_url;
        if (document_url) window.open(document_url);
      } else {
        toast.error(response?.msg);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const group_membership = applicationData?.group_membership;
  const relation = group_membership?.find(
    (item) => item.applicant_id === applicant._id,
  ) || {
    relation: "",
    head_of_family: "",
  };
  const relationship = GROUP_RELATION_DATA?.find(
    (item) => item?.value === relation?.relation || "",
  );

  const relationshipLabel = relationship?.label
    ? relationship.label === "Main Person"
      ? relationship.label
      : `${relationship.label} of ${relation.head_of_family}`
    : "";

  const applicantStatus = getApplicantState(
    applicant.visa_status === "pending"
      ? applicationData.application_status
      : applicant.visa_status,
    applicant,
    applicationData,
  );

  const isRejected = applicant.visa_status === "application_rejected";

  const isVisaDownload =
    ["decision_taken", "application_approved"].includes(
      applicantStatus?.title || "",
    ) && !isRejected;

  const isInsuranceDownload =
    applicationData?.is_visaero_insurance_bundled &&
    applicant.insurance_status === "issued"
  //  &&    !isRejected;

  const { title, StateLabel } = applicantStatus;
  const { label, color } = getBookingStatusNew(
    applicationData?.application_state,
    applicationData,
  );

  return (
    <div className="w-full overflow-hidden rounded-md border p-3 shadow sm:max-w-full">
      {/* Header Section (responsive) */}
      <div className="flex w-full min-w-0 flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex w-full min-w-0 items-center gap-3 sm:w-auto">
          <FallbackImage
            alt={`profile-${index}`}
            src={applicant.applicant_profile_url || ""}
            className="h-12 w-12! shrink-0 rounded-full border object-contain shadow-sm"
            height={48}
            width={48}
            fallbackUser={fallbackUserImage}
          />
          <div className="min-w-0 flex-1 text-left">
            {/* <Tooltip>
              <TooltipTrigger className="w-full text-left"> */}
                <div className="truncate font-bold text-ellipsis">
                  {applicantFullName}
                </div>
              {/* </TooltipTrigger>
              <TooltipContent className="bg-white text-black">
                {applicantFullName}
              </TooltipContent>
            </Tooltip> */}

            <div className="text-muted-foreground truncate text-sm">
              Passport: {passportNumber}
            </div>
{/* 
            <Tooltip>
              <TooltipTrigger className="w-full text-left"> */}
                <div className="text-muted-foreground truncate text-sm">
                  {relationshipLabel || ""}
                </div>
              {/* </TooltipTrigger>
              <TooltipContent className="!bg-white text-black">
                {relationshipLabel}
              </TooltipContent>
            </Tooltip> */}
          </div>
        </div>

        <div className="max-w-full text-left sm:ml-auto sm:text-right">
          <Badge style={{ backgroundColor: isRejected ? "#b91c1c" : color }}>
            {StateLabel}
          </Badge>
        </div>
      </div>

      {/* Divider */}
      {(isInsuranceDownload || isVisaDownload || isRejected) && (
        <Separator className="my-2 w-full" />
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-between gap-2">
        {isInsuranceDownload && (
          <Button
            size="xs"
            variant="outline"
            className=" p-4"
            onClick={handleDownloadInsurance}
          >
            <Download /> Insurance
          </Button>
        )}
        {isVisaDownload && (
          <Button
            size="xs"
            variant="outline"
            className="hover:border-primary bg-primary text-muted hover:text-primary p-4"
            onClick={handleDownloadVisa}
          >
            <Download /> Download Visa
          </Button>
        )}
        {isRejected && (
          <Button
            size="xs"
            variant="outline"
            className="hover:border-primary hover:text-primary p-4"
            onClick={() => setIsViewDecision(true)}
          >
            View Decision
          </Button>
        )}
      </div>

      {/* Rejection Modal */}
      <PromptModal
        open={isViewDecision}
        title="Your Application is not approved"
        onCancel={() => setIsViewDecision(false)}
      >
        <div className="text-muted-foreground">
          Dear Customer,
          <p className="text-muted-foreground">
            The Visa issuing Authority has not approved your Visa application.
            This might be disappointing to you; however, you may choose to apply
            again or contact the concerned authorities directly.
          </p>
        </div>
      </PromptModal>
    </div>
  );
};
