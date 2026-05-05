import type { ModuleBootstrap } from "../../lib/module-registry";
import type { ApplyVisaInitialData } from "../../queries/apply-visa";
import type { ApplyVisaActions } from "./types";
import { ApplyVisaClient } from "./apply-visa-client";

export function ApplyVisaFlow({
  actions,
  bootstrap,
  initialData,
  uploadDocumentEndpoint,
}: {
  actions: ApplyVisaActions;
  bootstrap: ModuleBootstrap;
  initialData: ApplyVisaInitialData;
  uploadDocumentEndpoint?: string;
}) {
  return (
    <ApplyVisaClient
      actions={actions}
      bootstrap={bootstrap}
      initialData={initialData}
      uploadDocumentEndpoint={uploadDocumentEndpoint}
    />
  );
}
