"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { NoDataCard } from "@workspace/common-ui/components/no-data-card";
import { getCookie } from "@workspace/common-ui/lib/utils";
import { orpc } from "@workspace/orpc/lib/orpc";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTriggerPain,
} from "@workspace/ui/components/accordion";
import { format } from "date-fns";
import Pagination from "../components/pagination";
import {
  TrackApplicantCard,
  TrackApplicantCardSkeleton,
} from "../components/track-applicant-card";
import TrackApplicationCard from "../components/track-application-card";

interface TrackApplicationListProps {
  activeTab: string;
  dateRange: { from: Date; to: Date };
  currentPage: number;
  setCurrentPage: (page: number) => void;
  searchValue?: string;
}

export const TrackApplicationList = ({
  activeTab,
  dateRange,
  currentPage,
  setCurrentPage,
  searchValue,
}: TrackApplicationListProps) => {
  // const router = useRouter();
  // const searchParams = useSearchParams();
  // const searchValue = searchParams.get("search_text");
  // const [currentPage, setCurrentPage] = useState(1);

  const userId = getCookie("user_id");

  const { data, isLoading } = useSuspenseQuery(
    orpc.visa.getTrackVisaApplicationsData.queryOptions({
      input: {
        from: format(dateRange.from, "yyyy-MM-dd"),
        to: format(dateRange.to, "yyyy-MM-dd"),
        tabType: activeTab,
        search_text:
          activeTab === "search" ? searchValue || undefined : undefined,
        page_number: currentPage,
      },
    }),
  );

  console.log("Track applications data >>", data);

  const trackData = data?.data;
  const totalItems = data?.pagination_details?.total_elements || 0;

  const handlePageChange = (page: number) => {
    // const params = new URLSearchParams(window.location.search);
    // params.set("page", page.toString());
    // router.replace(`?${params.toString()}`);
    setCurrentPage(page);
  };

  console.log("page number >>", currentPage);

  if (isLoading) return <TrackApplicationListSkeleton />;

  if (!trackData?.length)
    return (
      <NoDataCard
        message="No applications found for this tab."
        title="No Applications Found"
      />
    );

  return (
    <div className="flex h-full flex-col">
      <div className="w-full flex-1 px-3 py-4">
        <Accordion type="single" collapsible defaultValue={"item-0"}>
          {trackData.map((data, i: number) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="track-accordion mb-3 overflow-hidden rounded-xl border border-[#757575] shadow-md last:border"
            >
              <AccordionTriggerPain
                showIcon
                asChild
                className="group cursor-pointer rounded-none border-[#757575] bg-[#EDEDED] py-2 hover:no-underline data-[state=open]:border-b"
              >
                <div>
                  <TrackApplicationCard
                    applicantsData={data?.applicants_data}
                    applicationData={data?.application_obj}
                  />
                </div>
              </AccordionTriggerPain>
              <AccordionContent className="bg-white p-2">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                  {data?.applicants_data?.map((applicant, idx) => (
                    <TrackApplicantCard
                      index={idx}
                      key={applicant?._id}
                      applicant={applicant}
                      applicationData={data.application_obj}
                      user_id={userId!}
                    />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
      <div className="sticky bottom-0 z-10 w-full bg-white shadow-[0_-4px_8px_-2px_rgba(0,0,0,0.1)]">
        <Pagination
          totalItems={totalItems}
          itemsPerPage={10}
          currentPage={currentPage}
          // onPageChange={(page) => console.log(page)}
          onPageChange={(page) => handlePageChange(page)}
          // onPageChange={(page) => setCurrentPage(page)}
          siblingCount={1}
        />
      </div>
    </div>
  );
};

export const TrackApplicationListSkeleton = () => (
  <div className="min-h-full space-y-3 p-3 pt-0">
    {Array.from({ length: 3 }).map((_, i) => (
      <TrackApplicantCardSkeleton key={i} />
    ))}
  </div>
);
