import { createFileRoute } from "@tanstack/react-router";

import { QrVisaEntry } from "@acme/ui/components/qr-visa-entry";

export const Route = createFileRoute("/$moduleId/_moduleLayout/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { enterpriseData } = Route.useRouteContext();
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
