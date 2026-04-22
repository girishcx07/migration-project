import { getDomainHost } from "@/lib/domain";
import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";

import { QrVisaEntrySkeleton } from "@acme/ui/components/qr-visa-entry-skeleton";

const getSSRRequestHost = createServerFn({ method: "GET" }).handler(() => {
  return (
    getRequestHeader("x-forwarded-host") ??
    getRequestHeader("host") ??
    getRequestHeader("origin") ??
    ""
  );
});

export const Route = createFileRoute("/qr-visa/_qrLayout")({
  loader: async ({ context }) => {
    const { trpc, queryClient } = context;
    const requestHost = await getSSRRequestHost({ data: undefined });
    const domainHost = getDomainHost({
      domainHost: requestHost,
      moduleType: "qr-visa",
    });

    if (!domainHost) {
      throw notFound();
    }

    const enterpriseData = await queryClient.ensureQueryData(
      trpc.enterprise.getEnterpriseAccountHostDetails.queryOptions({
        domainHost,
      }),
    );

    if (!enterpriseData) {
      throw notFound();
    }

    return {
      enterpriseData,
    };
  },
  pendingComponent: QrVisaEntrySkeleton,
  component: Outlet,
});
