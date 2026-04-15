import { Country } from "./new-visa";

export type DataSimOfferTypesList = DataSimOfferTypes[];

export interface DataSimOfferTypes {
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
  title: string;
  is_available: boolean;
  price_changed: boolean;
  package_ref_id?: string;
  sims?: sims[];
}

export interface sims {
  package_name: string;
  package_data: string;
  package_call: any;
  package_sms: any;
  perioddays: number;
  unit_price_net_amount: string;
  unit_price_gross_amount: string;
  iccid: string;
  msisdn: string;
  imsi_number: string;
  status: string;
  lpa_server: string;
  lpa_qr_code: string;
  smdpAddress: string;
  matchingID: string;
  puk_code: string;
  pin: string;
  title: string;
  esim_ref_id: string;
  qr_filename: string;
  qr_signed_url: string;
}

export interface DataSimApplicationTypes {
  _id: string;
  application_reference_code: string;
  user_id: string;
  application_status: string;
  package_id: string;
  country: string;
  first_name: string;
  last_name: string;
  address: string;
  email: string;
  state: string;
  nationality_name: string;
  nationality: string;
  city: string;
  pincode: string;
  phone_number: string;
  country_code: string;
  created_on: number;
  esim_generated_on: string;
  created_by: string;
  reviewed_by: any;
  quantity: number;
  host: string;
  destination_name: string;
  application_type: string;
  flight_ticket: string;
  passport: string;
  passport_back: string;
  agency_id: string;
  travel_desk_id: string;
  application_branch_id: string;
  application_branch_name: string;
  application_agency_name: string;
  application_traveldesk_name: string;
  application_country: string;
  destination: string;
  is_destination_a_region: string;
  journey_start_date: string;
  journey_end_date: string;
  packages: SelectedEsimType[];
}

export interface EsimRegionCountriesDataTypes {
  _id: string;
  name: string;
  host: string;
  data: DataSimCountryTypes[];
}

export interface DataSimCountryTypes {
  id: number;
  name: string;
  iso2: string;
  iso3: string;
  image: string;
  is_region: boolean;
  flag: string;
}

export type EsimNationatlityType = Country;
export interface EsimNationatlityDataTypes {
  _id: string;
  name: string;
  host: string;
  data: EsimNationatlityType[];
}

export interface CompatibleDevicesListTypes {
  android: string[];
  ios: string[];
}

export type SelectedEsimType = DataSimOfferTypes & { quantity: number };

export interface EsimDataType {
  nationality: ESimNationalityType;
  destination: ESimDestinationType;
  dateRange: ESimDateRangeType;
  offers?: SelectedEsimType[];
  is_kyc_required?: boolean;
}

export type ESimNationalityType = Omit<Country, "alpha2Code" | "cioc"> & {
  label: string;
  value: string;
  icon: string;
  iso2: string;
  iso3: string;
};

export interface ESimDestinationType {
  label: string;
  value: string;
  id: number;
  name: string;
  iso2: string;
  iso3: string;
  image: string;
  is_region: boolean;
}

export interface ESimDateRangeType {
  start: string;
  end: string;
}

export interface CreateDataSimApplicationTypes {
  acknowledged: boolean;
  insertedId: string;
  application_reference_code: string;
}

export interface DataSimPaymentSummaryTypes {
  _id: string;
  application_reference_code: string;
  user_id: string;
  application_status: string;
  is_kyc_required: boolean;
  country: string;
  first_name: string;
  last_name: string;
  address: string;
  email: string;
  state: any;
  nationality_name: string;
  nationality: string;
  journey_start_date: string;
  journey_end_date: string;
  city: any;
  pincode: any;
  phone_number: string;
  country_code: string;
  created_on: number;
  updated_on: number;
  created_by: string;
  reviewed_by: string;
  host: string;
  destination_name: string;
  application_type: string;
  flight_ticket: string;
  passport: string;
  passport_back: string;
  destination: string;
  is_destination_a_region: boolean;
  nationality_data: NationalityData;
  destination_data: DestinationData;
  payment_config: PaymentConfig;
  payment_details: PaymentDetails;
  status: string;
  updated_at: number;
  application_sub_status: string;
  payment_status: string;
  is_all_package_not_available: boolean;
  is_any_package_not_available: boolean;
  is_price_changed: boolean;
  esim_generated_on: number;
  transaction_logs: TransactionLog[];
  currency: string;
  packages: SelectedEsimType[];
  payment_summary: PaymentSummary;
  currency_details: CurrencyDetails;
}

export interface NationalityData {
  id: number;
  image: string;
  is_region: boolean;
  is_selected: boolean;
  iso2: string;
  iso3: string;
  name: string;
}

export interface DestinationData {
  id: number;
  image: string;
  is_region: boolean;
  is_selected: boolean;
  iso2: string;
  iso3: string;
  name: string;
}

export interface PaymentConfig {
  session: Session;
  mode: string;
  api_key: string;
  return_url: string;
  notify_url: string;
}

export interface Session {
  paymentIntent: string;
  paymentIntentId: string;
  ephemeralKey: string;
  customer: string;
  publishableKey: string;
  orderId: string;
}

export interface PaymentDetails {
  paymentGateway: string;
  orderId: string;
  orderAmount: number;
  orderCurrency: string;
  status: string;
  paymentIntentId: string;
  paymentTransactions: any[];
}

export interface TransactionLog {
  error?: Error;
  status: string;
  package_id: string;
  timestamp: number;
  success?: boolean;
  message?: string;
  firstname?: string;
  last_name?: string;
  email?: string;
  order_id?: string;
  net_amount?: string;
  gross_amount?: string;
  total?: string;
  sims?: Sim[];
}

export interface Sim {
  package_name: string;
  package_data: string;
  package_call: number;
  package_sms: number;
  perioddays: number;
  unit_price_net_amount: string;
  unit_price_gross_amount: string;
  iccid: string;
  msisdn: string;
  imsi_number: string;
  status: string;
  lpa_server: string;
  lpa_qr_code: string;
  smdpAddress: string;
  matchingID: string;
  puk_code: string;
  pin: string;
}

export interface PaymentSummary {
  total_amount: number;
  data_sim_cost: number;
  service_fee: number;
  convenience_fee: number;
  currency: string;
  total_quantity: number;
  billing_details: BillingDetails;
  gst_details: GstDetails;
}

export interface BillingDetails {
  billing_country: BillingCountry;
  billing_currency: string;
  billing_state: string;
}

export interface BillingCountry {
  id: number;
  image: string;
  is_region: boolean;
  is_selected: boolean;
  iso2: string;
  iso3: string;
  name: string;
}

export interface GstDetails {
  gst_company_address: string;
  gst_company_name: string;
  gst_no: string;
  gst_state: string;
}

export interface CurrencyDetails {
  country: string;
  currency: string;
  symbol: string;
  name: string;
  value_to_usd: number;
  exchange_rate: number;
}

export interface DataSimEnterpriseAccountCreditTypes {
  credit_balance: string;
  this_transaction: string;
  new_credit_balance: string;
}

export interface TrackDataEsimApplicationTypes {
  _id: string;
  application_reference_code: string;
  user_id: string;
  application_status: string;
  is_kyc_required: boolean;
  country: any;
  first_name: string;
  last_name: string;
  address: string;
  email: string;
  state: any;
  nationality_name: string;
  nationality: string;
  journey_start_date: string;
  journey_end_date: string;
  city: any;
  pincode: any;
  phone_number: any;
  country_code: any;
  packages: SelectedEsimType[];
  quantity: number;
  currency: string;
  created_on: number;
  updated_on: number;
  created_by: string;
  reviewed_by: any;
  host: string;
  destination_name: string;
  application_type: string;
  flight_ticket: string;
  passport: string;
  passport_back: string;
  nationality_data: ESimNationalityType;
  destination_data: ESimDestinationType;
  esim_generated_on: string;
  agency_id: string;
  travel_desk_id: string;
  application_branch_id: string;
  application_branch_name: string;
  application_agency_name: string;
  application_traveldesk_name: string;
  application_country: string;
  destination: string;
  is_destination_a_region: string;
  is_all_package_not_available: boolean;
  is_any_package_not_available: boolean;
  is_price_changed: boolean;
  payment_summary: PaymentSummary;
  operations_head_email?: string;
}

export interface PaymentSummary {
  convenience_fee: number;
  currency: string;
  data_sim_cost: number;
  service_fee: number;
  total_amount: number;
  total_quantity: number;
}

export interface DownloadESIM {
  document_name: string;
  document_display_name: string;
  document_url: string;
  application_id: string;
  package_id: string;
  vault_category: string;
  vault_level: string;
  esim_reference_code: string;
  esim_title: string;
  product_type: string;
  is_encrypted: boolean;
}
