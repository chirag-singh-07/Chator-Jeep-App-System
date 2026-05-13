import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";

export default function RefundScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Refund Policy</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Refund & Commission Policy</Text>
        <Text style={styles.body}>Restaurant registration is processed through Razorpay. If payment fails, no restaurant account is created and the partner can retry checkout. Successful registration fee payments are non-refundable.</Text>
        <Text style={styles.section}>Launch Offer</Text>
        <Text style={styles.body}>The launch registration fee is Rs 299 per kitchen with 10% commission for the first 48 hours after activation.</Text>
        <Text style={styles.section}>After Offer</Text>
        <Text style={styles.body}>After the launch window, registration pricing becomes Rs 499 and the configured normal commission applies automatically.</Text>
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
