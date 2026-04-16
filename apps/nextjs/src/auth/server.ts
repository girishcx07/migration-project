import type { NextRequest } from "next/server";

import type { Auth } from "@acme/validators/auth";

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

export const getUserSession = (req: NextRequest): Partial<Auth> => {
  const session: Partial<Auth> = {};

  for (const key of authKeys) {
    const value = req.cookies.get(key)?.value;

    if (value !== undefined) {
      session[key] = value as Auth[typeof key];
    }
  }

  return session;
};
