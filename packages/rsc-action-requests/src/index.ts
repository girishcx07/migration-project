export const RSC_ACTION_ID_HEADER = "rsc-action-id";

const GLOBAL_MANAGER_KEY = "__visaeroRscActionRequests__";

export type PendingRscActionRequest = Readonly<{
  requestId: string;
  actionId: string;
  method: string;
  url: string;
  startedAt: number;
}>;

type PendingRequestRecord = PendingRscActionRequest & {
  controller: AbortController;
};

export type RscActionRequestListener = () => void;

export interface RscActionRequestManager {
  fetch(request: Request): Promise<Response>;
  getPending(): readonly PendingRscActionRequest[];
  subscribe(listener: RscActionRequestListener): () => void;
  cancel(requestId: string, reason?: unknown): boolean;
  cancelByActionId(actionId: string, reason?: unknown): number;
  cancelAll(reason?: unknown): number;
}

let fallbackRequestId = 0;

function createRequestId() {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `rsc-action-request-${++fallbackRequestId}`
  );
}

function createAbortReason(message: string) {
  return typeof DOMException === "function"
    ? new DOMException(message, "AbortError")
    : new Error(message);
}

function getSignalReason(signal: AbortSignal) {
  return "reason" in signal ? signal.reason : undefined;
}

function abortController(controller: AbortController, reason?: unknown) {
  if (controller.signal.aborted) {
    return false;
  }

  if (reason === undefined) {
    controller.abort();
  } else {
    controller.abort(reason);
  }

  return true;
}

function toSnapshot(request: PendingRequestRecord): PendingRscActionRequest {
  return {
    actionId: request.actionId,
    method: request.method,
    requestId: request.requestId,
    startedAt: request.startedAt,
    url: request.url,
  };
}

function createRscActionRequestManager(): RscActionRequestManager {
  const pendingRequests = new Map<string, PendingRequestRecord>();
  const listeners = new Set<RscActionRequestListener>();
  let snapshot: readonly PendingRscActionRequest[] = Object.freeze([]);

  function emit() {
    snapshot = Object.freeze(Array.from(pendingRequests.values(), toSnapshot));

    for (const listener of listeners) {
      listener();
    }
  }

  function addPendingRequest(request: PendingRequestRecord) {
    pendingRequests.set(request.requestId, request);
    emit();
  }

  function removePendingRequest(requestId: string) {
    if (pendingRequests.delete(requestId)) {
      emit();
    }
  }

  function cancelRecord(request: PendingRequestRecord, reason?: unknown) {
    const didCancel = abortController(
      request.controller,
      reason ?? createAbortReason("Server action request was cancelled."),
    );

    if (didCancel) {
      removePendingRequest(request.requestId);
    }

    return didCancel;
  }

  function cancelWhere(
    predicate: (request: PendingRequestRecord) => boolean,
    reason?: unknown,
  ) {
    const matchingRequests = Array.from(pendingRequests.values()).filter(
      predicate,
    );
    let cancelledCount = 0;

    for (const request of matchingRequests) {
      if (cancelRecord(request, reason)) {
        cancelledCount += 1;
      }
    }

    return cancelledCount;
  }

  async function rscActionFetch(request: Request): Promise<Response> {
    const actionId = request.headers.get(RSC_ACTION_ID_HEADER);

    if (!actionId) {
      return fetch(request);
    }

    const controller = new AbortController();
    const pendingRequest: PendingRequestRecord = {
      actionId,
      controller,
      method: request.method,
      requestId: createRequestId(),
      startedAt: Date.now(),
      url: request.url,
    };

    function forwardRouterAbort() {
      abortController(controller, getSignalReason(request.signal));
      removePendingRequest(pendingRequest.requestId);
    }

    addPendingRequest(pendingRequest);

    try {
      if (request.signal.aborted) {
        forwardRouterAbort();
      } else {
        request.signal.addEventListener("abort", forwardRouterAbort, {
          once: true,
        });
      }

      return await fetch(new Request(request, { signal: controller.signal }));
    } finally {
      request.signal.removeEventListener("abort", forwardRouterAbort);
      removePendingRequest(pendingRequest.requestId);
    }
  }

  return {
    fetch: rscActionFetch,
    getPending() {
      return snapshot;
    },
    subscribe(listener) {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
    cancel(requestId, reason) {
      const request = pendingRequests.get(requestId);

      if (!request) {
        return false;
      }

      return cancelRecord(request, reason);
    },
    cancelByActionId(actionId, reason) {
      return cancelWhere((request) => request.actionId === actionId, reason);
    },
    cancelAll(reason) {
      return cancelWhere(() => true, reason);
    },
  };
}

function getGlobalManager() {
  const globalStore = globalThis as typeof globalThis & Record<string, unknown>;
  const existingManager = globalStore[GLOBAL_MANAGER_KEY];

  if (existingManager) {
    return existingManager as RscActionRequestManager;
  }

  const manager = createRscActionRequestManager();
  globalStore[GLOBAL_MANAGER_KEY] = manager;

  return manager;
}

export const rscActionRequests = getGlobalManager();
