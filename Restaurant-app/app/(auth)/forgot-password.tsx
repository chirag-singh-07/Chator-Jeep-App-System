import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { apiClient } from "@/lib/api";

type ResetStep = "EMAIL" | "OTP" | "PASSWORD";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getApiMessage = (error: any, fallback: string) =>
  error?.response?.data?.message || error?.message || fallback;

export default function ForgotPasswordScreen() {
  const [step, setStep] = useState<ResetStep>("EMAIL");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const sendOtp = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      Alert.alert("Email Required", "Please enter your restaurant account email.");
      return;
    }
    if (!emailRegex.test(normalizedEmail)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);
      await apiClient.post("/auth/request-otp", {
        email: normalizedEmail,
        type: "forgot_password",
      });
      setEmail(normalizedEmail);
      setStep("OTP");
      Alert.alert("OTP Sent", "A 6-digit reset code has been sent to your email.");
    } catch (error: any) {
      Alert.alert("OTP Failed", getApiMessage(error, "Could not send reset OTP. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const verifyOtpLocally = () => {
    if (!/^\d{6}$/.test(otp.trim())) {
      Alert.alert("Invalid OTP", "Please enter the 6-digit OTP sent to your email.");
      return;
    }
    setStep("PASSWORD");
  };

  const resetPassword = async () => {
    if (password.length < 8 || password.length > 64) {
      Alert.alert("Invalid Password", "Password must be between 8 and 64 characters.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Password Mismatch", "New password and confirm password do not match.");
      return;
    }

    try {
      setLoading(true);
      await apiClient.post("/auth/reset-password", {
        email,
        otp: otp.trim(),
        password,
      });
      Alert.alert("Password Reset", "Your password has been updated successfully.", [
        { text: "Login", onPress: () => router.replace("/(auth)/login") },
      ]);
    } catch (error: any) {
      Alert.alert("Reset Failed", getApiMessage(error, "Could not reset your password. Please check the OTP and try again."));
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (step === "PASSWORD") setStep("OTP");
    else if (step === "OTP") setStep("EMAIL");
    else router.back();
  };

  const title =
    step === "EMAIL" ? "RESET ACCESS" : step === "OTP" ? "VERIFY OTP" : "NEW PASSWORD";
  const subtitle =
    step === "EMAIL"
      ? "Enter your restaurant account email to receive a secure reset code."
      : step === "OTP"
        ? `Enter the 6-digit code sent to ${email}.`
        : "Create a new password for your kitchen partner account.";

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={goBack} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#FFF" />
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.iconBox}>
              <Ionicons
                name={step === "EMAIL" ? "mail-open" : step === "OTP" ? "keypad" : "lock-closed"}
                size={34}
                color={Colors.light.primary}
              />
            </View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>

          <View style={styles.form}>
            {step === "EMAIL" && (
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>OFFICIAL EMAIL</Text>
                <View style={styles.inputRow}>
                  <Ionicons name="mail" size={20} color="#666" />
                  <TextInput
                    style={styles.input}
                    placeholder="partner@example.com"
                    placeholderTextColor="#333"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>
              </View>
            )}

            {step === "OTP" && (
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>RESET OTP</Text>
                <View style={styles.inputRow}>
                  <Ionicons name="keypad" size={20} color="#666" />
                  <TextInput
                    style={[styles.input, styles.otpInput]}
                    placeholder="000000"
                    placeholderTextColor="#333"
                    value={otp}
                    onChangeText={(value) => setOtp(value.replace(/\D/g, "").slice(0, 6))}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>
              </View>
            )}

            {step === "PASSWORD" && (
              <>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>NEW PASSWORD</Text>
                  <View style={styles.inputRow}>
                    <Ionicons name="lock-closed" size={20} color="#666" />
                    <TextInput
                      style={styles.input}
                      placeholder="Password"
                      placeholderTextColor="#333"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword((current) => !current)}>
                      <Ionicons
                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                        size={20}
                        color="#666"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>CONFIRM PASSWORD</Text>
                  <View style={styles.inputRow}>
                    <Ionicons name="shield-checkmark" size={20} color="#666" />
                    <TextInput
                      style={styles.input}
                      placeholder="Confirm password"
                      placeholderTextColor="#333"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showPassword}
                    />
                  </View>
                </View>
              </>
            )}

            <TouchableOpacity
              style={[styles.actionButton, loading && { opacity: 0.65 }]}
              onPress={step === "EMAIL" ? sendOtp : step === "OTP" ? verifyOtpLocally : resetPassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="black" />
              ) : (
                <>
                  <Text style={styles.actionText}>
                    {step === "EMAIL" ? "SEND OTP" : step === "OTP" ? "CONTINUE" : "RESET PASSWORD"}
                  </Text>
                  <Ionicons name="arrow-forward" size={20} color="black" />
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  content: {
    flexGrow: 1,
    padding: 30,
    justifyContent: "center",
  },
  backBtn: {
    position: "absolute",
    top: 24,
    left: 24,
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#222",
  },
  header: { alignItems: "center", marginBottom: 42 },
  iconBox: {
    width: 82,
    height: 82,
    borderRadius: 26,
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#222",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: {
    color: "#FFF",
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: 3,
    textAlign: "center",
  },
  subtitle: {
    color: "#888",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 21,
    textAlign: "center",
    marginTop: 12,
  },
  form: { gap: 24 },
  inputWrapper: { gap: 12 },
  inputLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: Colors.light.primary,
    letterSpacing: 2,
    marginLeft: 4,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0A0A0A",
    minHeight: 65,
    borderRadius: 20,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "#1A1A1A",
    gap: 15,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#FFF",
    fontWeight: "700",
  },
  otpInput: {
    letterSpacing: 8,
    fontWeight: "900",
  },
  actionButton: {
    backgroundColor: Colors.light.primary,
    minHeight: 65,
    borderRadius: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginTop: 8,
  },
  actionText: {
    color: "black",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
});
