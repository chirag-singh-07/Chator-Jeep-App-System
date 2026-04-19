import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

// Rejection reason passed via route params in production
const REJECTION_REASON = "Your FSSAI License document was not clearly visible. Please upload a higher-quality image.";

export default function RejectedScreen() {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);

  const RESUBMIT_CHECKLIST = [
    'FSSAI License (clear, high-res image)',
    'Owner government ID (Aadhar/Passport)',
    'Kitchen address proof',
    'Bank account details',
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.topSection}>
          <View style={styles.iconCircle}>
            <Ionicons name="close-circle" size={60} color={Colors.light.primary} />
          </View>
          <Text style={styles.title}>Application Rejected</Text>
          <Text style={styles.subtitle}>
            Unfortunately, your kitchen application could not be approved at this time.
          </Text>
        </View>

        {/* Rejection Reason */}
        <View style={styles.reasonCard}>
          <View style={styles.reasonHeader}>
            <Ionicons name="warning" size={18} color="#FF4B3A" />
            <Text style={styles.reasonTitle}>Reason for Rejection</Text>
          </View>
          <Text style={styles.reasonText}>{REJECTION_REASON}</Text>
        </View>

        {/* What to Fix */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Before Resubmitting</Text>
          <Text style={styles.cardSub}>Please ensure you provide all of the following clearly:</Text>
          <View style={styles.checklist}>
            {RESUBMIT_CHECKLIST.map((item) => (
              <View key={item} style={styles.checkRow}>
                <View style={styles.checkDot} />
                <Text style={styles.checkText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.replace('/(auth)/register')}
          >
            <Ionicons name="refresh" size={18} color="white" />
            <Text style={styles.primaryBtnText}>Resubmit Application</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryBtn}>
            <Ionicons name="headset-outline" size={18} color={Colors.light.primary} />
            <Text style={styles.secondaryBtnText}>Talk to Support</Text>
          </TouchableOpacity>
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={styles.logoutBtn} onPress={() => router.replace('/(auth)/login')}>
          <Text style={styles.logoutText}>← Back to Login</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA', padding: 24 },
  topSection: { alignItems: 'center', marginTop: 20, marginBottom: 24 },
  iconCircle: {
    height: 100,
    width: 100,
    borderRadius: 50,
    backgroundColor: '#FFF0EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 26, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 10 },
  subtitle: { fontSize: 14, color: '#757575', textAlign: 'center', lineHeight: 22, paddingHorizontal: 20 },
  reasonCard: {
    backgroundColor: '#FFF5F5',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#FFDAD6',
    marginBottom: 16,
  },
  reasonHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  reasonTitle: { fontSize: 14, fontWeight: 'bold', color: Colors.light.primary },
  reasonText: { fontSize: 13, color: '#4A4A4A', lineHeight: 20 },
  card: { backgroundColor: 'white', borderRadius: 24, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 6 },
  cardSub: { fontSize: 13, color: '#757575', marginBottom: 16 },
  checklist: { gap: 10 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  checkDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.light.primary },
  checkText: { fontSize: 13, color: '#1A1A1A', fontWeight: '500', flexShrink: 1 },
  actionsSection: { gap: 12, marginBottom: 20 },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.light.primary,
    height: 56,
    borderRadius: 18,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryBtnText: { color: 'white', fontSize: 15, fontWeight: 'bold' },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#FFF5F5',
    height: 56,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
  secondaryBtnText: { color: Colors.light.primary, fontSize: 15, fontWeight: 'bold' },
  logoutBtn: { alignItems: 'center' },
  logoutText: { color: '#AAAAAA', fontSize: 13 },
});
