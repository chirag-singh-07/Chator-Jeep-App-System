import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useAuthStore } from "@/store/useAuthStore";

export default function LoginScreen() {
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isDisabled = useMemo(
    () => !email.trim() || password.trim().length < 8 || isLoading,
    [email, isLoading, password]
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
    <LinearGradient colors={["#0F172A", "#111827", "#1F2937"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboardArea}
        >
          <View style={styles.hero}>
            <Text style={styles.kicker}>Delivery Partner Console</Text>
            <Text style={styles.title}>Stay online, deliver faster, and track your payouts live.</Text>
            <Text style={styles.subtitle}>
              Sign in with your rider credentials to manage active deliveries, route updates, and wallet requests.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Rider sign in</Text>
            <Text style={styles.cardDescription}>This app is for delivery partners only.</Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="rider@example.com"
                placeholderTextColor="#94A3B8"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                secureTextEntry
                placeholder="Minimum 8 characters"
                placeholderTextColor="#94A3B8"
                style={styles.input}
                value={password}
                onChangeText={setPassword}
              />
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Pressable
              disabled={isDisabled}
              onPress={handleLogin}
              style={({ pressed }) => [
                styles.button,
                isDisabled && styles.buttonDisabled,
                pressed && !isDisabled && styles.buttonPressed,
              ]}
            >
              {isLoading ? (
                <ActivityIndicator color="#081018" />
              ) : (
                <Text style={styles.buttonText}>Sign in</Text>
              )}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardArea: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  hero: {
    marginTop: 24,
    gap: 12,
  },
  kicker: {
    color: "#FBBF24",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.6,
    textTransform: "uppercase",
  },
  title: {
    color: "#F8FAFC",
    fontSize: 34,
    fontWeight: "800",
    lineHeight: 42,
  },
  subtitle: {
    color: "#CBD5E1",
    fontSize: 16,
    lineHeight: 24,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderRadius: 28,
    padding: 22,
    gap: 16,
    marginBottom: 18,
  },
  cardTitle: {
    color: "#F8FAFC",
    fontSize: 24,
    fontWeight: "800",
  },
  cardDescription: {
    color: "#CBD5E1",
    fontSize: 14,
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    color: "#E2E8F0",
    fontSize: 13,
    fontWeight: "600",
  },
  input: {
    borderRadius: 18,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: "#0F172A",
    fontSize: 15,
  },
  button: {
    backgroundColor: "#FBBF24",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 54,
    marginTop: 6,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  buttonPressed: {
    opacity: 0.82,
  },
  buttonText: {
    color: "#0B1220",
    fontSize: 16,
    fontWeight: "800",
  },
  error: {
    color: "#FCA5A5",
    fontSize: 13,
    fontWeight: "600",
  },
});
