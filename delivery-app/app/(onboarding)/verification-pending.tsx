import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useDeliveryStore } from "@/store/useDeliveryStore";
import { useAuthStore } from "@/store/useAuthStore";
import { Colors, Spacing, Radius } from "@/constants/Colors";

export default function VerificationPending() {
  const profile = useDeliveryStore((state) => state.partnerProfile);
  const fetchProfile = useDeliveryStore((state) => state.fetchProfile);
  const logout = useAuthStore((state) => state.logout);

  const isRejected = profile?.status === "rejected";

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={[styles.iconWrapper, isRejected && styles.iconWrapperRejected]}>
          <Ionicons
            name={isRejected ? "close-circle" : "time-outline"}
            size={100}
            color={isRejected ? Colors.light.error : Colors.light.primary}
          />
        </View>
        <Text style={styles.title}>
          {isRejected ? "Account Rejected" : "Verification Pending"}
        </Text>
        <Text style={styles.description}>
          {isRejected
            ? `Your application was rejected. Remark: ${profile.adminRemarks || "No remarks provided."}`
            : "Your account is currently under review by our admin team. This usually takes 24-48 hours. We'll notify you once it's approved."}
        </Text>

        <TouchableOpacity style={styles.refreshButton} onPress={() => fetchProfile()}>
          <Text style={styles.refreshText}>Refresh Status</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={() => logout()}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
  },
  iconWrapper: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: Colors.light.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  iconWrapperRejected: {
    backgroundColor: "#FEE2E2",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.light.text,
    marginBottom: Spacing.md,
  },
  description: {
    fontSize: 16,
    color: Colors.light.textMuted,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  refreshButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: Radius.md,
    marginBottom: Spacing.md,
  },
  refreshText: {
    color: Colors.light.secondary,
    fontSize: 16,
    fontWeight: "600",
  },
  logoutButton: {
    padding: Spacing.md,
  },
  logoutText: {
    color: Colors.light.error,
    fontSize: 16,
    fontWeight: "500",
  },
});