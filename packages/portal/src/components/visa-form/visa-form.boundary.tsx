import { Suspense } from "react";
import { VisaFormRSC } from "./visa-form.rsc";
import { VisaFormServerSkeleton } from "./visa-form.skeleton";

interface VisaFormBoundaryProps {
  applicationId?: string;
  applicantId?: string;
}

const VisaFormBoundary = (props: VisaFormBoundaryProps) => {
  return (
    <Suspense fallback={<VisaFormServerSkeleton />}>
      <VisaFormRSC {...props} />
    </Suspense>
  );
};

export default VisaFormBoundary;
