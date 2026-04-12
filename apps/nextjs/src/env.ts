export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  VERCEL_ENV: process.env.VERCEL_ENV ?? "development",
} as const;
