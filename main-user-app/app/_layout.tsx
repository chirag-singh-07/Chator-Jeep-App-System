import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { useAuthStore } from "@/store/useAuthStore";
import { SocketProvider } from "@/context/SocketContext";
import { useNotifications } from "@/hooks/useNotifications";

function AuthGate() {
  const { isAuthenticated, hasHydrated } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  // Initialize notifications
  useNotifications();

  useEffect(() => {
    if (!hasHydrated) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inOnboardingGroup = segments[0] === "(onboarding)";

    if (!isAuthenticated && !inAuthGroup && !inOnboardingGroup) {
      router.replace("/(onboarding)");
    } else if (isAuthenticated && (inAuthGroup || inOnboardingGroup)) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, hasHydrated, segments]);

  return (
    <SocketProvider>
       <Stack screenOptions={{ headerShown: false }} />
    </SocketProvider>
  );
}

export default function RootLayout() {
  return <AuthGate />;
}
