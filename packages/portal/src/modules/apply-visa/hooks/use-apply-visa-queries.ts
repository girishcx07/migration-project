import { useCallback, useMemo, useRef, useState } from "react";

import { rscActionRequests } from "@repo/rsc-action-requests";

import type { LatestActionTask } from "../types/apply-visa.types";

export function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

export function useLatestClientTask(
  actionGroup: string,
  startTransition: (callback: () => void) => void,
) {
  const [isRunning, setIsRunning] = useState(false);
  const activeTaskRef = useRef<{
    controller: AbortController;
    key: string;
  } | null>(null);
  const lastKeyRef = useRef<string | null>(null);

  const abort = useCallback(() => {
    activeTaskRef.current?.controller.abort();
    activeTaskRef.current = null;
    lastKeyRef.current = null;
    setIsRunning(false);
    rscActionRequests.cancelAll(
      new DOMException(`${actionGroup} was cancelled.`, "AbortError"),
    );
  }, [actionGroup]);

  const run = useCallback(
    (key: string, task: LatestActionTask) => {
      if (lastKeyRef.current === key) return;

      activeTaskRef.current?.controller.abort(
        new DOMException(`${actionGroup} was superseded.`, "AbortError"),
      );

      const controller = new AbortController();
      const activeTask = { controller, key };
      activeTaskRef.current = activeTask;
      lastKeyRef.current = key;
      setIsRunning(true);

      startTransition(() => {
        void (async () => {
          const isCurrent = () =>
            activeTaskRef.current === activeTask &&
            lastKeyRef.current === key &&
            !controller.signal.aborted;

          try {
            await task({
              isCurrent,
              runAction: (callback) => callback(),
              signal: controller.signal,
            });
          } catch (error) {
            if (!isAbortError(error)) {
              throw error;
            }
          } finally {
            if (activeTaskRef.current === activeTask) {
              activeTaskRef.current = null;
              setIsRunning(false);
            }
          }
        })();
      });
    },
    [actionGroup, startTransition],
  );

  return useMemo(() => ({ abort, isRunning, run }), [abort, isRunning, run]);
}
