import { createServerFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";

import type { Auth } from "@acme/validators/auth";

const auth = [
  "userId",
  "sessionId",
  "currency",
  "host",
  "accessToken",
  "email",
  "firstName",
  "lastName",
] as const satisfies (keyof Auth)[];

export const getUserSession = createServerFn().handler(() => {
  const session: Partial<Auth> = {};

  auth.forEach((key) => {
    const value = getCookie(key);
    if (value) {
      session[key] = value;
    }
  });
  return session as Auth;
});
