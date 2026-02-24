import { describe, expect, it } from 'bun:test';

import { getRootAuthGateState } from './root-auth-gate';

describe('getRootAuthGateState', () => {
  it('fails closed while auth is loading', () => {
    expect(
      getRootAuthGateState({
        isLoaded: false,
        isSignedIn: false,
        pathname: '/(tabs)',
      })
    ).toEqual({
      shouldRenderStack: false,
      redirectTo: null,
    });
  });

  it('redirects signed-out users away from protected routes', () => {
    expect(
      getRootAuthGateState({
        isLoaded: true,
        isSignedIn: false,
        pathname: '/(tabs)',
      })
    ).toEqual({
      shouldRenderStack: true,
      redirectTo: '/sign-in',
    });
  });

  it('keeps signed-out users on sign-in', () => {
    expect(
      getRootAuthGateState({
        isLoaded: true,
        isSignedIn: false,
        pathname: '/sign-in',
      })
    ).toEqual({
      shouldRenderStack: true,
      redirectTo: null,
    });
  });

  it('redirects signed-in users away from sign-in', () => {
    expect(
      getRootAuthGateState({
        isLoaded: true,
        isSignedIn: true,
        pathname: '/sign-in',
      })
    ).toEqual({
      shouldRenderStack: true,
      redirectTo: '/(tabs)',
    });
  });
});
