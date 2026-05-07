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

    const inAuthGroup = segments.some(s => s === "(auth)");
    const inOnboardingGroup = segments.some(s => s === "(onboarding)");

    console.log('AuthGate:', { isAuthenticated, segments, inAuthGroup, inOnboardingGroup });

    if (!isAuthenticated && !inAuthGroup && !inOnboardingGroup) {
      console.log('Redirecting to onboarding');
      router.replace("/(onboarding)");
    } else if (isAuthenticated && (inAuthGroup || inOnboardingGroup)) {
      console.log('Redirecting to tabs');
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
