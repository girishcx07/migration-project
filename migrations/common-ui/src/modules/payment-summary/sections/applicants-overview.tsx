"use client";

import { useApplicationDetails } from "@workspace/common-ui/hooks/global-queries";
import ApplicantProfile, {
  ApplicantProfileSkeleton,
} from "../components/applicant-profile";

const ApplicantOverview = () => {
  const { data } = useApplicationDetails();

  const applicants = data?.data?.applicants || [];

  return (
    <>
      <h6 className="p-2 text-lg font-bold"> Applicant/s Overview</h6>

      <div className="flex flex-wrap gap-2">
        {applicants?.map((applicant) => (
          <ApplicantProfile
            className="max-w-56 rounded-xl border shadow"
            key={applicant._id}
            data={applicant}
          />
        ))}
      </div>
    </>
  );
};

export default ApplicantOverview;

export const ApplicantOverviewSkeleton = () => {
  return (
    <div>
      <h6 className="animate-pulse p-2 text-lg font-bold">
        Applicant/s Overview
      </h6>

      <div className="flex flex-wrap gap-4">
        {/* Show 3–4 skeletons as placeholder */}
        {[...Array(3)].map((_, i) => (
          <ApplicantProfileSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};
