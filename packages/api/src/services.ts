export const API_ENDPOINTS = {
  ENTERPRISE_ADMIN: {
    GET_ENTERPRISE_ACCOUNT_HOST_DETAILS:
      "/enterprise-admin/getEnterpriseAccountsHostDetails",
  },
  VDATA_SIM: {
    GET_DATA_SIM_REGION_COUNTRIES: "/vdata-sim/getDataSimRegionCountries",
    GET_DATA_SIM_PLANS: "/vdata-sim/getDataSimPlans",
    GET_DATASIM_APPLICATION_DETAILS: "/vdata-sim/getApplicationDetails",
    GET_DATASIM_COMPATIBLE_DEVICES: "/vdata-sim/getDataSimCompatibleDevices",
    CREATE_DATA_SIM_APPLICATION: "/vdata-sim/create-application",
    GET_DATASIM_PAYMENT_SUMMARY: "/vdata-sim/get-data-sim-payment-summary",
    GET_DATASIM_ENTERPRISE_ACCOUNT_CREDIT_FOR_APPLICATION:
      "/vdata-sim/get-enterprise-account-credit-for-application",
    GET_DATASIM_USER_APPLICATIONS: "/vdata-sim/getUserApplications",
    GET_DATASIM_READY_TO_PROCESS_APPLICATION:
      "/vdata-sim/getReadyToProcessApplications",
    GET_DATASIM_COMPLETED_APPLICATIONS: "/vdata-sim/getCompletedApplications",
    SEARCH_DATASIM_APPLICATIONS: "/vdata-sim/searchApplication",
    DOWNLOAD_DATA_SIM: "/vdata-sim/download-data-sim",
  },
  EXTERNAL_VISA: {
    INITIATE_CONSOLE_SESSION: "/external-visa/initiateConsoleSession",
    GET_EXTERNAL_AGENT_DETAILS: "/external-visa/getExternalAgentDetails",
    GET_EVM_REQUEST_DATA: "/external-visa/getEvmRequestData",
    VERIFY_EXTERNAL_USER_ID: "/external-visa/verifyExternalUserId",
    VERIFY_USER_TOKEN: "/external-visa/verifyUserToken",
  },
  QR_VISA: {
    REGISTER_ANONYMOUS_USER: "/qr-visa/registerAnonymousUser",
    SEND_OTP_FOR_VISA: "/qr-visa/sendOtpForVisa",
    VERIFY_OTP_FOR_VISA: "/qr-visa/verifyOtpForVisa",
  },
  VISA_ADMIN: {
    GET_NEWS_AND_UPDATES: "/visa-admin/getNewsAndUpdates",
    GET_NOTIFICATION: "/visa-admin/getAppNotifications",
    GET_NEW_DASHBOARD: "/visa-admin/getNewDashboardData",
    GET_SUPPORTED_CURRENCIES: "/visa-admin/getSupportedCurrencies",
    GET_DOCUMENT_TYPES: "/visa-admin/getDocumentTypes",
    UPDATE_APPLICANT_READY_STATUS: "/visa-admin/updateApplicantReadyStatus",
    ISSUE_INSURANCE: "/visa-admin/issueInsuranceForApplicant",
    UPDATE_PRICE_CHANGE_ACK: "/visa-admin/updatePriceChangeAck",
  },
  USER_ADMIN: {
    VERIFY_ADMIN_USER_SESSION: "/user-admin/verifyAdminUserSession",
    LOGIN: "/user-admin/login",
    FORGOT_PASSWORD: "/user-admin/generateOtpForResetPassword",
    GET_ROLE_PERMISSIONS: "/user-admin/getUserRole",
  },
  BRULE_ENGINE: {
    GET_NATIONALITIES: "/brule-engine/getNationalities",
    GET_ORIGIN: "/brule-engine/getOriginCountries",
    GET_TRAVELLING_TO: "/brule-engine/getTravellingTo",
  },
  VISA: {
    GET_VISA_OFFERS: "/visa/getVisaOffers",
    GET_VISA_DOCUMENTS: "/visa/getVisaDocuments",
    SAVE_VISA_FORM: "/visa/saveApplicantVisaForm",
    CREATE_APPLICATION_WITH_DOCUMENTS: "/visa/createApplicationWithDocuments",
    GET_APPLICATION_APPLICANT_DETAILS: "/visa/getApplicationApplicantsDetails",
    GET_VISA_FORM_FOR_APPLICANT: "/visa/getReviewFormForApplicant",
    ADD_APPLICANT: "/visa/addApplicant",
    DELETE_APPLICANT: "/visa/deleteApplicantFromApplication",
    GET_APPLICANT_DOCUMENT_DATA: "/visa/getApplicantDocumentData",
    LINK_APPLICANTS_DOCUMENT: "/visa/linkApplicantsDocument",
    LINK_APPLICANTS_DOCUMENT_NEW: "/visa/linkApplicantsDocumentNew",
    REMOVE_LINKED_APPLICANTS_DOCUMENT: "/visa/removelinkedApplicantsDocument",
    DELETE_DOCUMENT_FROM_POOL: "/visa/deleteDocumentFromPool",
    GET_VISA_PAYMENT_SUMMARY_NEW: "/visa/getVisaPaymentSummaryNew",
    GET_APPLICATION_DOCUMENTS_POOL: "/visa/getApplicationDocumentsPool",
    GET_MISSING_DOCUMENTS_FOR_APPLICATION:
      "/visa/getMissingDocumentsForApplication",
    BACK_ON_HOLD_APPLICATION:
      "/visa-admin/submitBackOnholdApplicationForProcessing",
    SEARCH_RAFF_APPLICANTS: "/visa-admin/searchApplicantsForRAFF",
    GET_APPLICABLE_CHILD_AGE_FOR_DESTINATION:
      "/visa/getApplicableChildAgeForDestination",
    UPDATE_GROUP_MEMBERSHIP_FOR_APPLICATION_B2C:
      "/visa/updateGroupMembershipForApplication",
  },
  TRACK_APPLICATIONS: {
    GET_MY_APPLICATIONS: "/visa/getUserApplication",
    GET_IN_PROGRESS_APPLICATIONS: "/visa-admin/getInProgressApplications",
    GET_COMPLETED_APPLICATIONS: "/visa-admin/getCompletedApplications",
    GET_HOLD_APPLICATIONS: "/visa-admin/getApplicationsOnHold",
    GET_ARCHIVED_APPLICATIONS: "/visa-admin/getArchivedApplications",
    GET_READY_FOR_SUBMIT_APPLICATIONS:
      "/visa-admin/getReadyToSubmitApplications",
    GET_REVIEW_APPLICATIONS:
      "/visa-admin/getPendingAdminVerificationApplications",
    GET_CONFIRM_PAYMENT_APPLICATIONS:
      "/visa-admin/getPendingFinanceApprovalApplications",
    GET_SEARCH_APPLICATIONS: "/visa-admin/getApplicantApplicationSearchData",
    GET_APPLICATION_ACTIVITIES: "/visa/getApplicationActivities",
    UPDATE_APPLICATION_STATE: "/visa-admin/changeApplicationStateBySupportUser",
    GET_USER_PROFILE_DETAILS: "/user-admin/getUserByUserId",
    ARCHIVE_APPLICATION: "/visa-admin/archiveApplication",
    RESTORE_APPLICATION: "/visa-admin/restoreArchivedApplication",
    ASSIGN_TO_ME: "/visa/assignApplication",
    MARK_AS_FIXED: "/visa-admin/markApplicantAsFixed",
    GET_NOTES_FOR_APPLICATION: "/notes/getNotesForApplication",
    ADD_COMMENT_ON_NOTE: "/notes/addCommentOnNote",
    ADD_NOTE_FOR_APPLICATION: "/notes/addNotesForApplication",
    UPLOAD_NOTE_DOCUMENT: "/notes/uploadDocuments",
    DOWNLOAD_APPLICANT_VISA: "/visa-admin/downloadEVisa",
    DOWNLOAD_BUNDELD_INSURANCE:
      "/visa-admin/downloadBundledInsuranceForApplicant",
    UPDATE_APPLICANT_FILE_NUMBER: "/visa-admin/updateApplicantFileNumber",
  },
  PROCESS_DOCUMENTS: {
    UPLOAD_AND_EXTRACT_DOCUMENTS: "/process-documents/uploadAndExtractDocument",
    UPDATE_APPLICANTS_EXTRACTED_DOCUMENT:
      "/process-documents/updateApplicantsExtractedDocument",
    UPLOAD_AND_EXTRACT_DOCUMENT_FOR_APPLICATION:
      "/process-documents/uploadAndExtractDocumentForApplication",
  },
  VISA_PAYMENT: {
    GET_VISA_PAYMENT_SUMMARY_FOR_B2C:
      "/visa-payment/getVisaPaymentSummaryForB2C",
    GET_VISAERO_STRIPE_PAYMENT_TOKEN_EVM:
      "/visa-payment/getVisaeroStripePaymentTokenEVM",
    UPDATE_GROUP_MEMBERSHIP_FOR_APPLICATION:
      "/visa-admin/updateGroupMembershipForApplication",
    GENERATE_QR_VISA_OTP_FOR_ANONYMOUS_USER:
      "/qr-visa/generateOtpForAnonymousUser",
    GENERATE_OTP_FOR_ANONYMOUS_USER:
      "/external-visa/generateOtpForAnonymousUser",
    VERIFY_QR_VISA_OTP_FOR_ANONYMOUS_USER: "/qr-visa/verifyOtpForAnonymousUser",
    VERIFY_OTP_FOR_ANONYMOUS_USER: "/external-visa/verifyOtpForAnonymousUser",
    UPDATE_USER_DETAILS: "/qr-visa/updateUserDetails",
    UPDATE_PAYMENT_PROCESSING_STATUS:
      "/visa-payment/updatePaymentProcessingStatus",
    GET_PAYMENT_MODES: "/visa-payment/v2/getPaymentModes",
    GET_TOKEN: "/visa-payment/v2/getToken",
    GET_WALLET_BALANCE: "/visa-payment/v2/getBalance",
    POST_SUBMIT_APPLICATION: "/visa-payment/v2/submitApplication",
  },
  EXTERNAL: {
    IP_API: "https://ipapi.co/json/",
    GET_ARABIC_TRANSLATION_AWS:
      "https://services.visaero.com/utils/getArabicTranslationAWS",
  },
} as const;

export const SERVICES = {
  ...API_ENDPOINTS.ENTERPRISE_ADMIN,
  ...API_ENDPOINTS.VISA_ADMIN,
  ...API_ENDPOINTS.USER_ADMIN,
  ...API_ENDPOINTS.BRULE_ENGINE,
  ...API_ENDPOINTS.VISA,
  ...API_ENDPOINTS.PROCESS_DOCUMENTS,
  ...API_ENDPOINTS.QR_VISA,
  ...API_ENDPOINTS.EXTERNAL,
  ...API_ENDPOINTS.EXTERNAL_VISA,
  ...API_ENDPOINTS.VISA_PAYMENT,
  ...API_ENDPOINTS.TRACK_APPLICATIONS,
  ...API_ENDPOINTS.VDATA_SIM,
};
