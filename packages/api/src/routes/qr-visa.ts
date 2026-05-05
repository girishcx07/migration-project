import type {
  BaseAPIResponse,
  QRVisaRegisterAnonymousUserInput,
  QRVisaUser,
} from "@repo/types";
import type { Application } from "@repo/types/review";

import type { ApiClient } from "../fetcher";
import type { HostPayload } from "../route-utils";
import { SERVICES } from "../services";

export type SendOtpForVisaInput = HostPayload & {
  application_reference_code: string;
};

export type VerifyOtpForVisaInput = HostPayload & {
  application_id: string;
  otp: string;
};

type QrVisaUserApplication = Application & { user: QRVisaUser };

export interface QrVisaAnonymousSession {
  accessToken: string;
  defaultCurrency: string;
  host: string;
  refreshToken: string;
  sessionId: string;
  userId: string;
  userType: string;
}

function toQrVisaAnonymousSession(
  response: BaseAPIResponse<QRVisaRegisterAnonymousUserInput>,
) {
  const data = response.dataobj;
  const isValid =
    response.data === "success" &&
    Boolean(data?.host) &&
    Boolean(data?.accessToken) &&
    Boolean(data?.refreshToken) &&
    Boolean(data?._id) &&
    Boolean(data?.user_type) &&
    Boolean(data?.session_id);

  return {
    data: {
      accessToken: data?.accessToken ?? "",
      defaultCurrency: data?.user_preference.default_currency ?? "",
      host: data?.host ?? "",
      refreshToken: data?.refreshToken ?? "",
      sessionId: data?.session_id ?? "",
      userId: data?._id ?? "",
      userType: data?.user_type ?? "",
    },
    msg: response.msg,
    status: isValid ? ("success" as const) : ("error" as const),
  };
}

export function createQrVisaRoutes(api: ApiClient) {
  return {
    async registerAnonymousUser(input: HostPayload) {
      const response = await api.get<
        BaseAPIResponse<QRVisaRegisterAnonymousUserInput>
      >(SERVICES.REGISTER_ANONYMOUS_USER, {
        query: { host: input.host },
        raw: true,
      });

      return {
        data: response.dataobj,
        status: response.data,
        msg: response.msg,
      };
    },

    async registerAnonymousSession(input: HostPayload) {
      const response = await api.get<
        BaseAPIResponse<QRVisaRegisterAnonymousUserInput>
      >(SERVICES.REGISTER_ANONYMOUS_USER, {
        query: { host: input.host },
        raw: true,
      });

      return toQrVisaAnonymousSession(response);
    },

    async sendOtpForVisa(input: SendOtpForVisaInput) {
      const response = await api.post<BaseAPIResponse<Application>>(
        SERVICES.SEND_OTP_FOR_VISA,
        {
          application_reference_code: input.application_reference_code,
          host: input.host,
        },
        { raw: true },
      );

      return {
        data: response.data,
        msg: response.msg ?? "",
        dataobj: response.dataobj,
      };
    },

    async verifyOtpForVisa(input: VerifyOtpForVisaInput) {
      const response = await api.post<BaseAPIResponse<QrVisaUserApplication>>(
        SERVICES.VERIFY_OTP_FOR_VISA,
        {
          application_id: input.application_id,
          otp: input.otp,
          host: input.host,
        },
        { raw: true },
      );

      return {
        data: response.data,
        msg: response.msg ?? "",
        dataobj: response.dataobj,
      };
    },
  };
}
