import { z } from "zod/v4";

export const authSchema = z.object({
  userId: z.string(),
  sessionId: z.string(),
  currency: z.string(),
  host: z.string(),
  accessToken: z.string(),
  email: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export type Auth = z.infer<typeof authSchema>;
