import { Redirect } from "expo-router";
import { useAuthStore } from "@/store/useAuthStore";

export default function IndexScreen() {
  const { isAuthenticated } = useAuthStore();
  
  // Logic to check if user has seen onboarding could be added here
  // For now, redirect to onboarding if not authenticated
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(onboarding)" />;
}
