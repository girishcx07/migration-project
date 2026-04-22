export const SERVICES = {
  GET_SUPPORTED_CURRENCIES: "/visa-admin/getSupportedCurrencies",
  UPDATE_PRICE_CHANGE_ACK: "/visa-admin/updatePriceChangeAck",
  GET_NATIONALITIES: "/brule-engine/getNationalities",
  GET_TRAVELLING_TO: "/brule-engine/getTravellingTo",
  GET_VISA_OFFERS: "/visa/getVisaOffers",
  GET_VISA_DOCUMENTS: "/visa/getVisaDocuments",
  CREATE_APPLICATION_WITH_DOCUMENTS: "/visa/createApplicationWithDocuments",
  SEARCH_RAFF_APPLICANTS: "/visa-admin/searchApplicantsForRAFF",
  UPLOAD_AND_EXTRACT_DOCUMENTS: "/process-documents/uploadAndExtractDocument",
  REGISTER_ANONYMOUS_USER: "/qr-visa/registerAnonymousUser",
  SEND_OTP_FOR_VISA: "/qr-visa/sendOtpForVisa",
  VERIFY_OTP_FOR_VISA: "/qr-visa/verifyOtpForVisa",
} as const;
