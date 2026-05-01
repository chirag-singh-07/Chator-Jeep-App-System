import { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuthStore } from "@/store/useAuthStore";
import { Colors, Spacing, Radius, Shadows } from "@/constants/Colors";
import { ScreenContainer } from "@/components/ScreenContainer";
import { ThemedInput } from "@/components/ThemedInput";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function LoginScreen() {
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isDisabled = useMemo(
    () => !email.trim() || password.trim().length < 8 || isLoading,
    [email, isLoading, password],
  );

  const handleLogin = async () => {
    setError(null);
    try {
      await login(email.trim(), password);
    } catch (err: any) {
      setError(err?.message ?? "Unable to sign in right now.");
    }
  };

  return (
    <ScreenContainer withSafeArea>
      <LinearGradient
        colors={[Colors.light.background, Colors.light.surface, "#121212"]}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardArea}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Ionicons
                  name="bicycle"
                  size={40}
                  color={Colors.light.primary}
                />
              </View>
              <Text style={styles.kicker}>Partner Console</Text>
              <Text style={styles.title}>Drive. Deliver.{"\n"}Earn Gold.</Text>
              <Text style={styles.subtitle}>
                Sign in to your rider account to manage deliveries and track
                your daily performance.
              </Text>
            </View>

            <View style={styles.card}>
              <ThemedInput
                label="Email Address"
                placeholder="rider@chatorijeep.com"
                icon="mail-outline"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />

              <ThemedInput
                label="Password"
                placeholder="••••••••"
                icon="lock-closed-outline"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              {error && (
                <View style={styles.errorContainer}>
                  <Ionicons
                    name="alert-circle"
                    size={16}
                    color={Colors.light.error}
                  />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <PrimaryButton
                label="Sign In"
                onPress={handleLogin}
                loading={isLoading}
                disabled={isDisabled}
                style={styles.loginButton}
              />

              <View style={styles.footer}>
                <Text style={styles.footerText}>New partner?</Text>
                <PrimaryButton
                  label="Register Now"
                  variant="outline"
                  onPress={() => router.replace("/(auth)/register")}
                  style={styles.registerButton}
                  textStyle={styles.registerButtonText}
                />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  keyboardArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  header: {
    marginTop: 60,
    marginBottom: Spacing.xl,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: Radius.lg,
    backgroundColor: Colors.light.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  kicker: {
    color: Colors.light.primary,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: Spacing.xs,
  },
  title: {
    color: Colors.light.text,
    fontSize: 40,
    fontWeight: "900",
    lineHeight: 48,
    marginBottom: Spacing.md,
  },
  subtitle: {
    color: Colors.light.textDim,
    fontSize: 16,
    lineHeight: 24,
  },
  card: {
    backgroundColor: Colors.light.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.light.border,
    ...Shadows.soft,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  errorText: {
    color: Colors.light.error,
    fontSize: 14,
    fontWeight: "500",
  },
  loginButton: {
    marginTop: Spacing.sm,
  },
  footer: {
    marginTop: Spacing.xl,
    alignItems: "center",
    gap: Spacing.md,
  },
  footerText: {
    color: Colors.light.textMuted,
    fontSize: 14,
  },
  registerButton: {
    height: 44,
    width: "100%",
  },
  registerButtonText: {
    fontSize: 14,
  },
});
