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
import { Colors, Spacing, Radius, Shadows } from "../../constants/Colors";
import { ThemedInput } from "@/components/ThemedInput";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

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
      <StatusBar style="light" backgroundColor={Colors.light.primary} />

      {/* Hero Header */}
      <LinearGradient
        colors={[Colors.light.primaryLight, Colors.light.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        {/* Decorative circles */}
        <View style={styles.heroCircle1} />
        <View style={styles.heroCircle2} />

        <SafeAreaView edges={['top']} style={styles.heroContent}>
          <View style={styles.logoWrapper}>
            <View style={styles.logoCircle}>
              <Image
                source={require("../../assets/delivery-app-logo.png")}
                style={styles.logoImage}
              />
            </View>
          </View>
          <Text style={styles.brandName}>CHATORI JEEB</Text>
          <Text style={styles.tagline}>Delivery Partner</Text>
        </SafeAreaView>
      </LinearGradient>

      {/* Form Card */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.formContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
        >
          {/* Welcome card */}
          <View style={styles.welcomeCard}>
            <Text style={styles.welcomeTitle}>Welcome Back 👋</Text>
            <Text style={styles.welcomeSubtitle}>
              Sign in to manage your deliveries and track earnings
            </Text>
          </View>

          {/* Input fields */}
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

            <View style={styles.passwordWrapper}>
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
                onPress={() => setShowPassword((c) => !c)}
                accessibilityLabel={showPassword ? "Hide password" : "Show password"}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={Colors.light.textMuted}
                />
              </TouchableOpacity>
            </View>

            {error && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={16} color="#EF4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
          </View>

          {/* Forgot password */}
          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Login button */}
          <TouchableOpacity
            style={[styles.loginButtonWrapper, isDisabled && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isDisabled || isLoading}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={
                isDisabled
                  ? ['#B0C4FF', '#B0C4FF']
                  : [Colors.light.primaryLight, Colors.light.primaryDark]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.loginGradient}
            >
              {isLoading ? (
                <View style={styles.loadingRow}>
                  <Ionicons name="hourglass" size={20} color="#FFFFFF" />
                  <Text style={styles.loginButtonText}>Signing in...</Text>
                </View>
              ) : (
                <View style={styles.loadingRow}>
                  <Text style={styles.loginButtonText}>Sign In</Text>
                  <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Register */}
          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => router.replace("/(auth)/register")}
            activeOpacity={0.8}
          >
            <Ionicons name="person-add-outline" size={18} color={Colors.light.primary} />
            <Text style={styles.registerButtonText}>Create Partner Account</Text>
          </TouchableOpacity>

          {/* Version */}
          <Text style={styles.versionText}>Version 1.0.0</Text>
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
  hero: {
    paddingBottom: 48,
    overflow: 'hidden',
  },
  heroCircle1: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#FFFFFF',
    opacity: 0.07,
    top: -60,
    right: -50,
  },
  heroCircle2: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FFFFFF',
    opacity: 0.05,
    bottom: -30,
    left: 30,
  },
  heroContent: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 8,
  },
  logoWrapper: {
    marginBottom: 14,
  },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
    ...Shadows.blue,
  },
  logoImage: {
    width: 90,
    height: 90,
    resizeMode: 'cover',
    borderRadius: 45,
  },
  brandName: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 3,
    marginBottom: 4,
  },
  tagline: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  formContainer: {
    flex: 1,
    marginTop: -20,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: Colors.light.background,
    overflow: 'hidden',
    zIndex: 10,
    elevation: 10,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  welcomeCard: {
    marginBottom: Spacing.lg,
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.light.text,
    marginBottom: 6,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: Colors.light.textMuted,
    lineHeight: 21,
    fontWeight: '500',
  },
  inputCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.light.border,
    ...Shadows.card,
  },
  passwordWrapper: {
    position: 'relative',
  },
  eyeButton: {
    position: 'absolute',
    right: 14,
    top: 38,
    padding: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: Spacing.sm,
    padding: 12,
    backgroundColor: '#FEF2F2',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.lg,
    marginTop: 4,
  },
  forgotPasswordText: {
    color: Colors.light.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  loginButtonWrapper: {
    borderRadius: Radius.full,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
    ...Shadows.blue,
  },
  loginButtonDisabled: {
    opacity: 0.65,
  },
  loginGradient: {
    paddingVertical: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.light.border,
  },
  dividerText: {
    marginHorizontal: 14,
    color: Colors.light.textMuted,
    fontSize: 13,
    fontWeight: '500',
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.light.surface,
    borderRadius: Radius.full,
    paddingVertical: 15,
    borderWidth: 1.5,
    borderColor: Colors.light.primary,
    marginBottom: Spacing.xl,
    ...Shadows.soft,
  },
  registerButtonText: {
    color: Colors.light.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  versionText: {
    color: Colors.light.textDim,
    fontSize: 12,
    textAlign: 'center',
  },
});