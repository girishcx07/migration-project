export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  VITE_APP_NAME: process.env.VITE_APP_NAME ?? "TanStack Start Template",
} as const;
