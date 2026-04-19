import { Stack, useRouter, useSegments, useRootNavigationState } from "expo-router";
import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { SocketProvider } from "@/components/SocketProvider";
import { AlertOverlay } from "@/components/AlertOverlay";
// import { setupNotificationChannels, registerForPushNotificationsAsync, registerBackgroundTasks } from "@/lib/PushNotificationService";

// Register task as early as possible
// registerBackgroundTasks();

export default function RootLayout() {
  const { isAuthenticated, user } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    // // Setup Critical Push Infrastructure
    // setupNotificationChannels();
    // registerForPushNotificationsAsync().then(token => {
    //   if (token) {
    //     // Here you would eventually send the device push token to your backend
    //     // apiClient.post('/restaurants/update-push-token', { token });
    //   }
    // });
  }, []);

  useEffect(() => {
    // Crucial fix: wait until the router tree is actually mounted before navigating!
    if (!navigationState?.key) return;

    // We use a zero-timeout to defer navigation to the next cycle and guarantee the Slot is fully mounted
    setTimeout(() => {
      const inAuthGroup = segments[0] === "(auth)";
      const inTabsGroup = segments[0] === "(tabs)";

      if (!isAuthenticated && !inAuthGroup) {
        // Redirect to login if not authenticated and not already in auth pages
        router.replace("/(auth)/login");
      } else if (isAuthenticated && inAuthGroup) {
        // If authenticated but in auth pages, redirect based on status
        if (user?.status === "REQUESTED" || user?.status === "PENDING") {
          router.replace("/(auth)/pending");
        } else if (user?.status === "REJECTED") {
          router.replace("/(auth)/rejected");
        } else {
          router.replace("/(tabs)");
        }
      }
    }, 0);
  }, [isAuthenticated, user?.status, segments, navigationState?.key]);

  return (
    <SocketProvider>
      <Stack screenOptions={{ headerShown: false }}>
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
