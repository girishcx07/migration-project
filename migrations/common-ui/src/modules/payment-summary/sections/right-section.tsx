"use client";

import { Skeleton } from "@workspace/ui/components/skeleton";
import PaymentMethod, {
  PaymentModeSkeleton,
} from "../components/payment-method";
import { SubmitApplicationBtn } from "../components/submit-application-btn";
import { usePaymentSummary } from "../context/payment-summary-context";
import PaymentSummaryCard, {
  PaymentSummaryCardSkeleton,
} from "../sections/payment-summary";
import WalletBalance from "../sections/wallet-balance";
import { ChildApplicantError } from "../components/child-applicant-error";
import { useRouteContext } from "@workspace/common-ui/context/route-context";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { Label } from "@workspace/ui/components/label";

interface rightSectionProps {
  applicationId: string;
}
const RightSection = ({
  applicationId,
}: rightSectionProps) => {
  const { selectedPaymentMethod, isSingleApplicantChild, acceptedTnc, setAcceptedTnc } = usePaymentSummary();

  const { workflow } = useRouteContext()

  console.log("isSingleApplicantChild >>", isSingleApplicantChild);

  return (
    <div className="relative flex h-auto w-full flex-col space-y-6 md:w-5/12">
      <div className="flex-1 space-y-6">
        <PaymentMethod />
        <PaymentSummaryCard
          applicationId={applicationId!}
        />
        {selectedPaymentMethod.type === "wallet" && (
          <WalletBalance applicationId={applicationId} />
        )}
      </div>

      {/* Proceed Button for Desktop */}
      <div className="sticky bottom-0 hidden bg-white p-4 md:block">
        {isSingleApplicantChild && <ChildApplicantError className="mb-3" />}
        {/* {
          ["console", "qr-visa"].includes(workflow) && (
            <div className="mb-5">
              <label className="flex items-start gap-2 text-sm ">
                <Checkbox id="terms-checkbox" name="terms-checkbox" checked={acceptedTnc} onClick={() => setAcceptedTnc(!acceptedTnc)} />
                <Label htmlFor="terms-checkbox">
                  <div>
                    I agree to{" "}
                    <a
                      href="https://s3.ap-southeast-1.amazonaws.com/visaero.assets/agreements/arcube/arcube_tnc.html"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      Terms of Use
                    </a>{' '}
                    and
                    {" "}  <a
                      // href="https://s3.ap-southeast-1.amazonaws.com/visaero.assets/agreements/arcube/arcube_tnc.html"
                      href="https://www.arcube.com/privacy-policy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      Privacy Policy</a>
                  </div>

                </Label>
              </label>
            </div>
          )
        } */}
        <SubmitApplicationBtn />
      </div>
    </div>
  );
};

export default RightSection;

export const RightSectionSkeleton = ({ className }: { className?: string }) => {
  return (
    <div className={`relative flex h-auto w-full flex-col space-y-6 md:w-5/12`}>
      <PaymentModeSkeleton />
      {/* Payment Summary Skeleton */}
      <div className="flex-1">
        <PaymentSummaryCardSkeleton />
      </div>
      {/* Bottom Proceed Button Skeleton (Desktop Only) */}
      <div className="sticky bottom-0 hidden bg-white p-4 md:block">
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    </div>
  );
};
