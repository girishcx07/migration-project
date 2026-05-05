"use server";

import { initializeModuleSession as initializeModuleSessionImpl } from "@/server/module-initialization";

export async function initializeModuleSession(
  ...args: Parameters<typeof initializeModuleSessionImpl>
) {
  return initializeModuleSessionImpl(...args);
}
