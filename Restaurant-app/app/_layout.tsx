import { Stack, router, useSegments, useRootNavigationState } from "expo-router";
import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { SocketProvider } from "@/components/SocketProvider";
import { useNotifications } from "@/hooks/useNotifications";
import { StatusBar } from "expo-status-bar";
import { AlertOverlay } from "@/components/AlertOverlay";

export default function RootLayout() {
  const { isAuthenticated, user } = useAuthStore();
  const segments = useSegments();
  const navigationState = useRootNavigationState();

  // Initialize Notifications
  useNotifications();

  useEffect(() => {
    // Wait until navigation state is ready
    if (!navigationState?.key) return;

    const inAuthGroup = segments[0] === "(auth)";
    const isPublicAuthPage = segments[1] === "login" || segments[1] === "register";
    
    if (!isAuthenticated) {
      // If not authenticated and not on login/register, go to login
      if (!inAuthGroup || !isPublicAuthPage) {
        router.replace("/(auth)/login");
      }
    } else if (isAuthenticated && inAuthGroup) {
      // If authenticated but still in auth group, redirect based on status
      if (user?.status === "REQUESTED" || user?.status === "PENDING") {
        router.replace("/(auth)/pending");
      } else if (user?.status === "REJECTED") {
        router.replace("/(auth)/rejected");
      } else {
        router.replace("/(tabs)");
      }
    }
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
        <Stack.Screen name="(auth)/pending" />
        <Stack.Screen name="(auth)/rejected" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="order/[id]" />
      </Stack>
      <AlertOverlay />
    </SocketProvider>
  );
}
