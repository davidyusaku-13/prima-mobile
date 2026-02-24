import { describe, expect, it } from 'bun:test';

import { createApiClient } from './client';
import { ApiClientError } from './types';

describe('api client', () => {
  it('classifies token retrieval failures separately from network failures', async () => {
    const originalApiUrl = process.env.EXPO_PUBLIC_API_URL;
    process.env.EXPO_PUBLIC_API_URL = 'https://api.example.com';
    const tokenFailure = new Error('token provider failed');

    try {
      const client = createApiClient({
        getToken: async () => {
          throw tokenFailure;
        },
        fetchImpl: async () => {
          throw new Error('network should not be called');
        },
      });

      let thrown: unknown;
      try {
        await client.get('/admin');
      } catch (error) {
        thrown = error;
      }

      expect(thrown instanceof ApiClientError).toBe(true);
      const apiError = thrown as ApiClientError;
      expect(apiError.kind).toBe('token');
      expect(apiError.path).toBe('/admin');
      expect(apiError.cause).toBe(tokenFailure);
    } finally {
      process.env.EXPO_PUBLIC_API_URL = originalApiUrl;
    }
  });

  it('treats non-json success responses as invalid-response errors', async () => {
    const originalApiUrl = process.env.EXPO_PUBLIC_API_URL;
    process.env.EXPO_PUBLIC_API_URL = 'https://api.example.com';

    try {
      const client = createApiClient({
        getToken: async () => 'token-123',
        fetchImpl: async () =>
          new Response('ok', {
            status: 200,
            headers: { 'Content-Type': 'text/plain' },
          }),
      });

      let thrown: unknown;
      try {
        await client.get('/admin');
      } catch (error) {
        thrown = error;
      }

      expect(thrown instanceof ApiClientError).toBe(true);
      const apiError = thrown as ApiClientError;
      expect(apiError.kind).toBe('invalid-response');
      expect(apiError.status).toBe(200);
      expect(apiError.path).toBe('/admin');
    } finally {
      process.env.EXPO_PUBLIC_API_URL = originalApiUrl;
    }
  });

  it('treats AbortError-shaped errors as timeout errors', async () => {
    const originalApiUrl = process.env.EXPO_PUBLIC_API_URL;
    process.env.EXPO_PUBLIC_API_URL = 'https://api.example.com';

    const abortLikeError = new Error('aborted');
    abortLikeError.name = 'AbortError';

    try {
      const client = createApiClient({
        getToken: async () => 'token-123',
        fetchImpl: async () => {
          throw abortLikeError;
        },
      });

      let thrown: unknown;
      try {
        await client.get('/admin');
      } catch (error) {
        thrown = error;
      }

      expect(thrown instanceof ApiClientError).toBe(true);
      const apiError = thrown as ApiClientError;
      expect(apiError.kind).toBe('timeout');
      expect(apiError.path).toBe('/admin');
      expect(apiError.cause).toBe(abortLikeError);
    } finally {
      process.env.EXPO_PUBLIC_API_URL = originalApiUrl;
    }
  });
});
