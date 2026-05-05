export type ApiQuery = Record<
  string,
  string | number | boolean | null | undefined
>;

export interface ApiRequestOptions {
  query?: ApiQuery;
  headers?: HeadersInit;
  signal?: AbortSignal;
  raw?: boolean;
}

export type ApiClient = ReturnType<typeof createApiClient>;

export class ApiError extends Error {
  statusCode: number;
  errors?: unknown;

  constructor(message: string, statusCode: number, errors?: unknown) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

const appendQuery = (url: URL, query?: ApiQuery) => {
  if (!query) return;

  Object.entries(query).forEach(([key, value]) => {
    if (value === null || typeof value === "undefined") return;
    url.searchParams.set(key, String(value));
  });
};

const resolveUrl = (baseUrl: string, path: string) => {
  if (/^https?:\/\//.test(path)) return new URL(path);
  return new URL(path, baseUrl);
};

const readResponse = async (response: Response): Promise<unknown> => {
  const text = await response.text();
  if (!text) return undefined;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
};

export function createApiClient(
  options: {
    baseUrl?: string;
    credentials?: RequestCredentials;
    headers?: HeadersInit | (() => HeadersInit | Promise<HeadersInit>);
    fetchFn?: typeof fetch;
  } = {},
) {
  const baseUrl =
    options.baseUrl ??
    process.env.API_BASE_URL ??
    "https://services-uat.visaero.com";
  const fetchFn = options.fetchFn ?? fetch;

  async function request<TResponse>(
    method: string,
    path: string,
    requestOptions: ApiRequestOptions & { body?: unknown } = {},
  ): Promise<TResponse> {
    const url = resolveUrl(baseUrl, path);
    appendQuery(url, requestOptions.query);

    const headers = new Headers(
      typeof options.headers === "function"
        ? await options.headers()
        : options.headers,
    );
    new Headers(requestOptions.headers).forEach((value, key) => {
      headers.set(key, value);
    });

    let body: BodyInit | undefined;
    if (typeof requestOptions.body !== "undefined") {
      if (requestOptions.body instanceof FormData) {
        body = requestOptions.body;
      } else {
        body = JSON.stringify(requestOptions.body);
        headers.set("content-type", "application/json");
      }
    }

    const response = await fetchFn(url, {
      method,
      headers,
      body,
      credentials: options.credentials,
      signal: requestOptions.signal,
    });
    const payload = await readResponse(response);

    if (!response.ok) {
      throw new ApiError(
        response.statusText || "API request failed",
        response.status,
        payload,
      );
    }

    if (
      !requestOptions.raw &&
      payload &&
      typeof payload === "object" &&
      "data" in payload &&
      (payload as { data?: unknown }).data === "success" &&
      "dataobj" in payload
    ) {
      return (payload as { dataobj: TResponse }).dataobj;
    }

    if (
      !requestOptions.raw &&
      payload &&
      typeof payload === "object" &&
      "data" in payload &&
      (payload as { data?: unknown }).data === "error"
    ) {
      throw new ApiError(
        "msg" in payload &&
          typeof (payload as { msg?: unknown }).msg === "string"
          ? (payload as { msg: string }).msg
          : "API request failed",
        response.status,
        payload,
      );
    }

    return payload as TResponse;
  }

  return {
    get: <TResponse>(path: string, options?: ApiRequestOptions) =>
      request<TResponse>("GET", path, options),
    post: <TResponse>(
      path: string,
      body?: unknown,
      options?: ApiRequestOptions,
    ) => request<TResponse>("POST", path, { ...options, body }),
  };
}

export function createBrowserApiClient(
  options: Omit<Parameters<typeof createApiClient>[0], "headers"> & {
    baseUrl: string;
    headers?: HeadersInit;
  },
) {
  return createApiClient(options);
}
