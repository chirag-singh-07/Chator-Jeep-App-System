import { Stack, router, useSegments, useRootNavigationState } from "expo-router";
import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { SocketProvider } from "@/components/SocketProvider";
import { useNotifications } from "@/hooks/useNotifications";
import { StatusBar } from "expo-status-bar";
import { AlertOverlay } from "@/components/AlertOverlay";
import { AppLoadingScreen } from "@/components/AppLoadingScreen";
import { useState } from "react";

export default function RootLayout() {
  const { isAuthenticated, user } = useAuthStore();
  const segments = useSegments();
  const navigationState = useRootNavigationState();
  const [isReady, setIsReady] = useState(false);

  // Initialize Notifications
  useNotifications();

  useEffect(() => {
    // Wait until navigation state is ready
    if (!navigationState?.key) return;

    const segs = segments as string[];
    const inAuthGroup = segs[0] === "(auth)";
    const inOnboarding = segs[0] === "(onboarding)";
    const authPage = segs[1] as string | undefined;
    
    // Defer the navigation to ensure Root Layout is fully mounted
    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        // If not authenticated and not on login/register/onboarding, go to onboarding
        if (!inAuthGroup && !inOnboarding) {
          router.replace("/(onboarding)");
        }
      } else if (isAuthenticated && (inAuthGroup || inOnboarding)) {
        // If authenticated but still in auth or onboarding, redirect based on status
        if (user?.status === "REQUESTED" || user?.status === "PENDING") {
          if (authPage !== "pending") router.replace("/(auth)/pending");
        } else if (user?.status === "REJECTED") {
          if (authPage !== "rejected") router.replace("/(auth)/rejected");
        } else {
          router.replace("/(tabs)");
        }
      }
    }, 1);

    return () => clearTimeout(timer);
  }, [isAuthenticated, user?.status, segments, navigationState?.key]);

  return (
    <SocketProvider>
      <StatusBar style="light" backgroundColor="#000" />
      <Stack screenOptions={{ 
        headerShown: false,
        contentStyle: { backgroundColor: '#000' } // Ensure background is always dark
      }}>
        <Stack.Screen name="(auth)/login" />
        <Stack.Screen name="(auth)/register" />
        <Stack.Screen name="(auth)/forgot-password" />
        <Stack.Screen name="(auth)/pending" />
        <Stack.Screen name="(auth)/rejected" />
        <Stack.Screen name="(onboarding)/index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="order/[id]" />
      </Stack>
      <AlertOverlay />
      {!isReady && <AppLoadingScreen onFinish={() => setIsReady(true)} />}
    </SocketProvider>
  );
}
