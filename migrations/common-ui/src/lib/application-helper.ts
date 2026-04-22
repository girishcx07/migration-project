import { ApplicantRequiredDocument } from "@workspace/types/review";


export const getErroredDocuments = (
  docsList: ApplicantRequiredDocument[]
): ApplicantRequiredDocument[] =>
  docsList?.filter(
    ({ doc_snap }) =>
      doc_snap[0]?.mandatory && doc_snap[0]?.status === "pending"
  );
