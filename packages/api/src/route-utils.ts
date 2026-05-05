import type {
  BaseAPIResponse,
  DataAndMsg,
  DataStatusType,
} from "@repo/types";

export interface HostPayload {
  host: string;
}

export interface UserPayload {
  userId: string;
}

export type UserHostPayload = HostPayload & UserPayload;

export interface CurrencyPayload {
  currency: string;
}

export interface RouteResponse<T> {
  data: T | null;
  status: DataStatusType;
  msg?: string;
}

export type FileLike = Blob & {
  name?: string;
};

export function toRouteResponse<T>(
  response: BaseAPIResponse<T>,
): RouteResponse<T> {
  return {
    data: response.dataobj ?? null,
    status: response.data,
    msg: response.msg,
  };
}

export function toDataAndMsgResponse<T = DataAndMsg>(response: DataAndMsg) {
  return {
    data: response as T,
    status: response.data,
    msg: response.msg,
  };
}

export function appendFile(formData: FormData, key: string, file: FileLike) {
  if (file.name) {
    formData.append(key, file, file.name);
    return;
  }

  formData.append(key, file);
}
