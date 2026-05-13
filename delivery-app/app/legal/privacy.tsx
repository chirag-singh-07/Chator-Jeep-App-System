import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, Radius } from "@/constants/Colors";

export default function PrivacyScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Delivery Partner Privacy</Text>
        <Text style={styles.body}>Chatori Jeeb uses identity, document, payout, device, notification, and location data for verification, live delivery assignment, safety, support, and payout processing.</Text>
        <Text style={styles.section}>Location</Text>
        <Text style={styles.body}>Live location is used during active delivery work to assign nearby orders and provide customer tracking.</Text>
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
