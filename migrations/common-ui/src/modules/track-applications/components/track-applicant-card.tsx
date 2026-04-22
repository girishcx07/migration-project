import { useMutation, useQueryClient } from "@tanstack/react-query";
import fallbackUser from "@workspace/common-ui/assets/img/fallback_user.png";
import { FallbackImage } from "@workspace/common-ui/components/fallback-image";
import { VisaGlobeIcon } from "@workspace/common-ui/components/icons";
import {
  GROUP_RELATION_DATA,
  VISA_INPROGRESS_APPLICATION_STATUS,
} from "@workspace/common-ui/constants/track-applications";
import { useUserGlobalRolePermissions } from "@workspace/common-ui/hooks/global-queries";
import { getApplicantName, getApplicantState, getPassportNumber, getStaticImageFromPath, showIssueInsurance } from "@workspace/common-ui/lib/utils";
import { client, orpc } from "@workspace/orpc/lib/orpc";
import {
  TrackApplicant,
  TrackApplication,
} from "@workspace/types/track-application";
import { Button } from "@workspace/ui/components/button";
import { Skeleton } from "@workspace/ui/components/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { useState } from "react";
import { toast } from "sonner";
import ApplicantProgressStepper from "./applicant-progress-stepper";
import PromptModal from "./promt-modal";
import TrackApplicantActions from "./track-applicant-actions";
import { File} from "lucide-react";

interface TrackApplicantCardProps {
  index: number;
  applicationData: TrackApplication;
  applicant: TrackApplicant;
  user_id?: string;
}

export const TrackApplicantCard = ({
  index,
  applicant,
  applicationData,
  user_id,
}: TrackApplicantCardProps) => {
  const [isViewDecision, setIsViewDecision] = useState(false);
  const applicantFullName = getApplicantName(applicant);
  const fallbackUserImage = getStaticImageFromPath(fallbackUser);
  const passportNumber = getPassportNumber(applicant);
  //const fileNumber = getFileNumber(applicant);
  const [isOpenIssueInsuranceModal, setIsOpenIssueInsuranceModal] =
    useState(false);
  const queryClient = useQueryClient();


  const { mutate, isPending: isIssuingInsurance } = useMutation(
    orpc.visa.issueInsurance.mutationOptions({
      onSuccess: async (data) => {
        if (data && data?.status === "success") {
          toast.success("Insurance will be issued shortly!");
          console.log("queryKey to be invalidated >>", {
            queryKey: orpc.visa.getTrackVisaApplicationsData.key(),
          });
          queryClient.invalidateQueries({
            queryKey: orpc.visa.getTrackVisaApplicationsData.key(),
            exact: false,
          });
          setIsOpenIssueInsuranceModal(false);
        } else {
          queryClient.invalidateQueries({
            queryKey: orpc.visa.getTrackVisaApplicationsData.key(),
            exact: false,
          });
          console.log("data in issue insurance >>", data);
          toast.error(
            data?.msg || "Failed to issue insurance. Please try again.",
          );
        }
      },
    }),
  );

  const { data: permissionsData } = useUserGlobalRolePermissions();

  const permissions = permissionsData?.data;

  const { can_download_visa } =
    permissions?.role_permissions?.track_application || {};

  console.log("rolePermissions ---->", {
    permissions,
    can_download_visa,
  });

  const getFileNumber = (applicant:TrackApplicant) => {
  const visaApplicationId = applicant?.visa_rpa?.visa_application_id;
  

  // Return empty string if visaApplicationId is missing or "null"
  if (!visaApplicationId || visaApplicationId === "null") {
     return "";
   }
     return visaApplicationId;
 }  
   
 const fileNumber = getFileNumber(applicant);

  const HandleDownloadVisa = async () => {
    try {
      const response = await client.visa.downloadApplicantVisa({
        applicant_id: applicant._id,
        application_id: applicationData?._id,
        document_name: applicant?.evisa?.visa_file_name,
      });

      if (response?.status === "success") {
        toast.success("Visa downloaded successfully.");
        const document_url = response?.data?.document_url;
        if (document_url) {
          window.open(document_url);
        }
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

  const HandleViewDecision = () => {
    setIsViewDecision(true);
  };

  // Issue Insurance handler
  const handleIssueInsurance = async () => {
    console.log("issuing insurance >>", applicant._id);
    mutate({
      applicantId: applicant._id,
    });
  };

  const handleDownloadInsurance = async () => {
    try {
      const response = await client.visa.downloadBundledInsurance({
        applicant_id: applicant._id,
        application_id: applicationData?._id,
      });
      if (response?.status === "success") {
        toast.success("Insurance downloaded successfully.");
        const document_url = response?.data?.insurance_url;
        if (document_url) {
          window.open(document_url);
        }
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
  ) || { relation: "", head_of_family: "" };

  const relationship = GROUP_RELATION_DATA?.find(
    (item) => item?.value === relation?.relation || "",
  );

  const applicantStatus = getApplicantState(
    applicant.visa_status === "pending"
      ? applicationData.application_status
      : applicant.visa_status,
    applicant,
    applicationData,
  );
  const relationshipLabel = relationship?.label
    ? relationship.label === "Main Person" //"Head of Family"
      ? relationship.label
      : `${relationship.label} of ${relation.head_of_family}`
    : "";

  // applicant visa is rejected
  const isRejected = applicant.visa_status === "application_rejected";

  const isVisaDownload =
    ["decision_taken", "application_approved"].includes(
      applicantStatus?.title || "",
    ) &&
    !isRejected &&
    can_download_visa;

  console.log("applicantData", { applicantStatus, applicant });

  // check Insurance Issue or not
  const isIssueInsurace =
    applicationData?.is_visaero_insurance_bundled &&
    applicant.insurance_status !== "issued";

  //Check Insurance Download
  const isInsuraceDownload =
    applicationData?.is_visaero_insurance_bundled &&
    applicant.insurance_status === "issued";
  // &&    !isRejected;
  console.log("isInsuraceDownload", {
    isInsuraceDownload,
    insurance_status: applicant.insurance_status,
    is_visaero_insurance_bundled: applicationData?.is_visaero_insurance_bundled,
  });
  return (
    <div className="rounded-md border p-2 shadow">
      <div className="flex gap-3">
        <FallbackImage
          alt={`prfile-${index}`}
          src={applicant.applicant_profile_url || ""}
          className="h-12 w-12 rounded-full border object-contain shadow-sm"
          height={48}
          width={48}
          fallbackUser={fallbackUserImage}
        />
        <div className="min-w-0 grow">
          <Tooltip>
            <TooltipTrigger className="w-full">
              <div className="flex w-full items-start truncate overflow-hidden font-bold text-ellipsis">
                {applicantFullName}
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-white text-black">
              {applicantFullName}
            </TooltipContent>
          </Tooltip>

          <div className="text-muted-foreground w-full truncate text-xs">
            <Tooltip>
              <TooltipTrigger className="w-full">
                <div className="flex w-full items-start truncate overflow-hidden text-ellipsis">
                  {relationshipLabel || ""}
                </div>
              </TooltipTrigger>
              <TooltipContent className="!bg-white text-black">
                {relationshipLabel}
              </TooltipContent>
            </Tooltip>
            {/* Head of Family */}
          </div>
        </div>

        <div className="text-muted-foreground flex gap-1 pt-2">
          <div className="flex flex-col gap-1 items-end">
            <div className="text-xs flex gap-1">{passportNumber}
                <VisaGlobeIcon className="text-muted-foreground" />
            </div>
          
          {fileNumber.length > 0 && (
            <div className="text-xs flex gap-1">{fileNumber}
              <File size={13}/>
            </div>
          )}
          </div>
          <TrackApplicantActions
            applicantStatus={applicantStatus}
            applicant={applicant}
            applicationData={applicationData}
          />
        </div>
      </div>
      <div className="mb-2 flex items-center justify-end gap-2">
        {showIssueInsurance(applicationData, applicant) && (
          <Button
            size="xs"
            variant="link"
            className="border-blue-500 text-blue-500 underline"
            onClick={() => setIsOpenIssueInsuranceModal(true)}
          >
            Issue Insurance
          </Button>
        )}
        {isInsuraceDownload && (
          <Button
            size="xs"
            variant="outline"
            className="hover:border-primary hover:text-primary"
            onClick={handleDownloadInsurance}
          >
            Insurance
          </Button>
        )}
        {isVisaDownload && (
          <Button
            size="xs"
            variant="outline"
            className="hover:border-primary hover:text-primary"
            onClick={HandleDownloadVisa}
          >
            Visa
          </Button>
        )}
        {isRejected && (
          <Button
            size="xs"
            variant="outline"
            className="hover:border-primary hover:text-primary"
            onClick={HandleViewDecision}
          >
            View Decision
          </Button>
        )}
      </div>
      <div>
        <ApplicantProgressStepper
          currentValue={applicantStatus.title || "draft"}
          statuses={VISA_INPROGRESS_APPLICATION_STATUS}
          isRejected={isRejected}
        />
      </div>
      <PromptModal
        open={isOpenIssueInsuranceModal}
        title="Issue Insurance"
        onCancel={() => setIsOpenIssueInsuranceModal(false)}
        onSubmit={handleIssueInsurance}
        isCTA
        submitText="Issue Insurance"
        isPending={isIssuingInsurance}
      >
        <p className="text-muted-foreground">
          Are you sure you want to issue insurance for{" "}
          <strong>{applicantFullName}</strong>?
        </p>
      </PromptModal>

      <PromptModal
        open={isViewDecision}
        title="Your Application is not approved"
        onCancel={() => setIsViewDecision(false)}
        children={
          <div className="text-muted-foreground">
            Dear Customer,
            <p className="text-muted-foreground">
              The Visa issuing Authority has not approved your Visa application.
              This might be disappointing to you however you may choose to apply
              again or contact the concerned authorities directly.
            </p>
          </div>
        }
      />
    </div>
  );
};

export const TrackApplicantCardSkeleton = () => {
  return <Skeleton className="h-[190px] w-full rounded-md border p-2 shadow" />;
};


