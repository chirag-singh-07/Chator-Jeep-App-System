import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";

export default function PrivacyScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Privacy at Chatori Jeeb</Text>
        <Text style={styles.body}>We collect restaurant profile, owner identity, tax, bank, document, menu, device, and notification token data to run onboarding, verification, payouts, support, and order operations.</Text>
        <Text style={styles.section}>Data Use</Text>
        <Text style={styles.body}>Data is used for verification, fraud prevention, order fulfilment, compliance, analytics, and operational messaging.</Text>
        <Text style={styles.section}>Security</Text>
        <Text style={styles.body}>Payment success is verified server-side. Sensitive operational data is sent only through authenticated API requests.</Text>
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
