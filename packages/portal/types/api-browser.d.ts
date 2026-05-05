declare module "@repo/api/browser" {
  import type { IpData } from "@repo/types";

  export function getClientIpData(options?: {
    signal?: AbortSignal;
  }): Promise<IpData>;
}
