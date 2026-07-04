import { Redirect } from "expo-router";
import { useAuthStore } from "@/store/useAuthStore";

export default function IndexScreen() {
  const { isAuthenticated, hasHydrated } = useAuthStore();
  
  if (!hasHydrated) {
    return null; // Wait for hydration to complete
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/login" />;
}
