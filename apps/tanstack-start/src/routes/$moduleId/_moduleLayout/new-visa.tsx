import { createFileRoute } from "@tanstack/react-router";

import { NewVisaPage } from "@acme/shared-ui/pages/new-visa";

export const Route = createFileRoute("/$moduleId/_moduleLayout/new-visa")({
  component: RouteComponent,
});

function RouteComponent() {
  return <NewVisaPage onReviewRoute="/qr-visa/review" />;
}
