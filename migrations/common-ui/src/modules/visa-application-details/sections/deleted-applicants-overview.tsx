"use client";

import { DeletedApplicantCard } from "../components/delete-applicant-card";
import { GetApplicationApplicantResponse } from "@workspace/types/review";

const DeletedApplicantsOverview = ({
    application,
}: {
    application: GetApplicationApplicantResponse;
}) => {

    return (
        <div className="w-full rounded-lg bg-white p-4 shadow-md">
            <div className="content-center text-lg font-bold">
                Deleted Applicants
            </div>

            <div className="mt-2 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {application?.deleted_applicants?.map((applicant, index) => (
                    <DeletedApplicantCard
                        index={index}
                        applicant={applicant}
                        key={index}
                    />
                ))}
            </div>
        </div>
    );
};

export default DeletedApplicantsOverview;
