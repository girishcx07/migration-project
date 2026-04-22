"use client";

import useCopyToClipboard from "@workspace/common-ui/hooks/use-copy-to-clipboard";
import {
  generateVisaType,
  travelDates
} from "@workspace/common-ui/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Copy, SquareCheckBig } from "lucide-react";
import { memo } from "react";
import { useApplicationState } from "../context/review-visa-context";

const ApplicationDetails = () => {
  const { applicationDetails } = useApplicationState();
  const { isCopied, copyToClipboard } = useCopyToClipboard();

  const application = applicationDetails?.application;

  const visaType = generateVisaType(application);

  const travelDatesStr = travelDates(
    application?.journey_start_date || "",
    application?.journey_end_date || "",
  );


  console.log("applicationDetails",applicationDetails)

  return (
    <>
      <Accordion type="single" collapsible>
        <AccordionItem
          value="item-1"
          className="overflow-hidden rounded-xl border shadow-sm"
        >
          <AccordionTrigger className="bg-gray-100 px-2 py-2 text-black">
            <div className="text-primary text-xs font-semibold md:text-sm">
              <span className="text-xs text-black md:text-sm">
                Application Ref. No:&nbsp;&nbsp;
              </span>
              {application?.application_reference_code}
            </div>
          </AccordionTrigger>
          <AccordionContent className="bg-white px-3 pt-2">
            <div className="grid grid-cols-1 gap-x-4 gap-y-1 md:grid-cols-3 md:gap-y-2">
              <div className="flex items-center gap-2">
                <div className="text-xs font-semibold md:text-sm">Ref No: </div>
                <div className="text-xs text-gray-500 md:text-sm">
                  {application?.application_reference_code}
                </div>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(
                      application?.application_reference_code || "-",
                    );
                  }}
                  className="text-gray-500 transition-colors hover:text-blue-600"
                  title="Copy Reference Number"
                >
                  {isCopied ? (
                    <SquareCheckBig className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xs font-semibold md:text-sm">
                  {" "}
                  Nationality:{" "}
                </div>
                <div className="text-xs text-gray-500 md:text-sm">
                  {application?.nationality}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xs font-semibold md:text-sm">
                  Travelling to:{" "}
                </div>
                <div className="text-xs text-gray-500 md:text-sm">
                  {application?.travelling_to_country}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xs font-semibold md:text-sm">
                  Visa Type:{" "}
                </div>
                <div className="text-xs text-gray-500 md:text-sm">
                  {" "}
                  {visaType}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xs font-semibold md:text-sm">
                  Travel Dates:{" "}
                </div>
                <div className="text-xs text-gray-500 md:text-sm">
                  {" "}
                  {travelDatesStr}
                </div>
              </div>
              {/* <div className="flex items-center gap-2">
                <div className="text-xs font-semibold md:text-sm">
                  Visa Duration:{" "}
                </div>
                <div className="text-xs text-gray-500 md:text-sm">
                  {durationDays}
                </div>
              </div> */}
              <div className="flex items-center gap-2">
                <div className="text-xs font-semibold md:text-sm">
                  {" "}
                  Applicants:{" "}
                </div>
                <div className="text-xs text-gray-500 md:text-sm">
                  {applicationDetails?.applicants?.length || 0}
                </div>
              </div>

              {application?.is_visaero_insurance_bundled && <div className="flex items-center gap-2">
                <div className="text-xs font-semibold md:text-sm">
                  {" "}
                  Insurance Type:{" "}
                </div>
                <div className="text-xs text-gray-500 md:text-sm">
                  {application?.insurance_details?.insurance_title || "N/A"}
                </div>
              </div>}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  );
};

ApplicationDetails.displayName = "ApplicationDetails";

export default memo(ApplicationDetails);

export const ApplicationDetailsSkeleton = () => {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem
        value="item-1"
        className="overflow-hidden rounded-xl border shadow-sm"
      >
        <AccordionTrigger className="bg-gray-100 px-2 py-2 text-black">
          <div className="text-primary flex items-center gap-2 text-xs font-semibold md:text-sm">
            <span className="text-xs text-black md:text-sm">
              Application Ref. No:&nbsp;&nbsp;
            </span>
            <Skeleton className="h-4 w-32" />
          </div>
        </AccordionTrigger>
        <AccordionContent className="bg-white px-3 pt-2">
          <div className="grid grid-cols-1 gap-x-4 gap-y-1 md:grid-cols-3 md:gap-y-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-24 text-xs font-semibold md:text-sm">
                  <Skeleton className="h-4 w-full" />
                </div>
                <div className="flex-1 text-xs text-gray-500 md:text-sm">
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
