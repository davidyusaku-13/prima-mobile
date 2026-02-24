import { useCallback, useEffect, useRef, useState } from 'react';

import { createAdminApi, mapAdminUnauthorized } from '@/lib/api/admin';
import { ApiClientError } from '@/lib/api/types';

type ShouldProbeAdminAccessInput = {
  isLoaded: boolean;
  userId: string | null | undefined;
  hasAdminTab: boolean;
};

export const shouldProbeAdminAccess = ({
  isLoaded,
  userId,
  hasAdminTab,
}: ShouldProbeAdminAccessInput) => isLoaded && Boolean(userId) && hasAdminTab;

export function isUnauthorizedAdminError(error: unknown): boolean {
  if (!(error instanceof ApiClientError)) {
    return false;
  }

  return error.kind === 'http' && typeof error.status === 'number' && mapAdminUnauthorized(error.status);
}

type AdminAccessState = {
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
};

type TokenCallback = () => Promise<string | null | undefined> | string | null | undefined;

type UseAdminAccessOptions = {
  isLoaded: boolean;
  userId: string | null | undefined;
  getToken: TokenCallback;
  hasAdminTab?: boolean;
};

export function useAdminAccess({
  isLoaded,
  userId,
  getToken,
  hasAdminTab = true,
}: UseAdminAccessOptions) {
  const [state, setState] = useState<AdminAccessState>({
    isAdmin: false,
    isLoading: true,
    error: null,
  });

  const getTokenRef = useRef(getToken);

  useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);

  const probeAdminAccess = useCallback(async () => {
    if (!shouldProbeAdminAccess({ isLoaded, userId, hasAdminTab })) {
      if (!isLoaded && hasAdminTab) {
        setState((current) => {
          if (current.isLoading) {
            return current;
          }

          return { ...current, isLoading: true };
        });
        return;
      }

      setState({ isAdmin: false, isLoading: false, error: null });
      return;
    }

    setState((current) => {
      if (current.isLoading && current.error === null) {
        return current;
      }

      return { ...current, isLoading: true, error: null };
    });

    const adminApi = createAdminApi({
      getToken: () => getTokenRef.current(),
    });

    try {
      await adminApi.getAdmin();
      setState({ isAdmin: true, isLoading: false, error: null });
    } catch (error) {
      if (isUnauthorizedAdminError(error)) {
        setState({ isAdmin: false, isLoading: false, error: null });
        return;
      }

      setState({
        isAdmin: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unable to verify admin access',
      });
    }
  }, [hasAdminTab, isLoaded, userId]);

  useEffect(() => {
    void probeAdminAccess();
  }, [probeAdminAccess]);

  return {
    ...state,
    refreshAdminAccess: probeAdminAccess,
  };
}
