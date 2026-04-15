export type DataStatusType = "success" | "error";

export interface BaseAPIResponse<T = unknown> {
  data: DataStatusType;
  dataobj?: T;
  msg?: string;
}

export type DataAndMsg = Pick<BaseAPIResponse, "data" | "msg">;

export interface LockConfig {
  nationality: boolean;
  travellingTo: boolean;
  cor: boolean;
  dateRange: boolean;
  applicantLimit: number;
  visaOffer: boolean;
  currency: boolean;
}

export interface GetHostDetailsResponse {
  _id: string;
  enterprise_account_id: string;
  type: string;
  domain_host: string;
  host: string;
  brand: string;
  brand_color: string;
  secondary_color: string;
  brand_logo: string;
  currency: string;
  theme_config: Theme;
  locking_type?: string;
  lockData?: LockConfig;
  lockIfDataAvailable?: LockConfig;
  title?: string;
  description?: string;
  favicon?: string;
}

export interface QRVisaRegisterAnonymousUserInput {
  _id: string;
  status: string;
  host: string;
  isMobileVerified: boolean;
  isMailVerified: boolean;
  role: string;
  createdAt: string;
  updatedAt: string;
  isBiometric: boolean;
  user_preference: UserPreference;
  user_type: string;
  user_sub_type: string;
  session_id: string;
  accessToken: string;
  refreshToken: string;
}

export interface Theme {
  root: Root;
  dark: Dark;
}

export interface Root {
  background: string;
  foreground: string;
  card: string;
  "card-foreground": string;
  popover: string;
  "popover-foreground": string;
  primary: string;
  "primary-foreground": string;
  secondary: string;
  "secondary-foreground": string;
  muted: string;
  "muted-foreground": string;
  accent: string;
  "accent-foreground": string;
  destructive: string;
  "destructive-foreground": string;
  border: string;
  input: string;
  ring: string;
  radius: string;
  "chart-1": string;
  "chart-2": string;
  "chart-3": string;
  "chart-4": string;
  "chart-5": string;
}

export interface Dark {
  background: string;
  foreground: string;
  card: string;
  "card-foreground": string;
  popover: string;
  "popover-foreground": string;
  primary: string;
  "primary-foreground": string;
  secondary: string;
  "secondary-foreground": string;
  muted: string;
  "muted-foreground": string;
  accent: string;
  "accent-foreground": string;
  destructive: string;
  "destructive-foreground": string;
  border: string;
  input: string;
  ring: string;
  "chart-1": string;
  "chart-2": string;
  "chart-3": string;
  "chart-4": string;
  "chart-5": string;
}

export interface IpData {
  ip: string;
  network: string;
  version: string;
  city: string;
  region: string;
  region_code: string;
  country: string;
  country_name: string;
  country_code: string;
  country_code_iso3: string;
  country_capital: string;
  country_tld: string;
  continent_code: string;
  in_eu: boolean;
  postal: string;
  latitude: number;
  longitude: number;
  timezone: string;
  utc_offset: string;
  country_calling_code: string;
  currency: string;
  currency_name: string;
  languages: string;
  country_area: number;
  country_population: number;
  asn: string;
  org: string;
}

export interface GetExternalAgentDetails {
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
  city: string;
  agency_id: string;
  agency_name: string;
  otp: string;
  user_preference: UserPreference;
  status: string;
  otp_generated_dt: number;
  device_id: string;
  session_id: string;
  token: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  device_token: string;
  last_login: number;
  host: string;
  external_user_id: string;
  external_token: string;
  user_sub_type: string;
  accessToken: string;
  refreshToken: string;
  last_active_on: number;
  evm_request_id?: string;
  price_change_ack?: boolean;
}

export interface UserPreference {
  default_currency: string;
  backup_vault: boolean;
}

export interface InitiateConsoleSessionResponse {
  _id: string;
  mobile_no: any;
  country_code: any;
  platform: string;
  user_type: string;
  user_type_id: string;
  role_name: string;
  role_id: string;
  branch: string;
  branch_id: string;
  country: string;
  city: string;
  agency_id: string;
  agency_name: string;
  otp: string;
  user_preference: UserPreference;
  status: string;
  otp_generated_dt: number;
  device_id: any;
  session_id: string;
  token: string;
  email: any;
  first_name: string;
  last_name: string;
  password: any;
  device_token: any;
  host: string;
  external_user_id: string;
  external_token: string;
  user_sub_type: string;
  accessToken: string;
  refreshToken: string;
  evm_request_obj: EvmRequestObj;
}

export interface EvmRequestObj {
  _id: string;
  user_id: string;
  external_user_id: string;
  host: string;
  created_on: number;
}

export interface VerfiyExternalUserIdResponse {
  user_id: string;
  session_id: string;
  host: string;
}

export interface VerifyUserTokenResponse {
  _id: string;
  mobile_no: any;
  country_code: any;
  platform: string;
  user_type: string;
  user_type_id: string;
  role_name: string;
  role_id: string;
  branch: string;
  branch_id: string;
  country: string;
  city: string;
  agency_id: string;
  agency_name: string;
  otp: string;
  user_preference: UserPreference;
  status: string;
  otp_generated_dt: number;
  device_id: any;
  session_id: string;
  token: string;
  email: any;
  first_name: string;
  last_name: string;
  password: any;
  device_token: any;
  last_login: number;
  host: string;
  external_user_id: string;
  external_token: string;
  user_sub_type: string;
  accessToken: string;
  refreshToken: string;
  last_active_on: number;
}

export interface UserRolePermission {
  _id: string;
  role_name: string;
  role_description: string;
  user_type: string;
  role_id: string;
  host: string;
  role_permissions: RolePermissions;
}

export interface RolePermissions {
  news_updates: NewsUpdates;
  app_notifications: AppNotifications;
  dashboard: Dashboard;
  new_visa: NewVisa;
  apply_new_visa: ApplyNewVisa;
  track_application: TrackApplication;
  ancillary_products: AncillaryProducts;
  overstay: Overstay;
  track_sticker_visa: TrackStickerVisa;
  visa_offers: VisaOffers;
  visa_documents: VisaDocuments;
  promo_code: PromoCode;
  user_management: UserManagement;
  branch_management: BranchManagement;
  agency_management: AgencyManagement;
  agent_management: AgentManagement;
  agency_credit_info: AgencyCreditInfo;
  travel_desk_management: TravelDeskManagement;
  travel_desk_admin_management: TravelDeskAdminManagement;
  travel_desk_credit_info: TravelDeskCreditInfo;
  travel_desk_employee_management: TravelDeskEmployeeManagement;
  travel_desk_cost_center_management: TravelDeskCostCenterManagement;
  embassy_account_config: EmbassyAccountConfig;
  role_management: RoleManagement;
  currency_management: CurrencyManagement;
  reporting: Reporting;
  markup: Markup;
  external_bundle_insurance: ExternalBundleInsurance;
  external_fulfilment: ExternalFulfilment;
  v_data_sim: VDataSim;
}

export interface NewsUpdates {
  display_menu: boolean;
  add_news_updates: boolean;
}

export interface AppNotifications {
  display_menu: boolean;
}

export interface Dashboard {
  display_menu: boolean;
}

export interface NewVisa {
  display_menu: any;
  add_new_visa: any;
}

export interface ApplyNewVisa {
  display_menu: boolean;
  add_new_visa: boolean;
}

export interface TrackApplication {
  is_support_admin: any;
  display_new_menu: boolean;
  display_menu: any;
  list_my_applications: boolean;
  list_waiting_for_finance_verification: any;
  can_confirm_payment_receipt: any;
  list_pending_verification: any;
  can_preview_application: boolean;
  can_verify_application: any;
  list_ready_to_submit: boolean;
  can_download_applicant_payload: any;
  can_submit_application: any;
  list_in_progress: boolean;
  list_completed_applications: boolean;
  can_upload_visa: any;
  can_download_visa: boolean;
  list_hold_application: boolean;
  can_proceed_hold_application: boolean;
  list_employee_submitted_application: any;
  process_employee_submitted_applications: any;
  can_archive_application: boolean;
  list_archived_application: boolean;
  can_restore_archived_application: any;
}

export interface AncillaryProducts {
  display_menu: any;
  display_travel_insurance: any;
  display_data_sim: any;
  display_carbon_offset: any;
  can_add_travel_insurance: any;
  can_add_data_sim: any;
  can_add_carbon_offet: any;
  can_process_travel_insurance: any;
  can_process_data_sim: any;
  can_process_carbon_offset: any;
}

export interface Overstay {
  display_menu: any;
  can_archive: any;
}

export interface TrackStickerVisa {
  display_menu: any;
  list_my_applications: boolean;
  list_waiting_for_finance_verification: any;
  can_confirm_payment_receipt: any;
  list_pending_verification: any;
  can_preview_application: boolean;
  can_verify_application: boolean;
  list_ready_to_submit: boolean;
  can_download_applicant_payload: boolean;
  can_submit_application: boolean;
  list_in_progress: boolean;
  list_completed_applications: boolean;
  can_upload_visa: any;
  can_download_visa: boolean;
  list_hold_application: boolean;
  can_proceed_hold_application: boolean;
  list_employee_submitted_application: any;
  process_employee_submitted_applications: any;
  can_archive_application: boolean;
  list_archived_application: boolean;
  can_restore_archived_application: any;
}

export interface VisaOffers {
  display_menu: any;
  list_visa_offer: any;
  add_visa_offer: any;
  update_visa_offer: any;
  delete_visa_offer: any;
}

export interface VisaDocuments {
  display_menu: any;
  list_visa_documents: any;
  add_visa_documents: any;
  update_visa_documents: any;
  delete_visa_documents: any;
}

export interface PromoCode {
  display_menu: any;
  add_master_code: any;
  update_master_code: any;
  add_promo_code: any;
  update_promo_code: any;
  download_promo_code: any;
}

export interface UserManagement {
  display_menu: any;
  list_users: any;
  add_users: any;
  update_users: any;
  delete_users: any;
  can_reset_user_password: any;
  can_download_user_list: any;
}

export interface BranchManagement {
  display_menu: any;
  list_branch: any;
  add_branch: any;
  update_branch: any;
  delete_branch: any;
}

export interface AgencyManagement {
  display_menu: boolean;
  list_agency: boolean;
  add_agency: boolean;
  update_agency: boolean;
  delete_agency: boolean;
  add_credits: boolean;
  view_credits: boolean;
  view_transactions: boolean;
  can_approve_or_reject_credit: any;
  view_discounts: boolean;
  add_discounts: boolean;
  update_discounts: boolean;
}

export interface AgentManagement {
  display_menu: boolean;
  list_users: boolean;
  add_users: boolean;
  update_users: boolean;
  delete_users: boolean;
  can_reset_agent_password: boolean;
}

export interface AgencyCreditInfo {
  display_menu: boolean;
  can_approve_or_reject_credit: any;
  view_agency_transactions: boolean;
  view_agency_credits: boolean;
  add_agency_credits: any;
  add_credits: boolean;
}

export interface TravelDeskManagement {
  display_menu: any;
  list_travel_desk: boolean;
  add_travel_desk: boolean;
  update_travel_desk: boolean;
  delete_travel_desk: boolean;
  add_credits: boolean;
  view_credits: boolean;
  view_transactions: boolean;
  can_approve_or_reject_credit: any;
  view_discounts: boolean;
  add_discounts: boolean;
  update_discounts: boolean;
}

export interface TravelDeskAdminManagement {
  display_menu: any;
  list_admin: boolean;
  add_admin: boolean;
  update_admin: boolean;
  delete_admin: boolean;
  can_reset_admin_password: boolean;
}

export interface TravelDeskCreditInfo {
  display_menu: any;
  can_approve_or_reject_credit: any;
  view_travel_desk_transactions: any;
  view_travel_desk_credits: any;
  add_travel_desk_credits: any;
}

export interface TravelDeskEmployeeManagement {
  display_menu: any;
  list_employee: any;
  add_employee: any;
  update_employee: any;
  delete_employee: any;
  can_reset_employee_password: any;
}

export interface TravelDeskCostCenterManagement {
  display_menu: any;
  list_cost_centers: any;
  add_cost_centers: any;
  update_cost_centes: any;
}

export interface EmbassyAccountConfig {
  display_menu: any;
  list_embassy_accounts: any;
  add_embassy_accounts: any;
  update_embassy_accounts: any;
  delete_embassy_accounts: any;
}

export interface RoleManagement {
  display_menu: any;
  list_roles: any;
  add_roles: any;
  update_roles: any;
  delete_roles: any;
}

export interface CurrencyManagement {
  display_menu: any;
  list_currencies: any;
  update_currencies: any;
}

export interface Reporting {
  display_menu: boolean;
  list_business_report: boolean;
  list_travel_insurance_report: any;
  list_external_fullfillment_report: any;
  list_bundled_insurance_report: any;
  list_data_esim_report: boolean;
}

export interface Markup {
  display_menu: any;
  list_branch_markup: any;
  list_agency_markup: any;
  list_travel_desk_markup: any;
}

export interface ExternalBundleInsurance {
  display_menu: any;
}

export interface ExternalFulfilment {
  display_menu: any;
}

export interface VDataSim {
  display_menu: boolean;
  can_apply: boolean;
  can_download: boolean;
  can_process: boolean;
  can_share_email: boolean;
}

export interface QRVisaUser {
  _id: string;
  status: string;
  host: string;
  isMobileVerified: boolean;
  isMailVerified: boolean;
  role: string;
  createdAt: string;
  updatedAt: string;
  isBiometric: boolean;
  user_preference: UserPreference;
  user_type: string;
  user_sub_type: string;
  session_id: string;
  country_code: string;
  email: string;
  first_name: string;
  last_name: string;
  mobile_no: string;
  accessToken: string;
  refreshToken: string;
  visa_lancer_code: string;
}

export interface EcommPaymentModeTokenResponse {
  success: boolean;
  payment_id: string;
  redirect_url: string;
  signature: string;
  data: EcommPaymentModeTokenResponseData;
  url_encoded_signature: string;
}

export interface EcommPaymentModeTokenResponseData {
  salt: string;
  baseURI: string;
  params: EcommPaymentModeTokenResponseDataParams;
}

export interface EcommPaymentModeTokenResponseDataParams {
  project_id: number;
  interface_type: string;
  payment_id: string;
  payment_amount: number;
  payment_currency: string;
  customer_id: string;
  payment_description: string;
  payment_customer_email: string;
  payment_customer_phone: string;
  success_url: string;
  fail_url: string;
  callback_url: string;
}

export interface EcommPaySuccess {
  sum_request: {
    amount: number;
    currency: string;
  };
  request_id: string;
  transaction: {
    id: number;
    date: string;
    type: string;
  };
  payment: {
    id: string;
    method: string;
    date: string;
    result_code: string;
    result_message: string;
    status: string;
    is_new_attempts_available: boolean;
    attempts_timeout: number;
    cascading_with_redirect: boolean;
    split_with_redirect: boolean;
    actual_amount: number;
    need_confirm_retry: boolean;
    method_id: number;
    provider_id: number;
  };
  sum_real: {
    amount: number;
    currency: string;
  };
  customer: {
    id: string;
  };
  account: {
    number: string;
    type: string;
    card_holder: string;
    expiry_month: string;
    expiry_year: string;
  };
  AuthCode: string;
  rrn: string;
  terminal: {
    method_code: string;
    mode_code: string;
    name: string;
  };
  cashout_data: {
    account_number: string;
  };
  general: {
    project_id: number;
    payment_id: string;
    signature: string;
  };
  description: string;
  operations: [
    {
      id: number;
      type: string;
      status: string;
      date: string;
      processing_time: string;
      request_id: string;
      sum: {
        amount: number;
        currency: string;
      };
      code: string;
      message: string;
      provider: {
        id: number;
        payment_id: string;
      };
    },
  ];
  return_url: string;
}

export interface EcommPayFail {
  sum_request: {
    amount: number;
    currency: string;
  };
  request_id: string;
  transaction: {
    id: number;
    date: string;
    type: string;
  };
  payment: {
    method: string;
    date: string;
    result_code: string;
    result_message: string;
    status: string;
    is_new_attempts_available: boolean;
    attempts_timeout: number;
    id: string;
    provider_id: number;
  };
  sum_real: {
    amount: number;
    currency: string;
  };
  customer: {
    id: string;
  };
  status: string;
  account: {
    number: string;
    type: string;
    card_holder: string;
    id: number;
    expiry_month: string;
    expiry_year: string;
  };
  rrn: string;
  auth_code: string;
  general: {
    project_id: number;
    payment_id: string;
    signature: string;
  };
  description: string;
  operations: [
    {
      id: number;
      type: string;
      status: string;
      date: string;
      processing_time: string;
      request_id: string;
      sum: {
        amount: number;
        currency: string;
      };
      code: string;
      message: string;
      provider: {
        id: number;
        payment_id: string;
      };
    },
  ];
  return_url: string;
}
