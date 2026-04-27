import { Stack, router, useRootNavigationState, useSegments } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { SocketProvider } from "@/components/SocketProvider";
import { useAuthStore } from "@/store/useAuthStore";
import { useLiveLocationSync } from "@/hooks/useLiveLocationSync";

import { useNotifications } from "@/hooks/useNotifications";

export default function RootLayout() {
  const segments = useSegments();
  const navigationState = useRootNavigationState();
  const { isAuthenticated, hasHydrated } = useAuthStore();

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

    if (isAuthenticated && inAuthGroup && !isRegistering) {
      router.replace("/(tabs)");
    }
  }, [hasHydrated, isAuthenticated, navigationState?.key, segments]);

  return (
    <SafeAreaProvider>
      <SocketProvider>
        <View style={{ flex: 1 }}>
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

          {!hasHydrated && (
            <View
              style={[
                StyleSheet.absoluteFill,
                {
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#0B1220",
                  zIndex: 999,
                },
              ]}
            >
              <ActivityIndicator color="#F59E0B" size="large" />
            </View>
          )}
        </View>
      </SocketProvider>
    </SafeAreaProvider>
  );
}
