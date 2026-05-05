import { createVisaeroApi } from "@repo/api";

import { getBearerHeaders } from "@/server/request";

export function createServerApi(accessToken?: string) {
  return createVisaeroApi({
    headers: () => {
      const headers = getBearerHeaders();

      if (accessToken) {
        headers.set("Authorization", `Bearer ${accessToken}`);
      }

      return headers;
    },
  });
}
