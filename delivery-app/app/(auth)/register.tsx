import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useDeliveryStore } from "@/store/useDeliveryStore";
import { useAuthStore } from "@/store/useAuthStore";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

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
    profilePhoto: "https://i.pravatar.cc/300", // Placeholder
    drivingLicense: "DL-123456789", // Placeholder
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
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Delivery Partner Registration</Text>
        <Text style={styles.subtitle}>Fill in your details to start earning</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Details</Text>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={form.fullName}
            onChangeText={(text) => setForm({ ...form, fullName: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            keyboardType="phone-pad"
            value={form.phoneNumber}
            onChangeText={(text) => setForm({ ...form, phoneNumber: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
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
          <TextInput
            style={styles.input}
            placeholder="Bank Name"
            value={form.bankDetails.bankName}
            onChangeText={(text) =>
              setForm({ ...form, bankDetails: { ...form.bankDetails, bankName: text } })
            }
          />
          <TextInput
            style={styles.input}
            placeholder="Account Number"
            keyboardType="numeric"
            value={form.bankDetails.accountNumber}
            onChangeText={(text) =>
              setForm({ ...form, bankDetails: { ...form.bankDetails, accountNumber: text } })
            }
          />
          <TextInput
            style={styles.input}
            placeholder="IFSC Code"
            autoCapitalize="characters"
            value={form.bankDetails.ifscCode}
            onChangeText={(text) =>
              setForm({ ...form, bankDetails: { ...form.bankDetails, ifscCode: text } })
            }
          />
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>Submit for Verification</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  typeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  typeButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4,
  },
  typeButtonActive: {
    backgroundColor: "#007bff",
    borderColor: "#007bff",
  },
  typeText: {
    color: "#333",
    fontWeight: "500",
  },
  typeTextActive: {
    color: "#fff",
  },
  submitButton: {
    backgroundColor: "#007bff",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 32,
  },
  submitText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
