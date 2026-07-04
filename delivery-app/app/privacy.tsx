import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '@/constants/Colors';

export default function PrivacyScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.light.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Privacy Policy for Delivery Partners</Text>
        <Text style={styles.date}>Effective Date: July 2026</Text>

        <Text style={styles.sectionTitle}>1. Information We Collect</Text>
        <Text style={styles.paragraph}>
          We collect personal data you provide during registration, including your name, contact information, vehicle details, identification documents, and banking information. We also collect data about your interactions with the application, device information, and connectivity status.
        </Text>

        <Text style={styles.sectionTitle}>2. Location Data</Text>
        <Text style={styles.paragraph}>
          Our app collects background location data to assign deliveries efficiently and allow customers to track their orders in real-time. This is essential for the app's functionality when you are online. You can manage location permissions through your device settings, but disabling them will prevent you from receiving delivery requests.
        </Text>

        <Text style={styles.sectionTitle}>3. How We Use Your Data</Text>
        <Text style={styles.paragraph}>
          We use your information to:
          {"\n"}• Verify your identity and eligibility to perform deliveries.
          {"\n"}• Facilitate and track deliveries in real-time.
          {"\n"}• Process your earnings, payouts, and incentives.
          {"\n"}• Communicate important updates, alerts, and support messages.
          {"\n"}• Analyze application usage to improve the delivery experience.
        </Text>

        <Text style={styles.sectionTitle}>4. Data Security and Retention</Text>
        <Text style={styles.paragraph}>
          We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. We retain your data as long as your account is active, or as needed to comply with our legal obligations, resolve disputes, and enforce our agreements.
        </Text>

        <Text style={styles.sectionTitle}>5. Sharing of Information</Text>
        <Text style={styles.paragraph}>
          We may share your basic profile (name, photo, and vehicle details) and real-time location with customers solely for the purpose of order fulfillment. We may also share your information with trusted third-party service providers (such as payment processors) under strict confidentiality agreements. We do not sell your personal data to third parties.
        </Text>

        <Text style={styles.sectionTitle}>6. Your Rights</Text>
        <Text style={styles.paragraph}>
          You have the right to access, correct, or delete your personal information. You can update most of your details directly within the app. For data deletion requests, you must contact our support team. Please note that deleting essential data may result in the termination of your delivery partner account.
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
