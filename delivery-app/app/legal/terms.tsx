import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, Radius } from "@/constants/Colors";

export default function TermsScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Policies</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Chatori Jeeb Delivery Partner Terms</Text>
        <Text style={styles.body}>Delivery partners must provide accurate identity, license, vehicle, payout, and address information. Fraudulent documents or unsafe conduct may result in rejection or suspension.</Text>
        <Text style={styles.section}>Privacy Policy</Text>
        <Text style={styles.body}>Location, order, and identity data are used only for verification, live delivery routing, support, compliance, and payout processing.</Text>
        <Text style={styles.section}>Refund & Payout Policy</Text>
        <Text style={styles.body}>Customer refunds are handled by Chatori Jeeb. Partner payout disputes are reviewed from order logs, delivery timestamps, and proof of delivery.</Text>
        <Text style={styles.section}>Commission Policy</Text>
        <Text style={styles.body}>Delivery earnings are calculated from platform distance and incentive rules visible inside the partner wallet and order details.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  header: { flexDirection: "row", alignItems: "center", padding: Spacing.lg, gap: Spacing.md },
  backBtn: { width: 44, height: 44, borderRadius: Radius.lg, backgroundColor: Colors.light.surface, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: Colors.light.border },
  headerTitle: { color: Colors.light.text, fontSize: 15, fontWeight: "900", letterSpacing: 1 },
  content: { padding: Spacing.lg, paddingBottom: 48 },
  title: { color: Colors.light.primary, fontSize: 28, fontWeight: "900", marginBottom: 18 },
  section: { color: Colors.light.text, fontSize: 17, fontWeight: "900", marginTop: 20, marginBottom: 8 },
  body: { color: Colors.light.textDim, fontSize: 14, lineHeight: 23, fontWeight: "600" },
});
