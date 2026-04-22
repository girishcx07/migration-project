import { Suspense } from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { queryClient } from "@workspace/common-ui/lib/react-query";
import { orpc } from "@workspace/orpc/lib/orpc";
import { VisaColumnProvider } from "./context/visa-columns-context";
import VisaColumnsView, {
  VisaColumnsViewSkeleton,
} from "./view/visa-columns-view";

const VisaColumnsSuspenseContent = async () => {
  await Promise.all([
    queryClient.prefetchQuery(orpc.visa.getNationalities.queryOptions()),
    queryClient.prefetchQuery(orpc.evm.getEVMRequestData.queryOptions()),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <VisaColumnsView />
    </HydrationBoundary>
  );
};

const Page = () => {
  return (
    <div className="bg-secondary h-screen">
      <VisaColumnProvider>
        <Suspense fallback={<VisaColumnsViewSkeleton />}>
          <VisaColumnsSuspenseContent />
        </Suspense>
      </VisaColumnProvider>
    </div>
  );
};

export default Page;
