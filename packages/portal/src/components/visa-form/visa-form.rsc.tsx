import { orpc } from "@workspace/orpc/lib/orpc";
import { VisaFormClient } from "./visa-form.client";
import { generateVisaFormRuntime } from "./visa-form.generator";

interface VisaFormRSCProps {
  applicationId?: string;
  applicantId?: string;
}

const readVisaFormForApplicant = async ({
  applicantId,
  applicationId,
}: Required<VisaFormRSCProps>) => {
  const rawProcedure = orpc.visa.getVisaFormForApplicant as unknown;
  const procedure = rawProcedure as {
    call?: (input: { applicantId: string; applicationId: string }) => Promise<unknown>;
    query?: (input: { input: { applicantId: string; applicationId: string } }) => Promise<unknown>;
    queryOptions?: (input: {
      input: { applicantId: string; applicationId: string };
    }) => { queryFn?: (context?: unknown) => Promise<unknown>; queryKey?: unknown };
  };

  const input = { applicantId, applicationId };

  if (typeof rawProcedure === "function") {
    return rawProcedure(input);
  }

  if (typeof procedure.call === "function") {
    return procedure.call(input);
  }

  if (typeof procedure.query === "function") {
    return procedure.query({ input });
  }

  const queryOptions = procedure.queryOptions?.({ input });
  if (typeof queryOptions?.queryFn === "function") {
    return queryOptions.queryFn({ queryKey: queryOptions.queryKey });
  }

  throw new Error("Unable to read visa form: missing server callable ORPC procedure.");
};

const getVisaFormPayload = (response: unknown): unknown => {
  const payload = response as {
    data?: { data?: { visa_form?: unknown }; visa_form?: unknown };
    visa_form?: unknown;
  };

  return payload?.data?.data?.visa_form ?? payload?.data?.visa_form ?? payload?.visa_form ?? [];
};

export const VisaFormRSC = async ({ applicationId, applicantId }: VisaFormRSCProps) => {
  if (!applicationId || !applicantId) {
    const runtime = generateVisaFormRuntime([]);
    return (
      <VisaFormClient
        runtime={runtime}
        applicationId={applicationId}
        applicantId={applicantId}
      />
    );
  }

  const response = await readVisaFormForApplicant({ applicantId, applicationId });
  const runtime = generateVisaFormRuntime(getVisaFormPayload(response));

  return (
    <VisaFormClient
      runtime={runtime}
      applicationId={applicationId}
      applicantId={applicantId}
    />
  );
};
