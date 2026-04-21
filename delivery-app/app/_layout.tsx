import { Stack, router, useRootNavigationState, useSegments } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { SocketProvider } from "@/components/SocketProvider";
import { useAuthStore } from "@/store/useAuthStore";
import { useLiveLocationSync } from "@/hooks/useLiveLocationSync";

function AuthGate() {
  const segments = useSegments();
  const navigationState = useRootNavigationState();
  const { isAuthenticated, hasHydrated } = useAuthStore();

  useLiveLocationSync();

  useEffect(() => {
    if (!navigationState?.key || !hasHydrated) {
      return;
    }

    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/login");
    }

    if (isAuthenticated && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [hasHydrated, isAuthenticated, navigationState?.key, segments]);

  if (!hasHydrated) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0B1220",
        }}
      >
        <ActivityIndicator color="#F59E0B" size="large" />
      </View>
    );
  }

  return (
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
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SocketProvider>
        <AuthGate />
      </SocketProvider>
    </SafeAreaProvider>
  );
}
