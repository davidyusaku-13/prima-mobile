import { createApiClient, type CreateApiClientOptions } from './client';
import type { AdminHealthResponse, AdminRootResponse, AdminUsersResponse } from './types';

export interface CreateAdminApiOptions extends CreateApiClientOptions {}

export function mapAdminUnauthorized(status: number): boolean {
  return status === 401 || status === 403;
}

export function createAdminApi(options: CreateAdminApiOptions) {
  const client = createApiClient(options);

  return {
    getAdmin: () => client.get<AdminRootResponse>('/admin'),
    getHealth: () => client.get<AdminHealthResponse>('/admin/health'),
    getUsers: () => client.get<AdminUsersResponse>('/admin/users'),
  };
}
