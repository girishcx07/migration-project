import TrackApplicationView, {
  TrackApplicationViewSkeleton,
} from "./view/track-applications-view";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { queryClient } from "@workspace/common-ui/lib/react-query";
import { orpc } from "@workspace/orpc/lib/orpc";
import { subDays, format, parseISO, formatISO, isValid } from "date-fns";
import { Suspense } from "react";

interface PageProps {
  searchParams?: Promise<{
    tab?: string;
    search_text?: string;
    from?: string;
    to?: string;
    page_number?: string;
  }>;
}

const TrackApplicationSuspenseContent = async ({ searchParams }: PageProps) => {
  const params = await searchParams;

  const tabType = params?.tab || "my_applications";
  const search_text = params?.search_text || "";

  // ✅ Parse `from` and `to` as yyyy-MM-dd from URL
  const hasValidFrom = params?.from && isValid(parseISO(params.from));
  const hasValidTo = params?.to && isValid(parseISO(params.to));

  // ✅ Use param-based or default range
  const fromDate = hasValidFrom
    ? parseISO(params!.from!)
    : subDays(new Date(), 7);
  const toDate = hasValidTo ? parseISO(params!.to!) : new Date();

  // ✅ For API (yyyy-MM-dd)
  const apiFrom = format(fromDate, "yyyy-MM-dd");
  const apiTo = format(toDate, "yyyy-MM-dd");

  // ✅ For UI (ISO)
  const isoFrom = formatISO(fromDate, { representation: "date" });
  const isoTo = formatISO(toDate, { representation: "date" });

  // ✅ Prefetch API
  await queryClient.prefetchQuery(
    orpc.visa.getTrackVisaApplicationsData.queryOptions({
      input: {
        from: apiFrom,
        to: apiTo,
        tabType,
        search_text,
        // page_number: 1,
        page_number: params?.page_number ? Number(params.page_number) : 1,
      },
    }),
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TrackApplicationView from={isoFrom} to={isoTo} />
    </HydrationBoundary>
  );
};

export default function Page({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<TrackApplicationViewSkeleton />}>
      <TrackApplicationSuspenseContent searchParams={searchParams} />
    </Suspense>
  );
}
