import { describe, expect, it } from 'bun:test';

import { createAdminApi, mapAdminUnauthorized } from './admin';

describe('admin api', () => {
  it('treats 401 and 403 as unauthorized', () => {
    expect(mapAdminUnauthorized(401)).toBe(true);
    expect(mapAdminUnauthorized(403)).toBe(true);
    expect(mapAdminUnauthorized(500)).toBe(false);
  });

  it('calls /admin/users with bearer token', async () => {
    const originalApiUrl = process.env.EXPO_PUBLIC_API_URL;
    process.env.EXPO_PUBLIC_API_URL = 'https://api.example.com';

    let requestUrl = '';
    let authHeader = '';

    try {
      const api = createAdminApi({
        getToken: async () => 'token-123',
        fetchImpl: async (input, init) => {
          requestUrl = String(input);
          authHeader = String((init?.headers as Record<string, string>)?.Authorization ?? '');

          return new Response(JSON.stringify([]), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        },
      });

      const response = await api.getUsers();

      expect(requestUrl).toBe('https://api.example.com/admin/users');
      expect(authHeader).toBe('Bearer token-123');
      expect(response).toEqual([]);
    } finally {
      process.env.EXPO_PUBLIC_API_URL = originalApiUrl;
    }
  });
});
