import { useEffect } from "react";
import { ScrollView, StyleSheet, Text, View, Animated, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { DashboardHeader } from "@/components/DashboardHeader";
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
          title="My Earnings"
          subtitle="Manage your balance, track payouts, and view history."
        />

        {/* Premium Main Balance Card */}
        <LinearGradient
          colors={[Colors.light.primary, Colors.light.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceCard}
        >
          <View style={styles.cardGlow1} />
          <View style={styles.cardGlow2} />
          
          <View style={styles.balanceHeader}>
            <View style={styles.balanceBadge}>
              <Ionicons name="checkmark-circle" size={14} color={Colors.light.success} />
              <Text style={styles.balanceBadgeText}>Available for Payout</Text>
            </View>
            <TouchableOpacity onPress={() => fetchWalletOverview()} activeOpacity={0.7} style={styles.refreshBtn}>
              <Ionicons name="refresh" size={20} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>{formatCurrency(overview?.balance ?? 0)}</Text>
          
          <View style={styles.balanceDivider} />
          
          <View style={styles.balanceFooter}>
            <View>
              <Text style={styles.footerLabel}>Total Earned</Text>
              <Text style={styles.footerValue}>{formatCurrency(overview?.totalEarnings ?? 0)}</Text>
            </View>
            <PrimaryButton
              label="Withdraw"
              onPress={() => router.push("/wallet/request")}
              style={styles.withdrawBtn}
              textStyle={styles.withdrawBtnText}
            />
          </View>
        </LinearGradient>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <View style={[styles.statIconWrapper, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
              <Ionicons name="time" size={22} color="#F59E0B" />
            </View>
            <View>
              <Text style={styles.statLabel}>Held / Pending</Text>
              <Text style={styles.statValue}>{formatCurrency(overview?.heldBalance ?? 0)}</Text>
            </View>
          </View>

          <View style={styles.statBox}>
            <View style={[styles.statIconWrapper, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
              <Ionicons name="cash" size={22} color="#10B981" />
            </View>
            <View>
              <Text style={styles.statLabel}>Total Paid Out</Text>
              <Text style={styles.statValue}>{formatCurrency(overview?.totalPaidOut ?? 0)}</Text>
            </View>
          </View>
        </View>

        <SectionHeader title="Recent Payouts" actionLabel="View All" onPress={() => {}} />
        <View style={styles.stack}>
          {overview?.payouts?.length ? (
            overview.payouts.slice(0, 3).map((payout: WalletOverview["payouts"][number]) => (
              <View key={payout._id} style={styles.transactionItem}>
                <View style={styles.itemIcon}>
                  <Ionicons name="wallet-outline" size={20} color={Colors.light.primary} />
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
              <View style={styles.emptyIconBg}>
                <Ionicons name="cash-outline" size={28} color={Colors.light.textMuted} />
              </View>
              <Text style={styles.emptyTitle}>No payouts yet</Text>
              <Text style={styles.emptySubtitle}>When you request a withdrawal, it will show up here.</Text>
            </View>
          )}
        </View>

        <SectionHeader title="Transaction History" actionLabel="View All" onPress={() => {}} />
        <View style={styles.stack}>
          {overview?.transactions?.length ? (
            overview.transactions.slice(0, 5).map((transaction: WalletOverview["transactions"][number]) => (
              <View key={transaction._id} style={styles.transactionItem}>
                <View style={[styles.itemIcon, { backgroundColor: transaction.amount >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }]}>
                  <Ionicons 
                    name={transaction.amount >= 0 ? "arrow-down" : "arrow-up"} 
                    size={18} 
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
                  <Text style={styles.meta}>Balance: {formatCurrency(transaction.balanceAfter)}</Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyRow}>
              <View style={styles.emptyIconBg}>
                <Ionicons name="receipt-outline" size={28} color={Colors.light.textMuted} />
              </View>
              <Text style={styles.emptyTitle}>No recent activity</Text>
              <Text style={styles.emptySubtitle}>Complete deliveries to earn money.</Text>
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
  balanceCard: {
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    overflow: 'hidden',
    position: 'relative',
    ...Shadows.medium,
    shadowColor: Colors.light.primary,
  },
  cardGlow1: {
    position: 'absolute',
    top: -50,
    right: -20,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#ffffff',
    opacity: 0.1,
  },
  cardGlow2: {
    position: 'absolute',
    bottom: -60,
    left: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#ffffff',
    opacity: 0.05,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  balanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    gap: 6,
  },
  balanceBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  refreshBtn: {
    padding: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: Radius.full,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  balanceAmount: {
    color: '#ffffff',
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: -1,
    marginBottom: Spacing.md,
  },
  balanceDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginVertical: Spacing.md,
  },
  balanceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  footerValue: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  withdrawBtn: {
    backgroundColor: '#ffffff',
    paddingHorizontal: Spacing.xl,
    height: 40,
    minWidth: 120,
    borderRadius: Radius.full,
  },
  withdrawBtnText: {
    color: Colors.light.primary,
    fontSize: 14,
    fontWeight: '800',
  },
  statsContainer: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  statBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    padding: Spacing.md,
    borderRadius: Radius.xl,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
    ...Shadows.soft,
  },
  statIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    color: Colors.light.textDim,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  statValue: {
    color: Colors.light.text,
    fontSize: 16,
    fontWeight: '800',
  },
  stack: {
    gap: Spacing.md,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    padding: Spacing.md,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: Spacing.md,
  },
  itemIcon: {
    width: 46,
    height: 46,
    borderRadius: Radius.xl,
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
    fontWeight: "500",
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
  emptyRow: {
    padding: Spacing.xl,
    backgroundColor: Colors.light.surface,
    borderRadius: Radius.xl,
    borderStyle: 'dashed',
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyIconBg: {
    width: 56,
    height: 56,
    borderRadius: Radius.full,
    backgroundColor: Colors.light.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    color: Colors.light.text,
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
  },
  emptySubtitle: {
    color: Colors.light.textMuted,
    fontSize: 13,
    textAlign: "center",
    marginTop: 4,
    lineHeight: 18,
    paddingHorizontal: 20,
  }
});
