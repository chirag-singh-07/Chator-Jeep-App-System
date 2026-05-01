import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useDeliveryStore } from "@/store/useDeliveryStore";
import { useAuthStore } from "@/store/useAuthStore";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, Radius, Shadows } from "../../constants/Colors";
import { ScreenContainer } from "@/components/ScreenContainer";
import { ThemedInput } from "@/components/ThemedInput";
import { PrimaryButton } from "@/components/PrimaryButton";
import Animated, { 
  FadeInRight, 
  FadeOutLeft, 
  Layout,
} from "react-native-reanimated";

export default function RegisterScreen() {
  const router = useRouter();
  const authRegister = useAuthStore((state) => state.register);
  const requestOtp = useAuthStore((state) => state.requestOtp);
  const deliveryRegister = useDeliveryStore((state) => state.register);
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    otp: "",
    vehicleType: "Bike" as const,
    bankDetails: {
      bankName: "",
      accountNumber: "",
      ifscCode: "",
    },
  });

  const isStep1Valid = form.name.trim().length > 2 && 
                      form.email.includes("@") && 
                      form.password.length >= 8 && 
                      form.phone.length >= 10 &&
                      form.otp.length === 6;

  const isStep2Valid = !!form.vehicleType;
  const isStep3Valid = !!(form.bankDetails.bankName && form.bankDetails.accountNumber && form.bankDetails.ifscCode);

  const handleSendOtp = async () => {
    if (!form.email.includes("@")) {
      Alert.alert("Invalid Email", "Please enter a valid email to receive the OTP.");
      return;
    }

    setLoading(true);
    try {
      await requestOtp(form.email, "register");
      setOtpSent(true);
      Alert.alert("OTP Sent", "Please check your email for the verification code.");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else handleRegister();
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else router.replace("/(auth)/login");
  };

  const handleRegister = async () => {
    setLoading(true);
    try {
      // Step 1: Register User Account with OTP
      await authRegister({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        otp: form.otp,
      });

      // Step 2: Register Delivery Partner Details
      await deliveryRegister({
        fullName: form.name,
        phoneNumber: form.phone,
        email: form.email,
        vehicleType: form.vehicleType,
        bankDetails: form.bankDetails,
        profilePhoto: "https://i.pravatar.cc/300",
        drivingLicense: "PENDING",
      });

      Alert.alert("Success!", "Registration complete. Welcome to the team!");
      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert("Registration Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Animated.View key="step1" entering={FadeInRight} exiting={FadeOutLeft} style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Account Details</Text>
            <Text style={styles.stepSubtitle}>Start with your basic information and verify your email.</Text>
            
            <ThemedInput
              label="Full Name"
              placeholder="John Doe"
              icon="person-outline"
              value={form.name}
              onChangeText={(text) => setForm({ ...form, name: text })}
            />
            
            <View style={styles.otpInputGroup}>
              <View style={{ flex: 1 }}>
                <ThemedInput
                  label="Email Address"
                  placeholder="john@example.com"
                  icon="mail-outline"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={form.email}
                  onChangeText={(text) => setForm({ ...form, email: text })}
                  containerStyle={{ marginBottom: 0 }}
                />
              </View>
              <TouchableOpacity 
                style={[styles.otpBtn, otpSent && styles.otpBtnSent]} 
                onPress={handleSendOtp}
                disabled={loading}
              >
                <Text style={styles.otpBtnText}>{otpSent ? "Resend" : "Get OTP"}</Text>
              </TouchableOpacity>
            </View>

            <ThemedInput
              label="Verification Code (OTP)"
              placeholder="Enter 6-digit code"
              icon="shield-checkmark-outline"
              keyboardType="numeric"
              maxLength={6}
              value={form.otp}
              onChangeText={(text) => setForm({ ...form, otp: text })}
            />

            <ThemedInput
              label="Phone Number"
              placeholder="10 digit number"
              icon="call-outline"
              keyboardType="phone-pad"
              value={form.phone}
              onChangeText={(text) => setForm({ ...form, phone: text })}
            />
            <ThemedInput
              label="Password"
              placeholder="At least 8 characters"
              icon="lock-closed-outline"
              secureTextEntry
              value={form.password}
              onChangeText={(text) => setForm({ ...form, password: text })}
            />

            <View style={styles.loginLinkContainer}>
              <Text style={styles.loginLinkText}>Already have an account?</Text>
              <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
                <Text style={styles.loginLinkAction}>Login</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        );
      case 2:
        return (
          <Animated.View key="step2" entering={FadeInRight} exiting={FadeOutLeft} style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Your Vehicle</Text>
            <Text style={styles.stepSubtitle}>Select the vehicle you will use for deliveries.</Text>
            
            <View style={styles.vehicleGrid}>
              {[
                { type: "Bike", icon: "bicycle-outline", desc: "Fast & Agile" },
                { type: "Cycle", icon: "walk-outline", desc: "Eco Friendly" },
                { type: "Car", icon: "car-outline", desc: "Max Capacity" },
              ].map((item) => (
                <TouchableOpacity
                  key={item.type}
                  style={[styles.vehicleCard, form.vehicleType === item.type && styles.vehicleCardActive]}
                  onPress={() => setForm({ ...form, vehicleType: item.type as any })}
                >
                  <View style={[styles.iconBox, form.vehicleType === item.type && styles.iconBoxActive]}>
                    <Ionicons 
                      name={item.icon as any} 
                      size={32} 
                      color={form.vehicleType === item.type ? Colors.light.black : Colors.light.primary} 
                    />
                  </View>
                  <Text style={[styles.vehicleLabel, form.vehicleType === item.type && styles.vehicleLabelActive]}>{item.type}</Text>
                  <Text style={[styles.vehicleDesc, form.vehicleType === item.type && styles.vehicleDescActive]}>{item.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        );
      case 3:
        return (
          <Animated.View key="step3" entering={FadeInRight} exiting={FadeOutLeft} style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Payout Details</Text>
            <Text style={styles.stepSubtitle}>Where should we send your hard-earned money?</Text>
            
            <ThemedInput
              label="Bank Name"
              placeholder="e.g. HDFC Bank"
              icon="business-outline"
              value={form.bankDetails.bankName}
              onChangeText={(text) => setForm({ ...form, bankDetails: { ...form.bankDetails, bankName: text }})}
            />
            <ThemedInput
              label="Account Number"
              placeholder="Your bank account number"
              icon="card-outline"
              keyboardType="numeric"
              value={form.bankDetails.accountNumber}
              onChangeText={(text) => setForm({ ...form, bankDetails: { ...form.bankDetails, accountNumber: text }})}
            />
            <ThemedInput
              label="IFSC Code"
              placeholder="e.g. HDFC0001234"
              icon="code-outline"
              autoCapitalize="characters"
              value={form.bankDetails.ifscCode}
              onChangeText={(text) => setForm({ ...form, bankDetails: { ...form.bankDetails, ifscCode: text }})}
            />
          </Animated.View>
        );
    }
  };

  return (
    <ScreenContainer withSafeArea>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <View style={styles.container}>
          <View style={styles.progressHeader}>
            <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
            </TouchableOpacity>
            <View style={styles.progressBarWrapper}>
              <View style={styles.progressBar}>
                <Animated.View layout={Layout.springify()} style={[styles.progressFill, { width: `${(step / 3) * 100}%` }]} />
              </View>
              <Text style={styles.stepIndicator}>Step {step} of 3</Text>
            </View>
          </View>

          <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {renderStep()}
          </ScrollView>

          <View style={styles.footer}>
            <PrimaryButton
              label={step === 3 ? "Complete Registration" : "Continue"}
              onPress={handleNext}
              loading={loading}
              disabled={loading || (step === 1 && !isStep1Valid) || (step === 2 && !isStep2Valid) || (step === 3 && !isStep3Valid)}
              style={styles.mainBtn}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: Spacing.lg },
  progressHeader: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.md, gap: Spacing.md, marginBottom: Spacing.xl },
  backBtn: { width: 44, height: 44, borderRadius: Radius.lg, backgroundColor: Colors.light.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.light.border },
  progressBarWrapper: { flex: 1, gap: 6 },
  progressBar: { height: 6, backgroundColor: Colors.light.surface, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.light.primary },
  stepIndicator: { fontSize: 12, fontWeight: '700', color: Colors.light.textDim, textTransform: 'uppercase', letterSpacing: 1 },
  content: { flex: 1 },
  scrollContent: { paddingBottom: Spacing.xl },
  stepContainer: { flex: 1 },
  stepTitle: { fontSize: 32, fontWeight: '900', color: Colors.light.text, letterSpacing: -1, marginBottom: Spacing.xs },
  stepSubtitle: { fontSize: 16, color: Colors.light.textDim, lineHeight: 24, marginBottom: Spacing.xl },
  otpInputGroup: { 
    flexDirection: 'row', 
    alignItems: 'flex-end', 
    gap: Spacing.sm, 
    marginBottom: Spacing.md 
  },
  otpBtn: { 
    height: 56, 
    paddingHorizontal: Spacing.lg, 
    backgroundColor: Colors.light.surfaceSecondary, 
    borderRadius: Radius.md, 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderWidth: 1.5, 
    borderColor: Colors.light.primary,
  },
  otpBtnSent: { borderColor: Colors.light.success, opacity: 0.8 },
  otpBtnText: { color: Colors.light.primary, fontWeight: '800', fontSize: 13 },
  vehicleGrid: { gap: Spacing.md },
  vehicleCard: { backgroundColor: Colors.light.surface, borderRadius: Radius.xl, padding: Spacing.lg, borderWidth: 2, borderColor: Colors.light.border, flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  vehicleCardActive: { borderColor: Colors.light.primary, backgroundColor: Colors.light.surfaceSecondary },
  iconBox: { width: 64, height: 64, borderRadius: Radius.lg, backgroundColor: Colors.light.background, alignItems: 'center', justifyContent: 'center' },
  iconBoxActive: { backgroundColor: Colors.light.primary },
  vehicleLabel: { fontSize: 20, fontWeight: '800', color: Colors.light.text },
  vehicleLabelActive: { color: Colors.light.primary },
  vehicleDesc: { fontSize: 14, color: Colors.light.textMuted, position: 'absolute', bottom: Spacing.md, right: Spacing.lg },
  vehicleDescActive: { color: Colors.light.textDim },
  footer: { paddingBottom: Spacing.xl, paddingTop: Spacing.md },
  mainBtn: { ...Shadows.gold },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xl,
    gap: Spacing.xs,
  },
  loginLinkText: {
    color: Colors.light.textDim,
    fontSize: 14,
  },
  loginLinkAction: {
    color: Colors.light.primary,
    fontSize: 14,
    fontWeight: '700',
  },
});
