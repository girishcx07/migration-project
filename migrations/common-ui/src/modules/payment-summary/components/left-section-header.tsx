"use client";
import { Flag } from "@workspace/common-ui/components/flag-img";
import useCopyToClipboard from "@workspace/common-ui/hooks/use-copy-to-clipboard";
import { getCountryFlagBy3Code } from "@workspace/common-ui/lib/utils";
import { Application } from "@workspace/types/review";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Copy, SquareCheckBig } from "lucide-react";

interface leftSectionHeaderProps {
  application: Application;
}

const LeftSectionHeader = ({ application }: leftSectionHeaderProps) => {
  const { isCopied, copyToClipboard } = useCopyToClipboard();
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="mb-1 flex items-center gap-2">
            {application?.travelling_to ? (
              <Flag
                src={getCountryFlagBy3Code(application?.travelling_to) || ""}
                alt={application?.travelling_to || "Country Flag"}
              />
            ) : (
              <Skeleton className="h-[20px] w-[40px]" />
            )}
            <span className="text-sm font-semibold text-gray-600">
              {application?.travelling_to_country || "Unknown Country"}
            </span>
          </div>
          {/* <p className="mt-1 text-sm text-gray-500">
                       Visa Reference Number
                     </p> */}
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-800 md:text-2xl">
              {application?.application_reference_code || "-"}
            </h1>
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
        </div>
      </div>
    </div>
  );
};

export default LeftSectionHeader;
