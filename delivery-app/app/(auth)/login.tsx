import { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuthStore } from "@/store/useAuthStore";
import { Colors, Spacing, Radius } from "../../constants/Colors";
import { ThemedInput } from "@/components/ThemedInput";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const getLoginErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string") return error;
  return "Invalid email or password. Please check your details and try again.";
};

export default function LoginScreen() {
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDisabled = useMemo(
    () => !email.trim() || password.trim().length < 8 || isLoading,
    [email, isLoading, password],
  );

  const handleLogin = async () => {
    setError(null);
    try {
      await login(email.trim(), password);
      router.replace("/(tabs)");
    } catch (err: any) {
      setError(getLoginErrorMessage(err));
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.light.primary, '#E5A812']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <View style={styles.logoWrapper}>
            <View style={styles.logoCircle}>
              <Image
                source={require("../../assets/delivery-app-logo.png")}
                style={styles.logoImage}
              />
            </View>
          </View>
          <Text style={styles.brandName}>CHATORI JEEB</Text>
          <Text style={styles.tagline}>Partner Console</Text>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.formContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Welcome Back!</Text>
            <Text style={styles.welcomeSubtitle}>
              Sign in to manage deliveries and track your earnings
            </Text>
          </View>

          <View style={styles.inputSection}>
            <View style={styles.inputCard}>
              <ThemedInput
                label="Email Address"
                placeholder="rider@chatorijeeb.com"
                icon="mail-outline"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />

              <View style={styles.passwordContainer}>
                <ThemedInput
                  label="Password"
                  placeholder="Enter your password"
                  icon="lock-closed-outline"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword((current) => !current)}
                  accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={22}
                    color={Colors.light.textMuted}
                  />
                </TouchableOpacity>
              </View>

              {error && (
                <View style={styles.errorContainer}>
                  <Ionicons
                    name="alert-circle"
                    size={18}
                    color={Colors.light.error}
                  />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}
            </View>

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.loginButton,
                isDisabled && styles.loginButtonDisabled,
              ]}
              onPress={handleLogin}
              disabled={isDisabled || isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <Ionicons name="hourglass" size={20} color={Colors.light.secondary} />
                  <Text style={styles.loginButtonText}>Signing in...</Text>
                </View>
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.registerSection}>
            <View style={styles.registerDivider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.registerButton}
              onPress={() => router.replace("/(auth)/register")}
              activeOpacity={0.8}
            >
              <Text style={styles.registerButtonText}>Create Partner Account</Text>
              <Ionicons name="arrow-forward" size={18} color={Colors.light.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.versionInfo}>
            <Text style={styles.versionText}>Version 1.0.0</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    alignItems: "center",
  },
  logoWrapper: {
    marginBottom: 16,
  },
  logoCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.light.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: Colors.light.border,
  },
  logoImage: {
    width: 100,
    height: 100,
    resizeMode: "cover",
    borderRadius: 100,
  },
  brandName: {
    fontSize: 28,
    fontWeight: "900",
    color: Colors.light.text,
    letterSpacing: 3,
    marginBottom: 4,
  },
  tagline: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.text,
    letterSpacing: 1,
    opacity: 0.8,
  },
  formContainer: {
    flex: 1,
    marginTop: -20,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  welcomeSection: {
    backgroundColor: Colors.light.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.light.text,
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: Colors.light.textMuted,
    lineHeight: 20,
  },
  inputSection: {
    marginBottom: Spacing.lg,
  },
  inputCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  passwordContainer: {
    position: "relative",
  },
  eyeButton: {
    position: "absolute",
    right: 12,
    top: 36,
    padding: 4,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: Spacing.md,
    padding: 12,
    backgroundColor: Colors.light.error,
    borderRadius: Radius.md,
  },
  errorText: {
    color: Colors.light.white,
    fontSize: 13,
    fontWeight: "500",
    flex: 1,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: Spacing.md,
  },
  forgotPasswordText: {
    color: Colors.light.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  loginButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: Radius.md,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  loginButtonDisabled: {
    opacity: 0.5,
  },
  loginButtonText: {
    color: "black",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  registerSection: {
    marginBottom: Spacing.xl,
  },
  registerDivider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.light.border,
  },
  dividerText: {
    marginHorizontal: 16,
    color: Colors.light.textMuted,
    fontSize: 13,
    fontWeight: "500",
  },
  registerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.dark.surface,
    borderRadius: Radius.md,
    paddingVertical: 14,
    gap: 8,
    borderWidth: 2,
    borderColor: Colors.light.primary,
  },
  registerButtonText: {
    color: Colors.dark.text,
    fontSize: 15,
    fontWeight: "600",
  },
  versionInfo: {
    alignItems: "center",
  },
  versionText: {
    color: Colors.light.textMuted,
    fontSize: 12,
  },
});