import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { useDeliveryStore } from "@/store/useDeliveryStore";
import { useAuthStore } from "@/store/useAuthStore";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, Radius, Shadows } from "@/constants/Colors";
import { ScreenContainer } from "@/components/ScreenContainer";
import { ThemedInput } from "@/components/ThemedInput";
import { PrimaryButton } from "@/components/PrimaryButton";

export default function RegisterScreen() {
  const router = useRouter();
  const register = useDeliveryStore((state) => state.register);
  const user = useAuthStore((state) => state.user);
  
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: user?.name || "",
    phoneNumber: user?.phone || "",
    email: user?.email || "",
    vehicleType: "Bike",
    profilePhoto: "https://i.pravatar.cc/300",
    drivingLicense: "DL-123456789",
    bankDetails: {
      accountHolderName: user?.name || "",
      accountNumber: "",
      ifscCode: "",
      bankName: "",
    },
  });

  const handleRegister = async () => {
    if (!form.bankDetails.accountNumber || !form.bankDetails.ifscCode) {
      Alert.alert("Error", "Please fill all bank details");
      return;
    }

    setLoading(true);
    try {
      await register(form);
      Alert.alert("Success", "Registration successful. Please wait for admin approval.");
      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer withSafeArea>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardArea}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color={Colors.light.text} />
            </TouchableOpacity>
            <Text style={styles.title}>Partner Onboarding</Text>
            <Text style={styles.subtitle}>Complete your profile to start receiving delivery requests.</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Details</Text>
            <ThemedInput
              label="Full Name"
              placeholder="John Doe"
              icon="person-outline"
              value={form.fullName}
              onChangeText={(text) => setForm({ ...form, fullName: text })}
            />
            <ThemedInput
              label="Phone Number"
              placeholder="+91 98765 43210"
              icon="call-outline"
              keyboardType="phone-pad"
              value={form.phoneNumber}
              onChangeText={(text) => setForm({ ...form, phoneNumber: text })}
            />
            <ThemedInput
              label="Email Address"
              placeholder="john@example.com"
              icon="mail-outline"
              keyboardType="email-address"
              value={form.email}
              onChangeText={(text) => setForm({ ...form, email: text })}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vehicle Information</Text>
            <View style={styles.typeContainer}>
              {["Bike", "Cycle", "Car"].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    form.vehicleType === type && styles.typeButtonActive,
                  ]}
                  onPress={() => setForm({ ...form, vehicleType: type as any })}
                >
                  <Ionicons 
                    name={type === 'Bike' ? 'bicycle' : type === 'Cycle' ? 'walk' : 'car'} 
                    size={20} 
                    color={form.vehicleType === type ? Colors.light.black : Colors.light.textDim} 
                  />
                  <Text
                    style={[
                      styles.typeText,
                      form.vehicleType === type && styles.typeTextActive,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bank Details</Text>
            <ThemedInput
              label="Bank Name"
              placeholder="HDFC Bank"
              icon="business-outline"
              value={form.bankDetails.bankName}
              onChangeText={(text) =>
                setForm({ ...form, bankDetails: { ...form.bankDetails, bankName: text } })
              }
            />
            <ThemedInput
              label="Account Number"
              placeholder="0000 0000 0000 0000"
              icon="card-outline"
              keyboardType="numeric"
              value={form.bankDetails.accountNumber}
              onChangeText={(text) =>
                setForm({ ...form, bankDetails: { ...form.bankDetails, accountNumber: text } })
              }
            />
            <ThemedInput
              label="IFSC Code"
              placeholder="HDFC0001234"
              icon="code-outline"
              autoCapitalize="characters"
              value={form.bankDetails.ifscCode}
              onChangeText={(text) =>
                setForm({ ...form, bankDetails: { ...form.bankDetails, ifscCode: text } })
              }
            />
          </View>

          <PrimaryButton
            label="Submit for Verification"
            onPress={handleRegister}
            loading={loading}
            style={styles.submitButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  keyboardArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  header: {
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.light.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.light.textDim,
    lineHeight: 22,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.light.primary,
    marginBottom: Spacing.md,
    letterSpacing: 0.5,
  },
  typeContainer: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    height: 50,
    backgroundColor: Colors.light.surface,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
  },
  typeButtonActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  typeText: {
    color: Colors.light.textDim,
    fontWeight: "700",
    fontSize: 14,
  },
  typeTextActive: {
    color: Colors.light.black,
  },
  submitButton: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
    ...Shadows.gold,
  },
});
