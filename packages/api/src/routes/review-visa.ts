import type {
  BaseAPIResponse,
  DataAndMsg,
  DataStatusType,
} from "@repo/types";
import type {
  Applicant,
  ApplicantReadyStatusResponse,
  BackOnHoldApplicationResponse,
  GetApplicantDocumentResponse,
  GetApplicationApplicantResponse,
  GetApplicationDocumentsPoolResponse,
  GetDocumentTypesResponse,
  GetVisaFormResponse,
  UploadAndExtractDocumentResponse,
} from "@repo/types/review";

import type { ApiClient } from "../fetcher";
import type { FileLike, HostPayload, UserHostPayload } from "../route-utils";
import { appendFile, toRouteResponse } from "../route-utils";
import { SERVICES } from "../services";

export interface ApplicationInput {
  applicationId: string;
}

export type ApplicantInput = ApplicationInput & {
  applicantId: string;
};

export type UserApplicationInput = UserHostPayload & ApplicationInput;

export type UserApplicantInput = UserHostPayload & ApplicantInput;

export type UploadAndExtractDocumentForApplicationInput = HostPayload &
  ApplicationInput & {
    file: FileLike;
  };

export type GetDocumentTypesInput = HostPayload & {
  destinationCode: string;
};

export type LinkApplicantsDocumentInput = HostPayload & {
  doc_type: string;
  doc_ocr: unknown;
  file_name: string;
  mime_type: string;
  applicant_id: string;
};

export type LinkApplicantDocumentNewInput = LinkApplicantsDocumentInput & {
  doc_description: string;
  ocr_required: boolean;
  rpa_doc_name: string;
  vault: unknown;
};

export type RemoveApplicantDocumentInput = HostPayload & {
  application_id: string;
  applicant_id: string;
  document_id: string;
};

export type GetMissingDocsInput = UserHostPayload & {
  application_id: string;
  applicants: { applicant_id: string }[];
};

export type BackOnHoldApplicationInput = UserHostPayload & {
  application_id: string;
  remark?: string;
};

export type UploadEditedImageInput = HostPayload &
  ApplicantInput & {
    docName?: string;
    docType: string;
    docId: string;
    file: FileLike;
  };

export type SaveVisaFormInput = UserHostPayload &
  ApplicantInput & {
    formData: Record<string, string | unknown[]>;
  };

export interface EnglishToArabicTranslationInput {
  text: string;
}

export type DeleteDocumentFromPoolInput = UserHostPayload & {
  file_name: string;
  applicationId: string;
};

export interface UpdateApplicantReadyStatusInput {
  applicantId: string;
  status: string;
}

export type UploadAndLinkDocumentInput = UserHostPayload &
  ApplicantInput & {
    file: FileLike;
    docType: string;
  };

interface UploadAndExtractDocumentObj {
  ocr?: unknown;
  file_name: string;
  mime_type: string;
  doc_description?: string;
  ocr_required?: boolean;
  rpa_doc_name?: string;
  vault?: unknown;
}

export function createReviewVisaRoutes(api: ApiClient) {
  return {
    async getApplicationApplicantsDetails(input: ApplicationInput) {
      const response = await api.post<
        BaseAPIResponse<GetApplicationApplicantResponse>
      >(
        SERVICES.GET_APPLICATION_APPLICANT_DETAILS,
        { application_id: input.applicationId },
        { raw: true },
      );

      return toRouteResponse(response);
    },

    async getVisaFormForApplicant(input: ApplicantInput) {
      const response = await api.post<BaseAPIResponse<GetVisaFormResponse>>(
        SERVICES.GET_VISA_FORM_FOR_APPLICANT,
        {
          application_id: input.applicationId,
          applicant_id: input.applicantId,
        },
        { raw: true },
      );

      return toRouteResponse(response);
    },

    async addApplicantForApplication(input: UserApplicationInput) {
      const response = await api.post<BaseAPIResponse<Applicant>>(
        SERVICES.ADD_APPLICANT,
        {
          application_id: input.applicationId,
          user_id: input.userId,
        },
        { raw: true },
      );

      return toRouteResponse(response);
    },

    async deleteApplicantForApplication(input: UserApplicantInput) {
      const response = await api.post<BaseAPIResponse<unknown>>(
        SERVICES.DELETE_APPLICANT,
        {
          application_id: input.applicationId,
          user_id: input.userId,
          applicant_id: input.applicantId,
          host: input.host,
        },
        { raw: true },
      );

      return toRouteResponse(response);
    },

    async getApplicantDocData(input: ApplicantInput) {
      const response = await api.get<
        BaseAPIResponse<GetApplicantDocumentResponse>
      >(SERVICES.GET_APPLICANT_DOCUMENT_DATA, {
        query: {
          applicant_id: input.applicantId,
          application_id: input.applicationId,
        },
        raw: true,
      });

      return toRouteResponse(response);
    },

    async uploadAndExtractDocumentForApplication(
      input: UploadAndExtractDocumentForApplicationInput,
    ) {
      const formData = new FormData();
      appendFile(formData, "document", input.file);
      formData.append("application_id", input.applicationId);
      formData.append("host", input.host);

      const response = await api.post<
        BaseAPIResponse<UploadAndExtractDocumentResponse>
      >(SERVICES.UPLOAD_AND_EXTRACT_DOCUMENT_FOR_APPLICATION, formData, {
        raw: true,
      });

      return toRouteResponse(response);
    },

    async getDocumentTypes(input: GetDocumentTypesInput) {
      const response = await api.get<BaseAPIResponse<GetDocumentTypesResponse>>(
        SERVICES.GET_DOCUMENT_TYPES,
        {
          query: { destination: input.destinationCode, host: input.host },
          raw: true,
        },
      );

      return toRouteResponse(response);
    },

    async linkApplicantsDocument(input: LinkApplicantsDocumentInput) {
      const response = await api.post<DataAndMsg>(
        SERVICES.LINK_APPLICANTS_DOCUMENT,
        input,
        { raw: true },
      );

      return {
        status: response.data,
        message: response.msg ?? "Failed to link applicants document",
      };
    },

    async linkApplicantDocumentNew(input: LinkApplicantDocumentNewInput) {
      const response = await api.post<DataAndMsg>(
        SERVICES.LINK_APPLICANTS_DOCUMENT_NEW,
        input,
        { raw: true },
      );

      return {
        status: response.data,
        message: response.msg ?? "Failed to link applicant document (new)",
      };
    },

    async removeApplicantDocument(input: RemoveApplicantDocumentInput) {
      const response = await api.post<DataAndMsg>(
        SERVICES.REMOVE_LINKED_APPLICANTS_DOCUMENT,
        {
          application_id: input.application_id,
          applicant_id: input.applicant_id,
          doc_id: input.document_id,
          host: input.host,
        },
        { raw: true },
      );

      return {
        status: response.data,
        msg: response.msg,
      };
    },

    async getMissingDocs(input: GetMissingDocsInput) {
      const response = await api.post<
        BaseAPIResponse<string[]> & {
          applicant_summary?: ApplicantReadyStatusResponse[];
        }
      >(
        SERVICES.GET_MISSING_DOCUMENTS_FOR_APPLICATION,
        {
          application_id: input.application_id,
          user_id: input.userId,
          applicants: input.applicants,
          host: input.host,
        },
        { raw: true },
      );

      return {
        ...toRouteResponse(response),
        applicant_summary: response.applicant_summary,
      };
    },

    async backOnHoldApplicationForProcessing(
      input: BackOnHoldApplicationInput,
    ) {
      const response = await api.post<
        BaseAPIResponse<BackOnHoldApplicationResponse>
      >(
        SERVICES.BACK_ON_HOLD_APPLICATION,
        {
          application_id: input.application_id,
          remark: input.remark,
          host: input.host,
          user_id: input.userId,
        },
        { raw: true },
      );

      return toRouteResponse(response);
    },

    async uploadEditedImage(input: UploadEditedImageInput) {
      const formData = new FormData();
      appendFile(formData, "document", input.file);
      formData.append("application_id", input.applicationId);
      formData.append("doc_identifier", input.docId);
      formData.append("doc_type", input.docType);
      formData.append("host", input.host);
      formData.append("applicant_id", input.applicantId);

      const response = await api.post<DataAndMsg>(
        SERVICES.UPDATE_APPLICANTS_EXTRACTED_DOCUMENT,
        formData,
        { raw: true },
      );

      return {
        status: response.data,
        msg:
          response.msg ??
          (response.data === "success"
            ? "Document updated successfully"
            : "Failed to upload edited image"),
      };
    },

    async saveVisaForm(input: SaveVisaFormInput) {
      const response = await api.post<DataAndMsg>(
        SERVICES.SAVE_VISA_FORM,
        {
          visa_form_obj: {
            ...input.formData,
            applicant_id: input.applicantId,
          },
          applicant_id: input.applicantId,
          application_id: input.applicationId,
          structure: "new",
          applicant_display_status: "false",
          host: input.host,
          user_id: input.userId,
        },
        { raw: true },
      );

      return {
        data: response,
        status: response.data,
      };
    },

    async englishToArabicTranslation(input: EnglishToArabicTranslationInput) {
      const parsedText = input.text.replace(/[^a-zA-Z ]/g, "");
      const response = await api.get<string>(
        SERVICES.GET_ARABIC_TRANSLATION_AWS,
        {
          query: { text: parsedText },
          raw: true,
        },
      );
      const awsErrorString =
        '{"Errors":["Value cannot be null.\\r\\nParameter name: content"],"StatusCode":500}';

      if (!response || response === awsErrorString) {
        return {
          data: { translated: "" },
          status: "error" as DataStatusType,
        };
      }

      return {
        data: { translated: response },
        status: "success" as DataStatusType,
      };
    },

    async deleteDocumentFromPool(input: DeleteDocumentFromPoolInput) {
      const response = await api.post<DataAndMsg>(
        SERVICES.DELETE_DOCUMENT_FROM_POOL,
        {
          file_name: input.file_name,
          application_id: input.applicationId,
          host: input.host,
          user_id: input.userId,
        },
        { raw: true },
      );

      return {
        data: response,
        status: response.data,
      };
    },

    async getApplicationDocumentsPool(input: HostPayload & ApplicationInput) {
      const response = await api.get<
        BaseAPIResponse<GetApplicationDocumentsPoolResponse>
      >(SERVICES.GET_APPLICATION_DOCUMENTS_POOL, {
        query: {
          host: input.host,
          application_id: input.applicationId,
        },
        raw: true,
      });

      return toRouteResponse(response);
    },

    async updateApplicantReadyStatus(input: UpdateApplicantReadyStatusInput) {
      const response = await api.post<DataAndMsg>(
        SERVICES.UPDATE_APPLICANT_READY_STATUS,
        {
          applicant_id: input.applicantId,
          ready_status: input.status,
        },
        { raw: true },
      );

      return {
        data: response.data,
        status: response.data,
      };
    },

    async uploadAndLinkDocument(input: UploadAndLinkDocumentInput) {
      const formData = new FormData();
      appendFile(formData, "document", input.file);
      formData.append("application_id", input.applicationId);
      formData.append("host", input.host);

      const uploadResponse = await api.post<
        BaseAPIResponse<UploadAndExtractDocumentObj[]>
      >(SERVICES.UPLOAD_AND_EXTRACT_DOCUMENT_FOR_APPLICATION, formData, {
        raw: true,
      });

      if (uploadResponse.data === "error") {
        return { data: "error", msg: uploadResponse.msg };
      }

      const uploadedDoc = uploadResponse.dataobj?.[0];
      if (!uploadedDoc) {
        return {
          data: "error",
          msg: "No uploaded document returned",
        };
      }

      return await api.post<DataAndMsg>(
        SERVICES.LINK_APPLICANTS_DOCUMENT_NEW,
        {
          doc_type: input.docType,
          user_id: input.userId,
          host: input.host,
          doc_ocr: uploadedDoc.ocr,
          file_name: uploadedDoc.file_name,
          mime_type: uploadedDoc.mime_type,
          applicant_id: input.applicantId,
          doc_description: uploadedDoc.doc_description ?? "",
          ocr_required: uploadedDoc.ocr_required ?? false,
          rpa_doc_name: uploadedDoc.rpa_doc_name ?? "",
          vault: uploadedDoc.vault ?? "",
        },
        { raw: true },
      );
    },
  };
}
