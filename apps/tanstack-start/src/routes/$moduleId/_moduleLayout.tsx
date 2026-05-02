import { getDomainHost } from "@/lib/domain";
import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";

import { QrVisaEntrySkeleton } from "@acme/ui/components/qr-visa-entry-skeleton";

const allowedModules = [
  "qr-visa",
  "evm",
  "console",
  "b2b",
  "enterprise",
] as const;

type ModuleId = (typeof allowedModules)[number];

function isAllowedModule(moduleId: string): moduleId is ModuleId {
  return allowedModules.includes(moduleId as ModuleId);
}

const getSSRRequestHost = createServerFn({ method: "GET" }).handler(() => {
  return (
    getRequestHeader("x-forwarded-host") ??
    getRequestHeader("host") ??
    getRequestHeader("origin") ??
    ""
  );
});

export const Route = createFileRoute("/$moduleId/_moduleLayout")({
  beforeLoad: async ({ context, params }) => {
    const { moduleId } = params;

    if (!isAllowedModule(moduleId)) {
      throw notFound();
    }

    const { trpc, queryClient } = context;

    const requestHost = await getSSRRequestHost();

    const domainHost = getDomainHost({
      domainHost: requestHost,
      moduleType: moduleId,
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
      moduleId,
      enterpriseData,
    };
  },

  pendingComponent: QrVisaEntrySkeleton,
  component: Outlet,
});
