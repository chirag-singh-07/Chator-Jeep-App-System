import { Stack, router, useRootNavigationState, useSegments } from "expo-router";
import { ThemeProvider, DarkTheme } from "@react-navigation/native";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { SocketProvider } from "@/components/SocketProvider";
import { useAuthStore } from "@/store/useAuthStore";
import { useLiveLocationSync } from "@/hooks/useLiveLocationSync";

import { useNotifications } from "@/hooks/useNotifications";
import { AppLoadingScreen } from "@/components/AppLoadingScreen";
import { useState } from "react";

export default function RootLayout() {
  const segments = useSegments();
  const navigationState = useRootNavigationState();
  const { isAuthenticated, hasHydrated } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  useLiveLocationSync();
  useNotifications();

  useEffect(() => {
    if (!navigationState?.key || !hasHydrated) {
      return;
    }

    const inAuthGroup = segments[0] === "(auth)";
    const inOnboardingGroup = segments[0] === "(onboarding)";
    const isRegistering = segments[1] === "register";

    if (!isAuthenticated && !inAuthGroup && !inOnboardingGroup) {
      router.replace("/(auth)/login");
    }
  }, [hasHydrated, isAuthenticated, navigationState?.key, segments]);

  return (
    <SafeAreaProvider>
      <ThemeProvider value={DarkTheme}>
        <SocketProvider>
          <View style={{ flex: 1, backgroundColor: "#000000" }}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen
                name="order/[id]"
                options={{
                  presentation: "card",
                }}
              />
              <Stack.Screen
                name="wallet/request"
                options={{
                  presentation: "modal",
                }}
              />
            </Stack>

            {(!hasHydrated || !isReady) && (
              <AppLoadingScreen onFinish={() => setIsReady(true)} />
            )}
          </View>
        </SocketProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
