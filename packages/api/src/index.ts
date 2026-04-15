import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

import type { AppRouter } from "./root";

/**
 * Inference helpers for input types
 * @example
 * type PostByIdInput = RouterInputs['post']['byId']
 *      ^? { id: number }
 */
type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helpers for output types
 * @example
 * type AllPostsOutput = RouterOutputs['post']['all']
 *      ^? Post[]
 */
type RouterOutputs = inferRouterOutputs<AppRouter>;

export { type AppRouter, appRouter } from "./root";
export { createTRPCContext } from "./trpc";
export type { RouterInputs, RouterOutputs };

/**
 * This is the primary export for the API package, which includes the tRPC API client and related types.
 * You can add other exports here as needed, such as utility functions, types, etc.
 * This file serves as the main entry point for the API package, so anything that should be accessible to consumers of the API package can be exported here.
 * @example
 *  createApiClient() can be used to create a new API client instance, which can then be used to make requests to the API.
 *  The ApiResponse type can be used to type the responses from the API client, which can be either a success or a failure response.
 *  You can also export other types related to the API client, such as ApiClientContext, CreateApiClientOptions, etc.
 *  This allows consumers of the API package to have access to all the necessary types and functions for working with the API client in one place.
 **/

export { createApiClient } from "./fetcher";
export type {
  ApiClient,
  ApiClientContext,
  CreateApiClientOptions,
} from "./fetcher";
