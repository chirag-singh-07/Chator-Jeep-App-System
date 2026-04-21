import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useWalletStore } from "@/store/useWalletStore";

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
    if (!Number(amount)) return false;
    if (method === "UPI") return upiId.trim().length > 2;
    return (
      accountHolderName.trim().length > 1 &&
      accountNumber.trim().length > 5 &&
      ifscCode.trim().length > 3 &&
      bankName.trim().length > 1
    );
  }, [accountHolderName, accountNumber, amount, bankName, ifscCode, method, upiId]);

  const handleSubmit = async () => {
    if (method === "UPI") {
      await requestPayout({
        amount: Number(amount),
        paymentMethod: {
          type: "UPI",
          upiId,
        },
      });
      return;
    }

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
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenContainer>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Request payout</Text>
          <Text style={styles.subtitle}>
            Submit a rider payout request to admin. Funds move from available balance into held balance until reviewed.
          </Text>

          <Text style={styles.label}>Amount</Text>
          <TextInput
            style={styles.input}
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
            placeholder="Enter payout amount"
            placeholderTextColor="#94A3B8"
          />

          <View style={styles.methodRow}>
            <PrimaryButton
              label="UPI"
              variant={method === "UPI" ? "primary" : "secondary"}
              onPress={() => setMethod("UPI")}
              style={{ flex: 1 }}
            />
            <PrimaryButton
              label="Bank account"
              variant={method === "BANK_ACCOUNT" ? "primary" : "secondary"}
              onPress={() => setMethod("BANK_ACCOUNT")}
              style={{ flex: 1 }}
            />
          </View>

          {method === "UPI" ? (
            <>
              <Text style={styles.label}>UPI ID</Text>
              <TextInput
                style={styles.input}
                value={upiId}
                onChangeText={setUpiId}
                placeholder="name@bank"
                placeholderTextColor="#94A3B8"
              />
            </>
          ) : (
            <>
              <Text style={styles.label}>Account holder name</Text>
              <TextInput
                style={styles.input}
                value={accountHolderName}
                onChangeText={setAccountHolderName}
                placeholder="Name on account"
                placeholderTextColor="#94A3B8"
              />
              <Text style={styles.label}>Account number</Text>
              <TextInput
                style={styles.input}
                value={accountNumber}
                onChangeText={setAccountNumber}
                placeholder="Account number"
                placeholderTextColor="#94A3B8"
              />
              <Text style={styles.label}>IFSC code</Text>
              <TextInput
                autoCapitalize="characters"
                style={styles.input}
                value={ifscCode}
                onChangeText={setIfscCode}
                placeholder="IFSC"
                placeholderTextColor="#94A3B8"
              />
              <Text style={styles.label}>Bank name</Text>
              <TextInput
                style={styles.input}
                value={bankName}
                onChangeText={setBankName}
                placeholder="Bank name"
                placeholderTextColor="#94A3B8"
              />
            </>
          )}

          <PrimaryButton
            label={isSubmitting ? "Submitting..." : "Submit payout request"}
            onPress={() => void handleSubmit()}
            disabled={!canSubmit || isSubmitting}
            style={{ marginTop: 10 }}
          />
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
    gap: 12,
    paddingBottom: 28,
  },
  title: {
    color: "#0F172A",
    fontSize: 28,
    fontWeight: "800",
  },
  subtitle: {
    color: "#475569",
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 10,
  },
  label: {
    color: "#0F172A",
    fontSize: 13,
    fontWeight: "700",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: "#0F172A",
  },
  methodRow: {
    flexDirection: "row",
    gap: 10,
    marginVertical: 6,
  },
});
