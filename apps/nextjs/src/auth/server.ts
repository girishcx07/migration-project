import type { NextRequest } from "next/server";
import { cookies } from "next/headers";

import type { Auth } from "@acme/validators/auth";
import { authSchema } from "@acme/validators/auth";

const authKeys = [
  "userId",
  "sessionId",
  "currency",
  "host",
  "accessToken",
  "email",
  "firstName",
  "lastName",
] as const satisfies readonly (keyof Auth)[];

export const getUserSession = async (): Promise<Auth | null> => {
  const cookieStore = await cookies();
  const session: Partial<Auth> = {};

  for (const key of authKeys) {
    const value = cookieStore.get(key)?.value;

    if (value !== undefined) {
      session[key] = value;
    }
  }

  const parsed = authSchema.safeParse(session);
  return parsed.success ? parsed.data : null;
};
