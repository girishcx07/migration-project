import { NewVisaPage } from "@acme/shared-ui/pages/new-visa";

export default async function QrVisaNewVisaPage() {
  return <NewVisaPage onReviewRoute="/qr-visa/review" />;
}
