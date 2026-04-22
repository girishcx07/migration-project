import { VisaStepLayout } from "@acme/shared-ui/pages/new-visa";

export default async function QrVisaNewVisaPage() {
  return <VisaStepLayout onReviewRoute="/qr-visa/review" />;
}
// import NewVisaPage from "@acme/shared-ui/modules/new-visa/page";

// export default async function QrVisaNewVisaPage() {
//   return <NewVisaPage reviewRoute="/qr-visa/review" />;
// }
