import { createFileRoute, getRouteApi } from "@tanstack/react-router";

import { QrVisaEntry } from "@acme/ui/components/qr-visa-entry";
const qrLayoutRoute = getRouteApi("/qr-visa/_qrLayout");

export const Route = createFileRoute("/qr-visa/_qrLayout/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { enterpriseData } = qrLayoutRoute.useLoaderData();

  return (
    <QrVisaEntry
      brand={enterpriseData.brand}
      brandColor={enterpriseData.brand_color}
      currency={enterpriseData.currency}
      description={enterpriseData.description}
      domainHost={enterpriseData.domain_host}
      host={enterpriseData.host}
      title={enterpriseData.title}
    />
  );
}
