"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@workspace/orpc/lib/orpc";
import { Flag } from "@workspace/common-ui/components/flag-img";
import { VisaIcon } from "@workspace/common-ui/components/icons";
import AnimatedProfileCard from "@workspace/common-ui/components/user-profile";
import useCopyToClipboard from "@workspace/common-ui/hooks/use-copy-to-clipboard";
import { formatDate, generateVisaType, getBookingStatusNew, getCookie, getCountryFlagBy3Code } from "@workspace/common-ui/lib/utils";
// orpc already imported above
import {
  TrackApplicant,
  TrackApplication,
} from "@workspace/types/track-application";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { format } from "date-fns";
import {
  Calendar,
  ChevronDown,
  Copy,
  SquareCheckBig,
  SquareUserIcon,
  TimerIcon,
} from "lucide-react";
import { AppLink as Link } from "../../../platform/navigation";
import { useState } from "react";
import { toast } from "sonner";
import PromptModal from "./promt-modal";
import TrackApplicationActions from "./track-application-actions";

interface TrackApplicationCardProps {
  applicationData: TrackApplication;
  applicantsData: TrackApplicant[];
}

const TrackApplicationCard = ({
  applicationData,
  applicantsData,
}: TrackApplicationCardProps) => {
  const { isCopied, copyToClipboard } = useCopyToClipboard();
  const [promtInfno, setPromtInfo] = useState({
    isOpen: false,
    title: "",
    description: "",
    isCTA: true,
    submitText: "Confirm",
    cancelText: "Cancel",
    onSubmit: () => {},
    content: null as React.ReactNode,
  });

  const user_id = getCookie("user_id");

  const {
    application_reference_code,
    journey_start_date,
    journey_end_date,
    travelling_to_country,
    travelling_to,
    application_state,
    creator_user,
    reviewer_user,
    created_on,
    insurance_details,
    is_visaero_insurance_bundled,
  } = applicationData;

  const formattedDate = format(new Date(created_on), "dd MMM yyyy");

  // console.log("applicationDatacreator_user", { applicationData, creator_user });

  const visaTitle = generateVisaType(applicationData);
  const queryClient = useQueryClient();

  const { label, color } = getBookingStatusNew(
    application_state,
    applicationData,
  );

  const { refetch: RefetchAssignToMe } = useQuery({
    ...orpc.visa.assignToMeApplication.queryOptions({
      input: {
        applicationId: applicationData?._id,
      },
    }),
    enabled: false,
  });

  const refreshTabData = () => {
    queryClient.invalidateQueries({
      queryKey: orpc.visa.getTrackVisaApplicationsData.key(),
    });
  };

  const handleConfirmAssignToMe = async () => {
    try {
      const { data: request } = await RefetchAssignToMe();
      if (request?.status === "success") {
        refreshTabData();
        setPromtInfo((prev) => ({
          ...prev,
          isOpen: false,
        }));
        toast.success(request?.msg || "Application assigned successfully!");
      }
    } catch (error) {
      console.error("Error confirming mark as fixed:", error);
    }
  };

  console.log("creator and reviewer logs >>", { creator_user, reviewer_user });
  console.log("insurance details >>", {
    is_visaero_insurance_bundled,
    insurance_details,
  });

  //
  const isAssignToMe = false; // creator_user?._id !== user_id;
  return (
    <div className="flex w-full gap-3 px-2">
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h6 className="text-sm font-bold">{application_reference_code}</h6>
          <button
            onClick={(e) => {
              e.stopPropagation();
              copyToClipboard(application_reference_code || "-");
            }}
            className="text-gray-500 transition-colors hover:text-blue-600"
            title="Copy Reference Number"
          >
            {isCopied ? (
              <SquareCheckBig className="h-5 w-5 text-green-500" />
            ) : (
              <Copy className="h-5 w-5" />
            )}
          </button>
          <Badge
            style={{ backgroundColor: color }}
            className="bg-primary rounded-xs text-[10px] text-white md:rounded-sm md:text-xs"
          >
            {label}
          </Badge>
        </div>
        <div>
          <FlagBadge
            key={travelling_to}
            code={travelling_to || ""}
            label={travelling_to_country || ""}
            name={travelling_to_country}
          />
        </div>

        <div className="mt-2 grid gap-4 sm:grid-cols-3 md:grid-cols-5">
          <div className="col-span-2 flex flex-col justify-around gap-3">
            <TrackColumnRow
              icon={<Calendar className="size-5" />}
              label={`${formatDate(journey_start_date)} - ${formatDate(journey_end_date)}`}
              className="max-sm:hidden"
            />
            <TrackColumnRow
              icon={<VisaIcon className="size-8 md:size-5" />}
              label={visaTitle}
            />

            <TrackColumnRow
              icon={<SquareUserIcon className="size-6 md:size-5" />}
              label={`${applicantsData.length} Applicant(s)`}
            />
            {is_visaero_insurance_bundled && (
              <TrackColumnRow
                className="md:hidden"
                icon={<InsuranceIcon className="size-5" />}
                label={insurance_details?.insurance_title}
              />
            )}
          </div>

          {(Object.keys(creator_user || {}).length > 0 ||
            Object.keys(reviewer_user || {}).length > 0) && (
            <div className="hidden flex-col gap-3 border-dashed border-l-[#757575] px-3 sm:border-l md:flex">
              {creator_user && (
                <AnimatedProfileCard user={creator_user} label="Creator" />
              )}

              {reviewer_user?.first_name ? (
                <AnimatedProfileCard
                  isHoverable={false}
                  user={reviewer_user}
                  label="Reviewer"
                />
              ) : null}
            </div>
          )}
          <div className="hidden flex-col gap-3 border-dashed border-l-[#757575] px-3 sm:border-l md:flex">
            <div className="flex gap-2 p-2">
              <div>
                <TimerIcon />
              </div>
              <div>
                <div>Created On:</div>
                <div className="text-muted-foreground">{formattedDate}</div>
              </div>
            </div>
          </div>
          {is_visaero_insurance_bundled && (
            <div className="hidden flex-col gap-3 border-dashed border-l-[#757575] px-3 sm:border-l md:flex">
              <div className="flex gap-2 p-2">
                <InsuranceIcon className="size-5" />
                <div>{insurance_details?.insurance_title}</div>
              </div>
            </div>
          )}

          {/* <div>
            <TrackColumnRow
              icon={<CircleDollarSign className="h-5 w-5" />}
              label="Offline"
              className="max-sm:hidden"
            />
          </div> */}
        </div>
      </div>

      <div className="flex flex-col justify-end gap-2 py-2">
        {isAssignToMe && (
          <Link
            href="#"
            className="font-medium text-blue-600 hover:underline dark:text-blue-500"
            onClick={() =>
              setPromtInfo({
                ...promtInfno,
                isOpen: true,
                title: "Assign To Me",
                onSubmit: handleConfirmAssignToMe,
                content: (
                  <p className="text-muted-foreground text-sm">
                    Are you sure you want to assign this application to
                    yourself?
                  </p>
                ),
              })
            }
          >
            Assign To Me
          </Link>
        )}
      </div>

      <div className="flex flex-col justify-between gap-2">
        <TrackApplicationActions applicationData={applicationData} />
        <Button
          size="icon"
          variant="ghost"
          className="transition-transform duration-200"
        >
          <ChevronDown
            className="text-muted-foreground h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180 data-[state=open]:rotate-180 data-[state=open]:text-red-200"
            aria-label="Toggle accordion"
          />
        </Button>
      </div>

      {promtInfno?.isOpen && (
        <PromptModal
          title={promtInfno.title || "Confirm Action"}
          description={promtInfno.description || ""}
          open={promtInfno.isOpen}
          onCancel={() => {
            setPromtInfo((prev) => ({ ...prev, isOpen: false }));
          }}
          onSubmit={promtInfno.onSubmit || (() => {})}
          isCTA={true}
          submitText="Confirm"
          cancelText="Cancel"
          children={promtInfno.content || null}
        />
      )}
    </div>
  );
};

interface TrackColumnRowProps {
  icon: React.ReactNode;
  label: React.ReactNode;
  className?: string;
}

const TrackColumnRow = ({ icon, label, className }: TrackColumnRowProps) => (
  <div
    className={`flex items-start gap-2 normal-case md:items-center ${className || ""}`}
  >
    {icon}
    <span>{label}</span>
  </div>
);

interface FlagBadgeProps {
  code: string;
  name: string;
  label: string;
}

const FlagBadge = ({ code, name, label }: FlagBadgeProps) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger className="flex items-center gap-2">
        <Flag src={getCountryFlagBy3Code(code) || ""} alt={name} />
        <span>{label}</span>
      </TooltipTrigger>
      <TooltipContent arrowClassName="fill-primary" className="bg-primary">
        <p>{name}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export default TrackApplicationCard;

const InsuranceIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <mask
      id="mask0_2458_2858"
      style={{
        maskType: "luminance",
      }}
      maskUnits="userSpaceOnUse"
      x={0}
      y={0}
      width={16}
      height={16}
    >
      <path d="M0 3.8147e-06H16V16H0V3.8147e-06Z" fill="white" />
    </mask>
    <g mask="url(#mask0_2458_2858)">
      <path
        d="M13.5959 10.7814C13.756 10.4547 13.9021 10.121 14.0351 9.78262"
        stroke="#0A0A0A"
        strokeWidth={0.666667}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.3985 8.74617C15.1258 6.40436 15.286 3.95342 15.1223 2.10408C15.099 1.84167 14.8415 1.66411 14.589 1.73889C14.0403 1.90129 13.4681 2.00042 12.8916 2.02311C11.1887 2.0902 9.34673 1.57095 8.19864 0.362202C8.03173 0.186483 7.75392 0.186545 7.58708 0.362295C6.4393 1.57136 4.59748 2.09114 2.89458 2.02451C2.31808 2.00201 1.74583 1.90304 1.19714 1.74076C0.944516 1.66608 0.687078 1.8437 0.663922 2.10614C0.293453 6.3048 1.59342 13.6038 7.4063 15.6858C7.72205 15.7989 8.06805 15.7988 8.38377 15.6856C9.17589 15.4017 9.88423 15.0208 10.5159 14.5641"
        stroke="#0A0A0A"
        strokeWidth={0.666667}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.2596 10.6685C13.6673 8.23114 14.1392 5.19965 13.9641 3.2568C13.9461 3.0568 13.7462 2.92149 13.5501 2.97849C11.6675 3.52555 9.5138 3.26852 8.13058 1.83874C8.05218 1.75768 7.99655 1.72571 7.89324 1.7428C7.7899 1.72574 7.7343 1.75771 7.6559 1.8388C7.45218 2.04952 7.23168 2.2348 6.9978 2.39577"
        stroke="#0A0A0A"
        strokeWidth={0.666667}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.03663 2.89881C4.85354 3.35131 3.48564 3.34256 2.23689 2.98009C2.04076 2.92315 1.84095 3.05853 1.82298 3.25853C1.53539 6.45837 3.00379 12.6106 7.51579 14.1973C7.63832 14.2404 7.76676 14.2619 7.89517 14.2619C8.0236 14.2619 8.15198 14.2403 8.27451 14.1972C8.99538 13.9435 9.63848 13.5732 10.2091 13.1171"
        stroke="#0A0A0A"
        strokeWidth={0.666667}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.17953 9.86458L9.78472 7.49958L10.6548 6.72668C11.1153 6.31761 11.3873 5.73727 11.4072 5.12168C11.4186 4.76689 11.128 4.47621 10.7732 4.48764C10.1576 4.50752 9.57722 4.77958 9.16816 5.24008L8.39525 6.11011L6.03028 8.71533L5.01231 8.7623C4.93903 8.76567 4.86966 8.7963 4.81778 8.84821L4.46737 9.19858C4.32206 9.34389 4.36662 9.58961 4.55369 9.67464L5.69941 10.1954L6.22019 11.3411C6.30522 11.5282 6.55094 11.5728 6.69625 11.4275L7.04666 11.0771C7.09853 11.0252 7.12916 10.9558 7.13256 10.8825L7.17953 9.86458Z"
        stroke="#0A0A0A"
        strokeWidth={0.666667}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.63458 5.84102L5.75083 5.38099C5.65767 5.36615 5.56305 5.39683 5.49636 5.46352L5.14605 5.81383C5.01436 5.94552 5.03652 6.1648 5.19186 6.26746L7.10267 7.53033L8.63458 5.84102Z"
        stroke="#0A0A0A"
        strokeWidth={0.666667}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.0523 7.25912L10.5124 10.1429C10.5272 10.236 10.4965 10.3307 10.4298 10.3973L10.0795 10.7477C9.94788 10.8793 9.72857 10.8572 9.62591 10.7018L8.36304 8.791L10.0523 7.25912Z"
        stroke="#0A0A0A"
        strokeWidth={0.666667}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.394 13.2197C15.394 14.6285 14.2519 15.7706 12.8431 15.7706C11.4343 15.7706 10.2922 14.6285 10.2922 13.2197C10.2922 11.8109 11.4343 10.6688 12.8431 10.6688C14.2519 10.6688 15.394 11.8109 15.394 13.2197Z"
        stroke="#0A0A0A"
        strokeWidth={0.666667}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.5527 14.4271C12.4099 14.4271 12.2729 14.3694 12.1729 14.2669L11.5648 13.6429C11.3604 13.4332 11.3647 13.0975 11.5744 12.8931C11.7841 12.6887 12.1198 12.6931 12.3243 12.9028L12.5322 13.1161L13.3427 12.1919C13.5358 11.9718 13.8708 11.9498 14.091 12.1428C14.3111 12.3359 14.3331 12.671 14.14 12.8911L12.9513 14.2465C12.8539 14.3576 12.7144 14.423 12.5666 14.4269C12.562 14.427 12.5573 14.4271 12.5527 14.4271Z"
        stroke="#0A0A0A"
        strokeWidth={0.666667}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  </svg>
);
