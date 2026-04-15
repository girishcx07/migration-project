import { Ocr, VisaOffer } from "./new-visa";

export interface GetApplicationApplicantResponse {
  application: Application;
  applicants: Applicant[];
  insurance_t_c: string;
  deleted_applicants?: Applicant[];
}

export type FormStatus = "calculating" | "pending" | "completed";

export interface Application {
  _id: string;
  user_id: string;
  agency_id: string;
  booking_token: any;
  travel_desk_id: string;
  application_status: string;
  application_state: string;
  application_title: string;
  application_reference_code: string;
  application_code: string;
  origin: string;
  nationality: string;
  travelling_to: string;
  travelling_to_country: string;
  travelling_to_identity: string;
  adults_count: number;
  children_count: number;
  infants_count: number;
  travellers: number;
  total_applicants: number;
  visa: string;
  visa_id: string;
  visa_type: string;
  visa_type_display_name: string;
  visa_entry_type: string;
  visa_processing_type: string;
  visa_category?: string;
  total_days: string;
  duration_type: string;
  hold_type?: string;
  base_currency_symbol: string;
  journey_start_date: string;
  journey_end_date: string;
  visa_fees: ApplicationVisaFees;
  is_with_insurance: string;
  supported_currencies: any;
  created_on: number;
  updated_at: number;
  payment_promo_code: string;
  payment_promo_code_id: string;
  documents_pool: DocumentsPool[];
  application_type: string;
  application_created_by_user: string;
  application_branch_id: string;
  application_branch_name: string;
  application_agency_name: string;
  application_traveldesk_name: string;
  application_costcenter_name: string;
  payment_mode: string;
  payment_done_via: string;
  primary_policy_holder_name: any;
  primary_policy_holder_email: any;
  primary_policy_holder_mobile: any;
  host: string;
  contact_details: ApplicationContactDetails;
  is_visaero_insurance_bundled: boolean;
  insurance_details: ApplicationInsuranceDetails;
  evm_request_id: any;
  evm_request: EvmRequest;
  application_country: any;
  application_city: any;
  structure: string;
  visa_form_brule: VisaFormBrule;
  current_stack: CurrentStack[];
  fulfillment_history: FulfillmentHistory[];
  group_membership: GroupMembership[];
  payment_status?: string;
  assigned_to_user_id?: string;
  creator_user: CreatorUser;
  reviewer_user: CreatorUser;
  processing_type?: string;
  target_host?: string;
  payment_summary?: PaymentSummaryTypes;
  visa_offer?: VisaOffer;
  hold_message?: string;
  operations_head_email?: string;
  archival_details?: archivalDetails;
}

export interface PaymentSummaryTypes {
  application_id: string;
  travelling_to_identity: string;
  travelling_to: string;
  visa_id: string;
  start_date: string;
  end_date: string;
  applicants: PaymentSummaryApplicant[];
  supported_currencies: any;
  application_reference_code: string;
  visa_type_display_name: string;
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
  convenience_fee?: string;
  is_visaero_insurance_bundled?: string;
  tax_label?: string;
  tax?: string;
}

export interface PaymentSummaryApplicant {
  applicant_id: string;
  applicant_first_name: string;
  applicant_last_name: string;
  traveller_type: string;
  gender: string;
  age: number;
}

export interface CreatorUser {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  mobile_no: string;
  profile_url: string;
  roll: string;
  country_code: string;
  brach: string;
  agency: string;
  travel_desk: string;
  cost_center: string;
  created_on: number;
  user_type?: string;
  application_state?: string;
}

export interface archivalDetails {
  archived_by: string;
  archived_on?: any;
  pre_archival_status?: string;
}

export interface ApplicationContactDetails {
  first_name: string;
  last_name: string;
  mobile_no: string;
  country_code: string;
  email: string;
}

export interface ApplicationInsuranceDetails {
  visaero_insurance_fees: string;
  visaero_service_fees: string;
  insurance_type: string;
  insurance_type_id: string;
  insurance_title: string;
  insurance_coverage: ApplicationInsuranceCoverage[];
  insurance_desc: ApplicationInsuranceDesc[];
}

export interface ApplicationInsuranceCoverage {
  name: string;
  value: string;
}

export interface ApplicationInsuranceDesc {
  name: string;
  value: string;
}

export interface EvmRequest {}

export interface VisaFormBrule {
  name: string;
  travelling_to_identity: string;
  destination: string;
  host: string;
  structure: string;
  visa_type: string;
}

export interface CurrentStack {
  type: string;
  user_id: string;
  agency_id: string;
  application_branch_id: string;
  application_country: any;
  application_city: any;
  travel_desk_id: string;
  created_on: number;
  source_host: string;
  target_host: string;
  application_status: string;
}

export interface FulfillmentHistory {
  type: string;
  user_id: string;
  agency_id: string;
  application_branch_id: string;
  application_country: any;
  application_city: any;
  travel_desk_id: string;
  created_on: number;
  source_host: string;
  target_host: string;
  application_status: string;
}

export interface GroupMembership {
  applicant_id: string;
  name: string;
  relation: string;
  head_of_family: string;
  HOF_id: string;
  no_of_applicants: number;
}

export interface Applicant {
  _id: string;
  application_id: string;
  applicant_profile_url?: string;
  user_id: string;
  applicant_master_id: string;
  visaero_group_id: string;
  applicant_first_name: string;
  applicant_last_name: string;
  default_fname: string;
  default_lname: string;
  travelling_to: string;
  travelling_to_identity: string;
  traveller_type: string;
  isPrimaryApplicant: boolean;
  gender: string;
  age: string;
  visa_id: string;
  documents_ocr_done: boolean;
  journey_start_date: string;
  journey_end_date: string;
  sequence_number: number;
  applicant_display_status: string;
  visa_status: string;
  host: string;
  created_on: number;
  updated_on: number;
  structure: string;
  visa_form: VisaFormObj;
  visa_form_brule: VisaFormBrule2;
  documents: Documents;
  evisa?: EVisa;
  insurance_status?: string;
  bundled_insurance_file_name?: string;
  ready_status?: FormStatus;
  passport_number?: string;
  deleted_by_user_name?: string;
  deleted_by_user_type?: string;
  deleted_at?: number;
}

export interface EVisa {
  visa_file_name: string;
  visa_url: string;
  visa_title: string;
  visa_type: any;
  visa_issued_date: number;
  uploaded_by_user: string;
  vault: EVisaVault[];
}

export interface EVisaVault {
  level: string;
  category: string;
}

export interface VisaFormObj {
  visa_category_type: string;
  "personal_details-first_name": string;
  "personal_details-middle_name": string;
  "personal_details-last_name": string;
  "personal_details-gender": string;
  "personal_details-marital_status": string;
  "personal_details-date_of_birth": string;
  "personal_details-birth_place": string;
  "personal_details-faith": string;
  "family_details-father_name": string;
  "family_details-mother_name": string;
  "family_details-spouse_name": string;
  "identity_details-prev_nationality": string;
  "identity_details-present_nationality": string;
  "identity_details-country": string;
  "identity_details-birth_country": string;
  "identity_details-passport_number": string;
  "identity_details-passport_type": string;
  "identity_details-date_of_issue": string;
  "identity_details-date_of_expiry": string;
  "identity_details-passport_issuing_government": string;
  "identity_details-place_of_issue": string;
  "contact_information-address_line1": string;
  "contact_information-address_line2": string;
  "contact_information-city": string;
  "other_details-processing": string;
  "other_details-company_name": string;
  "other_details-visa_type": string;
  "other_details-group_membership": string;
  "other_details-education": string;
  "other_details-email_id": string;
  "other_details-profession": string;
  "other_details-telephone": string;
  "other_details-language_spoken": string;
  "other_details-religion": string;
  "other_details-applicant_loc_outside_uae": string;
  "other_details-applicant_loc_inside_uae": string;
  "other_details-applicant_city_inside_uae": string;
  "other_details-applicant_area_inside_uae": string;
  "other_details-local_street": string;
  "other_details-local_flat_number": string;
  "other_details-uae_phone_number": string;
  "other_details-applicant_coming_from_country": string;
  "other_details-applicant_coming_from_country-applicant_coming_from_country_state": OtherDetailsApplicantComingFromCountryApplicantComingFromCountryState[];
  "travel_information-visa_type": string;
  "other_details-faith": string;
  "personal_details-prev_nationality": string;
  "personal_details-applicant_loc_outside_uae": string;
  "address-country": string;
  "personal_details-country": string;
  "personal_details-birth_country": string;
  "address-city": string;
  "personal_details-nationality": string;
  "personal_details-country_of_residence": string;
  "personal_details-applicant_coming_from_country": string;
  "contact_information-country": string;
  "contact_information-address": string;
  "personal_details-father_name": string;
  "personal_details-mother_name": string;
}

export interface OtherDetailsApplicantComingFromCountryApplicantComingFromCountryState {
  applicant_coming_from_state: string;
}

export interface VisaFormBrule2 {
  name: string;
  travelling_to_identity: string;
  destination: string;
  host: string;
  structure: string;
  visa_type: string;
}

export interface Documents {
  required_documents: ApplicantRequiredDocument[];
  additional: any[];
}

export interface ApplicantRequiredDocument {
  doc_id: string;
  doc_type: string;
  doc_display_name: string;
  doc_short_description: string;
  doc_description: string;
  doc_snap: DocSnap[];
}

export interface DocSnap {
  doc_type: string;
  doc_description: string;
  rpa_doc_name: string;
  ocr_required: boolean;
  vault: DocSnapVault[];
  doc_specification: DocumentDocSpecification;
  doc_short_description: string;
  doc_display_name: string;
  doc_name: string;
  is_reusable: boolean;
  mandatory: boolean;
  status: string;
  doc_file_name: string;
  doc_thumb_file_name: string;
  doc_url: string;
  doc_thumbnail: string;
  doc_processed: boolean;
  ocr_processed: boolean;
  is_valid: boolean;
}

export interface DocSnapVault {
  level: string;
  category: string;
}

// ===========================================

export interface GetVisaFormResponse {
  visa_form: VisaFormField[];
  visa_document: VisaDocument[];
  data_dictionary: DataDictionary;
}

export type WhenType = "before" | "after" | string;

export interface Validations {
  mandatory: boolean;
  min_length?: number;
  max_length?: number;
  special_char?: boolean;
  read_only: boolean;
  isDigit?: boolean;
  display: boolean;
  format?: string;
  when?: WhenType;
  allow_digits?: boolean;
  min_days?: number;
  length?: number;
  max_days?: number;
  input_type?: string;
  after?: string;
  isTextOnly?: boolean;
  keyboard_type?: string;
}

export interface VisaFormField {
  name: string;
  label: string;
  type: "textField" | "dropdown" | "dateControl" | "subGroup" | "hidden";
  sub_label: string;
  validations: Validations;
  value: string;
  group_elements?: VisaFormField[]; // Updated from Field[] to VisaFormField[]
  options?: string[];
  dependent_elements?: VisaFormField[]; // Updated from Field[] to VisaFormField[]
  dependent_value?: string;
  sub_group_elements?: VisaFormField[][]; // Updated from Field[][] to VisaFormField[][]
  max_count?: number;
  sub_type?: string;
  keyboard_type?: string;
  has_arabic?: boolean;
  associated_field?: string;
}

export interface VisaDocument {
  doc_type: string;
  doc_name: string;
  status: string;
  doc_url: string;
  doc_thumbnail: string;
  ocr_processed: boolean;
}

export interface DataDictionary {}

export interface AddApplicantResponse {
  application_id: string;
  user_id: string;
  applicant_master_id: string;
  visaero_group_id: string;
  applicant_first_name: string;
  applicant_last_name: string;
  default_fname: string;
  default_lname: string;
  travelling_to: string;
  travelling_to_identity: string;
  traveller_type: string;
  isPrimaryApplicant: boolean;
  gender: string;
  age: string;
  visa_id: string;
  documents_ocr_done: boolean;
  journey_start_date: string;
  journey_end_date: string;
  sequence_number: number;
  applicant_display_status: string;
  visa_status: string;
  host: string;
  created_on: number;
  updated_on: number;
  _id: string;
}

export interface GetApplicantDocumentResponse {
  applicant_id: string;
  applicant_data: ApplicantData;
  applicant_doc: ApplicantDoc;
  application_data: ApplicationData;
}

export interface ApplicantData {
  applicant_first_name: string;
  applicant_last_name: string;
  applicant_profile_url: string;
  age: string;
  gender: string;
}

export interface ApplicantDoc {
  required_documents: ApplicantRequiredDocument[];
  additional: ApplicantRequiredDocument[];
}

export interface DocSnap {
  doc_type: string;
  doc_description: string;
  rpa_doc_name: string;
  ocr_required: boolean;
  vault: DocSnapVault[];
  doc_specification: DocumentDocSpecification;
  doc_short_description: string;
  doc_display_name: string;
  doc_name: string;
  is_reusable: boolean;
  mandatory: boolean;
  status: string;
  doc_file_name: string;
  doc_thumb_file_name: string;
  doc_url: string;
  doc_thumbnail: string;
  doc_processed: boolean;
  ocr_processed: boolean;
  is_valid: boolean;
}

export interface DocumentDocSpecification {
  size: string;
  format: string[];
  max_width: string;
  max_height: string;
  aspect_ratio: string;
  face_ratio: string;
  background: string;
}

export interface ApplicationData {}

export interface SaveVisaFormPayload {
  applicant_id: string;
  visa_form_obj: Record<string, any>;
  structure: string;
  applicant_display_status: string;
  comments: string;
  save_comment: boolean;
  user_id: string;
  host: string;
}

export interface GetApplicantDocumentPoolResponse {
  _id: string;
  user_id: string;
  agency_id: string;
  booking_token: any;
  travel_desk_id: string;
  application_status: string;
  application_state: string;
  application_title: string;
  application_reference_code: string;
  application_code: string;
  origin: string;
  nationality: string;
  travelling_to: string;
  travelling_to_country: string;
  travelling_to_identity: string;
  adults_count: number;
  children_count: number;
  infants_count: number;
  travellers: number;
  total_applicants: number;
  visa: string;
  visa_id: string;
  visa_type: string;
  visa_type_display_name: string;
  visa_entry_type: string;
  visa_processing_type: string;
  visa_category: string;
  total_days: string;
  duration_type: string;
  base_currency_symbol: string;
  journey_start_date: string;
  journey_end_date: string;
  visa_fees: ApplicationVisaFees;
  is_with_insurance: string;
  supported_currencies: any;
  created_on: number;
  updated_at: number;
  payment_promo_code: string;
  payment_promo_code_id: string;
  documents_pool: DocumentsPool[];
  application_type: string;
  application_created_by_user: string;
  application_branch_id: string;
  application_branch_name: string;
  application_agency_name: string;
  application_traveldesk_name: string;
  application_costcenter_name: string;
  payment_mode: string;
  payment_done_via: string;
  primary_policy_holder_name: any;
  primary_policy_holder_email: any;
  primary_policy_holder_mobile: any;
  host: string;
  contact_details: ApplicationContactDetails;
  is_visaero_insurance_bundled: boolean;
  insurance_details: ApplicationInsuranceDetails;
  evm_request_id: any;
  evm_request: EvmRequest;
  application_country: any;
  application_city: any;
  structure: string;
  visa_form_brule: VisaFormBrule;
  current_stack: CurrentStack[];
  fulfillment_history: FulfillmentHistory[];
}

export interface ApplicationVisaFees {
  adult_govt_fee: string;
  adult_service_fee: string;
  child_govt_fee: string;
  child_service_fee: string;
  infant_govt_fee: string;
  infant_service_fee: string;
  currency: string;
  total_cost: string;
  total_service_fee: string;
}

export type DocumentPoolCardType = DocumentsPool;

export interface DocumentsPool {
  is_valid: boolean;
  doc_identifier: string;
  file_thumbnail: string;
  file: string;
  mime_type: string;
  file_name: string;
  confidence: number;
  ocr: DocumentPoolOcr;
  file_type: string;
  can_be_shared: boolean;
  doc_type: string;
  applicant_ids: string[];
}

export interface DocumentPoolOcr {
  country_code: string;
  date_of_birth: string;
  date_of_expiry: string;
  date_of_issue: string;
  doc_type: string;
  gender: string;
  given_name: string;
  issuing_country: string;
  last_name: string;
  nationality: string;
  passport_number: string;
  passport_type: string;
  place_of_birth: string;
  place_of_issue: string;
  firstname: string;
  lastname: string;
  passport_no: string;
}

export interface EvmRequest {}

export interface VisaFormBrule {
  name: string;
  travelling_to_identity: string;
  destination: string;
  host: string;
  structure: string;
  visa_type: string;
}

export interface CurrentStack {
  type: string;
  user_id: string;
  agency_id: string;
  application_branch_id: string;
  application_country: any;
  application_city: any;
  travel_desk_id: string;
  created_on: number;
  source_host: string;
  target_host: string;
  application_status: string;
}

export interface FulfillmentHistory {
  type: string;
  user_id: string;
  agency_id: string;
  application_branch_id: string;
  application_country: any;
  application_city: any;
  travel_desk_id: string;
  created_on: number;
  source_host: string;
  target_host: string;
  application_status: string;
}

export interface LinkApplicantsDocumentPayload {
  applicant_id: string;
  doc_type: string;
  doc_ocr: DocOcr;
  file_name: string;
  mime_type: string;
}

export interface DocOcr {
  country_code: string;
  date_of_birth: string;
  date_of_expiry: string;
  date_of_issue: string;
  doc_type: string;
  gender: string;
  given_name: string;
  issuing_country: string;
  last_name: string;
  nationality: string;
  passport_number: string;
  passport_type: string;
  place_of_birth: string;
  place_of_issue: string;
  firstname: string;
  lastname: string;
  passport_no: string;
}

export interface LinkApplicantDocumentNewPayload {
  applicant_id: string;
  doc_type: string;
  doc_ocr: DocOcr;
  file_name: string;
  doc_description?: string;
  rpa_doc_name?: string;
  ocr_required?: boolean;
  vault?: DocSnapVault[];
  mime_type: string;
}

export type UploadAndExtractDocumentResponse = UploadAndExtractDocumentObj[];

export interface UploadAndExtractDocumentObj {
  is_valid: boolean;
  doc_identifier: string;
  file_thumbnail: string;
  file: string;
  mime_type: string;
  file_name: string;
  confidence: number;
  error: string;
  ocr: Ocr;
}

// =========================================

export interface GetDocumentTypesResponse {
  _id: string;
  name: string;
  host: string;
  destination: string;
  data: DocumentType[];
}

export interface DocumentType {
  doc_type: string;
  doc_description: string;
  rpa_doc_name: string;
  ocr_required: boolean;
  vault: DocSnapVault[];
  doc_specification: DocumentDocSpecification;
  doc_short_description: string;
  doc_display_name: string;
  doc_name: string;
  is_reusable?: boolean;
}

export type OptionType = {
  label: string;
  value: string;
} & DocumentType;

export interface GetApplicationDocumentsPoolResponse {
  _id: string;
  user_id: string;
  agency_id: string;
  booking_token: any;
  travel_desk_id: string;
  application_status: string;
  application_state: string;
  application_title: string;
  application_reference_code: string;
  application_code: string;
  origin: string;
  nationality: string;
  travelling_to: string;
  travelling_to_country: string;
  travelling_to_identity: string;
  adults_count: number;
  children_count: number;
  infants_count: number;
  travellers: number;
  total_applicants: number;
  visa: string;
  visa_id: string;
  visa_type: string;
  visa_type_display_name: string;
  visa_entry_type: string;
  visa_processing_type: string;
  visa_category: string;
  total_days: string;
  duration_type: string;
  base_currency_symbol: string;
  journey_start_date: string;
  journey_end_date: string;
  visa_fees: ApplicationVisaFees;
  is_with_insurance: string;
  supported_currencies: any;
  created_on: number;
  updated_at: number;
  payment_promo_code: string;
  payment_promo_code_id: string;
  documents_pool: DocumentsPool[];
  application_type: string;
  application_created_by_user: string;
  application_branch_id: string;
  application_branch_name: string;
  application_agency_name: string;
  application_traveldesk_name: string;
  application_costcenter_name: string;
  payment_mode: string;
  payment_done_via: string;
  primary_policy_holder_name: any;
  primary_policy_holder_email: any;
  primary_policy_holder_mobile: any;
  host: string;
  contact_details: ApplicationContactDetails;
  is_visaero_insurance_bundled: boolean;
  insurance_details: ApplicationInsuranceDetails;
  evm_request_id: any;
  evm_request: EvmRequest;
  application_country: any;
  application_city: any;
  structure: string;
  visa_form_brule: VisaFormBrule;
  current_stack: CurrentStack[];
  fulfillment_history: FulfillmentHistory[];
}

export interface DocumentsPool {
  is_valid: boolean;
  error_message?: string;
  doc_identifier: string;
  file: string;
  file_thumbnail: string;
  ocr: DocumentPoolOcr;
  file_type: string;
  file_name: string;
  confidence: number;
  original_file_name: string;
  mime_type: string;
  processed_by: string;
  can_be_shared: boolean;
  doc_type: string;
  applicant_ids: string[];
}

export interface EvmRequest {}

export interface VisaFormBrule {
  name: string;
  travelling_to_identity: string;
  destination: string;
  host: string;
  structure: string;
  visa_type: string;
}

export interface CurrentStack {
  type: string;
  user_id: string;
  agency_id: string;
  application_branch_id: string;
  application_country: any;
  application_city: any;
  travel_desk_id: string;
  created_on: number;
  source_host: string;
  target_host: string;
  application_status: string;
}

export interface FulfillmentHistory {
  type: string;
  user_id: string;
  agency_id: string;
  application_branch_id: string;
  application_country: any;
  application_city: any;
  travel_desk_id: string;
  created_on: number;
  source_host: string;
  target_host: string;
  application_status: string;
}

export interface ApplicantReadyStatusResponse {
  _id: string;
  applicant_first_name: string;
  applicant_last_name: string;
  passport_number: string;
  ready_status: FormStatus;
}

export interface BackOnHoldApplicationPaylod {
  application_id: string;
  comment: string;
  host: string;
  user_id: string;
}

export interface BackOnHoldApplicationResponse {
  data: string;
  msg: string;
}
