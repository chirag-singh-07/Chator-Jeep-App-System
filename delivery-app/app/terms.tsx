import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '@/constants/Colors';

export default function TermsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.light.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Delivery Partner Terms & Conditions</Text>
        <Text style={styles.date}>Effective Date: July 2026</Text>

        <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
        <Text style={styles.paragraph}>
          By registering as a delivery partner with Chatori Jeeb ("Company", "we", "us", or "our"), you agree to be bound by these Terms and Conditions ("Terms"). If you do not agree to all the terms and conditions, you may not access the application or perform any deliveries.
        </Text>

        <Text style={styles.sectionTitle}>2. Eligibility and Registration</Text>
        <Text style={styles.paragraph}>
          You must be at least 18 years of old to become a delivery partner. You must provide accurate, current, and complete information during the registration process, including valid identification documents (Aadhaar, PAN), a valid driving license (if using a motorized vehicle), and up-to-date vehicle registration and insurance. You are responsible for maintaining the confidentiality of your account password.
        </Text>

        <Text style={styles.sectionTitle}>3. Independent Contractor Status</Text>
        <Text style={styles.paragraph}>
          You acknowledge that you are an independent contractor and not an employee, agent, joint venturer, or partner of Chatori Jeeb. You have complete discretion to accept or reject delivery requests. You are solely responsible for all costs incurred in providing delivery services, including fuel, vehicle maintenance, and insurance.
        </Text>

        <Text style={styles.sectionTitle}>4. Delivery Standards and Performance</Text>
        <Text style={styles.paragraph}>
          When you accept a delivery request, you agree to:
          {"\n"}• Pick up the order from the restaurant and deliver it to the customer safely and promptly.
          {"\n"}• Maintain a professional and polite demeanor with all customers, restaurant partners, and support staff.
          {"\n"}• Ensure that food is kept in a clean, hygienic environment and within an insulated delivery bag if required.
          {"\n"}• Follow all applicable traffic laws and safety regulations.
        </Text>

        <Text style={styles.sectionTitle}>5. Earnings, Payouts, and Fees</Text>
        <Text style={styles.paragraph}>
          You will earn a fee for each completed delivery, calculated based on distance, time, and potential surge pricing. 
          {"\n\n"}• The minimum withdrawal amount for a payout request is ₹5,000. 
          {"\n"}• Payouts are transferred to your registered bank account or UPI ID. 
          {"\n"}• Payout requests are typically processed within 24-48 business hours.
          {"\n"}• Chatori Jeeb reserves the right to withhold payouts in cases of suspected fraud, customer disputes, or unreturned cash-on-delivery (COD) amounts.
        </Text>

        <Text style={styles.sectionTitle}>6. Cash on Delivery (COD)</Text>
        <Text style={styles.paragraph}>
          For COD orders, you are responsible for collecting the exact amount from the customer. Any cash collected must be deposited or reconciled with Chatori Jeeb according to the company's cash limit policies. Failure to deposit collected cash may result in account suspension and legal action.
        </Text>

        <Text style={styles.sectionTitle}>7. Suspension and Termination</Text>
        <Text style={styles.paragraph}>
          We reserve the right to suspend or terminate your account immediately, without notice, if you:
          {"\n"}• Violate these Terms or any applicable laws.
          {"\n"}• Receive consistently poor ratings or customer complaints.
          {"\n"}• Engage in fraudulent activity, such as marking orders delivered without actually delivering them.
          {"\n"}• Display abusive behavior towards customers or restaurant staff.
        </Text>

        <Text style={styles.sectionTitle}>8. Limitation of Liability</Text>
        <Text style={styles.paragraph}>
          Chatori Jeeb shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill, arising out of your use of the application or performance of delivery services. You assume all risks associated with the delivery services, including traffic accidents or personal injury.
        </Text>

        <Text style={styles.sectionTitle}>9. Modifications</Text>
        <Text style={styles.paragraph}>
          We may modify these Terms at any time. Changes will be effective upon posting to the app. Your continued performance of delivery services after any changes constitutes your acceptance of the new Terms.
        </Text>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.light.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    gap: Spacing.md,
    elevation: 2,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.surfaceSecondary,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.light.text,
  },
  content: {
    padding: Spacing.xl,
    paddingBottom: 60,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.light.text,
    marginBottom: Spacing.sm,
  },
  date: {
    fontSize: 13,
    color: Colors.light.textMuted,
    marginBottom: Spacing.xl,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.light.text,
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  paragraph: {
    fontSize: 14,
    color: Colors.light.textDim,
    lineHeight: 24,
    fontWeight: '500',
  },
});
