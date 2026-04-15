import { createApiClient } from "./fetcher";

export const api = createApiClient({
  baseUrl: process.env.API_BASE_URL,
});
