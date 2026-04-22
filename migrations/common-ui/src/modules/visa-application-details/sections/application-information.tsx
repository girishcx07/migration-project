"use client";

import { Flag } from "@workspace/common-ui/components/flag-img";
import { useRouteContext } from "@workspace/common-ui/context/route-context";
import { getCookie } from "@workspace/common-ui/lib/utils";
import useCopyToClipboard from "@workspace/common-ui/hooks/use-copy-to-clipboard";
import { formatDate, getBookingStatusNew, getCountryFlagBy3Code, travelDates } from "@workspace/common-ui/lib/utils";
import { Application } from "@workspace/types/review";
import { Badge } from "@workspace/ui/components/badge";
import { Separator } from "@workspace/ui/components/separator";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Copy, Hourglass, MoveRight, SquareCheckBig } from "lucide-react";
import ProductDetails from "../../payment-summary/components/product-details";
import { VisaOfferDetailsModal } from "@workspace/common-ui/components/visa-offer-details-modal";
import { useStripe } from "@stripe/react-stripe-js";
import { useState } from "react";

const ApplicationInformation = ({ application }: { application: Application }) => {
  const { isCopied, copyToClipboard } = useCopyToClipboard();
  const [isOpenModal, setIsOpenModal] = useState(false)

  const { workflow } = useRouteContext()

  const travelDatesStr = travelDates(
    application?.journey_start_date!,
    application?.journey_end_date!,
  );

  const nationalityCode = application?.travelling_to_identity.split("_")[1];
  const destinationCode = application?.travelling_to_identity.split("_")[2];
  const creatorName = `${application?.creator_user?.first_name} ${application?.creator_user?.last_name}`;
  // const reviewerName = `${application?.reviewer_user?.first_name} ${application?.reviewer_user?.last_name}`;
  const reviewerName = application?.reviewer_user
    ? `${application?.reviewer_user?.first_name || ""} ${application?.reviewer_user?.last_name || ""}`.trim()
    : "";
  const { label, color } = getBookingStatusNew(
    // application?.application_state || "",
    application?.application_status || "",
    application,
  );

  console.log("reviewerName", reviewerName);
  return (
    <>
      <div className=" w-full rounded-lg bg-white p-4 shadow-md">
        <div className="flex justify-between">
          <div className="w-full">
            <div className="flex flex-row w-full justify-between">
              <div className="flex content-center items-center gap-2">
                <span className="text-xl font-bold text-gray-800 md:text-xl">
                  {application?.application_reference_code}
                </span>
                <button
                  onClick={() =>
                    copyToClipboard(application?.application_reference_code || "-")
                  }
                  className="text-gray-500 transition-colors hover:text-blue-600"
                  title="Copy Reference Number"
                >
                  {isCopied ? (
                    <SquareCheckBig className="h-5 w-5 text-green-500" />
                  ) : (
                    <Copy className="h-5 w-5" />
                  )}
                </button>
              </div>

              <div className="pt-1 flex justify-end">
                <Badge
                  style={{ backgroundColor: color }}
                  className="bg-primary text-[10px] text-white md:text-xs"
                >
                  <Hourglass />
                  {label}
                </Badge>
              </div>
            </div>

            <div className="text-muted-foreground text-sm">
              Visa Reference Number
            </div>
            <div className="flex w-full gap-2">
              <div className="flex items-center gap-1">
                <Flag
                  src={getCountryFlagBy3Code(nationalityCode || "")}
                  alt={application?.nationality || "Country Flag"}
                />
                <span className="font-semibold">
                  {application?.nationality || "Unknown Country"}
                </span>
              </div>
              <MoveRight />
              <div className="flex items-center gap-1">
                <Flag
                  src={getCountryFlagBy3Code(destinationCode || "")}
                  alt={application?.travelling_to_country || "Country Flag"}
                />
                <span className="font-semibold">
                  {application?.travelling_to_country || "Unknown Country"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-4" />


        <ProductDetails application={application} />

        {workflow !== "qr-visa" &&
          <div className="grid gap-4 px-3 md:grid-cols-3">
            <TrackColumnRow
              name={"Created On"}
              value={formatDate(new Date(application?.created_on || ""))}
              className="max-sm:hidden"
            />
            <TrackColumnRow
              name={"Travel Dates"}
              value={travelDatesStr}
              className="max-sm:hidden"
            />
            <TrackColumnRow
              name={"Created By"}
              value={creatorName || "Unknown"}
              className="max-sm:hidden"
            />
            {reviewerName !== "" && (
              <TrackColumnRow
                name={"Reviewed By"}
                value={reviewerName == "" ? "-" : reviewerName}
                className="max-sm:hidden"
              />
            )}
          </div>
        }
        {/* <div className="flex justify-end">
          <p
            className="mt-4 cursor-pointer text-sm text-blue-600 hover:underline"
            onClick={() => setIsOpenModal(true)}> More Details...</p>
        </div> */}
      </div>
      {isOpenModal && <VisaOfferDetailsModal
        application={application} isOpenModal={isOpenModal} setIsOpenModal={setIsOpenModal} />}
    </>
  );
};

interface TrackColumnRowProps {
  name: React.ReactNode;
  value: React.ReactNode;
  className?: string;
}

const TrackColumnRow = ({ name, value, className }: TrackColumnRowProps) => (
  <div className="flex-col text-sm">
    <p className="text-muted-foreground"> {name} </p>
    <p className="text-sm font-medium">{value}</p>
  </div>
);

const ApplicationInformationSkeleton = () => (
  <div className="h-full w-full rounded-lg bg-white p-4 shadow-md">
    <div className="flex justify-between">
      <div className="flex-col space-y-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-32" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-8 rounded-sm" />
          <Skeleton className="h-4 w-24" />
          <MoveRight className="text-gray-300" />
          <Skeleton className="h-5 w-8 rounded-sm" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <Skeleton className="h-6 w-20 rounded-md" />
    </div>

    <Separator className="my-4" />

    <div className="grid gap-4 px-3 md:grid-cols-2">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-5 w-32" />
    </div>
  </div>
);

export default ApplicationInformation;
