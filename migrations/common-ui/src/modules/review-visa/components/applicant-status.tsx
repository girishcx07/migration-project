import clsx from "clsx";
import { useApplicationState } from "../context/review-visa-context";

interface ApplicantStatusProps {
  applicantId?: string;
}

export const ApplicantStatus = ({ applicantId }: ApplicantStatusProps) => {
  const { applicants } = useApplicationState();

  const applicant = applicants.find((app) => app.applicantId === applicantId);
  const status = applicant ? applicant.status : "calculating";

  return (
    <div className="flex items-center space-x-1">
      <span
        className={clsx("text-xs", {
          "text-green-500": status === "completed",
          "text-yellow-500": status === "pending",
          "text-gray-500": status === "calculating",
        })}
      >
        {status === "calculating" ? "Calculating..." : status || "Loading..."}
      </span>
    </div>
  );
};
