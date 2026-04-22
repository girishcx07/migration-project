"use client";

import { subDays } from "date-fns";
import { Suspense, useState } from "react";

import TrackHeader, { TrackHeaderSkeleton } from "../sections/track-header";
import { Button } from "@workspace/ui/components/button";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { type DateRangeTypes } from "@workspace/ui/components/date-range-picker";
import { ChevronLeft } from "lucide-react";
import {
  TrackApplicationList,
  TrackApplicationListSkeleton,
} from "../sections/track-application-list";

interface TrackApplicationViewProps {
  from: string;
  to: string;
}

const TrackApplicationView = ({ from, to }: TrackApplicationViewProps) => {
  const [currentPage, setCurrentPage] = useState(1);

  const [activeTab, setActiveTab] = useState("my_applications");

  const safeDate = (val: string | null, fallback: Date) => {
    const d = val ? new Date(val) : null;
    return d && !isNaN(d.getTime()) ? d : fallback;
  };
  const [value, setValue] = useState("");
  const [reset, setReset] = useState(false);

  const [dateRange, setDateRange] = useState<DateRangeTypes>({
    from: safeDate(null, subDays(new Date(), 7)),
    to: safeDate(null, new Date()),
  });

  const handleBack = () => {
    setActiveTab("my_applications");
    setValue("");
    setReset(true);
  };

  return (
    <div className="bg-secondary min-h-screen w-full">
      {/* Header */}
      <TrackHeader
        setCurrentPage={setCurrentPage}
        setActiveTab={setActiveTab}
        activeTab={activeTab}
        value={value}
        setValue={setValue}
        dateRange={dateRange}
        setDateRange={setDateRange}
        isReset={reset}
        setReset={setReset}
      />

      {/* Applications List with Suspense */}
      <div>
        <Suspense
          fallback={
            <TrackApplicationListSkeleton />
            // <div className="py-10 text-center">Loading applications...</div>
          }
        >
          {activeTab === "search" && !value ? (
            <div className="flex min-h-full w-full flex-col items-center space-y-3 p-3 pt-6">
              <div>
                <div className="-ml-2 flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6"
                    onClick={handleBack}
                  >
                    <ChevronLeft />
                  </Button>
                  <h1 className="font-bold">Search with </h1>
                </div>

                <ul className="list-disc pl-5">
                  <li>Applicant Name</li>
                  <li>Applicant Email</li>
                  <li>Application No.</li>
                </ul>
              </div>
            </div>
          ) : (
            <>
              <TrackApplicationList
                searchValue={value}
                activeTab={activeTab}
                dateRange={dateRange!}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
              />
            </>
          )}
        </Suspense>
      </div>
    </div>
  );
};

export default TrackApplicationView;

export const TrackApplicationViewSkeleton = () => {
  return (
    <div className="bg-secondary min-h-screen w-full">
      <TrackHeaderSkeleton />
      <div className="p-4">
        <TrackApplicationListSkeleton />
      </div>
    </div>
  );
};
