"use client";

import type { ModuleBootstrap } from "../../lib/module-registry";
import type { ApplyVisaInitialData } from "../../queries/apply-visa";
import type { ApplyVisaActions } from "./types";
import { ApplyVisaFlowContent } from "./apply-visa-flow";
import { ApplyVisaProvider } from "./providers/apply-visa-provider";

export function ApplyVisaClient({
  actions,
  bootstrap,
  initialData,
  uploadDocumentEndpoint,
}: Readonly<{
  actions: ApplyVisaActions;
  bootstrap: ModuleBootstrap;
  initialData: ApplyVisaInitialData;
  uploadDocumentEndpoint?: string;
}>) {
  return (
    <ApplyVisaProvider
      actions={actions}
      bootstrap={bootstrap}
      initialData={initialData}
      uploadDocumentEndpoint={uploadDocumentEndpoint}
    >
      <ApplyVisaFlowContent />
    </ApplyVisaProvider>
  );
}
