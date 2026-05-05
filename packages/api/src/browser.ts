import type { IpData } from "@repo/types";

import { SERVICES } from "./services";

export async function getClientIpData(options?: { signal?: AbortSignal }) {
  const response = await fetch(SERVICES.IP_API, {
    signal: options?.signal,
  });

  if (!response.ok) {
    throw new Error("Failed to load client IP data");
  }

  return (await response.json()) as IpData;
}
