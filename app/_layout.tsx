import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Redirect, Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';

import '@/global.css';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { getRootAuthGateState } from '@/lib/auth/root-auth-gate';
import { requireEnv } from '@/lib/auth/session';

export const unstable_settings = {
  anchor: '(tabs)',
};

const clerkPublishableKey = requireEnv(
  process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
  'EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY'
);

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ClerkProvider publishableKey={clerkPublishableKey} tokenCache={tokenCache}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AuthGate />
        <StatusBar style="auto" />
      </ThemeProvider>
    </ClerkProvider>
  );
}

function AuthGate() {
  const { isLoaded, isSignedIn } = useAuth();
  const pathname = usePathname();
  const gateState = getRootAuthGateState({
    isLoaded,
    isSignedIn,
    pathname,
  });

  if (!gateState.shouldRenderStack) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="small" />
      </View>
    );
  }

  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="sign-in" options={{ headerShown: false }} />
      </Stack>
      {gateState.redirectTo ? <Redirect href={gateState.redirectTo} /> : null}
    </>
  );
}
