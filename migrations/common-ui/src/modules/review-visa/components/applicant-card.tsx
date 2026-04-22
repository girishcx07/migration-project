"use client";

import { cn, getApplicantName } from "@workspace/common-ui/lib/utils";
import { generateAltTextForImage } from "@workspace/common-ui/lib/img-helper";
import { Applicant } from "@workspace/types/review";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Trash2Icon } from "lucide-react";
import { forwardRef } from "react";
import { FallbackImage } from "../../../components/fallback-image";
import { useApplicationState } from "../context/review-visa-context";

interface ApplicantCardProps {
  applicant: Applicant;
  fallbackUserImage: string;
  onDeleteClick: () => void;
  onClick?: () => void;
  canDelete?: boolean;
}

const DisabledOverlay = () => {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-xl">
      <div className="flex h-full items-center justify-center bg-gray-400/15" />
    </div>
  );
};

export const ApplicantCard = forwardRef<HTMLDivElement, ApplicantCardProps>(
  (
    { applicant, fallbackUserImage, onDeleteClick, onClick, canDelete },
    ref,
  ) => {

    const { activeApplicantId, applicationReadiness, applicants } =
      useApplicationState();

    const altText = generateAltTextForImage(getApplicantName(applicant));

    const isActive = applicant._id === activeApplicantId;

    const isLoading =
      !applicationReadiness.hasDocuments || !applicationReadiness.hasVisaForm;

    const currentApplicant = applicants.find(
      (app) => app.applicantId === applicant._id,
    );

    const status = currentApplicant ? currentApplicant.status : "calculating";

    const profilePhoto = applicant.applicant_profile_url;
    const ApplicantName = getApplicantName(applicant)

    console.log("ApplicantName ---?>", ApplicantName)

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex max-w-[450px] min-w-[165px] cursor-pointer items-center gap-2 overflow-hidden rounded-xl border-2 border-slate-200 p-2 shadow-sm transition-transform ease-in-out md:min-w-[245px]",
          // "relative flex w-[165px] cursor-pointer items-center gap-2 overflow-hidden rounded-xl border-2 border-slate-200 p-3 shadow-sm transition-transform ease-in-out md:w-[245px]",
          !isActive && `scale-90 opacity-70`,
          isActive && `border-blue-500 ${status === "completed"
            ? "bg-green-500/20"
            : status === "pending"
              ? "bg-yellow-500/20"
              : "bg-blue-500/20"
          }`,

          {
            "border-green-500": status === "completed",
            "border-yellow-500": status === "pending",
            "border-blue-500": status === "calculating",
          },
        )}
        onClick={isLoading ? undefined : onClick}
      >

        {/* Disabled overlay - only shows when loading/disabled */}
        {isLoading && <DisabledOverlay />}

        <FallbackImage
          src={profilePhoto || ""}
          alt={altText}
          // className="h-8 w-8! rounded-full border object-contain shadow-sm md:h-12 md:w-12!"
          className={cn(
            "h-8 w-8! rounded-full object-contain transition-all",
            "ring-offset-2 ring-offset-white",

            // ACTIVE → visible ring
            isActive && "ring-2 ring-primary",

            // INACTIVE → neutral border
            !isActive && "border border-slate-200",

            // responsive
            "md:h-12 md:w-12!"
          )}
          height={48}
          width={48}
          fallbackUser={fallbackUserImage}
        />

        <div
          className="flex-1 truncate text-xs md:text-sm"
          title={getApplicantName(applicant)}
        >
          {getApplicantName(applicant)}
        </div>
        {/* <div className="flex-grow space-y-1">
          <ApplicantStatus applicantId={applicant?._id} />
        </div> */}
        {canDelete && (
          <button
            type="button"
            className={`rounded-md ${isActive ? "" : "bg-white p-2"}`}
            onClick={(e) => {
              e.stopPropagation();
              onDeleteClick();
            }}
          >
            <Trash2Icon height={20} width={20} className="text-red-500" />
          </button>
        )}
      </div>
    );
  },
);

ApplicantCard.displayName = "ApplicantCard";

export const ApplicantCardSkeleton = forwardRef<HTMLDivElement, {}>(
  ({ }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative flex max-w-[450px] min-w-[165px] items-center gap-2 overflow-hidden",
          "rounded-xl border-2 border-slate-200 p-2 shadow-sm md:min-w-[245px]",
          "scale-90 opacity-70",
        )}
      >
        {/* Avatar */}
        <Skeleton className="h-8 w-8 rounded-full md:h-12 md:w-12" />

        {/* Name */}
        <div className="flex-1">
          <Skeleton className="h-3 w-24 rounded md:h-4 md:w-32" />
        </div>

        {/* Delete button placeholder (matches spacing) */}
        <Skeleton className="h-5 w-5 rounded" />
      </div>
    );
  },
);
