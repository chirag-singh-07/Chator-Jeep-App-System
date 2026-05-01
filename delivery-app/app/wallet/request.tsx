import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ScreenContainer } from "@/components/ScreenContainer";
import { ThemedInput } from "@/components/ThemedInput";
import { useWalletStore } from "@/store/useWalletStore";
import { Colors, Spacing, Radius, Shadows } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function RequestPayoutScreen() {
  const { requestPayout, isSubmitting } = useWalletStore();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"UPI" | "BANK_ACCOUNT">("UPI");
  const [upiId, setUpiId] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [bankName, setBankName] = useState("");

  const canSubmit = useMemo(() => {
    if (!Number(amount) || Number(amount) <= 0) return false;
    if (method === "UPI") return upiId.trim().length > 2;
    return (
      accountHolderName.trim().length > 1 &&
      accountNumber.trim().length > 5 &&
      ifscCode.trim().length > 3 &&
      bankName.trim().length > 1
    );
  }, [accountHolderName, accountNumber, amount, bankName, ifscCode, method, upiId]);

  const handleSubmit = async () => {
    try {
      if (method === "UPI") {
        await requestPayout({
          amount: Number(amount),
          paymentMethod: {
            type: "UPI",
            upiId,
          },
        });
      } else {
        await requestPayout({
          amount: Number(amount),
          paymentMethod: {
            type: "BANK_ACCOUNT",
            accountHolderName,
            accountNumber,
            ifscCode,
            bankName,
          },
        });
      }
      router.back();
    } catch (error) {
      // Error handled by store
    }
  };

  return (
    <ScreenContainer withSafeArea style={{ backgroundColor: Colors.light.background }}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Withdraw Funds</Text>
        </View>

        <ScrollView 
          contentContainerStyle={styles.content} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={20} color={Colors.light.primary} />
            <Text style={styles.infoText}>
              Your payout will be reviewed by the admin. Once approved, funds will be transferred to your account.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payout Amount</Text>
            <ThemedInput
              placeholder="0.00"
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
              icon="cash-outline"
              containerStyle={styles.amountInput}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Method</Text>
            <View style={styles.methodContainer}>
              <TouchableOpacity 
                style={[styles.methodTab, method === "UPI" && styles.activeTab]}
                onPress={() => setMethod("UPI")}
              >
                <Ionicons name="phone-portrait-outline" size={20} color={method === "UPI" ? Colors.light.black : Colors.light.textDim} />
                <Text style={[styles.tabText, method === "UPI" && styles.activeTabText]}>UPI Transfer</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.methodTab, method === "BANK_ACCOUNT" && styles.activeTab]}
                onPress={() => setMethod("BANK_ACCOUNT")}
              >
                <Ionicons name="business-outline" size={20} color={method === "BANK_ACCOUNT" ? Colors.light.black : Colors.light.textDim} />
                <Text style={[styles.tabText, method === "BANK_ACCOUNT" && styles.activeTabText]}>Bank Payout</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.detailsCard}>
            {method === "UPI" ? (
              <ThemedInput
                label="UPI ID"
                placeholder="username@bank"
                value={upiId}
                onChangeText={setUpiId}
                icon="at-outline"
                autoCapitalize="none"
              />
            ) : (
              <View style={styles.bankFields}>
                <ThemedInput
                  label="Account Holder"
                  placeholder="Full name"
                  value={accountHolderName}
                  onChangeText={setAccountHolderName}
                  icon="person-outline"
                />
                <ThemedInput
                  label="Account Number"
                  placeholder="0000 0000 0000"
                  value={accountNumber}
                  onChangeText={setAccountNumber}
                  icon="card-outline"
                  keyboardType="numeric"
                />
                <View style={styles.row}>
                  <View style={{ flex: 1.2 }}>
                    <ThemedInput
                      label="IFSC Code"
                      placeholder="IFSC"
                      value={ifscCode}
                      onChangeText={setIfscCode}
                      icon="code-outline"
                      autoCapitalize="characters"
                    />
                  </View>
                  <View style={{ flex: 1.8 }}>
                    <ThemedInput
                      label="Bank Name"
                      placeholder="e.g. HDFC"
                      value={bankName}
                      onChangeText={setBankName}
                      icon="business-outline"
                    />
                  </View>
                </View>
              </View>
            )}
          </View>

          <View style={styles.footer}>
            <PrimaryButton
              label={isSubmitting ? "Processing..." : "Confirm Withdrawal"}
              onPress={handleSubmit}
              disabled={!canSubmit || isSubmitting}
              style={styles.submitBtn}
              loading={isSubmitting}
            />
            <Text style={styles.footerNote}>
              Withdrawals are typically processed within 24-48 hours.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    backgroundColor: Colors.light.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.light.text,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: 40,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: Colors.light.surfaceSecondary,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  infoText: {
    flex: 1,
    color: Colors.light.textDim,
    fontSize: 13,
    lineHeight: 18,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },
  amountInput: {
    height: 72,
    fontSize: 32,
    fontWeight: '900',
  },
  methodContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  methodTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: Radius.lg,
    backgroundColor: Colors.light.surface,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    gap: Spacing.sm,
  },
  activeTab: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
    ...Shadows.gold,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.textDim,
  },
  activeTabText: {
    color: Colors.light.black,
  },
  detailsCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: Spacing.xl,
  },
  bankFields: {
    gap: Spacing.xs,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  footer: {
    marginTop: Spacing.md,
  },
  submitBtn: {
    height: 64,
    ...Shadows.gold,
  },
  footerNote: {
    textAlign: 'center',
    marginTop: Spacing.lg,
    color: Colors.light.textMuted,
    fontSize: 13,
  },
});

