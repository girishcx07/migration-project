import {
  Application,
  GroupMembership,
  PaymentSummaryApplicant,
} from "./review";

export interface GetVisaPaymentSumaryResponse {
  application_id: string;
  travelling_to_identity: string;
  travelling_to: string;
  visa_id: string;
  start_date: string;
  end_date: string;
  applicants: PaymentSummaryApplicant[];
  supported_currencies: any;
  convenience_fee?: string;
  application_reference_code: string;
  visa_type_display_name: any;
  visa_type: string;
  visa_option: string;
  visa_display: string;
  visa_header: string;
  currency: string;
  currency_symbol: string;
  no_of_adult_applicants: number;
  no_of_child_applicants: number;
  adult_embassy_fees: string;
  child_embassy_fees: string;
  visa_embassy_fees: string;
  service_fees: string;
  promocode_discount: string;
  additional_tax: any[];
  total_payment: string;
  is_visaero_insurance_bundled?: boolean;
  is_child_fees_applicable?: boolean;
  tax_label?: string;
  tax?: string;
}

// export interface PaymentSummaryApplicant {
//   applicant_id: string;
//   applicant_first_name: string;
//   applicant_last_name: string;
//   traveller_type: string;
//   gender: string;
//   age: number;
// }

export interface GetVisaeroStripePaymentTokenResponse {
  id: string;
  stripe_published_key: string;
  clientSecret: string;
}

export interface updateGroupMembershipPayload {
  application_id: string;
  user_id: string;
  host: string;
  group_membership: GroupMembership[];
}

// export interface GroupMembership {
//   applicant_id: string;
//   name: string;
//   relation: string;
//   head_of_family: string;
//   HOF_id: string;
//   no_of_applicants: number;
// }

export interface updateGroupMembershipResponse {
  data: string;
  msg: string;
}

export interface GenerateOTPForAnonymousUserPayload {
  user_id: string;
  email: string;
  host: string;
}

export interface GenerateOTPForAnonymousUserResponse {
  data: string;
  msg: string;
}

export interface VerifyOtpForAnonymousUserPayload {
  application_id: string;
  host: string;
  user_id: string;
  otp: string;
  email: string;
}

export interface VerifyOtpForAnonymousUserResponse {
  data: "success" | "error";
  msg: string;
  dataobj?: VerifyOtpForAnonymousUserResponseDataobj;
}

export interface VerifyOtpForAnonymousUserResponseDataobj {
  _id: string;
  status: string;
  host: string;
  isMobileVerified: boolean;
  isMailVerified: boolean;
  role: string;
  createdAt: string;
  updatedAt: string;
  isBiometric: boolean;
  user_preference: {
    backup_vault: boolean;
    default_currency: string;
  };
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
  otp: string;
  otp_generated_dt: number;
}

export interface UpdateUserDetailsPayload {
  contact_details: contactDetails;
  user_id: string;
  application_id: string;
}

export interface contactDetails {
  first_name: string;
  last_name: string;
  mobile_no: string;
  country_code: string;
  email: string;
}
export interface UpdateUserDetailsResponse {
  data: string;
  msg: string;
}

export interface UpdatePaymentProcessingStatusPayload {
  user_id: string;
  applicationId: string;
  payment_gateway: string;
  txStatus: string;
  qr_track_url?: string;
}

export interface UpdatePaymentProcessingStatusResponse {
  data: string;
  msg: string;
}

export interface bookingStatus {
  application_status: string;
  payment_mode: string;
  payment_status: string;
  hold_type?: string;
}

export interface GetPaymentModesPayload {
  user_id: string;
  currency?: string;
}

export interface GetPaymentModesResponse {
  data: string;
  msg: string;
  dataobj: GetPaymentModesDataobj[];
}

export interface GetPaymentModesDataobj {
  type: string;
  display_name: string;
  system_display_name?: string;
  provider: string;
  payment_config_id?: string;
  currency?: string[];
  status: string;
  payment_confirmation_required?: boolean;
}

export interface GetTokenPayload {
  application_id: string;
  user_id: string;
  type: string;
  payment_config_id: string;
  ui_mode?: string;
}

export interface GetTokenResponse {
  data: string;
  msg: string;
  dataobj: Dataobj;
}

export interface Dataobj {
  token: string;
  stripe_published_key: string;
  paymentMode: PaymentMode;
  clientSecret: string;
  payment_reference_id?: string;
}

export interface TokenResponse {
  token: string;
  stripe_published_key: string;
  paymentMode: PaymentMode;
}

export interface PaymentMode {
  type: string;
  display_name: string;
  system_display_name: string;
  provider: string;
  payment_config_id: string;
  currency: any[];
  status: string;
  description?: string;
  payment_confirmation_required?: boolean;
  configurations?: PaymentModeConfigurations[] | null;
}

export interface PaymentModeConfigurations {
  type: string;
  display_name: string;
  system_display_name: string;
  provider: string;
  payment_config_id?: string;
  currency: any[];
  status?: string;
  isSelected?: boolean;
  description?: string;
}
export interface GetWalletBalancePayload {
  application_id: string;
  user_id: string;
  type: string;
  payment_config_id: string;
  host?: string;
}

export interface GetWalletBalanceResponse {
  data: string;
  dataobj: GetWalletBalanceResponseDataobj;
  msg: string;
}

export interface GetWalletBalanceResponseDataobj {
  credit_balance: string;
  this_transaction: string;
  new_credit_balance: string;
  currency: string;
}

export interface submitApplicationPayload {
  application_id: string;
  user_id: string;
  type: string;
  payment_config_id: string;
  host?: string;
}

export interface submitApplicationResponse {
  data: string;
  msg: string;
}

export interface GetApplicableChildAgeForDestinationResponse {
  child_age_applicable: boolean;
  child_eligible_age: number;
  destination_cioc: string;
}
