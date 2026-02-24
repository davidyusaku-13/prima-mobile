import { useAuth } from '@clerk/clerk-expo';
import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ErrorCard } from '@/components/error-card';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useAdminAccess } from '@/hooks/use-admin-access';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { TAB_LAYOUT_SCREENS, getVisibleTabLayoutScreens, isAdminTabLayoutScreen } from '@/lib/navigation/routes';

const HAS_ADMIN_TAB = TAB_LAYOUT_SCREENS.some((screen) => isAdminTabLayoutScreen(screen));

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { isLoaded, userId, getToken } = useAuth();
  const { isAdmin, error, refreshAdminAccess } = useAdminAccess({
    isLoaded,
    userId,
    getToken,
    hasAdminTab: HAS_ADMIN_TAB,
  });
  const colors = Colors[colorScheme ?? 'light'];

  const screens = getVisibleTabLayoutScreens(isAdmin);

  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.tabIconSelected,
          tabBarInactiveTintColor: colors.tabIconDefault,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: {
            position: 'absolute',
            left: 16,
            right: 16,
            bottom: 20,
            height: 68,
            borderTopWidth: 1,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 24,
            backgroundColor: colors.surface,
            elevation: 8,
            shadowColor: colors.primaryStrong,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.08,
            shadowRadius: 20,
          },
          tabBarItemStyle: {
            borderRadius: 16,
            marginVertical: 8,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
        }}>
        {screens.map((screen) => (
          <Tabs.Screen
            key={screen.name}
            name={screen.name}
            options={{
              title: screen.title,
              tabBarIcon: ({ color }) => <IconSymbol size={28} name={screen.icon} color={color} />,
            }}
          />
        ))}
      </Tabs>
      {error ? (
        <View style={styles.errorBanner}>
          <ErrorCard
            title="Gagal verifikasi akses admin"
            message={error}
            retryLabel="Coba verifikasi ulang"
            onRetry={() => {
              void refreshAdminAccess();
            }}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorBanner: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 98,
  },
});
