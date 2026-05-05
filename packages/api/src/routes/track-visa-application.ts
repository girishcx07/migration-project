import type {
  BaseAPIResponse,
  DataAndMsg,
  DataStatusType,
} from "@repo/types";
import type { Applicant, Application } from "@repo/types/review";
import type {
  AddCommentOnResponse,
  AddNotesForApplicationResponse,
  ApplicationActivity,
  ArchiveApplicationResponse,
  AssignToMeResponse,
  DownloadApplicantVisaDataobj,
  NotesDataobj,
  RestoreApplicationResponse,
  TrackAPIResponse,
  TrackApplicationResponseData,
  UploadNotesDocumentResponse,
  UserProfileResponse,
} from "@repo/types/track-application";

import type { ApiClient } from "../fetcher";
import type { FileLike, HostPayload, UserHostPayload } from "../route-utils";
import {
  appendFile,
  toDataAndMsgResponse,
  toRouteResponse,
} from "../route-utils";
import { SERVICES } from "../services";

export type TrackVisaApplicationsInput = UserHostPayload & {
  from: string;
  to: string;
  tabType: string;
  search_text?: string;
  page_number?: number;
};

export interface GetUserProfileDetailsInput {
  user_id: string;
}

export interface ApplicationIdSnakeInput {
  application_id: string;
}

export type UpdateApplicationStateInput = UserHostPayload & {
  application_id: string;
  moving_state: string;
  password: string;
};

export interface ApplicationIdCamelInput {
  applicationId: string;
}

export type UserApplicationIdCamelInput = UserHostPayload &
  ApplicationIdCamelInput;

export type MarkAsFixedInput = UserApplicationIdCamelInput & {
  applicantId: string;
};

export type AddCommentOnNoteInput = UserHostPayload & {
  user: {
    user_id: string;
    name: string;
    profile_pic: string;
    user_type: string;
  };
  note_id?: string;
  application_id: string;
  comment: string;
};

export type AddNotesForApplicationInput = UserHostPayload & {
  application_id: string;
  documents: unknown[];
  notes_html: string;
  note_user: {
    name: string;
    profile_pic: string;
    user_type: string;
  };
};

export interface UploadDocumentInput {
  documents: FileLike;
}

export type DownloadApplicantVisaInput = UserHostPayload & {
  application_id: string;
  applicant_id: string;
  document_name?: string;
};

export type DownloadBundledInsuranceInput = UserHostPayload & {
  application_id: string;
  applicant_id: string;
};

export type UpdateApplicantFileNumberInput = UserHostPayload & {
  applicant_file_number: string;
  applicant_id: string;
};

export type IssueInsuranceInput = UserHostPayload & {
  applicantId: string;
};

export interface ApplicationType {
  application_obj: Application;
  applicants_data: Applicant[];
}

const endpointMap: Record<string, string> = {
  my_applications: SERVICES.GET_MY_APPLICATIONS,
  in_process: SERVICES.GET_IN_PROGRESS_APPLICATIONS,
  completed: SERVICES.GET_COMPLETED_APPLICATIONS,
  on_hold: SERVICES.GET_HOLD_APPLICATIONS,
  archive: SERVICES.GET_ARCHIVED_APPLICATIONS,
  ready_to_submit: SERVICES.GET_READY_FOR_SUBMIT_APPLICATIONS,
  review: SERVICES.GET_REVIEW_APPLICATIONS,
  confirm_payment: SERVICES.GET_CONFIRM_PAYMENT_APPLICATIONS,
  search: SERVICES.GET_SEARCH_APPLICATIONS,
};

export function createTrackVisaApplicationRoutes(api: ApiClient) {
  return {
    async getTrackVisaApplicationsData(input: TrackVisaApplicationsInput) {
      const apiEndpoint = endpointMap[input.tabType];
      if (!apiEndpoint) {
        return {
          data: null,
          status: "error" as DataStatusType,
          pagination_details: null,
        };
      }

      const response = await api.get<
        TrackAPIResponse<TrackApplicationResponseData>
      >(apiEndpoint, {
        query: {
          host: input.host,
          user_id: input.userId,
          page_number: input.page_number ?? 1,
          page_size: 10,
          start_date: input.from,
          end_date: input.to,
          search_text:
            input.tabType === "search" ? input.search_text : undefined,
        },
        raw: true,
      });

      return {
        data: response.dataobj,
        status: response.data,
        pagination_details: response.pagination_details ?? null,
      };
    },

    async getUserProfileDetails(input: GetUserProfileDetailsInput) {
      const response = await api.get<BaseAPIResponse<UserProfileResponse>>(
        SERVICES.GET_USER_PROFILE_DETAILS,
        { query: { user_id: input.user_id }, raw: true },
      );

      return toRouteResponse(response);
    },

    async getApplicationActivities(
      input: HostPayload & ApplicationIdSnakeInput,
    ) {
      const response = await api.get<BaseAPIResponse<ApplicationActivity[]>>(
        SERVICES.GET_APPLICATION_ACTIVITIES,
        {
          query: {
            application_id: input.application_id,
            host: input.host,
          },
          raw: true,
        },
      );

      return toRouteResponse(response);
    },

    async updateApplicationState(input: UpdateApplicationStateInput) {
      const response = await api.post<TrackAPIResponse<null>>(
        SERVICES.UPDATE_APPLICATION_STATE,
        {
          application_id: input.application_id,
          moving_state: input.moving_state,
          password: input.password,
          user_id: input.userId,
          host: input.host,
        },
        { raw: true },
      );

      return {
        data: response,
        status: response.data,
      };
    },

    async archiveApplication(input: UserApplicationIdCamelInput) {
      const response = await api.post<
        BaseAPIResponse<ArchiveApplicationResponse>
      >(
        SERVICES.ARCHIVE_APPLICATION,
        {
          application_id: input.applicationId,
          user_id: input.userId,
          host: input.host,
        },
        { raw: true },
      );

      return {
        status: response.data,
        msg: response.msg,
      };
    },

    async restoreApplication(input: UserApplicationIdCamelInput) {
      const response = await api.post<
        BaseAPIResponse<RestoreApplicationResponse>
      >(
        SERVICES.RESTORE_APPLICATION,
        {
          application_id: input.applicationId,
          user_id: input.userId,
          host: input.host,
        },
        { raw: true },
      );

      return {
        status: response.data,
        msg: response.msg,
      };
    },

    async assignToMeApplication(input: UserApplicationIdCamelInput) {
      const response = await api.get<BaseAPIResponse<AssignToMeResponse>>(
        SERVICES.ASSIGN_TO_ME,
        {
          query: {
            application_id: input.applicationId,
            user_id: input.userId,
            host: input.host,
          },
          raw: true,
        },
      );

      return {
        ...toRouteResponse(response),
        msg: response.msg,
      };
    },

    async markAsFixed(input: MarkAsFixedInput) {
      const response = await api.post<DataAndMsg>(
        SERVICES.MARK_AS_FIXED,
        {
          applicant_id: input.applicantId,
          application_id: input.applicationId,
          user_id: input.userId,
          host: input.host,
        },
        { raw: true },
      );

      return toDataAndMsgResponse(response);
    },

    async getNotesForApplication(input: UserApplicationIdCamelInput) {
      const response = await api.get<BaseAPIResponse<NotesDataobj[]>>(
        SERVICES.GET_NOTES_FOR_APPLICATION,
        {
          query: {
            application_id: input.applicationId,
            user_id: input.userId,
            host: input.host,
          },
          raw: true,
        },
      );

      return toRouteResponse(response);
    },

    async addCommentOnNote(input: AddCommentOnNoteInput) {
      const response = await api.post<BaseAPIResponse<AddCommentOnResponse>>(
        SERVICES.ADD_COMMENT_ON_NOTE,
        {
          user: input.user,
          note_id: input.note_id,
          application_id: input.application_id,
          comment: input.comment,
          user_id: input.userId,
          host: input.host,
        },
        { raw: true },
      );

      return toRouteResponse(response);
    },

    async addNotesForApplication(input: AddNotesForApplicationInput) {
      const response = await api.post<
        BaseAPIResponse<AddNotesForApplicationResponse>
      >(
        SERVICES.ADD_NOTE_FOR_APPLICATION,
        {
          application_id: input.application_id,
          documents: input.documents,
          notes_html: input.notes_html,
          note_user: {
            ...input.note_user,
            user_id: input.userId,
          },
          user_id: input.userId,
          host: input.host,
        },
        { raw: true },
      );

      return toRouteResponse(response);
    },

    async uploadDocument(input: UploadDocumentInput) {
      const formData = new FormData();
      appendFile(formData, "document", input.documents);

      const response = await api.post<
        BaseAPIResponse<UploadNotesDocumentResponse>
      >(SERVICES.UPLOAD_NOTE_DOCUMENT, formData, { raw: true });

      return toRouteResponse(response);
    },

    async downloadApplicantVisa(input: DownloadApplicantVisaInput) {
      const response = await api.get<
        BaseAPIResponse<DownloadApplicantVisaDataobj>
      >(SERVICES.DOWNLOAD_APPLICANT_VISA, {
        query: {
          application_id: input.application_id,
          applicant_id: input.applicant_id,
          document_name: input.document_name,
          host: input.host,
          user_id: input.userId,
        },
        raw: true,
      });

      return {
        ...toRouteResponse(response),
        msg: response.msg,
      };
    },

    async downloadBundledInsurance(input: DownloadBundledInsuranceInput) {
      const response = await api.post<
        BaseAPIResponse<{ insurance_url: string }>
      >(
        SERVICES.DOWNLOAD_BUNDELD_INSURANCE,
        {
          application_id: input.application_id,
          applicant_id: input.applicant_id,
          host: input.host,
          user_id: input.userId,
        },
        { raw: true },
      );

      return {
        ...toRouteResponse(response),
        msg: response.msg,
      };
    },

    async updateApplicantFileNumber(input: UpdateApplicantFileNumberInput) {
      const response = await api.post<DataAndMsg>(
        SERVICES.UPDATE_APPLICANT_FILE_NUMBER,
        {
          applicant_file_number: input.applicant_file_number,
          applicant_id: input.applicant_id,
          user_id: input.userId,
          host: input.host,
        },
        { raw: true },
      );

      return toDataAndMsgResponse(response);
    },

    async issueInsurance(input: IssueInsuranceInput) {
      const response = await api.post<BaseAPIResponse<ApplicationType>>(
        SERVICES.ISSUE_INSURANCE,
        {
          applicant_id: input.applicantId,
          user_id: input.userId,
          host: input.host,
        },
        { raw: true },
      );

      return {
        ...toRouteResponse(response),
        msg: response.msg ?? "Something went wrong!",
      };
    },
  };
}
