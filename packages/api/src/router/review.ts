import type { TRPCRouterRecord } from "@trpc/server";
import * as z from "zod";

import type { BaseAPIResponse, DataAndMsg } from "@repo/types";
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
import type { UploadedDocumentImage } from "@repo/types/new-visa";

import apiConfig from "../lib/axios";
import { parseBaseApiResponseWithFallback } from "../lib/response";
import { SERVICES } from "../lib/services";
import { protectedProcedure } from "../trpc";

const fileSchema = z.custom<File>(
  (value): value is File =>
    typeof File !== "undefined" && value instanceof File,
  {
    message: "Please upload a valid file",
  },
);

type LinkableUploadedDocument = UploadedDocumentImage & {
  doc_description?: string;
  ocr_required?: boolean;
  rpa_doc_name?: string;
  vault?: unknown;
};

export const reviewRouter = {
  getApplicationApplicantsDetails: protectedProcedure
    .input(z.object({ applicationId: z.string() }))
    .query(async ({ input }) => {
      const response = await apiConfig.post<
        BaseAPIResponse<GetApplicationApplicantResponse>
      >(SERVICES.GET_APPLICATION_APPLICANT_DETAILS, {
        application_id: input.applicationId,
      });

      return parseBaseApiResponseWithFallback(
        response.data,
        null as GetApplicationApplicantResponse | null,
      );
    }),

  getVisaFormForApplicant: protectedProcedure
    .input(
      z.object({
        applicationId: z.string(),
        applicantId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const response = await apiConfig.post<
        BaseAPIResponse<GetVisaFormResponse>
      >(SERVICES.GET_VISA_FORM_FOR_APPLICANT, {
        application_id: input.applicationId,
        applicant_id: input.applicantId,
      });

      return parseBaseApiResponseWithFallback(
        response.data,
        null as GetVisaFormResponse | null,
      );
    }),

  addApplicantForApplication: protectedProcedure
    .input(z.object({ applicationId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.userId;
      const response = await apiConfig.post<BaseAPIResponse<Applicant>>(
        SERVICES.ADD_APPLICANT,
        {
          application_id: input.applicationId,
          user_id: userId,
        },
      );

      return parseBaseApiResponseWithFallback(
        response.data,
        null as Applicant | null,
      );
    }),

  deleteApplicantForApplication: protectedProcedure
    .input(
      z.object({
        applicationId: z.string(),
        applicantId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const user = ctx.session.user;
      const response = await apiConfig.post(SERVICES.DELETE_APPLICANT, {
        application_id: input.applicationId,
        user_id: user.userId,
        applicant_id: input.applicantId,
        host: user.host,
      });

      return parseBaseApiResponseWithFallback(
        response.data as BaseAPIResponse<Applicant>,
        null as Applicant | null,
      );
    }),

  getApplicantDocData: protectedProcedure
    .input(
      z.object({
        applicationId: z.string(),
        applicantId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const response = await apiConfig.get<
        BaseAPIResponse<GetApplicantDocumentResponse>
      >(SERVICES.GET_APPLICANT_DOCUMENT_DATA, {
        params: {
          applicant_id: input.applicantId,
          application_id: input.applicationId,
        },
      });

      return parseBaseApiResponseWithFallback(
        response.data,
        null as GetApplicantDocumentResponse | null,
      );
    }),

  uploadAndExtractDocumentForApplication: protectedProcedure
    .input(
      z.object({
        file: fileSchema,
        applicationId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const host = ctx.session.user.host;
      const formData = new FormData();
      formData.append("document", input.file, input.file.name);
      formData.append("application_id", input.applicationId);
      formData.append("host", host);

      const response = await apiConfig.post<
        BaseAPIResponse<UploadAndExtractDocumentResponse>
      >(SERVICES.UPLOAD_AND_EXTRACT_DOCUMENT_FOR_APPLICATION, formData);

      return parseBaseApiResponseWithFallback(
        response.data,
        null as UploadAndExtractDocumentResponse | null,
      );
    }),

  getDocumentTypes: protectedProcedure
    .input(z.object({ destinationCode: z.string() }))
    .query(async ({ input, ctx }) => {
      const host = ctx.session.user.host;
      const response = await apiConfig.get<
        BaseAPIResponse<GetDocumentTypesResponse>
      >(SERVICES.GET_DOCUMENT_TYPES, {
        params: { destination: input.destinationCode, host },
      });

      return parseBaseApiResponseWithFallback(
        response.data,
        null as GetDocumentTypesResponse | null,
      );
    }),

  linkApplicantsDocument: protectedProcedure
    .input(
      z.object({
        doc_type: z.string(),
        doc_ocr: z.unknown(),
        file_name: z.string(),
        mime_type: z.string(),
        applicant_id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const host = ctx.session.user.host;
      const response = await apiConfig.post<DataAndMsg>(
        SERVICES.LINK_APPLICANTS_DOCUMENT,
        {
          ...input,
          host,
        },
      );

      return {
        status: response.data.data,
        message: response.data.msg,
      };
    }),

  linkApplicantDocumentNew: protectedProcedure
    .input(
      z.object({
        doc_type: z.string(),
        doc_ocr: z.unknown(),
        file_name: z.string(),
        mime_type: z.string(),
        doc_description: z.string(),
        ocr_required: z.boolean(),
        rpa_doc_name: z.string(),
        vault: z.unknown(),
        applicant_id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const host = ctx.session.user.host;
      const response = await apiConfig.post<DataAndMsg>(
        SERVICES.LINK_APPLICANTS_DOCUMENT_NEW,
        { ...input, host },
      );

      return {
        status: response.data.data,
        message: response.data.msg,
      };
    }),

  removeApplicantDocument: protectedProcedure
    .input(
      z.object({
        application_id: z.string(),
        applicant_id: z.string(),
        document_id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const host = ctx.session.user.host;
      const response = await apiConfig.post<DataAndMsg>(
        SERVICES.REMOVE_LINKED_APPLICANTS_DOCUMENT,
        {
          application_id: input.application_id,
          applicant_id: input.applicant_id,
          doc_id: input.document_id,
          host,
        },
      );

      return {
        status: response.data.data as "success" | "error",
        msg: response.data.msg,
      };
    }),

  getMissingDocs: protectedProcedure
    .input(
      z.object({
        application_id: z.string(),
        applicants: z.array(
          z.object({
            applicant_id: z.string(),
          }),
        ),
      }),
    )
    .query(async ({ input, ctx }) => {
      const user = ctx.session.user;
      const response = await apiConfig.post<
        BaseAPIResponse<string[]> & {
          applicant_summary: ApplicantReadyStatusResponse[];
        }
      >(SERVICES.GET_MISSING_DOCUMENTS_FOR_APPLICATION, {
        application_id: input.application_id,
        user_id: user.userId,
        applicants: input.applicants,
        host: user.host,
      });

      return {
        ...parseBaseApiResponseWithFallback(
          response.data as BaseAPIResponse<string[]>,
          [] as string[],
        ),
        applicant_summary: response.data.applicant_summary,
      };
    }),

  backOnHoldApplicationForProcessing: protectedProcedure
    .input(
      z.object({
        application_id: z.string(),
        remark: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const user = ctx.session.user;
      const response = await apiConfig.post<
        BaseAPIResponse<BackOnHoldApplicationResponse>
      >(SERVICES.BACK_ON_HOLD_APPLICATION, {
        ...input,
        host: user.host,
        user_id: user.userId,
      });

      return parseBaseApiResponseWithFallback(
        response.data,
        null as BackOnHoldApplicationResponse | null,
      );
    }),

  uploadEditedImage: protectedProcedure
    .input(
      z.object({
        applicationId: z.string(),
        docName: z.string().optional(),
        docType: z.string(),
        docId: z.string(),
        applicantId: z.string(),
        file: fileSchema,
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const host = ctx.session.user.host;
      const formData = new FormData();
      formData.append("document", input.file, input.file.name);
      formData.append("application_id", input.applicationId);
      formData.append("doc_identifier", input.docId);
      formData.append("doc_type", input.docType);
      formData.append("host", host);
      formData.append("applicant_id", input.applicantId);

      const response = await apiConfig.post<DataAndMsg>(
        SERVICES.UPDATE_APPLICANTS_EXTRACTED_DOCUMENT,
        formData,
      );

      if (response.data.data === "success") {
        return {
          status: "success" as const,
          msg: "Document updated successfully",
        };
      }

      return {
        status: "error" as const,
        msg: "Failed to upload edited image",
      };
    }),

  saveVisaForm: protectedProcedure
    .input(
      z.object({
        applicationId: z.string(),
        applicantId: z.string(),
        formData: z.record(
          z.string(),
          z.union([z.string(), z.array(z.unknown())]),
        ),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const user = ctx.session.user;
      const response = await apiConfig.post<DataAndMsg>(
        SERVICES.SAVE_VISA_FORM,
        {
          visa_form_obj: { ...input.formData, applicant_id: input.applicantId },
          applicant_id: input.applicantId,
          application_id: input.applicationId,
          structure: "new",
          applicant_display_status: "false",
          host: user.host,
          user_id: user.userId,
        },
      );

      if (response.data.data === "success") {
        return {
          data: response.data,
          status: "success" as const,
        };
      }

      return {
        data: response.data,
        status: "error" as const,
      };
    }),

  englishToArabicTranslation: protectedProcedure
    .input(z.object({ text: z.string() }))
    .query(async ({ input }) => {
      const response = await apiConfig.get<string>(
        SERVICES.GET_ARABIC_TRANSLATION_AWS,
        {
          params: {
            text: input.text ? input.text.replace(/[^a-zA-Z ]/g, "") : "",
          },
        },
      );

      const awsErrorString =
        '{"Errors":["Value cannot be null.\\r\\nParameter name: content"],"StatusCode":500}';

      if (!response.data || response.data === awsErrorString) {
        return {
          data: { translated: "" },
          status: "error" as const,
        };
      }

      return {
        data: { translated: response.data },
        status: "success" as const,
      };
    }),

  deleteDocumentFromPool: protectedProcedure
    .input(
      z.object({
        file_name: z.string(),
        applicationId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const user = ctx.session.user;
      const response = await apiConfig.post<DataAndMsg>(
        SERVICES.DELETE_DOCUMENT_FROM_POOL,
        {
          file_name: input.file_name,
          application_id: input.applicationId,
          host: user.host,
          user_id: user.userId,
        },
      );

      if (response.data.data === "success") {
        return {
          data: response.data,
          status: "success" as const,
        };
      }

      throw new Error(response.data.msg ?? "Failed to delete document");
    }),

  getApplicationDocumentsPool: protectedProcedure
    .input(z.object({ applicationId: z.string() }))
    .query(async ({ input, ctx }) => {
      const host = ctx.session.user.host;
      const response = await apiConfig.get<
        BaseAPIResponse<GetApplicationDocumentsPoolResponse>
      >(SERVICES.GET_APPLICATION_DOCUMENTS_POOL, {
        params: {
          host,
          application_id: input.applicationId,
        },
      });

      return parseBaseApiResponseWithFallback(
        response.data,
        null as GetApplicationDocumentsPoolResponse | null,
      );
    }),

  updateApplicantReadyStatus: protectedProcedure
    .input(
      z.object({
        applicantId: z.string(),
        status: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const response = await apiConfig.post<DataAndMsg>(
        SERVICES.UPDATE_APPLICANT_READY_STATUS,
        {
          applicant_id: input.applicantId,
          ready_status: input.status,
        },
      );

      if (response.data.data === "success") {
        return {
          data: response.data.data,
          status: "success" as const,
        };
      }

      throw new Error(response.data.msg ?? "Failed to update applicant status");
    }),

  uploadAndLinkDocument: protectedProcedure
    .input(
      z.object({
        file: fileSchema,
        docType: z.string(),
        applicationId: z.string(),
        applicantId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const user = ctx.session.user;
      const formData = new FormData();
      formData.append("document", input.file, input.file.name);
      formData.append("application_id", input.applicationId);
      formData.append("host", user.host);

      const uploadRes = await apiConfig.post<
        BaseAPIResponse<LinkableUploadedDocument[]>
      >(
        SERVICES.UPLOAD_AND_EXTRACT_DOCUMENT_FOR_APPLICATION,
        formData,
      );

      if (uploadRes.data.data === "error") {
        return {
          data: "error",
          msg: uploadRes.data.msg,
        };
      }

      const uploadedDoc = uploadRes.data.dataobj?.[0];
      if (!uploadedDoc) {
        return {
          data: "error",
          msg: "Failed to upload document",
        };
      }

      const linkRes = await apiConfig.post<DataAndMsg>(
        SERVICES.LINK_APPLICANTS_DOCUMENT_NEW,
        {
          doc_type: input.docType,
          user_id: user.userId,
          host: user.host,
          doc_ocr: uploadedDoc.ocr,
          file_name: uploadedDoc.file_name,
          mime_type: uploadedDoc.mime_type,
          applicant_id: input.applicantId,
          doc_description: uploadedDoc.doc_description ?? "",
          ocr_required: uploadedDoc.ocr_required ?? false,
          rpa_doc_name: uploadedDoc.rpa_doc_name ?? "",
          vault: uploadedDoc.vault ?? "",
        },
      );

      return linkRes.data;
    }),
} satisfies TRPCRouterRecord;
