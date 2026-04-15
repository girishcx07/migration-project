import type { TRPCRouterRecord } from "@trpc/server";
import * as z from "zod";

import type { BaseAPIResponse, DataAndMsg, DataStatusType } from "@repo/types";
import type { Application } from "@repo/types/review";
import type {
  AddCommentOnResponse,
  AddNotesForApplicationResponse,
  ApplicationActivity,
  ArchiveApplicationResponse,
  AssignToMeResponse,
  DownloadApplicantVisaDataobj,
  NotesDataobj,
  PaginationDetails,
  RestoreApplicationResponse,
  TrackApplicationResponseData,
  UploadNotesDocumentResponse,
  UserProfileResponse,
} from "@repo/types/track-application";

import apiConfig from "../lib/axios";
import { SERVICES } from "../lib/services";
import { protectedProcedure } from "../trpc";

const handleBaseResponse = <T>(response: BaseAPIResponse<T>, fallback: T) => {
  if (response.data === "success") {
    return {
      data: response.dataobj ?? fallback,
      status: "success" as DataStatusType,
    };
  }

  return {
    data: fallback,
    status: "error" as DataStatusType,
  };
};

const handleDataAndMsgResponse = <T>(response: DataAndMsg, fallback: T) => {
  if (response.data === "success") {
    return {
      data: response as T,
      status: "success" as DataStatusType,
    };
  }

  return {
    data: fallback,
    status: "error" as DataStatusType,
  };
};

export interface TrackApiResponse<T> {
  data: DataStatusType;
  dataobj: T;
  msg?: string;
  pagination_details?: PaginationDetails;
}

export const trackApplicationRouter = {
  getTrackVisaApplicationsData: protectedProcedure
    .input(
      z.object({
        from: z.string(),
        to: z.string(),
        tabType: z.string(),
        search_text: z.string().optional(),
        page_number: z.number().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const user = ctx.session.user;

      const apiEndpoint = {
        my_applications: SERVICES.GET_MY_APPLICATIONS,
        in_process: SERVICES.GET_IN_PROGRESS_APPLICATIONS,
        completed: SERVICES.GET_COMPLETED_APPLICATIONS,
        on_hold: SERVICES.GET_HOLD_APPLICATIONS,
        archive: SERVICES.GET_ARCHIVED_APPLICATIONS,
        ready_to_submit: SERVICES.GET_READY_FOR_SUBMIT_APPLICATIONS,
        review: SERVICES.GET_REVIEW_APPLICATIONS,
        confirm_payment: SERVICES.GET_CONFIRM_PAYMENT_APPLICATIONS,
        search: SERVICES.GET_SEARCH_APPLICATIONS,
      }[input.tabType];

      if (!apiEndpoint) {
        throw new Error("Invalid tab type");
      }

      const response = await apiConfig.get<
        TrackApiResponse<TrackApplicationResponseData>
      >(apiEndpoint, {
        params: {
          host: user.host,
          user_id: user.userId,
          page_number: input.page_number ?? 1,
          page_size: 10,
          start_date: input.from,
          end_date: input.to,
          search_text:
            input.tabType === "search" ? input.search_text : undefined,
        },
      });

      if (response.data.data === "success") {
        return {
          data: response.data.dataobj,
          status: "success" as DataStatusType,
          pagination_details: response.data.pagination_details ?? {},
        };
      }

      return {
        data: {} as TrackApplicationResponseData,
        status: "error" as DataStatusType,
        pagination_details: {} as PaginationDetails,
      };
    }),

  getUserProfileDetails: protectedProcedure
    .input(z.object({ user_id: z.string() }))
    .query(async ({ input }) => {
      const response = await apiConfig.get<
        BaseAPIResponse<UserProfileResponse>
      >(SERVICES.GET_USER_PROFILE_DETAILS, {
        params: { user_id: input.user_id },
      });

      return handleBaseResponse(
        response.data,
        null as UserProfileResponse | null,
      );
    }),

  getApplicationActivities: protectedProcedure
    .input(z.object({ application_id: z.string() }))
    .query(async ({ input, ctx }) => {
      const response = await apiConfig.get<
        BaseAPIResponse<ApplicationActivity[]>
      >(SERVICES.GET_APPLICATION_ACTIVITIES, {
        params: {
          application_id: input.application_id,
          host: ctx.session.user.host,
        },
      });

      return handleBaseResponse(response.data, [] as ApplicationActivity[]);
    }),

  updateApplicationState: protectedProcedure
    .input(
      z.object({
        application_id: z.string(),
        moving_state: z.string(),
        password: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const user = ctx.session.user;
      const response = await apiConfig.post<TrackApiResponse<null>>(
        SERVICES.UPDATE_APPLICATION_STATE,
        {
          ...input,
          user_id: user.userId,
          host: user.host,
        },
      );

      if (response.data.data === "success") {
        return { data: response.data, status: "success" as DataStatusType };
      }

      return {
        data: {
          data: "error",
          dataobj: null,
          msg: response.data.msg ?? "Failed to update application state",
        } as TrackApiResponse<null>,
        status: "error" as DataStatusType,
      };
    }),

  archiveApplication: protectedProcedure
    .input(z.object({ applicationId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const user = ctx.session.user;
      const response = await apiConfig.post<
        BaseAPIResponse<ArchiveApplicationResponse>
      >(SERVICES.ARCHIVE_APPLICATION, {
        application_id: input.applicationId,
        user_id: user.userId,
        host: user.host,
      });

      return {
        status: response.data.data,
        msg: response.data.msg,
      };
    }),

  restoreApplication: protectedProcedure
    .input(z.object({ applicationId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const user = ctx.session.user;
      const response = await apiConfig.post<
        BaseAPIResponse<RestoreApplicationResponse>
      >(SERVICES.RESTORE_APPLICATION, {
        application_id: input.applicationId,
        user_id: user.userId,
        host: user.host,
      });

      return {
        status: response.data.data,
        msg: response.data.msg,
      };
    }),

  assignToMeApplication: protectedProcedure
    .input(z.object({ applicationId: z.string() }))
    .query(async ({ input, ctx }) => {
      const user = ctx.session.user;
      const response = await apiConfig.get<BaseAPIResponse<AssignToMeResponse>>(
        SERVICES.ASSIGN_TO_ME,
        {
          params: {
            application_id: input.applicationId,
            user_id: user.userId,
            host: user.host,
          },
        },
      );

      return {
        ...handleBaseResponse(response.data, null as AssignToMeResponse | null),
        msg: response.data.msg,
      };
    }),

  markAsFixed: protectedProcedure
    .input(
      z.object({
        applicationId: z.string(),
        applicantId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const user = ctx.session.user;
      const response = await apiConfig.post<DataAndMsg>(
        SERVICES.MARK_AS_FIXED,
        {
          applicant_id: input.applicantId,
          application_id: input.applicationId,
          user_id: user.userId,
          host: user.host,
        },
      );

      return handleDataAndMsgResponse(response.data, null as DataAndMsg | null);
    }),

  getNotesForApplication: protectedProcedure
    .input(z.object({ applicationId: z.string() }))
    .query(async ({ input, ctx }) => {
      const user = ctx.session.user;
      const response = await apiConfig.get<BaseAPIResponse<NotesDataobj[]>>(
        SERVICES.GET_NOTES_FOR_APPLICATION,
        {
          params: {
            application_id: input.applicationId,
            user_id: user.userId,
            host: user.host,
          },
        },
      );

      if (response.data.data === "success") {
        return {
          data: response.data.dataobj ?? [],
          status: "success" as DataStatusType,
        };
      }

      return {
        data: [] as NotesDataobj[],
        status: "error" as DataStatusType,
      };
    }),

  addCommentOnNote: protectedProcedure
    .input(
      z.object({
        user: z.object({
          user_id: z.string(),
          name: z.string(),
          profile_pic: z.string(),
          user_type: z.string(),
        }),
        note_id: z.string().optional(),
        application_id: z.string(),
        comment: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const user = ctx.session.user;
      const response = await apiConfig.post<
        BaseAPIResponse<AddCommentOnResponse>
      >(SERVICES.ADD_COMMENT_ON_NOTE, {
        ...input,
        user_id: user.userId,
        host: user.host,
      });

      return handleBaseResponse(
        response.data,
        null as AddCommentOnResponse | null,
      );
    }),

  addNotesForApplication: protectedProcedure
    .input(
      z.object({
        application_id: z.string(),
        documents: z.array(z.unknown()),
        notes_html: z.string(),
        note_user: z.object({
          name: z.string(),
          profile_pic: z.string(),
          user_type: z.string(),
        }),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const user = ctx.session.user;
      const response = await apiConfig.post<
        BaseAPIResponse<AddNotesForApplicationResponse>
      >(SERVICES.ADD_NOTE_FOR_APPLICATION, {
        ...input,
        user_id: user.userId,
        host: user.host,
        note_user: {
          ...input.note_user,
          user_id: user.userId,
        },
      });

      return handleBaseResponse(
        response.data,
        null as AddNotesForApplicationResponse | null,
      );
    }),

  uploadDocument: protectedProcedure
    .input(z.object({ documents: z.unknown() }))
    .mutation(async ({ input }) => {
      const formData = new FormData();
      const documents = input.documents;
      if (documents instanceof File) {
        formData.append("document", documents, documents.name);
      } else if (Array.isArray(documents) && documents[0] instanceof File) {
        formData.append("document", documents[0], documents[0].name);
      }

      const response = await apiConfig.post<
        BaseAPIResponse<UploadNotesDocumentResponse>
      >(SERVICES.UPLOAD_NOTE_DOCUMENT, formData);

      return handleBaseResponse(
        response.data,
        null as UploadNotesDocumentResponse | null,
      );
    }),

  downloadApplicantVisa: protectedProcedure
    .input(
      z.object({
        application_id: z.string(),
        applicant_id: z.string(),
        document_name: z.string().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const user = ctx.session.user;
      const response = await apiConfig.get<
        BaseAPIResponse<DownloadApplicantVisaDataobj>
      >(SERVICES.DOWNLOAD_APPLICANT_VISA, {
        params: { ...input, host: user.host, user_id: user.userId },
      });

      return {
        ...handleBaseResponse(
          response.data,
          null as DownloadApplicantVisaDataobj | null,
        ),
        msg: response.data.msg,
      };
    }),

  downloadBundledInsurance: protectedProcedure
    .input(
      z.object({
        application_id: z.string(),
        applicant_id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const user = ctx.session.user;
      const response = await apiConfig.post<
        BaseAPIResponse<{ insurance_url: string }>
      >(SERVICES.DOWNLOAD_BUNDELD_INSURANCE, {
        ...input,
        host: user.host,
        user_id: user.userId,
      });

      return {
        ...handleBaseResponse(
          response.data,
          null as { insurance_url: string } | null,
        ),
        msg: response.data.msg,
      };
    }),

  updateApplicantFileNumber: protectedProcedure
    .input(
      z.object({
        applicant_file_number: z.string(),
        applicant_id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const user = ctx.session.user;
      const response = await apiConfig.post<DataAndMsg>(
        SERVICES.UPDATE_APPLICANT_FILE_NUMBER,
        { ...input, user_id: user.userId, host: user.host },
      );

      return handleDataAndMsgResponse(response.data, null as DataAndMsg | null);
    }),

  issueInsurance: protectedProcedure
    .input(
      z.object({
        applicantId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const user = ctx.session.user;
      const response = await apiConfig.post<BaseAPIResponse<Application>>(
        SERVICES.ISSUE_INSURANCE,
        {
          applicant_id: input.applicantId,
          user_id: user.userId,
          host: user.host,
        },
      );

      return {
        ...handleBaseResponse(response.data, null as Application | null),
        msg: response.data.msg ?? "Something went wrong!",
      };
    }),
} satisfies TRPCRouterRecord;
