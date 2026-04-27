import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useDeliveryStore } from "@/store/useDeliveryStore";
import { useAuthStore } from "@/store/useAuthStore";

export default function VerificationPending() {
  const profile = useDeliveryStore((state) => state.partnerProfile);
  const fetchProfile = useDeliveryStore((state) => state.fetchProfile);
  const logout = useAuthStore((state) => state.logout);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Ionicons 
          name={profile?.status === "rejected" ? "close-circle" : "time-outline"} 
          size={100} 
          color={profile?.status === "rejected" ? "#dc3545" : "#ffc107"} 
        />
        <Text style={styles.title}>
          {profile?.status === "rejected" ? "Account Rejected" : "Verification Pending"}
        </Text>
        <Text style={styles.description}>
          {profile?.status === "rejected" 
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
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginTop: 20,
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 30,
  },
  refreshButton: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginBottom: 15,
  },
  refreshText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  logoutButton: {
    padding: 10,
  },
  logoutText: {
    color: "#dc3545",
    fontSize: 16,
    fontWeight: "500",
  },
});
