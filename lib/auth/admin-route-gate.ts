type AdminRouteGateInput = {
  isLoaded: boolean;
  isAdmin: boolean;
  isAdminLoading: boolean;
};

type AdminRouteGateState = {
  shouldRenderStack: boolean;
  redirectTo: '/(tabs)' | null;
};

export function getAdminRouteGateState({
  isLoaded,
  isAdmin,
  isAdminLoading,
}: AdminRouteGateInput): AdminRouteGateState {
  if (!isLoaded || isAdminLoading) {
    return {
      shouldRenderStack: false,
      redirectTo: null,
    };
  }

  if (!isAdmin) {
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
