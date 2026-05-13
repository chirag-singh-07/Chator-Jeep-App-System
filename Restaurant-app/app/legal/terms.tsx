import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";

export default function TermsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Chatori Jeeb Partner Terms</Text>
        <Text style={styles.body}>Restaurants must provide accurate ownership, FSSAI, tax, bank, menu, and address details. Chatori Jeeb may reject or suspend listings that are unsafe, misleading, duplicated, or non-compliant.</Text>
        <Text style={styles.section}>Commission Policy</Text>
        <Text style={styles.body}>Launch partners pay a registration fee and receive 10% commission for the first 48 hours after activation. After that window, the configured standard commission applies automatically.</Text>
        <Text style={styles.section}>Payments & Verification</Text>
        <Text style={styles.body}>Registration payment is verified through Razorpay. A restaurant profile is created only after successful server-side payment verification. The registration fee is non-refundable after successful payment.</Text>
        <Text style={styles.section}>Operations</Text>
        <Text style={styles.body}>Partners are responsible for food quality, packaging, preparation time, order acceptance, and regulatory compliance.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  header: { flexDirection: "row", alignItems: "center", padding: 20, gap: 12 },
  backBtn: { width: 42, height: 42, borderRadius: 14, backgroundColor: "#111", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#222" },
  headerTitle: { color: "#FFF", fontSize: 15, fontWeight: "900", letterSpacing: 1 },
  content: { padding: 24, paddingBottom: 48 },
  title: { color: Colors.light.primary, fontSize: 28, fontWeight: "900", marginBottom: 18 },
  section: { color: "#FFF", fontSize: 17, fontWeight: "900", marginTop: 20, marginBottom: 8 },
  body: { color: "#AAA", fontSize: 14, lineHeight: 23, fontWeight: "600" },
});
