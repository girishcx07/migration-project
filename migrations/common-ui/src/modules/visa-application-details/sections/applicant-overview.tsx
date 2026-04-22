"use client";

import { TrackApplicant } from "@workspace/types/track-application";
import { ApplicantCard } from "../components/applicant-card";

const ApplicantOverview = ({
  application,
}: {
  application: any;
}) => {


  console.log("application--application", {
    application,
  });
  return (
    <div className="w-full rounded-lg bg-white p-4 shadow-md">
      <div className="content-center text-lg font-bold">
        Applicant Overview{" "}
      </div>

      <div className="mt-2 grid gap-4">
        {application?.applicants?.map((res: TrackApplicant, index: number) => (
          <ApplicantCard
            index={index}
            applicationData={application?.application}
            applicant={res}
            key={index}
          />
        ))}
      </div>
    </div>
  );
};

export default ApplicantOverview;
