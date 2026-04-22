"use client";
import { Applicant } from "@workspace/types/review";
import fallbackUser from "@workspace/common-ui/assets/img/fallback_user.png";
import { FallbackImage } from "@workspace/common-ui/components/fallback-image";
import {
  generateAltTextForImage,
  getApplicantName,
  getStaticImageFromPath,
} from "@workspace/common-ui/lib/utils";
import { cn } from "@workspace/ui/lib/utils";
import { Skeleton } from "@workspace/ui/components/skeleton";

interface ApplicationProfileProps {
  data: Applicant;
  className?: string;
}

const ApplicantProfile = ({ data, className }: ApplicationProfileProps) => {
  const imageAlt = (applicant: Applicant): string =>
    generateAltTextForImage(getApplicantName(applicant));

  console.log("applicant_profile_url", data)
  const fallbackUserImage = getStaticImageFromPath(fallbackUser);
  return (
    <>
      <div className={cn("flex w-full", className)}>
        <FallbackImage
          src={data?.applicant_profile_url || ""}
          alt={imageAlt(data)}
          className="h-10 w-10 m-2 rounded-full border object-contain shadow-sm"
          height={48}
          width={48}
          fallbackUser={fallbackUserImage}
        />
        <div className="flex flex-col mt-3">
          <span className="text-wrap text-[10px] md:text-[12px] ">
            {getApplicantName(data)}
          </span>
          <span className="text-[12px] md:text-[10px] text-gray-400">
            {data?.visa_form?.["identity_details-passport_number"]}
          </span>
        </div>
      </div>
    </>
  );
};

export default ApplicantProfile;



export const ApplicantProfileSkeleton = () => {
  return (
    <div className="flex items-center gap-3 p-2 animate-pulse">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex flex-col justify-center space-y-2">
        <Skeleton className="h-3 w-24 rounded" />
        <Skeleton className="h-3 w-20 rounded" />
      </div>
    </div>
  );
};
