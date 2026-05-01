import { useEffect } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
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
import { Colors, Spacing, Radius, Shadows } from "../../constants/Colors";

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

        <View style={styles.statsContainer}>
          <StatTile 
            label="AVAILABLE" 
            value={formatCurrency(overview?.balance ?? 0)} 
            tone="green" 
            icon="wallet"
          />
          <StatTile 
            label="HELD" 
            value={formatCurrency(overview?.heldBalance ?? 0)} 
            tone="amber" 
            icon="timer"
          />
          <StatTile 
            label="EARNED" 
            value={formatCurrency(overview?.totalEarnings ?? 0)} 
            tone="blue" 
            icon="stats-chart"
          />
        </View>

        <View style={styles.promoCard}>
          <View style={styles.promoInfo}>
            <Text style={styles.promoTitle}>Request Withdrawal</Text>
            <Text style={styles.promoSubtitle}>
              Transfer your available balance to your bank account or UPI ID.
            </Text>
          </View>
          <PrimaryButton
            label="New Payout"
            onPress={() => router.push("/wallet/request")}
            style={styles.payoutButton}
            icon="arrow-up-circle-outline"
          />
        </View>

        <SectionHeader title="Recent Payouts" />
        <View style={styles.stack}>
          {overview?.payouts?.length ? (
            overview.payouts.map((payout: WalletOverview["payouts"][number]) => (
              <View key={payout._id} style={styles.transactionItem}>
                <View style={styles.itemIcon}>
                  <Ionicons name="card-outline" size={20} color={Colors.light.primary} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={styles.cardTitle}>{formatCurrency(payout.amount)}</Text>
                  <Text style={styles.cardText}>
                    {payout.paymentMethod.type === "UPI"
                      ? payout.paymentMethod.upiId
                      : `${payout.paymentMethod.bankName ?? "Bank"} · ****${payout.paymentMethod.accountNumber?.slice(-4) ?? ""}`}
                  </Text>
                  <Text style={styles.meta}>{formatDateTime(payout.createdAt)}</Text>
                </View>
                <StatusPill label={payout.status} status={payout.status} />
              </View>
            ))
          ) : (
            <View style={styles.emptyRow}>
              <Text style={styles.emptyRowText}>No payout requests yet</Text>
            </View>
          )}
        </View>

        <SectionHeader title="Transaction History" />
        <View style={styles.stack}>
          {overview?.transactions?.length ? (
            overview.transactions.map((transaction: WalletOverview["transactions"][number]) => (
              <View key={transaction._id} style={styles.transactionItem}>
                <View style={[styles.itemIcon, { backgroundColor: transaction.amount >= 0 ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 75, 58, 0.1)' }]}>
                  <Ionicons 
                    name={transaction.amount >= 0 ? "add-circle-outline" : "remove-circle-outline"} 
                    size={20} 
                    color={transaction.amount >= 0 ? Colors.light.success : Colors.light.error} 
                  />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={styles.cardTitle}>{transaction.description}</Text>
                  <Text style={styles.meta}>{formatDateTime(transaction.createdAt)}</Text>
                </View>
                <View style={{ alignItems: "flex-end", gap: 2 }}>
                  <Text
                    style={[
                      styles.amount,
                      transaction.amount >= 0 ? styles.positiveAmount : styles.negativeAmount,
                    ]}
                  >
                    {transaction.amount >= 0 ? "+" : ""}
                    {formatCurrency(transaction.amount)}
                  </Text>
                  <Text style={styles.meta}>Balance {formatCurrency(transaction.balanceAfter)}</Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyRow}>
              <Text style={styles.emptyRowText}>No transactions found</Text>
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
    paddingBottom: Spacing.xxl,
    paddingTop: Spacing.md,
    gap: Spacing.lg,
  },
  statsContainer: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  stack: {
    gap: Spacing.md,
  },
  promoCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.light.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    ...Shadows.soft,
  },
  promoInfo: {
    flex: 1,
    gap: 4,
  },
  promoTitle: {
    color: Colors.light.text,
    fontSize: 18,
    fontWeight: "900",
  },
  promoSubtitle: {
    color: Colors.light.textDim,
    fontSize: 12,
    lineHeight: 18,
  },
  payoutButton: {
    height: 44,
    paddingHorizontal: Spacing.lg,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: Spacing.md,
  },
  itemIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.light.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    color: Colors.light.text,
    fontSize: 15,
    fontWeight: "800",
  },
  cardText: {
    color: Colors.light.textDim,
    fontSize: 12,
  },
  meta: {
    color: Colors.light.textMuted,
    fontSize: 11,
    fontWeight: "600",
  },
  amount: {
    fontSize: 15,
    fontWeight: "900",
  },
  positiveAmount: {
    color: Colors.light.success,
  },
  negativeAmount: {
    color: Colors.light.error,
  },
  emptyRow: {
    padding: Spacing.xxl,
    backgroundColor: Colors.light.surface,
    borderRadius: Radius.xl,
    borderStyle: 'dashed',
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyRowText: {
    color: Colors.light.textMuted,
    fontSize: 14,
    fontWeight: '600',
  }
});
