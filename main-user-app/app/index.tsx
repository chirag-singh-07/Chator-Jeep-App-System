import { Redirect } from 'expo-router';

export default function Index() {
  // Logic to check if user has seen onboarding or is logged in
  const hasSeenOnboarding = false;
  const isLoggedIn = false;

  if (isLoggedIn) {
    return <Redirect href="/(tabs)" />;
  }

  if (hasSeenOnboarding) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/(onboarding)" />;
}
