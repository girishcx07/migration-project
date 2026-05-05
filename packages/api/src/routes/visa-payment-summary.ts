import type { BaseAPIResponse, DataStatusType } from "@repo/types";
import type {
  GenerateOTPForAnonymousUserResponse,
  GetApplicableChildAgeForDestinationResponse,
  GetPaymentModesResponse,
  GetTokenResponse,
  GetVisaeroStripePaymentTokenResponse,
  GetVisaPaymentSumaryResponse,
  GetWalletBalanceResponse,
  submitApplicationResponse,
  updateGroupMembershipResponse,
  UpdatePaymentProcessingStatusResponse,
  UpdateUserDetailsResponse,
  VerifyOtpForAnonymousUserResponse,
} from "@repo/types/payment-summary";

import type { ApiClient } from "../fetcher";
import type { UserHostPayload } from "../route-utils";
import { SERVICES } from "../services";

export const DEFAULT_COUNTRY_DATA = {
  country: "INDIA",
  countryName: "India",
  countryCode: "IN",
  city: "PUNE",
  cityName: "Pune",
  state: "MAHARASHTRA",
  stateCode: "MH",
  currency: "INR",
  currencyCode: "INR",
  currencySymbol: "INR",
  countryFlag: "IN",
  countryFlagEmoji: "IN",
} as const;

export type ModuleType = "qr-visa" | "b2b" | "evm";

export interface GetVisaeroStripeTokenInput {
  applicationId: string;
  successUrl?: string;
  cancelUrl?: string;
}

export interface GetVisaeroPaymentSummaryInput {
  currency: string;
  applicationId: string;
  childApplicantIds?: string[];
  moduleType?: ModuleType;
}

export type UpdateGroupMembershipInput = UserHostPayload & {
  application_id: string;
  group_membership: {
    applicant_id: string;
    name?: string;
    relation?: string;
    head_of_family?: string;
    HOF_id?: string;
    no_of_applicants?: number;
  }[];
  workflow?: string;
};

export type GenerateOtpForAnonymousUserInput = UserHostPayload & {
  email: string;
  moduleType?: ModuleType;
};

export interface UpdateUserDetailsInput {
  userId: string;
  applicationId: string;
  contactDetails: {
    first_name: string;
    last_name: string;
    mobile_no: string;
    email: string;
    country_code: string;
  };
}

export type VerifyOtpForAnonymousUserInput = UserHostPayload & {
  application_id: string;
  otp: string;
  email: string;
  moduleType?: ModuleType;
};

export interface UpdatePaymentProcessingStatusInput {
  userId: string;
  applicationId: string;
  payment_gateway: string;
  txStatus: string;
  qr_track_url?: string;
}

export interface GetPaymentModesInput {
  userId: string;
  currency: string;
  type: string;
}

export interface GetPaymentModeTokenInput {
  userId: string;
  application_id: string;
  type: string;
  payment_config_id: string;
  ui_mode?: string;
}

export type PaymentConfigInput = UserHostPayload & {
  application_id: string;
  type: string;
  payment_config_id: string;
};

export type PostSubmitApplicationInput = PaymentConfigInput & {
  payment_reference_id?: string;
};

export type GetApplicableChildAgeForDestinationInput = UserHostPayload & {
  destination_cioc: string;
};

export function createVisaPaymentSummaryRoutes(api: ApiClient) {
  return {
    async getVisaeroStripeToken(input: GetVisaeroStripeTokenInput) {
      const response = await api.post<GetVisaeroStripePaymentTokenResponse>(
        SERVICES.GET_VISAERO_STRIPE_PAYMENT_TOKEN_EVM,
        {
          application_id: input.applicationId,
          country: DEFAULT_COUNTRY_DATA.countryName,
          city: DEFAULT_COUNTRY_DATA.cityName,
          success_url: input.successUrl ?? "/payment-success",
          cancel_url: input.cancelUrl ?? "/payment-cancel",
          type: "visa",
        },
        { raw: true },
      );

      return {
        data: response,
        status: "success" as DataStatusType,
      };
    },

    async getVisaeroPaymentSummary(input: GetVisaeroPaymentSummaryInput) {
      const moduleType = input.moduleType ?? "b2b";
      const apiPath =
        moduleType === "qr-visa"
          ? SERVICES.GET_VISA_PAYMENT_SUMMARY_FOR_B2C
          : SERVICES.GET_VISA_PAYMENT_SUMMARY_NEW;

      const response = await api.get<
        BaseAPIResponse<GetVisaPaymentSumaryResponse>
      >(apiPath, {
        query: {
          applicationId: input.applicationId,
          paymentMethod: "online",
          orderCurrency: input.currency,
          type: moduleType === "qr-visa" ? "qr_app" : "apply_new_visa",
          selectedCurrency: input.currency,
          source: moduleType === "qr-visa" ? "qr_app" : "evm",
          child_applicants_ids: JSON.stringify(input.childApplicantIds ?? []),
        },
        raw: true,
      });

      return {
        data: response.dataobj,
        status: response.data,
      };
    },

    async updateGroupMembershipForApplication(
      input: UpdateGroupMembershipInput,
    ) {
      const apiPath =
        input.workflow === "qr-visa"
          ? SERVICES.UPDATE_GROUP_MEMBERSHIP_FOR_APPLICATION_B2C
          : SERVICES.UPDATE_GROUP_MEMBERSHIP_FOR_APPLICATION;

      const response = await api.post<updateGroupMembershipResponse>(
        apiPath,
        {
          application_id: input.application_id,
          group_membership: input.group_membership,
          workflow: input.workflow,
          user_id: input.userId,
          host: input.host,
        },
        { raw: true },
      );

      return {
        data: response.data === "success" ? response.msg : response.data,
        status: response.data,
      };
    },

    async generateOtpForAnonymousUser(input: GenerateOtpForAnonymousUserInput) {
      const moduleType = input.moduleType ?? "qr-visa";
      const apiPath =
        moduleType === "qr-visa"
          ? SERVICES.GENERATE_QR_VISA_OTP_FOR_ANONYMOUS_USER
          : SERVICES.GENERATE_OTP_FOR_ANONYMOUS_USER;

      const response = await api.post<GenerateOTPForAnonymousUserResponse>(
        apiPath,
        {
          email: input.email,
          host: input.host,
          user_id: input.userId,
        },
        { raw: true },
      );

      return {
        msg: response.msg,
        status: response.data,
      };
    },

    async updateUserDetails(input: UpdateUserDetailsInput) {
      const response = await api.post<UpdateUserDetailsResponse>(
        SERVICES.UPDATE_USER_DETAILS,
        {
          application_id: input.applicationId,
          contact_details: input.contactDetails,
          user_id: input.userId,
        },
        { raw: true },
      );

      return {
        data: response.msg,
        status: response.data,
      };
    },

    async verifyOtpForAnonymousUser(input: VerifyOtpForAnonymousUserInput) {
      const moduleType = input.moduleType ?? "qr-visa";
      const apiPath =
        moduleType === "qr-visa"
          ? SERVICES.VERIFY_QR_VISA_OTP_FOR_ANONYMOUS_USER
          : SERVICES.VERIFY_OTP_FOR_ANONYMOUS_USER;

      const response = await api.post<VerifyOtpForAnonymousUserResponse>(
        apiPath,
        {
          application_id: input.application_id,
          otp: input.otp,
          email: input.email,
          host: input.host,
          user_id: input.userId,
        },
        { raw: true },
      );

      return {
        data: response.dataobj,
        msg:
          response.msg ||
          (response.data === "success"
            ? "OTP verified successfully"
            : "OTP verification failed"),
        status: response.data,
      };
    },

    async updatePaymentProcessingStatus(
      input: UpdatePaymentProcessingStatusInput,
    ) {
      const response = await api.post<UpdatePaymentProcessingStatusResponse>(
        SERVICES.UPDATE_PAYMENT_PROCESSING_STATUS,
        {
          applicationId: input.applicationId,
          payment_gateway: input.payment_gateway,
          txStatus: input.txStatus,
          qr_track_url: input.qr_track_url,
          user_id: input.userId,
        },
        { raw: true },
      );

      return {
        data: response,
        status: "success" as DataStatusType,
      };
    },

    async getPaymentModes(input: GetPaymentModesInput) {
      const response = await api.post<GetPaymentModesResponse>(
        SERVICES.GET_PAYMENT_MODES,
        {
          currency: input.currency,
          type: input.type,
          user_id: input.userId,
        },
        { raw: true },
      );

      return { data: response, status: "success" as DataStatusType };
    },

    async getPaymentModeToken(input: GetPaymentModeTokenInput) {
      const response = await api.post<GetTokenResponse>(
        SERVICES.GET_TOKEN,
        {
          application_id: input.application_id,
          type: input.type,
          payment_config_id: input.payment_config_id,
          ui_mode: input.ui_mode,
          user_id: input.userId,
        },
        { raw: true },
      );

      return { data: response, status: "success" as DataStatusType };
    },

    async getWalletBalance(input: PaymentConfigInput) {
      const response = await api.post<GetWalletBalanceResponse>(
        SERVICES.GET_WALLET_BALANCE,
        {
          application_id: input.application_id,
          type: input.type,
          payment_config_id: input.payment_config_id,
          host: input.host,
          user_id: input.userId,
        },
        { raw: true },
      );

      return { data: response, status: "success" as DataStatusType };
    },

    async postSubmitApplication(input: PostSubmitApplicationInput) {
      const response = await api.post<submitApplicationResponse>(
        SERVICES.POST_SUBMIT_APPLICATION,
        {
          application_id: input.application_id,
          type: input.type,
          payment_config_id: input.payment_config_id,
          payment_reference_id: input.payment_reference_id,
          host: input.host,
          user_id: input.userId,
        },
        {
          raw: true,
          headers: {
            "session-user-id": input.userId,
          },
        },
      );

      return { data: response, status: "success" as DataStatusType };
    },

    async getApplicableChildAgeForDestination(
      input: GetApplicableChildAgeForDestinationInput,
    ) {
      const response = await api.get<{
        data: DataStatusType;
        dataobj: GetApplicableChildAgeForDestinationResponse;
      }>(SERVICES.GET_APPLICABLE_CHILD_AGE_FOR_DESTINATION, {
        query: {
          destination_cioc: input.destination_cioc,
          host: input.host,
          user_id: input.userId,
        },
        raw: true,
      });

      return {
        data: response.dataobj,
        status: response.data,
      };
    },
  };
}
