import { createFileRoute, getRouteApi } from "@tanstack/react-router";

import { NewVisaPage } from "@acme/shared-ui/pages/new-visa";

const qrLayoutRoute = getRouteApi("/qr-visa/_qrLayout");

export const Route = createFileRoute("/qr-visa/_qrLayout/new-visa")({
  component: RouteComponent,
});

function RouteComponent() {
  const { enterpriseData } = qrLayoutRoute.useLoaderData();

  return <NewVisaPage onReviewRoute="/qr-visa/review" />;
}
