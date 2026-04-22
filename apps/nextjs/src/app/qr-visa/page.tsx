import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getDomainHost } from "@/lib/domain";
import { createServerCaller } from "@/trpc/server";

import { QrVisaEntry } from "@acme/ui/components/qr-visa-entry";

const getRequestHost = (requestHeaders: Headers) =>
  requestHeaders.get("x-forwarded-host") ??
  requestHeaders.get("host") ??
  requestHeaders.get("origin") ??
  "";

const getSearchParamValue = (value?: string | string[]): string | undefined => {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
};

export default async function QrVisaPage({
  searchParams,
}: {
  searchParams: Promise<{ host?: string | string[] }>;
}) {
  const requestHeaders = new Headers(await headers());
  requestHeaders.set("x-trpc-source", "nextjs-qr-visa-page");
  const query = await searchParams;
  const requestedHost = getSearchParamValue(query.host);
  const domainHost = getDomainHost({
    domainHost: requestedHost ?? getRequestHost(requestHeaders),
    moduleType: "qr-visa",
  });

  if (!domainHost) {
    notFound();
  }

  const caller = await createServerCaller("nextjs-qr-visa-page");

  const enterpriseData =
    await caller.enterprise.getEnterpriseAccountHostDetails({
      domainHost,
    });

  if (!enterpriseData) {
    notFound();
  }

  return (
    <QrVisaEntry
      host={enterpriseData.host}
      brand={enterpriseData.brand}
      brandColor={enterpriseData.brand_color}
      currency={enterpriseData.currency}
      description={enterpriseData.description}
      domainHost={enterpriseData.domain_host}
      title={enterpriseData.title}
    />
  );
}
