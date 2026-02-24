import { useAuth } from '@clerk/clerk-expo';
import { Redirect, Slot } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useAdminAccess } from '@/hooks/use-admin-access';
import { getAdminRouteGateState } from '@/lib/auth/admin-route-gate';
import { PrimaPalette } from '@/lib/theme/tokens';

export default function AdminRouteLayout() {
  const { isLoaded, userId, getToken } = useAuth();
  const { isAdmin, isLoading } = useAdminAccess({
    isLoaded,
    userId,
    getToken,
  });

  const gateState = getAdminRouteGateState({
    isLoaded,
    isAdmin,
    isAdminLoading: isLoading,
  });

  if (!gateState.shouldRenderStack) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={PrimaPalette.primaryEnd} size="small" />
      </View>
    );
  }

  return (
    <>
      <Slot />
      {gateState.redirectTo ? <Redirect href={gateState.redirectTo} /> : null}
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    alignItems: 'center',
    backgroundColor: PrimaPalette.backgroundWashStart,
    flex: 1,
    justifyContent: 'center',
  },
});
