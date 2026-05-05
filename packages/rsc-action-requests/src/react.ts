"use client";

import { useSyncExternalStore } from "react";

import {
  rscActionRequests,
  type PendingRscActionRequest,
} from "./index";

const EMPTY_PENDING_REQUESTS: readonly PendingRscActionRequest[] =
  Object.freeze([]);

export function usePendingRscActionRequests() {
  return useSyncExternalStore(
    rscActionRequests.subscribe,
    rscActionRequests.getPending,
    () => EMPTY_PENDING_REQUESTS,
  );
}
