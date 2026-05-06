"use client";

import { useSyncExternalStore } from "react";

import type { PendingRscActionRequest } from "./index";
import { rscActionRequests } from "./index";

const EMPTY_PENDING_REQUESTS: readonly PendingRscActionRequest[] =
  Object.freeze([]);

export function usePendingRscActionRequests() {
  return useSyncExternalStore(
    (listener) => rscActionRequests.subscribe(listener),
    () => rscActionRequests.getPending(),
    () => EMPTY_PENDING_REQUESTS,
  );
}
