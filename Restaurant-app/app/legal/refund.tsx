import { router } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";

export default function RefundScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={22} color="#FFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Refund Policy</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.iconBox}>
            <Ionicons
              name="shield-checkmark"
              size={28}
              color={Colors.light.primary}
            />
          </View>

          <Text style={styles.title}>Refund & Commission Policy</Text>

          <Text style={styles.heroText}>
            Please read our refund, commission, and payment terms carefully
            before registering your kitchen on the platform.
          </Text>
        </View>

        {/* Section */}
        <View style={styles.card}>
          <View style={styles.row}>
            <Ionicons name="card-outline" size={20} color="#FFF" />
            <Text style={styles.section}>Registration Payments</Text>
          </View>

          <Text style={styles.body}>
            Restaurant registration payments are securely processed through
            Razorpay. If a payment fails or is cancelled, no restaurant account
            will be created and the partner can retry checkout safely.
          </Text>

          <Text style={styles.body}>
            Once a registration payment is completed successfully and the
            kitchen account is activated, the registration fee becomes
            non-refundable.
          </Text>
        </View>

        {/* Launch Offer */}
        <View style={styles.card}>
          <View style={styles.row}>
            <Ionicons name="flash-outline" size={20} color="#FFD54F" />
            <Text style={styles.section}>Launch Offer</Text>
          </View>

          <View style={styles.highlightBox}>
            <Text style={styles.highlightText}>
              ₹299 Registration Fee
            </Text>

            <Text style={styles.highlightSub}>
              10% commission for the first 48 hours after activation
            </Text>
          </View>

          <Text style={styles.body}>
            This limited-time launch pricing is available only during the early
            onboarding phase and may be discontinued anytime without prior
            notice.
          </Text>
        </View>

        {/* After Offer */}
        <View style={styles.card}>
          <View style={styles.row}>
            <Ionicons name="time-outline" size={20} color="#8AB4FF" />
            <Text style={styles.section}>After Launch Period</Text>
          </View>

          <Text style={styles.body}>
            After the launch offer expires, the registration pricing will
            automatically update to ₹499 per kitchen and the standard platform
            commission will apply.
          </Text>
        </View>

        {/* Refund Conditions */}
        <View style={styles.card}>
          <View style={styles.row}>
            <Ionicons name="refresh-outline" size={20} color="#4ADE80" />
            <Text style={styles.section}>Refund Eligibility</Text>
          </View>

          <View style={styles.bulletRow}>
            <Ionicons name="ellipse" size={7} color="#666" />
            <Text style={styles.bulletText}>
              Duplicate payments caused by technical issues may be reviewed for
              refunds.
            </Text>
          </View>

          <View style={styles.bulletRow}>
            <Ionicons name="ellipse" size={7} color="#666" />
            <Text style={styles.bulletText}>
              Failed transactions are usually reversed automatically by the bank
              within 5-7 business days.
            </Text>
          </View>

          <View style={styles.bulletRow}>
            <Ionicons name="ellipse" size={7} color="#666" />
            <Text style={styles.bulletText}>
              Refund requests must include transaction details and registered
              kitchen information.
            </Text>
          </View>
        </View>

        {/* Support */}
        <View style={styles.supportCard}>
          <Ionicons
            name="mail-open-outline"
            size={26}
            color={Colors.light.primary}
          />

          <Text style={styles.supportTitle}>Need Help?</Text>

          <Text style={styles.supportText}>
            For payment issues, refund requests, or billing support, contact
            our support team.
          </Text>

          <TouchableOpacity style={styles.supportBtn}>
            <Text style={styles.supportBtnText}>Contact Support</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          By registering your kitchen, you agree to our payment, commission,
          refund, and onboarding policies.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 10,
    gap: 12,
  },

  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#222",
  },

  headerTitle: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: 0.6,
  },

  content: {
    padding: 20,
    paddingBottom: 50,
  },

  heroCard: {
    backgroundColor: "#0E0E0E",
    borderRadius: 28,
    padding: 24,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#1B1B1B",
  },

  iconBox: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  title: {
    color: "#FFF",
    fontSize: 30,
    fontWeight: "900",
    marginBottom: 10,
  },

  heroText: {
    color: "#8E8E93",
    fontSize: 15,
    lineHeight: 24,
    fontWeight: "600",
  },

  card: {
    backgroundColor: "#0D0D0D",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#1A1A1A",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },

  section: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: "900",
  },

  body: {
    color: "#A1A1AA",
    fontSize: 14,
    lineHeight: 24,
    fontWeight: "600",
    marginBottom: 12,
  },

  highlightBox: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#232323",
  },

  highlightText: {
    color: Colors.light.primary,
    fontSize: 24,
    fontWeight: "900",
  },

  highlightSub: {
    color: "#CFCFCF",
    fontSize: 13,
    marginTop: 4,
    fontWeight: "600",
  },

  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 14,
    paddingRight: 8,
  },

  bulletText: {
    flex: 1,
    color: "#AAA",
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "600",
  },

  supportCard: {
    backgroundColor: "#111",
    borderRadius: 28,
    padding: 24,
    alignItems: "center",
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#1F1F1F",
  },

  supportTitle: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "900",
    marginTop: 14,
    marginBottom: 8,
  },

  supportText: {
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 22,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 18,
  },

  supportBtn: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 16,
  },

  supportBtnText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "900",
  },

  footer: {
    color: "#666",
    textAlign: "center",
    marginTop: 24,
    lineHeight: 22,
    fontSize: 12,
    fontWeight: "600",
  },
});