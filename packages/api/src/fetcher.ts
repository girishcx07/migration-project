import type { ZodTypeAny } from "zod";

export type ApiSuccess<T> = {
  success: true;
  data: T;
  msg?: string;
};

export type ApiFailure = {
  success: false;
  msg: string;
  errors?: unknown;
  statusCode?: number;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export type ApiError = {
  msg: string;
  statusCode: number;
  errors?: unknown;
};

export type QueryValue =
  | string
  | number
  | boolean
  | undefined
  | null
  | Array<string | number | boolean | null | undefined>;

export type QueryParams = Record<string, QueryValue>;

export type ApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type ApiRequestOptions<TBody = unknown> = Omit<
  RequestInit,
  "body" | "method" | "headers"
> & {
  baseUrl?: string;
  query?: QueryParams;
  headers?: HeadersInit;
  body?: TBody;
  requestSchema?: ZodTypeAny;
  responseSchema?: ZodTypeAny;
};

export type ApiClientContext = Record<string, unknown>;

export type ApiRequestContext<TContext extends ApiClientContext = {}> = {
  method: ApiMethod;
  path: string;
  url: string;
  options: ApiRequestOptions<unknown>;
  headers: Headers;
  body: BodyInit | undefined;
  context: TContext;
};

export type ApiMiddleware<
  TInContext extends ApiClientContext = {},
  TOutContext extends ApiClientContext = TInContext,
> = (
  ctx: ApiRequestContext<TInContext>,
) => Promise<ApiRequestContext<TOutContext>> | ApiRequestContext<TOutContext>;

export type RequestOptionsInput<TBody, TContext extends ApiClientContext> =
  | ApiRequestOptions<TBody>
  | ((ctx: ApiRequestContext<TContext>) => ApiRequestOptions<TBody>);

export type CreateApiClientOptions<TContext extends ApiClientContext = {}> = {
  baseUrl?: string;
  headers?: HeadersInit | (() => HeadersInit | Promise<HeadersInit>);
  middlewares?: ApiMiddleware<any, any>[];
  fetchFn?: typeof fetch;
  context?: TContext;
};

export type ApiClient<TContext extends ApiClientContext = {}> = {
  request<TResponse, TBody = unknown>(
    method: ApiMethod,
    path: string,
    input?: RequestOptionsInput<TBody, TContext>,
  ): Promise<TResponse>;

  get<TResponse>(
    path: string,
    input?: RequestOptionsInput<never, TContext>,
  ): Promise<TResponse>;

  delete<TResponse>(
    path: string,
    input?: RequestOptionsInput<never, TContext>,
  ): Promise<TResponse>;

  post<TResponse, TBody = unknown>(
    path: string,
    input?: RequestOptionsInput<TBody, TContext>,
  ): Promise<TResponse>;

  put<TResponse, TBody = unknown>(
    path: string,
    input?: RequestOptionsInput<TBody, TContext>,
  ): Promise<TResponse>;

  patch<TResponse, TBody = unknown>(
    path: string,
    input?: RequestOptionsInput<TBody, TContext>,
  ): Promise<TResponse>;

  withMiddleware<TNextContext extends ApiClientContext>(
    middleware: ApiMiddleware<TContext, TNextContext>,
  ): ApiClient<TNextContext>;

  withMiddlewares<TNextContext extends ApiClientContext>(
    ...middlewares: ApiMiddleware<any, any>[]
  ): ApiClient<TNextContext>;

  withContext<TNextContext extends ApiClientContext>(
    context: TNextContext,
  ): ApiClient<TNextContext>;
};

function buildUrl(path: string, query?: QueryParams) {
  const search = new URLSearchParams();

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) continue;

      if (Array.isArray(value)) {
        for (const item of value) {
          if (item !== undefined && item !== null) {
            search.append(key, String(item));
          }
        }
      } else {
        search.set(key, String(value));
      }
    }
  }

  const qs = search.toString();
  return qs ? `${path}?${qs}` : path;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Object.prototype.toString.call(value) === "[object Object]";
}

function isApiResponse<T>(value: unknown): value is ApiResponse<T> {
  if (!value || typeof value !== "object") return false;
  if (!("success" in value)) return false;

  const v = value as Record<string, unknown>;

  if (v.success === true) return "data" in v;
  if (v.success === false) return typeof v.msg === "string";

  return false;
}

function normalizeHeaders(headers?: HeadersInit) {
  return new Headers(headers ?? {});
}

function prepareBody(body: unknown, headers: Headers): BodyInit | undefined {
  if (body == null) return undefined;

  if (
    typeof body === "string" ||
    body instanceof FormData ||
    body instanceof URLSearchParams ||
    body instanceof Blob ||
    body instanceof ArrayBuffer ||
    body instanceof ReadableStream
  ) {
    return body as BodyInit;
  }

  if (Array.isArray(body) || isPlainObject(body)) {
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    return JSON.stringify(body);
  }

  return body as BodyInit;
}

async function parseResponseBody(response: Response): Promise<unknown> {
  if (response.status === 204) return null;

  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  try {
    return await response.text();
  } catch {
    return null;
  }
}

function toApiError(response: Response, payload: unknown): ApiError {
  if (payload && typeof payload === "object") {
    const maybe = payload as Partial<ApiFailure>;

    return {
      msg: typeof maybe.msg === "string" ? maybe.msg : "Request failed",
      statusCode:
        typeof maybe.statusCode === "number"
          ? maybe.statusCode
          : response.status,
      errors: maybe.errors,
    };
  }

  return {
    msg: "Request failed",
    statusCode: response.status,
    errors: payload,
  };
}

export function createApiClient<TContext extends ApiClientContext = {}>(
  config: CreateApiClientOptions<TContext> = {},
): ApiClient<TContext> {
  const fetchFn = config.fetchFn ?? fetch;

  async function request<TResponse, TBody = unknown>(
    method: ApiMethod,
    path: string,
    input?: RequestOptionsInput<TBody, TContext>,
  ): Promise<TResponse> {
    const initialBaseUrl = config.baseUrl ?? "";

    let ctx: ApiRequestContext<TContext> = {
      method,
      path,
      url: `${initialBaseUrl}${path}`,
      options: {},
      headers: new Headers(),
      body: undefined,
      context: (config.context ?? {}) as TContext,
    };

    const resolvedOptions =
      typeof input === "function" ? input(ctx) : (input ?? {});

    if (resolvedOptions.requestSchema) {
      resolvedOptions.requestSchema.parse(resolvedOptions.body);
    }

    const baseUrl = resolvedOptions.baseUrl ?? config.baseUrl ?? "";

    const globalHeaders =
      typeof config.headers === "function"
        ? await config.headers()
        : (config.headers ?? {});

    const headers = normalizeHeaders(globalHeaders);
    const localHeaders = normalizeHeaders(resolvedOptions.headers);

    localHeaders.forEach((value, key) => {
      headers.set(key, value);
    });

    const body = prepareBody(resolvedOptions.body, headers);

    ctx = {
      ...ctx,
      method,
      path,
      url: `${baseUrl}${buildUrl(path, resolvedOptions.query)}`,
      options: resolvedOptions as ApiRequestOptions<unknown>,
      headers,
      body,
    };

    for (const middleware of config.middlewares ?? []) {
      ctx = await middleware(ctx as never);
    }

    const requestInit: RequestInit = {
      method: ctx.method,
      headers: ctx.headers,
      body: ctx.body,
      cache: resolvedOptions.cache ?? "no-store",
      credentials: resolvedOptions.credentials,
      integrity: resolvedOptions.integrity,
      keepalive: resolvedOptions.keepalive,
      mode: resolvedOptions.mode,
      redirect: resolvedOptions.redirect,
      referrer: resolvedOptions.referrer,
      referrerPolicy: resolvedOptions.referrerPolicy,
      signal: resolvedOptions.signal,
      window: resolvedOptions.window,
    };

    const response = await fetchFn(ctx.url, requestInit);
    const payload = await parseResponseBody(response);

    if (!response.ok) {
      throw toApiError(response, payload);
    }

    if (!isApiResponse<TResponse>(payload)) {
      throw {
        msg: "Invalid API response format",
        statusCode: response.status,
        errors: payload,
      } satisfies ApiError;
    }

    if (!payload.success) {
      throw {
        msg: payload.msg,
        statusCode: payload.statusCode ?? response.status,
        errors: payload.errors,
      } satisfies ApiError;
    }

    const result = payload.data;

    if (resolvedOptions.responseSchema) {
      return resolvedOptions.responseSchema.parse(result) as TResponse;
    }

    return result as TResponse;
  }

  function withMiddleware<TNextContext extends ApiClientContext>(
    middleware: ApiMiddleware<TContext, TNextContext>,
  ): ApiClient<TNextContext> {
    return createApiClient<TNextContext>({
      ...config,
      middlewares: [...(config.middlewares ?? []), middleware],
      context: (config.context ?? {}) as TNextContext,
    });
  }

  function withMiddlewares<TNextContext extends ApiClientContext>(
    ...middlewares: ApiMiddleware<any, any>[]
  ): ApiClient<TNextContext> {
    return createApiClient<TNextContext>({
      ...config,
      middlewares: [...(config.middlewares ?? []), ...middlewares],
      context: (config.context ?? {}) as TNextContext,
    });
  }

  function withContext<TNextContext extends ApiClientContext>(
    context: TNextContext,
  ): ApiClient<TNextContext> {
    return createApiClient<TNextContext>({
      ...config,
      context,
    });
  }

  return {
    request,

    get<TResponse>(path: string, input?: RequestOptionsInput<never, TContext>) {
      return request<TResponse, never>("GET", path, input);
    },

    delete<TResponse>(
      path: string,
      input?: RequestOptionsInput<never, TContext>,
    ) {
      return request<TResponse, never>("DELETE", path, input);
    },

    post<TResponse, TBody = unknown>(
      path: string,
      input?: RequestOptionsInput<TBody, TContext>,
    ) {
      return request<TResponse, TBody>("POST", path, input);
    },

    put<TResponse, TBody = unknown>(
      path: string,
      input?: RequestOptionsInput<TBody, TContext>,
    ) {
      return request<TResponse, TBody>("PUT", path, input);
    },

    patch<TResponse, TBody = unknown>(
      path: string,
      input?: RequestOptionsInput<TBody, TContext>,
    ) {
      return request<TResponse, TBody>("PATCH", path, input);
    },

    withMiddleware,
    withMiddlewares,
    withContext,
  };
}
