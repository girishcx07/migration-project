import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@workspace/common-ui/lib/react-query";
import { orpc } from "@workspace/orpc/lib/orpc";
import { useCallback, useEffect } from "react";
import {
  FormStatus,
  useApplicationState,
} from "../context/review-visa-context";
import { isApplicantStatusHydrated } from "../lib/ready-status";

type ReadyStatusHookReturn = {
  updateApplicantStatus: (
    applicantId: string,
    status: FormStatus,
  ) => Promise<void>;
  getStatusForApplication: () => Promise<any>; // or your actual typed output
};

export function useReadyStatus(): ReadyStatusHookReturn {
  const { applicants, setApplicants, applicationId } = useApplicationState();

  const { mutateAsync } = useMutation(
    orpc.visa.updateApplicantReadyStatus.mutationOptions(),
  );

  const applicantsArr = applicants?.map((a) => ({
    applicant_id: a.applicantId,
  }));

  const { refetch, data } = useQuery(
    orpc.visa.getMissingDocs.queryOptions({
      input: {
        applicants: applicantsArr!,
        application_id: applicationId!,
      },
      enabled: false,
    }),
  );

  useEffect(() => {
    if (data?.status !== "success") return;

    const missingDocs = data?.data || [];
    const applicantSummary = data?.applicant_summary || [];

    if (missingDocs.length > 0) {
      console.log("application state for ready status missing document >>", {
        length: missingDocs.length,
        data,
      });

      queryClient.invalidateQueries({
        queryKey: orpc.visa.getApplicantDocData.key(),
      });
    }

    // Keep local applicant status fully aligned with backend summary.
    setApplicants((prev) =>
      prev.map((applicant) => {
        const summary = applicantSummary.find(
          (item) => item?._id === applicant.applicantId,
        );
        if (!summary || isApplicantStatusHydrated(applicant)) {
          return applicant;
        }

        return { ...applicant, status: summary.ready_status };
      }),
    );
  }, [data]);

  // console.log("applcation state for ready status missing document >>", data)

  const updateApplicantStatus = useCallback(
    async (applicantId: string, status: FormStatus) => {
      mutateAsync({
        applicantId,
        status,
      });
    },
    [mutateAsync],
  );

  return {
    updateApplicantStatus,
    getStatusForApplication: refetch,
  };
}
