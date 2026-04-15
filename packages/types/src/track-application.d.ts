import { BaseAPIResponse } from ".";
import { Applicant, Application } from "./review";

export interface TrackAPIResponse<T = unknown> extends BaseAPIResponse<T> {
  pagination_details?: PaginationDetails;
}

export interface GetMyApplicationsPayload {
  user_id?: string | null;
  start_date: string;
  end_date: string;
  cost_center: string | null;
  page_number: number;
  page_size: number;
  total_elements: number | string;
}

export interface TabPayload {
  cost_center: string;
  page_number: number;
  page_size: number;
  total_elements?: number | string;
  search_text?: string;
}

export interface TrackApplicationContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  tabPayload: TabPayload;
  setTabPayload: (payload: TabPayload) => void;
  isLoading: boolean;
  error: Error | null;
}

export type TrackApplication = Application;
export interface TrackApplicant extends Applicant {
  comment_logs: CommentLog[];
  visa_rpa?: { visa_application_id: string };
}

export interface CommentLog {
  user_id: string;
  user_full_name: string;
  comment: string;
}

export interface TrackApplicationResponse {
  application_obj: TrackApplication;
  applicants_data: TrackApplicant[];
  deleted_applicants: TrackApplicant[];
}

export type TrackApplicationResponseData = TrackApplicationResponse[];

export interface PaginationDetails {
  page_number: number;
  total_pages: number;
  page_size: number;
  total_elements: number;
}

export interface UserProfileResponse<T = unknown> extends BaseAPIResponse<T> {
  _id: string;
  mobile_no: string;
  country_code: string;
  platform: string;
  user_type: string;
  user_type_id: string;
  role_name: string;
  role_id: string;
  branch: string;
  branch_id: string;
  country: string;
  otp: any;
  user_preference: UserPreference;
  status: string;
  otp_generated_dt: number;
  device_id: any;
  session_id: string;
  token: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  device_token: any;
  last_login: number;
  host: string;
  last_active_on: number;
  profile_url: string;
  date_of_birth: string;
  gender: string;
  login_failure_count: number;
  build_version: string;
  accessToken: string;
  refreshToken: string;
  to_del: string;
  password_lockout_time: number;
  force_password_reset: boolean;
  force_password_reset_msg: any;
  password_generated_at: number;
  password_history: string[];
  profile_pic: string;
}

export interface UserPreference {
  default_currency: string;
  backup_vault: boolean;
}

export interface ApplicationActivity extends BaseAPIResponse {
  _id: string;
  application_id: string;
  activity: string;
  activity_on: number;
  user_id: string;
  host: string;
}

export interface updateApplicationStatePayload {
  application_id: string;
  moving_state: string;
  password: string | undefined;
  user_id: string | undefined;
  host: string | undefined;
}

export interface RestoreApplicationResponse {
  data: string;
  msg: string;
}

export interface restoreApplicationPayload {
  application_id: string;
  user_id: string | undefined;
  host: string | undefined;
}

export interface ArchiveApplicationResponse {
  data: string;
  msg: string;
}

export interface ArchiveApplicationPayload {
  application_id: string;
  user_id: string | undefined;
  host: string | undefined;
}

export interface AssignToMePayload {
  application_id: string;
  user_id: string;
}
export interface AssignToMeResponse {
  data: string;
  dataobj: DataobjOfMarkAsFixedResponse;
  msg: string;
}
export interface MarkAsFixedPayload {
  application_id: string;
  applicant_id: string;
  host: string;
  user_id: string;
}
export interface MarkAsFixedResponse {
  data: string;
  msg: string;
}

export interface DataobjOfMarkAsFixedResponse {
  assigned_to: string;
  assigned_to_user_id: string;
}

export interface TrackApplicantActionsProps {
  applicantStatus: ApplicantState | null | undefined;
  applicant: Applicant;
  applicationData: Application;
}

export interface ApplicantState {
  StateLabel?: string;
  statePercent?: string;
  title?: string;
}

export interface GetNotesForApplicationPayload {
  application_id: string;
  host: string;
}

export interface GetNotesForApplicationResponse {
  data: string;
  dataobj: NotesDataobj[];
}

export interface NotesDataobj {
  _id: string;
  application_id: string;
  documents: NotesDocument[];
  notes_html: string;
  note_user: NoteUser;
  host: string;
  user_id: string;
  comments: any[];
  created_on: number;
}

export interface NotesDocument {
  file_type: string;
  file_name: string;
  original_file_name: string;
  mime_type: string;
  file: string;
  file_thumbnail: string;
}

export interface NoteUser {
  user_id: string;
  name: string;
  profile_pic: string;
  user_type: string;
}

export interface AddCommentOnNotePayload {
  user: NoteUser;
  note_id?: string;
  host: string;
  user_id: string;
  application_id: string;
}

export interface AddCommentOnResponse {
  data: string;
  msg: string;
}
export interface AddNotesForApplicationResponse {
  data: string;
  msg: string;
}

export interface AddNotesForApplicationPayload {
  application_id: string;
  documents: any[];
  notes_html: string;
  note_user: NoteUser;
  host: string;
  user_id: string;
}

export interface UploadNotesDocumentPayload {
  documents?: any;
}

export interface UploadNotesDocumentResponse {
  data: string;
  dataobj: DataobjOfUploadNotesDocument;
}

export interface DataobjOfUploadNotesDocument {
  file: string;
  file_thumbnail: string;
  file_type: string;
  file_name: string;
  original_file_name: string;
  mime_type: string;
}

export interface DownloadApplicantVisaPayload {
  application_id: string;
  applicant_id: string;
  document_name?: string;
}

export interface DownloadApplicantResponse {
  data: string;
  dataobj: DownloadApplicantVisaDataobj;
  msg?: string;
}

export interface DownloadApplicantVisaDataobj {
  document_name: string;
  document_url: string;
  applicant_id: string;
  application_id: string;
}

export interface DownloadBundledInsurancePayload {
  application_id: string;
  applicant_id: string;
  user_id: string;
}

export interface DownloadBundledInsuranceResponse {
  data: string;
  dataobj: DownloadBundledInsuranceDataobj;
  msg?: string;
}

export interface DownloadBundledInsuranceDataobj {
  insurance_url: string;
}

export interface UpdateApplicantFileNumberPayload {
  applicant_file_number: string;
  applicant_id: string;
  host: string;
  user_id: string;
}

export interface UpdateApplicantFileNumberResponse {
  data: string;
  msg: string;
}
