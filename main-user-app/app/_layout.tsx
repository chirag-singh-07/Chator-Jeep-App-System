import { useEffect, useState } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { useAuthStore } from "@/store/useAuthStore";
import { SocketProvider } from "@/context/SocketContext";
import { useNotifications } from "@/hooks/useNotifications";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AppLoadingScreen } from "@/components/AppLoadingScreen";
function AuthGate() {
  const { isAuthenticated, hasHydrated, hasSeenOnboarding } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  // Initialize notifications
  useNotifications();

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!hasHydrated) return;
    
    const inAuthGroup = segments.some(s => s === "(auth)");
    const inOnboardingGroup = segments.some(s => s === "(onboarding)");

    if (!isAuthenticated) {
      if (!hasSeenOnboarding && !inOnboardingGroup) {
        router.replace("/(onboarding)");
      }
      // If they have seen onboarding, they can browse as guest anywhere.
    } else {
      if (inAuthGroup || inOnboardingGroup) {
        router.replace("/(tabs)");
      }
    }
  }, [isAuthenticated, hasHydrated, hasSeenOnboarding, segments]);

  return (
    <SocketProvider>
       <Stack screenOptions={{ headerShown: false }} />
       {(!hasHydrated || !isReady) && (
         <AppLoadingScreen onFinish={() => setIsReady(true)} />
       )}
    </SocketProvider>
  );
}

import * as Location from 'expo-location';

import { AuthPromptModal } from "@/components/AuthPromptModal";

export default function RootLayout() {
  useEffect(() => {
    // Request location permissions natively like all other apps do
    (async () => {
      try {
        await Location.requestForegroundPermissionsAsync();
      } catch (e) {
        console.warn('Location permission request failed:', e);
      }
    })();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthGate />
      <AuthPromptModal />
    </GestureHandlerRootView>
  );
}
