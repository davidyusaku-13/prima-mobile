type RootAuthGateInput = {
  isLoaded: boolean;
  isSignedIn: boolean | undefined;
  pathname: string;
};

type RootAuthGateState = {
  shouldRenderStack: boolean;
  redirectTo: '/sign-in' | '/(tabs)' | null;
};

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

  if (!isSignedIn && pathname !== '/sign-in') {
    return {
      shouldRenderStack: true,
      redirectTo: '/sign-in',
    };
  }

  if (isSignedIn && pathname === '/sign-in') {
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
