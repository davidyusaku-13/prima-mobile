export type ApiErrorKind = 'config' | 'token' | 'network' | 'timeout' | 'http' | 'invalid-response';

export interface ApiErrorDetails {
  kind: ApiErrorKind;
  message: string;
  status?: number;
  path?: string;
  cause?: unknown;
}

export class ApiClientError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;
  readonly path?: string;
  readonly cause?: unknown;

  constructor(details: ApiErrorDetails) {
    super(details.message);
    this.name = 'ApiClientError';
    this.kind = details.kind;
    this.status = details.status;
    this.path = details.path;
    this.cause = details.cause;
  }
}

export interface AdminRootResponse {
  status?: string;
  section?: string;
  [key: string]: unknown;
}

export interface AdminHealthResponse {
  status?: string;
  db?: string;
  started_at?: string;
  checked_at?: string;
  uptime_seconds?: number;
  [key: string]: unknown;
}

export interface AdminUser {
  clerk_id?: string;
  name?: string;
  email?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  is_active?: boolean;
  [key: string]: unknown;
}

export type AdminUsersResponse = AdminUser[];
