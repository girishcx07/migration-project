import type { ApplicantRequiredDocument } from "@workspace/types/review";
import type {
  ApplicantErrors,
  FormStatus,
} from "../context/review-visa-context";

export const getMandatoryDocuments = (
  documents: ApplicantRequiredDocument[] = [],
) => documents.filter((document) => document?.doc_snap?.[0]?.mandatory);

export const areMandatoryDocumentsComplete = (
  documents: ApplicantRequiredDocument[] = [],
) => {
  const mandatoryDocuments = getMandatoryDocuments(documents);

  if (mandatoryDocuments.length === 0) {
    return false;
  }

  return mandatoryDocuments.every((document) => {
    const snapshot = document?.doc_snap?.[0];
    return snapshot?.status === "uploaded" && Boolean(snapshot?.doc_url);
  });
};

export const getVisaFormCompletion = (errors: ApplicantErrors = {}) => {
  const mandatoryFields = Object.values(errors).filter(
    (field) => field?.isRequiredField,
  );

  const totalMandatoryFields = mandatoryFields.length;
  const completedMandatoryFields = mandatoryFields.filter((field) => {
    const hasValue =
      typeof field.hasValue === "boolean" ? field.hasValue : field.isValid;
    const hasError =
      typeof field.hasError === "boolean" ? field.hasError : !field.isValid;

    return hasValue && !hasError;
  }).length;

  const progress = totalMandatoryFields
    ? Math.round((completedMandatoryFields / totalMandatoryFields) * 100)
    : 0;

  return {
    progress,
    totalMandatoryFields,
    isComplete: totalMandatoryFields > 0 && progress === 100,
  };
};

export const getApplicantReadyStatus = ({
  documents,
  errors,
  hasLoadedDocuments,
  hasLoadedVisaForm,
}: {
  documents?: ApplicantRequiredDocument[];
  errors?: ApplicantErrors;
  hasLoadedDocuments: boolean;
  hasLoadedVisaForm: boolean;
}): FormStatus => {
  if (!hasLoadedDocuments || !hasLoadedVisaForm) {
    return "calculating";
  }

  const documentsComplete = areMandatoryDocumentsComplete(documents);
  const visaFormComplete = getVisaFormCompletion(errors).isComplete;

  return documentsComplete && visaFormComplete ? "completed" : "pending";
};

export const isApplicantStatusHydrated = ({
  hasLoadedDocuments,
  hasLoadedVisaForm,
}: {
  hasLoadedDocuments: boolean;
  hasLoadedVisaForm: boolean;
}) => hasLoadedDocuments && hasLoadedVisaForm;
