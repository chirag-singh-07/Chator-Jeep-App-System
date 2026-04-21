import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DashboardHeader } from "@/components/DashboardHeader";
import { InfoCard } from "@/components/InfoCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useAuthStore } from "@/store/useAuthStore";

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenContainer>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <DashboardHeader
            title="Profile & settings"
            subtitle="Review your rider account details and sign out securely."
          />

          <InfoCard accent="slate">
            <Text style={styles.name}>{user?.name ?? "Delivery Partner"}</Text>
            <Text style={styles.meta}>{user?.email}</Text>
            <Text style={styles.meta}>{user?.phone || "No phone number on file"}</Text>
          </InfoCard>

          <InfoCard accent="blue">
            <Text style={styles.sectionTitle}>Dispatch setup</Text>
            <Text style={styles.sectionText}>
              Keep location permissions enabled for reliable assignment, map tracking, and live customer visibility.
            </Text>
          </InfoCard>

          <InfoCard accent="amber">
            <Text style={styles.sectionTitle}>Payout safety</Text>
            <Text style={styles.sectionText}>
              Payout requests move available wallet balance into a held state until admin approval or rejection.
            </Text>
          </InfoCard>

          <PrimaryButton label="Sign out" onPress={logout} />
        </ScrollView>
      </ScreenContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    paddingBottom: 28,
    gap: 16,
  },
  name: {
    color: "#0F172A",
    fontSize: 24,
    fontWeight: "800",
  },
  meta: {
    color: "#475569",
    fontSize: 14,
    lineHeight: 20,
  },
  sectionTitle: {
    color: "#0F172A",
    fontSize: 17,
    fontWeight: "800",
  },
  sectionText: {
    color: "#475569",
    fontSize: 14,
    lineHeight: 21,
  },
});
