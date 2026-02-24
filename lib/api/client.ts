import { ApiClientError } from './types';

type AuthTokenProvider = () => Promise<string | null | undefined> | string | null | undefined;

type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export interface CreateApiClientOptions {
  getToken: AuthTokenProvider;
  baseUrl?: string;
  timeoutMs?: number;
  fetchImpl?: FetchLike;
}

export interface ApiClient {
  get<TResponse>(path: string): Promise<TResponse>;
}

const DEFAULT_TIMEOUT_MS = 10_000;

export function createApiClient(options: CreateApiClientOptions): ApiClient {
  const baseUrl = (options.baseUrl ?? process.env.EXPO_PUBLIC_API_URL ?? '').trim();
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const fetchImpl = options.fetchImpl ?? fetch;

  async function get<TResponse>(path: string): Promise<TResponse> {
    if (!baseUrl) {
      throw new ApiClientError({
        kind: 'config',
        message: 'EXPO_PUBLIC_API_URL is not configured',
        path,
      });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    let token: string | null | undefined;
    try {
      token = await options.getToken();
    } catch (error) {
      clearTimeout(timeoutId);
      throw new ApiClientError({
        kind: 'token',
        message: 'Failed to retrieve auth token',
        path,
        cause: error,
      });
    }

    try {
      const url = new URL(path, normalizeBaseUrl(baseUrl)).toString();
      const headers: HeadersInit = {
        Accept: 'application/json',
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetchImpl(url, {
        method: 'GET',
        headers,
        signal: controller.signal,
      });

      const payload = await parseJsonResponse(response, path);

      if (!response.ok) {
        throw new ApiClientError({
          kind: 'http',
          status: response.status,
          path,
          message: getErrorMessage(response.status, payload),
        });
      }

      return payload as TResponse;
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw error;
      }

      if (isAbortError(error)) {
        throw new ApiClientError({
          kind: 'timeout',
          message: `Request timed out after ${timeoutMs}ms`,
          path,
          cause: error,
        });
      }

      throw new ApiClientError({
        kind: 'network',
        message: 'Network request failed',
        path,
        cause: error,
      });
    } finally {
      clearTimeout(timeoutId);
    }
  }

  return {
    get,
  };
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
}

function isAbortError(error: unknown): boolean {
  if (error instanceof DOMException && error.name === 'AbortError') {
    return true;
  }

  if (!error || typeof error !== 'object') {
    return false;
  }

  const maybeError = error as { name?: unknown; code?: unknown };
  return (
    maybeError.name === 'AbortError' ||
    maybeError.code === 20 ||
    maybeError.code === 'ABORT_ERR'
  );
}

async function parseJsonResponse(response: Response, path: string): Promise<unknown> {
  const contentType = response.headers.get('content-type') ?? '';
  const hasJson = contentType.toLowerCase().includes('application/json');

  if (!hasJson) {
    if (response.ok) {
      throw new ApiClientError({
        kind: 'invalid-response',
        message: 'Expected a JSON response body',
        status: response.status,
        path,
      });
    }

    return null;
  }

  try {
    return await response.json();
  } catch (error) {
    throw new ApiClientError({
        kind: 'invalid-response',
        message: 'Response is not valid JSON',
        status: response.status,
        path,
        cause: error,
      });
  }
}

function getErrorMessage(status: number, payload: unknown): string {
  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    const message = record.message ?? record.error;
    if (typeof message === 'string' && message.length > 0) {
      return message;
    }
  }

  return `Request failed with status ${status}`;
}
