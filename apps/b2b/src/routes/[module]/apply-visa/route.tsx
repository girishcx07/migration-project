import type { ModuleName } from "@/lib/module-registry";
import { Suspense } from "react";
import { redirect } from "react-router";

import {
  ApplyVisaFlow,
  ApplyVisaSkeleton,
} from "@repo/portal/modules/apply-visa";

import { ModuleProviders } from "@/components/module-providers";
import { createEnterpriseThemeCss } from "@/lib/theme";
import { getApplyVisaData } from "@/server/apply-visa";
import { getEnterpriseDataForModule } from "@/server/enterprise";
import { getModuleBootstrap } from "@/server/module-bootstrap";
import { getModuleFromPath } from "@/server/route-params";
import {
  acknowledgeApplyVisaPriceChangeAction,
  createApplyVisaApplicationAction,
  getApplyVisaDocumentsAction,
  getApplyVisaOffersAction,
  getApplyVisaTravellingToAction,
  searchApplyVisaRaffApplicationAction,
  uploadApplyVisaDocumentAction,
} from "./actions";

export default function Component() {
  const module = getModuleFromPath();

  return (
    <Suspense fallback={<ApplyVisaSkeleton />}>
      <ApplyVisaRouteContent module={module} />
    </Suspense>
  );
}

export function HydrateFallback() {
  return <ApplyVisaSkeleton />;
}

async function ApplyVisaRouteContent({
  module,
}: Readonly<{
  module: ModuleName;
}>) {
  const bootstrap = getModuleBootstrap(module, "apply-visa");
  const initialData = await getApplyVisaData(module);

  if (!initialData.data) {
    throw redirect(`/${module}/unauthorized`);
  }

  const enterprise = await getEnterpriseDataForModule(module);
  const themeCss = createEnterpriseThemeCss(enterprise.data?.theme_config);

  return (
    <ModuleProviders
      domainHost={enterprise.domainHost}
      enterprise={enterprise.data}
      module={module}
    >
      {themeCss ? (
        <style dangerouslySetInnerHTML={{ __html: themeCss }} />
      ) : null}
      <ApplyVisaFlow
        actions={{
          acknowledgePriceChange: acknowledgeApplyVisaPriceChangeAction,
          createApplication: createApplyVisaApplicationAction,
          getTravellingTo: getApplyVisaTravellingToAction,
          getVisaDocuments: getApplyVisaDocumentsAction,
          getVisaOffers: getApplyVisaOffersAction,
          searchRaffApplication: searchApplyVisaRaffApplicationAction,
          uploadDocument: uploadApplyVisaDocumentAction,
        }}
        bootstrap={bootstrap}
        initialData={initialData.data}
      />
    </ModuleProviders>
  );
}
