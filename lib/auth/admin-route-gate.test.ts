import { describe, expect, it } from 'bun:test';

import { getAdminRouteGateState } from './admin-route-gate';

describe('getAdminRouteGateState', () => {
  it('holds rendering while auth/admin probe is unresolved', () => {
    expect(
      getAdminRouteGateState({
        isLoaded: false,
        isAdmin: false,
        isAdminLoading: true,
      })
    ).toEqual({
      shouldRenderStack: false,
      redirectTo: null,
    });

    expect(
      getAdminRouteGateState({
        isLoaded: true,
        isAdmin: false,
        isAdminLoading: true,
      })
    ).toEqual({
      shouldRenderStack: false,
      redirectTo: null,
    });
  });

  it('redirects non-admin users to the public tab shell', () => {
    expect(
      getAdminRouteGateState({
        isLoaded: true,
        isAdmin: false,
        isAdminLoading: false,
      })
    ).toEqual({
      shouldRenderStack: true,
      redirectTo: '/(tabs)',
    });
  });

  it('allows admins to stay on admin routes', () => {
    expect(
      getAdminRouteGateState({
        isLoaded: true,
        isAdmin: true,
        isAdminLoading: false,
      })
    ).toEqual({
      shouldRenderStack: true,
      redirectTo: null,
    });
  });
});
