import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { useAuthStore } from "@/store/useAuthStore";
import { SocketProvider } from "@/context/SocketContext";
import { useNotifications } from "@/hooks/useNotifications";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AppLoadingScreen } from "@/components/AppLoadingScreen";
import { useState } from "react";

function AuthGate() {
  const { isAuthenticated, hasHydrated } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  // Initialize notifications
  useNotifications();

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!hasHydrated) return;
    
    // Once hydrated, wait for the loading screen animation to finish
    // However, the routing can run immediately or we can defer it.
    // Let's just run routing, but keep showing loading screen on top
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
       {(!hasHydrated || !isReady) && (
         <AppLoadingScreen onFinish={() => setIsReady(true)} />
       )}
    </SocketProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthGate />
    </GestureHandlerRootView>
  );
}
