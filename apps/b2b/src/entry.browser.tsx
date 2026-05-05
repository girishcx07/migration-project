import type { DataRouter } from "react-router";
import type { unstable_RSCPayload as RSCServerPayload } from "react-router/dom";
import { startTransition, StrictMode } from "react";
import {
  createFromReadableStream,
  createTemporaryReferenceSet,
  encodeReply,
  setServerCallback,
} from "@vitejs/plugin-rsc/browser";
import { hydrateRoot } from "react-dom/client";
import {
  unstable_createCallServer as createCallServer,
  unstable_getRSCStream as getRSCStream,
  unstable_RSCHydratedRouter as RSCHydratedRouter,
} from "react-router/dom";

import { rscActionRequests } from "@repo/rsc-action-requests";

const fetchRscAction: typeof rscActionRequests.fetch = (request) =>
  rscActionRequests.fetch(request);

// Create and set the callServer function to support post-hydration server actions.
setServerCallback(
  createCallServer({
    createFromReadableStream,
    createTemporaryReferenceSet,
    encodeReply,
    fetch: fetchRscAction,
  }),
);

// Get and decode the initial server payload
const rscStream = getRSCStream() as ReadableStream<Uint8Array>;
void createFromReadableStream<RSCServerPayload>(rscStream).then((payload) => {
  startTransition(async () => {
    const formState =
      payload.type === "render" ? await payload.formState : undefined;

    hydrateRoot(
      document,
      <StrictMode>
        <RSCHydratedRouter
          createFromReadableStream={createFromReadableStream}
          fetch={fetchRscAction}
          payload={payload}
        />
      </StrictMode>,
      {
        // @ts-expect-error - no types for this yet
        formState,
      },
    );
  });
});

if (import.meta.hot) {
  import.meta.hot.on("rsc:update", () => {
    void (
      window as unknown as { __reactRouterDataRouter: DataRouter }
    ).__reactRouterDataRouter.revalidate();
  });
}
