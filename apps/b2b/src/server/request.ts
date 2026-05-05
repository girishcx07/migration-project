import { unstable_getRequest as getRequest } from "react-router";

export function getServerRequest() {
  return getRequest();
}

export function getRequestUrl() {
  return new URL(getServerRequest().url);
}

export function getRequestHost() {
  return getServerRequest().headers.get("host");
}

export function getCookie(name: string) {
  const cookieHeader = getServerRequest().headers.get("cookie");

  if (!cookieHeader) return undefined;

  const match = cookieHeader
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${name}=`));

  return match
    ? decodeURIComponent(match.split("=").slice(1).join("="))
    : undefined;
}

export function getBearerHeaders() {
  const apiHeaders = new Headers();
  const accessToken = getCookie("accessToken");

  if (accessToken) {
    apiHeaders.set("Authorization", `Bearer ${accessToken}`);
  }

  return apiHeaders;
}
