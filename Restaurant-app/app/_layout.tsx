import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";

export default function RootLayout() {
  const { isAuthenticated, user } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Check if the user is in the (auth) group
    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to login if not authenticated and not already in auth pages
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      // If authenticated but in auth pages, redirect based on status
      if (user?.status === 'REQUESTED' || user?.status === 'PENDING') {
        router.replace('/(auth)/pending');
      } else if (user?.status === 'REJECTED') {
        router.replace('/(auth)/rejected');
      } else {
        router.replace('/(tabs)');
      }
    }
  }, [isAuthenticated, user?.status, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)/login" />
      <Stack.Screen name="(auth)/register" />
      <Stack.Screen name="(auth)/pending" />
      <Stack.Screen name="(auth)/rejected" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
