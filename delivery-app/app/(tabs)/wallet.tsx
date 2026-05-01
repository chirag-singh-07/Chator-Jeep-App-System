import { useEffect } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { DashboardHeader } from "@/components/DashboardHeader";
import { InfoCard } from "@/components/InfoCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ScreenContainer } from "@/components/ScreenContainer";
import { SectionHeader } from "@/components/SectionHeader";
import { StatTile } from "@/components/StatTile";
import { StatusPill } from "@/components/StatusPill";
import { useWalletStore } from "@/store/useWalletStore";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { WalletOverview } from "@/types";
import { Colors, Spacing, Radius } from "@/constants/Colors";

export default function WalletScreen() {
  const { overview, isLoading, fetchWalletOverview } = useWalletStore();

  useEffect(() => {
    void fetchWalletOverview();
  }, [fetchWalletOverview]);

  return (
    <ScreenContainer withSafeArea>
      <ScrollView 
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
      >
        <DashboardHeader
          title="Wallet"
          subtitle="Track balances, payout requests, and delivery earnings with a clean audit trail."
        />

        <View style={styles.grid}>
          <StatTile label="Available" value={formatCurrency(overview?.balance ?? 0)} tone="green" />
          <StatTile label="Held" value={formatCurrency(overview?.heldBalance ?? 0)} tone="amber" />
          <StatTile label="Total earned" value={formatCurrency(overview?.totalEarnings ?? 0)} tone="blue" />
          <StatTile label="Paid out" value={formatCurrency(overview?.totalPaidOut ?? 0)} tone="slate" />
        </View>

        <View style={styles.promoCard}>
          <Text style={styles.promoTitle}>Request a Payout</Text>
          <Text style={styles.promoSubtitle}>
            Available balance is ready for withdrawal. Held balance awaits admin approval.
          </Text>
          <PrimaryButton
            label="New payout request"
            onPress={() => router.push("/wallet/request")}
            style={styles.payoutButton}
          />
        </View>

        <SectionHeader title="Recent payout requests" />
        <View style={styles.stack}>
          {overview?.payouts?.length ? (
            overview.payouts.map((payout: WalletOverview["payouts"][number]) => (
              <InfoCard key={payout._id} accent="slate">
                <View style={styles.rowBetween}>
                  <View style={{ gap: 4, flex: 1 }}>
                    <Text style={styles.cardTitle}>{formatCurrency(payout.amount)}</Text>
                    <Text style={styles.cardText}>
                      {payout.paymentMethod.type === "UPI"
                        ? payout.paymentMethod.upiId
                        : `${payout.paymentMethod.bankName ?? "Bank account"} · ****${payout.paymentMethod.accountNumber?.slice(-4) ?? ""}`}
                    </Text>
                    <Text style={styles.meta}>{formatDateTime(payout.createdAt)}</Text>
                  </View>
                  <StatusPill label={payout.status} status={payout.status} />
                </View>
              </InfoCard>
            ))
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No payout requests yet</Text>
            </View>
          )}
        </View>

        <SectionHeader title="Recent transactions" />
        <View style={styles.stack}>
          {overview?.transactions?.length ? (
            overview.transactions.map((transaction: WalletOverview["transactions"][number]) => (
              <InfoCard key={transaction._id} accent="slate">
                <View style={styles.rowBetween}>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={styles.cardTitle}>{transaction.description}</Text>
                    <Text style={styles.cardText}>{formatDateTime(transaction.createdAt)}</Text>
                  </View>
                  <View style={{ alignItems: "flex-end", gap: 4 }}>
                    <Text
                      style={[
                        styles.amount,
                        transaction.amount >= 0 ? styles.positiveAmount : styles.negativeAmount,
                      ]}
                    >
                      {transaction.amount >= 0 ? "+" : ""}
                      {formatCurrency(transaction.amount)}
                    </Text>
                    <Text style={styles.meta}>Bal. {formatCurrency(transaction.balanceAfter)}</Text>
                  </View>
                </View>
              </InfoCard>
            ))
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No transactions yet</Text>
            </View>
          )}
        </View>
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
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  stack: {
    gap: Spacing.md,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacing.md,
  },
  promoCard: {
    backgroundColor: Colors.light.surfaceSecondary,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  promoTitle: {
    color: Colors.light.text,
    fontSize: 20,
    fontWeight: "800",
    marginBottom: Spacing.xs,
  },
  promoSubtitle: {
    color: Colors.light.textDim,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  payoutButton: {
    height: 50,
  },
  cardTitle: {
    color: Colors.light.text,
    fontSize: 16,
    fontWeight: "800",
  },
  cardText: {
    color: Colors.light.textDim,
    fontSize: 13,
    lineHeight: 18,
  },
  meta: {
    color: Colors.light.textMuted,
    fontSize: 11,
    fontWeight: "600",
  },
  amount: {
    fontSize: 16,
    fontWeight: "900",
  },
  positiveAmount: {
    color: Colors.light.success,
  },
  negativeAmount: {
    color: Colors.light.error,
  },
  emptyCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
    borderWidth: 1.5,
    borderColor: Colors.light.border,
  },
  emptyText: {
    color: Colors.light.textMuted,
    fontSize: 14,
    fontWeight: '600',
  }
});
