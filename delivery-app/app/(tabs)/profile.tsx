import { ScrollView, StyleSheet, Text, View } from "react-native";
import { DashboardHeader } from "@/components/DashboardHeader";
import { InfoCard } from "@/components/InfoCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useAuthStore } from "@/store/useAuthStore";
import { useDeliveryStore } from "@/store/useDeliveryStore";
import { Colors, Spacing, Radius } from "@/constants/Colors";
import { router } from "expo-router";

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const { simulateOrder } = useDeliveryStore();

  return (
    <ScreenContainer withSafeArea>
      <ScrollView 
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
      >
        <DashboardHeader
          title="Profile & settings"
          subtitle="Review your rider account details and sign out securely."
        />

        <View style={styles.userCard}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0) ?? "D"}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.name}>{user?.name ?? "Delivery Partner"}</Text>
            <Text style={styles.meta}>{user?.email}</Text>
            <Text style={styles.meta}>{user?.phone || "No phone number"}</Text>
          </View>
        </View>

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

        <View style={styles.devSection}>
          <Text style={styles.devTitle}>Developer Tools</Text>
          <PrimaryButton 
            label="Simulate Test Order" 
            onPress={() => {
              simulateOrder();
              router.push("/(tabs)");
            }} 
            style={styles.devButton}
            textStyle={styles.devButtonText}
            icon="flask-outline"
          />
        </View>

        <PrimaryButton 
          label="Sign out" 
          onPress={logout} 
          variant="outline"
          style={styles.logoutButton}
          textStyle={styles.logoutText}
        />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
    gap: Spacing.lg,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: Spacing.md,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.light.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
  avatarText: {
    color: Colors.light.primary,
    fontSize: 24,
    fontWeight: '900',
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  name: {
    color: Colors.light.text,
    fontSize: 22,
    fontWeight: "900",
  },
  meta: {
    color: Colors.light.textDim,
    fontSize: 14,
  },
  sectionTitle: {
    color: Colors.light.text,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: Spacing.xs,
  },
  sectionText: {
    color: Colors.light.textDim,
    fontSize: 14,
    lineHeight: 20,
  },
  logoutButton: {
    marginTop: Spacing.md,
    borderColor: Colors.light.error,
  },
  logoutText: {
    color: Colors.light.error,
  },
  devSection: {
    marginTop: Spacing.md,
    gap: Spacing.md,
  },
  devTitle: {
    color: Colors.light.textMuted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: -Spacing.xs,
  },
  devButton: {
    backgroundColor: Colors.light.surfaceSecondary,
    borderColor: Colors.light.border,
    borderWidth: 1,
  },
  devButtonText: {
    color: Colors.light.text,
  }
});
