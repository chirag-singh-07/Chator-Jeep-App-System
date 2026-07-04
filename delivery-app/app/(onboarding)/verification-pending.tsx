import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, ScrollView, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useDeliveryStore } from "@/store/useDeliveryStore";
import { useAuthStore } from "@/store/useAuthStore";
import { Colors, Spacing, Radius, Shadows } from "@/constants/Colors";
import { StatusBar } from "expo-status-bar";

export default function VerificationPending() {
  const profile = useDeliveryStore((state) => state.partnerProfile);
  const fetchProfile = useDeliveryStore((state) => state.fetchProfile);
  const isLoading = useDeliveryStore((state) => state.isLoading);
  const logout = useAuthStore((state) => state.logout);

  const isRejected = profile?.status === "rejected";

  // Pulse animation for the pending state
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isRejected) return;
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [isRejected]);

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar style="light" backgroundColor={Colors.light.primary} />

      {/* Top gradient banner */}
      <LinearGradient
        colors={[Colors.light.primaryLight, Colors.light.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroBanner}
      >
        <View style={styles.heroDeco1} />
        <View style={styles.heroDeco2} />
        <SafeAreaView edges={["top"]} style={styles.heroContent}>
          <Text style={styles.heroTitle}>Chatori Jeeb</Text>
          <Text style={styles.heroSubtitle}>Delivery Partner</Text>
        </SafeAreaView>
      </LinearGradient>

      <View style={styles.content}>
        {/* Status card */}
        <View style={styles.statusCard}>
          <Animated.View
            style={[
              styles.iconWrapper,
              isRejected ? styles.iconWrapperRejected : styles.iconWrapperPending,
              !isRejected && { transform: [{ scale: pulseAnim }] },
            ]}
          >
            <Ionicons
              name={isRejected ? "close-circle" : "time-outline"}
              size={64}
              color={isRejected ? "#EF4444" : Colors.light.primary}
            />
          </Animated.View>

          <Text style={styles.statusTitle}>
            {isRejected ? "Application Rejected" : "Verification Pending"}
          </Text>

          <Text style={styles.statusDesc}>
            {isRejected
              ? profile?.adminRemarks
                ? `Your application was rejected.\n\nReason: ${profile.adminRemarks}`
                : "Your application was rejected. Please contact support for more information."
              : "Your account is currently under review by our admin team. This usually takes 24–48 hours. We'll notify you once it's approved."}
          </Text>

          {/* Status steps */}
          {!isRejected && (
            <View style={styles.stepsRow}>
              <View style={styles.step}>
                <View style={[styles.stepCircle, styles.stepDone]}>
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                </View>
                <Text style={styles.stepText}>Submitted</Text>
              </View>
              <View style={[styles.stepLine, styles.stepLinePending]} />
              <View style={styles.step}>
                <View style={[styles.stepCircle, styles.stepActive]}>
                  <Ionicons name="time-outline" size={14} color="#FFFFFF" />
                </View>
                <Text style={[styles.stepText, { color: Colors.light.primary }]}>Review</Text>
              </View>
              <View style={styles.stepLine} />
              <View style={styles.step}>
                <View style={styles.stepCircle}>
                  <Ionicons name="checkmark-circle-outline" size={14} color={Colors.light.textDim} />
                </View>
                <Text style={styles.stepText}>Approved</Text>
              </View>
            </View>
          )}
        </View>

        {/* Info tips */}
        {!isRejected && (
          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={20} color={Colors.light.primary} />
            <Text style={styles.infoText}>
              We verify each partner's documents manually to ensure safety for our customers and riders.
            </Text>
          </View>
        )}

        {/* Actions */}
        <TouchableOpacity
          style={[styles.refreshButton, isLoading && { opacity: 0.7 }]}
          disabled={isLoading}
          onPress={async () => {
            await fetchProfile();
            const currentProfile = useDeliveryStore.getState().partnerProfile;
            if (currentProfile?.status === "approved") {
              Alert.alert("Approved!", "Your account has been verified. Welcome to Chatori Jeeb!");
            } else if (currentProfile?.status === "pending") {
              Alert.alert("Status: Pending", "Your account is still under review. Please check back later.");
            }
          }}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[Colors.light.primaryLight, Colors.light.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.refreshGradient}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Ionicons name="refresh-outline" size={20} color="#FFFFFF" />
            )}
            <Text style={styles.refreshText}>{isLoading ? "Checking..." : "Check Status"}</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={async () => {
            await logout();
            router.replace("/(auth)/login");
          }}
        >
          <Ionicons name="log-out-outline" size={18} color={Colors.light.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  heroBanner: {
    paddingBottom: 32,
    overflow: "hidden",
  },
  heroDeco1: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#FFFFFF",
    opacity: 0.06,
    top: -60,
    right: -40,
  },
  heroDeco2: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FFFFFF",
    opacity: 0.05,
    bottom: -30,
    left: 20,
  },
  heroContent: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 8,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 2,
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginTop: 2,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  statusCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: "center",
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.light.border,
    ...Shadows.card,
  },
  iconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  iconWrapperPending: {
    backgroundColor: Colors.light.overlay,
    borderWidth: 2,
    borderColor: Colors.light.border,
  },
  iconWrapperRejected: {
    backgroundColor: "#FEE2E2",
    borderWidth: 2,
    borderColor: "#FECACA",
  },
  statusTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: Colors.light.text,
    marginBottom: Spacing.md,
    textAlign: "center",
  },
  statusDesc: {
    fontSize: 14,
    color: Colors.light.textMuted,
    textAlign: "center",
    lineHeight: 22,
    fontWeight: "500",
    marginBottom: Spacing.xl,
  },
  // Status steps
  stepsRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    justifyContent: "center",
  },
  step: {
    alignItems: "center",
    gap: 4,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  stepDone: {
    backgroundColor: Colors.light.success,
    borderColor: Colors.light.success,
  },
  stepActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  stepText: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.light.textMuted,
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.light.border,
    marginBottom: 14,
    marginHorizontal: 4,
  },
  stepLinePending: {
    backgroundColor: Colors.light.primary,
    opacity: 0.4,
  },
  // Info box
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    backgroundColor: Colors.light.overlay,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: Colors.light.textMuted,
    lineHeight: 20,
    fontWeight: "500",
  },
  // Buttons
  refreshButton: {
    borderRadius: Radius.full,
    overflow: "hidden",
    marginBottom: Spacing.md,
    ...Shadows.blue,
  },
  refreshGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
  },
  refreshText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: Spacing.md,
  },
  logoutText: {
    color: Colors.light.error,
    fontSize: 15,
    fontWeight: "600",
  },
});