import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/store/useAuthStore";

export default function RejectedScreen() {
  const { user, logout } = useAuthStore();

  const rejectionReason =
    (user as { rejectionReason?: string } | null)?.rejectionReason ||
    "Verification failed. Please review your restaurant details and try again.";

  const RESUBMIT_CHECKLIST = [
    "GOVERNMENT ISSUED ID",
    "KITCHEN ESTABLISHMENT PROOF",
    "LINKED PAYOUT ACCOUNT",
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.topSection}>
          <View style={styles.iconCircle}>
            <Ionicons
              name="shield-outline"
              size={50}
              color="#FF4B3A"
            />
          </View>
          <Text style={styles.title}>APPLICATION REJECTED</Text>
          <Text style={styles.subtitle}>
            Your restaurant application was rejected. Update the missing details and submit again.
          </Text>
        </View>

        {/* Rejection Reason */}
        <View style={styles.reasonCard}>
          <View style={styles.reasonHeader}>
            <Ionicons name="alert-circle" size={18} color="#FF4B3A" />
            <Text style={styles.reasonTitle}>REJECTION REASON</Text>
          </View>
          <Text style={styles.reasonText}>{rejectionReason}</Text>
        </View>

        {/* What to Fix */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>REQUIRED ADJUSTMENTS</Text>
          <Text style={styles.cardSub}>
            Please fix the following before submitting your restaurant again:
          </Text>
          <View style={styles.checklist}>
            {RESUBMIT_CHECKLIST.map((item) => (
              <View key={item} style={styles.checkRow}>
                <Ionicons name="close-circle-outline" size={14} color="#444" />
                <Text style={styles.checkText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.replace("/(auth)/register")}
          >
            <Ionicons name="refresh" size={20} color="black" />
            <Text style={styles.primaryBtnText}>UPDATE & RESUBMIT</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryBtn}
            onPress={() => Alert.alert("Support", "Support chat is not available right now. Please try again later.")}
          >
            <Ionicons
              name="chatbubbles"
              size={20}
              color={Colors.light.primary}
            />
            <Text style={styles.secondaryBtnText}>CONTACT SUPPORT</Text>
          </TouchableOpacity>
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Ionicons name="log-out-outline" size={18} color="#444" />
          <Text style={styles.logoutText}>SIGN OUT</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  scroll: { padding: 30 },
  topSection: { alignItems: "center", marginTop: 40, marginBottom: 40 },
  iconCircle: {
    height: 120,
    width: 120,
    borderRadius: 40,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "#222",
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FFF",
    marginBottom: 12,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 15,
    fontWeight: "600",
  },
  reasonCard: {
    backgroundColor: "#111",
    borderRadius: 25,
    padding: 25,
    borderWidth: 1,
    borderColor: "#FF4B3A",
    marginBottom: 20,
  },
  reasonHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 15,
  },
  reasonTitle: {
    fontSize: 11,
    fontWeight: "900",
    color: "#FF4B3A",
    letterSpacing: 1.5,
  },
  reasonText: { fontSize: 13, color: "#EEE", lineHeight: 22, fontWeight: "600" },
  card: {
    backgroundColor: "#111",
    borderRadius: 30,
    padding: 25,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "#222",
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: "900",
    color: "#444",
    marginBottom: 8,
    letterSpacing: 2,
  },
  cardSub: { fontSize: 12, color: "#666", marginBottom: 20, fontWeight: "600" },
  checklist: { gap: 15 },
  checkRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  checkText: {
    fontSize: 12,
    color: "#EEE",
    fontWeight: "800",
    letterSpacing: 1,
  },
  actionsSection: { gap: 15, marginBottom: 30 },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: Colors.light.primary,
    height: 65,
    borderRadius: 22,
  },
  primaryBtnText: { color: "black", fontSize: 15, fontWeight: "900", letterSpacing: 1 },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: "#0A0A0A",
    height: 65,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#222",
  },
  secondaryBtnText: {
    color: "#CCC",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 1,
  },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 20 },
  logoutText: { color: "#444", fontSize: 11, fontWeight: "900", letterSpacing: 1.5 },
});
