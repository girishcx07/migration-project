"use server";

import type {
  ApplyVisaCreateApplicationInput,
  ApplyVisaDocumentsInput,
  ApplyVisaOffersInput,
  ApplyVisaRaffSearchInput,
  ApplyVisaTravellingToInput,
} from "@repo/portal/modules/apply-visa";

import { isModuleName } from "@/lib/module-registry";
import { createServerApi } from "@/server/api";
import { getApplyVisaSession } from "@/server/apply-visa";
import { getServerRequest } from "@/server/request";

function assertModule(module: string) {
  if (!isModuleName(module)) {
    throw new Error("Invalid module");
  }

  return module;
}

function getSession(module: string) {
  const moduleName = assertModule(module);
  const session = getApplyVisaSession(moduleName);

  if (!session) {
    throw new Error("Apply visa session is not available");
  }

  return {
    moduleName,
    session,
  };
}

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

export async function getApplyVisaTravellingToAction(
  input: ApplyVisaTravellingToInput,
) {
  const { session } = getSession(input.module);
  const api = createServerApi();

  return api.newVisa.getTravellingTo({
    host: session.host,
    nationality: input.nationality,
    origin: input.origin,
    userId: session.userId,
  });
}

export async function getApplyVisaOffersAction(input: ApplyVisaOffersInput) {
  const { session } = getSession(input.module);
  const api = createServerApi();

  return api.newVisa.getVisaOffers({
    currency: input.currency,
    host: session.host,
    managedBy: input.managedBy,
    travellingTo: input.travellingTo,
    travellingToIdentity: input.travellingToIdentity,
    type: input.type,
    userId: session.userId,
  });
}

export async function getApplyVisaDocumentsAction(
  input: ApplyVisaDocumentsInput,
) {
  const { session } = getSession(input.module);
  const api = createServerApi();

  return api.newVisa.getVisaDocuments({
    host: session.host,
    travellingToIdentity: input.travellingToIdentity,
    visaId: input.visaId,
  });
}

export async function uploadApplyVisaDocumentAction(formData: FormData) {
  const moduleName = getFormString(formData, "module");
  const { session } = getSession(moduleName);
  const document = formData.get("document");
  const nationalityCode = getFormString(formData, "nationalityCode");
  const visaId = getFormString(formData, "visaId");

  if (!(document instanceof File) || !nationalityCode || !visaId) {
    return {
      data: null,
      msg: "Document upload payload is incomplete.",
      status: "error" as const,
    };
  }

  const api = createServerApi();

  return api.newVisa.uploadAndExtractDocuments({
    document,
    host: session.host,
    nationalityCode,
    signal: getServerRequest().signal,
    userId: session.userId,
    visaId,
  });
}

export async function createApplyVisaApplicationAction(
  input: ApplyVisaCreateApplicationInput,
) {
  const { session } = getSession(input.module);
  const api = createServerApi();

  return api.newVisa.createApplicationWithDocuments({
    ...input,
    evmRequestId: session.evmRequestId,
    host: session.host,
    userId: session.userId,
  });
}

export async function searchApplyVisaRaffApplicationAction(
  input: ApplyVisaRaffSearchInput,
) {
  const { session } = getSession(input.module);
  const api = createServerApi();

  return api.newVisa.searchRaffApplication({
    host: session.host,
    searchText: input.searchText,
    userId: session.userId,
  });
}

export async function acknowledgeApplyVisaPriceChangeAction(input: {
  module: string;
}) {
  const { session } = getSession(input.module);
  const api = createServerApi();

  return api.newVisa.updatePriceChangeAck({
    host: session.host,
    userId: session.userId,
  });
}
