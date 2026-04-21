import { useEffect } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
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

export default function WalletScreen() {
  const { overview, isLoading, fetchWalletOverview } = useWalletStore();

  useEffect(() => {
    void fetchWalletOverview();
  }, [fetchWalletOverview]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenContainer>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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

          <InfoCard accent="green">
            <Text style={styles.cardTitle}>Request a payout</Text>
            <Text style={styles.cardText}>
              Available balance is what you can withdraw right now. Held balance covers requests waiting on admin approval.
            </Text>
            <PrimaryButton
              label="New payout request"
              onPress={() => router.push("/wallet/request")}
              style={{ marginTop: 14 }}
            />
          </InfoCard>

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
              <InfoCard accent="slate">
                <Text style={styles.cardTitle}>No payout requests yet</Text>
                <Text style={styles.cardText}>
                  Your submitted payout requests will show up here with approval status and admin notes.
                </Text>
              </InfoCard>
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
              <InfoCard accent="slate">
                <Text style={styles.cardTitle}>No transactions yet</Text>
                <Text style={styles.cardText}>
                  Completed deliveries and payout actions will generate transaction history here.
                </Text>
              </InfoCard>
            )}
          </View>
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
    paddingBottom: 30,
    gap: 18,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  stack: {
    gap: 12,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 14,
  },
  cardTitle: {
    color: "#0F172A",
    fontSize: 17,
    fontWeight: "800",
  },
  cardText: {
    color: "#475569",
    fontSize: 14,
    lineHeight: 20,
  },
  meta: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "600",
  },
  amount: {
    fontSize: 16,
    fontWeight: "800",
  },
  positiveAmount: {
    color: "#15803D",
  },
  negativeAmount: {
    color: "#B45309",
  },
});
