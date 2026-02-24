import { describe, expect, it } from 'bun:test';

import { ApiClientError } from '@/lib/api/types';

import { isUnauthorizedAdminError, shouldProbeAdminAccess } from './use-admin-access';

describe('admin tab visibility', () => {
  it('probes admin access only when all preconditions are met', () => {
    expect(shouldProbeAdminAccess({ isLoaded: true, userId: 'user_123', hasAdminTab: true })).toBe(true);
    expect(shouldProbeAdminAccess({ isLoaded: false, userId: 'user_123', hasAdminTab: true })).toBe(false);
    expect(shouldProbeAdminAccess({ isLoaded: true, userId: null, hasAdminTab: true })).toBe(false);
    expect(shouldProbeAdminAccess({ isLoaded: true, userId: 'user_123', hasAdminTab: false })).toBe(false);
  });

  it('treats 401 and 403 API errors as unauthorized', () => {
    expect(isUnauthorizedAdminError(httpError(401))).toBe(true);
    expect(isUnauthorizedAdminError(httpError(403))).toBe(true);
  });

  it('does not treat non-auth failures as unauthorized', () => {
    expect(isUnauthorizedAdminError(httpError(500))).toBe(false);
    expect(isUnauthorizedAdminError(new Error('network'))).toBe(false);
  });
});

function httpError(status: number): ApiClientError {
  return new ApiClientError({
    kind: 'http',
    status,
    path: '/admin',
    message: `Request failed with status ${status}`,
  });
}
