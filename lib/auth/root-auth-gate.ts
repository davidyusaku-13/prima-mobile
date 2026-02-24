type RootAuthGateInput = {
  isLoaded: boolean;
  isSignedIn: boolean | undefined;
  pathname: string;
};

type RootAuthGateState = {
  shouldRenderStack: boolean;
  redirectTo: '/sign-in' | '/(tabs)' | null;
};

const AUTH_ROUTES = new Set(['/sign-in', '/sign-up']);

export function getRootAuthGateState({
  isLoaded,
  isSignedIn,
  pathname,
}: RootAuthGateInput): RootAuthGateState {
  if (!isLoaded) {
    return {
      shouldRenderStack: false,
      redirectTo: null,
    };
  }

  if (!isSignedIn && !AUTH_ROUTES.has(pathname)) {
    return {
      shouldRenderStack: true,
      redirectTo: '/sign-in',
    };
  }

  if (isSignedIn && AUTH_ROUTES.has(pathname)) {
    return {
      shouldRenderStack: true,
      redirectTo: '/(tabs)',
    };
  }

  return {
    shouldRenderStack: true,
    redirectTo: null,
  };
}
