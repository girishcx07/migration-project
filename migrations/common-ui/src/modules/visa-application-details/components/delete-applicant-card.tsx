"use client";

import fallbackUser from "@workspace/common-ui/assets/img/fallback_user.png";
import { FallbackImage } from "@workspace/common-ui/components/fallback-image";
import { formatUserType, getApplicantName, getPassportNumber, getStaticImageFromPath } from "@workspace/common-ui/lib/utils";
import { Applicant } from "@workspace/types/review";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { format, isValid } from "date-fns";

interface TrackApplicantCardProps {
    index: number;
    applicant: Applicant;
}

export const DeletedApplicantCard = ({
    index,
    applicant,
}: TrackApplicantCardProps) => {

    const fallbackUserImage = getStaticImageFromPath(fallbackUser);
    const applicantFullName = getApplicantName(applicant);
    const passportNumber = getPassportNumber(applicant);
    const deletedByUserType = formatUserType(applicant?.deleted_by_user_type);
    const deletedBy = applicant.deleted_by_user_name;

    const rawDate = applicant.deleted_at ? new Date(applicant.deleted_at) : null;
    const deletedOn = rawDate && isValid(rawDate) ? format(rawDate, "dd MMM yyyy") : "";


    return (
        <div className="w-full overflow-hidden rounded-md border p-3 shadow sm:max-w-full">
            {/* Header Section (responsive) */}
            <div className="flex w-full min-w-0 flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                <div className="flex w-full min-w-0 items-center gap-3 sm:w-auto">
                    <FallbackImage
                        alt={`profile-${index}`}
                        src={applicant.applicant_profile_url || ""}
                        className="h-12 w-12 shrink-0 rounded-full border object-contain shadow-sm"
                        height={48}
                        width={48}
                        fallbackUser={fallbackUserImage}
                    />
                    <div className="min-w-0 flex-1 text-left">
                        <Tooltip>
                            <TooltipTrigger className="w-full text-left">
                                <div className="truncate font-bold text-ellipsis">
                                    {applicantFullName}
                                </div>
                            </TooltipTrigger>
                            <TooltipContent className="bg-white text-black">
                                {applicantFullName}
                            </TooltipContent>
                        </Tooltip>

                        <div className="text-muted-foreground truncate text-sm">
                            Passport: {passportNumber}
                        </div>

                    </div>
                </div>

                <div className="max-w-full flex-shrink-0 text-left sm:ml-auto sm:text-right">
                    <div className="text-sm">
                        <Tooltip>
                            <TooltipTrigger className="w-full text-left sm:text-right">
                                <div className="truncate font-medium max-w-[150px]">
                                    <span>Deleted By: </span>{deletedBy} {deletedByUserType && <span className="text-xs text-gray-500 font-normal">{`(${deletedByUserType})`}</span>}
                                </div>
                            </TooltipTrigger>
                            <TooltipContent arrowClassName="fill-primary bg-primary">
                                {deletedBy} {deletedByUserType && `(${deletedByUserType})`}
                            </TooltipContent>
                        </Tooltip>
                        {deletedOn && <div className="mt-1 text-xs text-muted-foreground">Deleted On: {deletedOn}</div>}
                    </div>
                </div>
            </div>
        </div>
    );
};
