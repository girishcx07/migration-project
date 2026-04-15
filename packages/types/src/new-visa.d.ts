export interface GetNationalityResponse {
  _id: string;
  name: string;
  host?: string;
  data?: Country[];
}

export interface Country {
  name: string;
  cioc: string;
  callingCodes: string;
  flag: string;
  synonyms: string[];
  alpha2Code: string;
  destination_info?: DestinationDetails;
}

export interface GetTravellingToPayload {
  origin: string;
  nationality: string;
}

export interface DestinationDetails {
  title: string;
  content_old: string;
  content_new: string;
}

export interface DocumentOCR {
  country_code?: string;
  mrz?: string;
  header?: string;
  place_of_birth?: string;
  nationality?: string;
  place_of_issue?: string;
  date_of_issue?: string;
  lastname?: string;
  firstname?: string;
  type?: string;
  gender?: string;
  date_of_expiry?: string;
  passport_no?: string;
  date_of_birth?: string;
  photo?: string;
  signature?: string;
  photo_imgdata?: string;
  signature_imgdata?: string;
  passport_no_barcode_roi_imgdata?: string;
  age?: number;
  spouse_name?: string;
  mother_name?: string;
  old_passport_details?: string;
  father_name?: string;
  address?: string;
  file_no?: string;
  passport_no_barcode?: string;
  passport_no_barcode_roi?: string;
  [key: string]: unknown;
}

export interface ApplicationDocument {
  is_valid: boolean;
  error_message?: string;
  doc_identifier: string;
  file: string;
  file_thumbnail: string;
  ocr: DocumentOCR;
  file_type: string;
  file_name: string;
  confidence: number;
  original_file_name: string;
  mime_type: string;
  processed_by: string;
}

export interface VisaFees {
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

export interface CreateApplicationPayload {
  documentsArray: UploadedDocumentFiles;
  // host: string;
  // user_id: string;
  nationality: string;
  origin: string;
  travelling_to: string;
  travelling_to_country: string;
  travelling_to_identity: string;
  journey_start_date: string;
  journey_end_date: string;
  user_type: string;
  application_created_by_user: string | null;
  visa_id: string;
  visa_code: string;
  duration_type: string;
  visa_category: string;
  visa_fees: VisaFees;
  visa_entry_type: string;
  visa_processing_type: string;
  visa_type_display_name: string;
  is_visaero_insurance_bundled: boolean;
  insurance_details?: InsuranceDetails;
  base_currency_symbol: string;
  is_with_insurance: string;
  total_days: string;
  visa_type: string;
  currency: string;
  platform: string;
  application_type?: string;
  raff_applicants?: string[];
}

export interface CreateApplicationResponse {
  _id: string;
  user_id: string;
  agency_id: string;
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
  visa_entry_type: string;
  visa_processing_type: string;
  visa_category: string;
  total_days: string;
  duration_type: string;
  base_currency_symbol: string;
  journey_start_date: string;
  journey_end_date: string;
  visa_fees: VisaFees;
  is_with_insurance: boolean;
  created_on: number;
  updated_at: number;
  payment_promo_code: string;
  payment_promo_code_id: string;
  documents_pool: ApplicationDocument[];
  application_type: string;
  application_created_by_user: string | null;
  application_branch_id: string;
  application_branch_name: string;
  application_agency_name: string;
  application_traveldesk_name: string;
  application_costcenter_name: string;
  payment_mode: string;
  payment_done_via: string;
  host: string;
  contact_details: ContactDetails;
  is_visaero_insurance_bundled: boolean;
  insurance_details: Record<string, unknown>;
  evm_request: Record<string, unknown>;
  applicants: CreateApplicationApplicant[];
}

export interface ContactDetails {
  first_name: string;
  last_name: string;
  mobile_no: string | null;
  country_code: string | null;
  email: string | null;
}

export interface CreateApplicationApplicant {
  _id: string;
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
  traveller_type: "adult" | "child" | "infant";
  isPrimaryApplicant: boolean;
  gender: string;
  age: number;
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
}

export interface GetTravellingToResponse {
  _id: string;
  name: string;
  origin: string;
  nationality: string;
  host: string;
  data: TravellingToCountry[];
}

export interface TravellingToCountry {
  identity: string;
  name: string;
  cioc: string;
  flag: string;
  max_travel_days: string;
  allowed_visa_applications: string;
  visa_types: VisaType[];
  visa_type: string[];
  managed_by?: string;
  is_visa_free?: boolean;
  is_e_visa?: boolean;
  destination_info?: DestinationInfo;
  cor_required?: boolean;
  is_sticker_visa?: boolean;
  is_visa_on_arrival?: boolean;
}

export interface VisaType {
  type: string;
  title: string;
  description: string;
  sub_description: string;
}

export interface DestinationInfo {
  title: string;
  html_content: string;
}

export interface GetVisaOfferPayload {
  currency: string;
  managed_by: string;
  travelling_to: string;
  travelling_to_identity: string;
  type: string;
}

export type GetVisaOfferResponse = VisaOffer[];

export interface VisaOffer {
  _id?: string;
  name?: string;
  travelling_to?: string;
  travelling_to_identity?: string;
  visa_type?: string;
  visa_type_display_name?: string;
  visa_category?: string;
  processing_type?: string;
  entry_type?: string;
  status?: string;
  is_child_fees_applicable?: boolean;
  visa_details?: VisaDetails;
  host?: string;
  is_visaero_insurance_bundled?: boolean;
  insurance_details?: InsuranceDetails;
}

export interface VisaDetails {
  visa_id: string;
  offer_id: string;
  visa_code: string;
  duration_in_days: number;
  duration_days: string;
  duration_type: string;
  duration_display: string;
  visa_title: string;
  visa_header: string;
  processing_time: string;
  visa_validity: string;
  stay_validity: string;
  description: string;
  base_fees_structure: BaseFeesStructure;
  desc: Desc;
  display_title: string;
  fees: Fees;
}

export interface BaseFeesStructure {
  adult_govt_fee: string;
  adult_service_fee: string;
  child_service_fee: string;
  infant_service_fee: string;
  child_govt_fee: string;
  infant_govt_fee: string;
  child_govt_fee_diff: string;
  currency: string;
}

export interface Desc {
  header: string;
  sub_header_1: string;
  sub_header_2: string;
  sub_header_3: string;
  body: string;
}

export interface Fees {
  adult_govt_fee: string;
  adult_service_fee: string;
  child_govt_fee: string;
  child_service_fee: string;
  infant_govt_fee: string;
  infant_service_fee: string;
  currency: string;
  total_cost: string;
  total_service_fee: string;
  convenience_fee?: string;
  tax_label?: string;
  tax?: string;
}

export interface InsuranceDetails {
  visaero_insurance_fees: string;
  visaero_service_fees: string;
  insurance_type: string;
  insurance_type_id: string;
  insurance_title: string;
  insurance_coverage: InsuranceCoverage[];
  insurance_desc: InsuranceDesc[];
}

export interface InsuranceCoverage {
  name: string;
  value: string;
}

export interface InsuranceDesc {
  name: string;
  value: string;
}

export interface GetSupportedCurrenciesResponse {
  _id: string;
  host: string;
  currencies: Currency[];
  updated_on: number;
}

export interface Currency {
  country: string;
  currency: string;
  symbol: string;
  name: string;
  value_to_usd: any;
  exchange_rate: number;
  taxes: any[];
}

export interface GetVisaDocumentsResponse {
  travelling_to_identity: string;
  offer_id: string;
  visa_id: string;
  required_documents: RequiredDocument[];
  evaluate: Evaluate[];
}

// ----------------- DOCUMENT STRUCTURE -----------------

export interface RequiredDocument {
  doc_id: string;
  doc_type: string;
  doc_display_name: string;
  doc_short_description: string;
  doc_description: string;
  doc_snap: RequiredDocumentDocSnap[];
  document_required_for_routes: string[]; // change to appropriate type if not always string[]
}

export interface Demand {
  doc_id: string;
  doc_type: string;
  doc_display_name: string;
  doc_short_description: string;
  doc_description: string;
  doc_snap: RequiredDocumentDocSnap[];
  document_required_for_routes: string[]; // consistent with RequiredDocument
}

export interface RequiredDocumentDocSnap {
  doc_type: string;
  doc_description: string;
  rpa_doc_name: string;
  ocr_required: boolean;
  is_reusable: boolean;
  vault: Vault[];
  doc_specification: DocSpecification;
  doc_short_description: string;
  doc_display_name: string;
  doc_name: string;
  mandatory: boolean;
}

export interface Vault {
  level: string;
  category: string;
}

export interface DocSpecification {
  size: string;
  format: string[];
  max_width: string;
  max_height: string;
  aspect_ratio: string;
  face_ratio: string;
  background: string;
}

// ----------------- CONDITIONAL EVALUATION -----------------

export interface Evaluate {
  condition: Condition;
  demand: Demand[];
}

export interface Condition {
  id: string;
  combinator: string;
  rules: Rule[];
  condition_description_text: string;
}

export interface Rule {
  id: string;
  parameter: string;
  value: string;
  operator: string;
}

export type UploadedDocumentFiles = UploadedDocumentImage[];

export interface UploadedDocumentImage {
  is_valid: boolean;
  error_message?: string;
  doc_identifier: string;
  file_thumbnail: string;
  file: string;
  mime_type: string;
  file_name: string;
  confidence: number;
  ocr?: DocumentOCR;
  file_type?: string;
  original_file_name: string;
  [key: string]: unknown;
}

export interface Ocr {
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
  [key: string]: unknown; // Allow additional fields
}

export interface GetEVMRequestDataPayload {
  evm_request_id: string;
  user_id: string;
  host: string;
}

export interface GetEVMRequestDataResponse {
  _id: string;
  user_id: string;
  external_user_id: string;
  host: string;
  origin: string;
  nationality: string;
  destination: string;
  no_of_applicants: number;
  start_date: string;
  end_date: string;
  created_on: number;
  travelling_to_identity: any;
  prm_client_id: string;
  prm_brn_id: string;
  prm_pos_object_id: string;
  currency: string;
  branchCode: string;
  accountId: any;
  useralias: string;
  userId: any;
  bookingReferenceNo: string;
  OrderId: string;
  firstName: string;
  mobileNo: any;
  emailid: string;
  tripType: string;
  selectedVisaOffer?: any;
}

export interface GetDataSimOffersPayload {
  selected_country_region: SelectedCountryRegion;
  host: string;
  nationality: Nationality;
  currency: string;
  user_id: string;
}

export interface SelectedCountryRegion {
  id: number;

  name: string;

  iso2: string;

  iso3: string;

  image: string;

  is_region: boolean;
}

export interface Nationality {
  id: number;

  name: string;

  iso2: string;

  iso3: string;

  image: string;

  is_region: boolean;
}

export interface GetDataSimOffersResponse {
  data: string;
  is_kyc_required: boolean;
  dataobj: Dataobj[];
}

export interface Dataobj {
  package_id: string;
  package_name: string;
  data: string;
  data_in_mb: number;
  call: number;
  call_in_seconds?: number;
  sms?: number;
  validity: number;
  coverage: string;
  price: string;
  network: string;
  status: boolean;
  fup_policy?: string;
  convertedPrice: string;
  data_sim_price: string;
  service_fees: string;
  currency: string;
  enterprise_price: number;
  original_price: number;
}

export interface getDataSimDestinationResponse {
  data: string;
  dataobj: Dataobj;
}

export interface Dataobj {
  _id: string;
  name: string;
  host: string;
  data: string;
}

export interface data {
  id: number;
  name: string;
  iso2: string;
  iso3: string;
  image: string;
  is_region: boolean;
}

export interface SearchRaffApplicantsResponse {
  "personal_details-first_name": string;
  "personal_details-last_name": string;
  "identity_details-passport_number": string;
  applicant_profile_url: string;
  ref_code: string;
}

export interface CreateApplicationPayload {
  documentsArray: UploadedDocumentFiles;
  nationality: string;
  origin: string;
  travelling_to: string;
  travelling_to_country: string;
  travelling_to_identity: string;
  journey_start_date: string;
  journey_end_date: string;
  user_type: string;
  application_created_by_user: string | null;
  visa_id: string;
  visa_code: string;
  duration_type: string;
  visa_category: string;
  visa_fees: unknown; // keep flexible (same as z.any)
  visa_entry_type: string;
  visa_processing_type: string;
  visa_type_display_name: string;
  is_visaero_insurance_bundled: boolean;
  insurance_details?: InsuranceDetails;
  base_currency_symbol: string;
  is_with_insurance: string;
  total_days: string;
  visa_type: string;
  currency: string;
  platform: string;
  raff_applicants?: string[];
  application_type?: string;
}
