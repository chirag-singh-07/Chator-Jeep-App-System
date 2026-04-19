import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function PendingVerificationScreen() {
  const router = useRouter();

  const STEPS = [
    { label: 'Application Submitted', done: true },
    { label: 'Admin Review', done: false, active: true },
    { label: 'Verification Decision', done: false },
    { label: 'Account Activated', done: false },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Animated top section */}
      <View style={styles.topSection}>
        <View style={styles.iconRing}>
          <View style={styles.iconInner}>
            <Ionicons name="time" size={48} color={Colors.light.primary} />
          </View>
        </View>
        <Text style={styles.title}>Under Review</Text>
        <Text style={styles.subtitle}>
          Your kitchen application is being reviewed by our team. This usually takes 1–2 business days.
        </Text>
      </View>

      {/* Progress Tracker */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Application Progress</Text>
        {STEPS.map((step, index) => (
          <View key={step.label} style={styles.stepRow}>
            {/* Connector line */}
            {index > 0 && (
              <View style={[styles.connector, step.done && styles.connectorDone]} />
            )}
            <View style={[
              styles.stepDot,
              step.done && styles.stepDotDone,
              step.active && styles.stepDotActive,
            ]}>
              {step.done ? (
                <Ionicons name="checkmark" size={14} color="white" />
              ) : step.active ? (
                <Ionicons name="ellipsis-horizontal" size={14} color="white" />
              ) : (
                <View style={styles.emptyDot} />
              )}
            </View>
            <Text style={[
              styles.stepLabel,
              step.done && styles.stepLabelDone,
              step.active && styles.stepLabelActive,
            ]}>
              {step.label}
            </Text>
          </View>
        ))}
      </View>

      {/* Info blocks */}
      <View style={styles.infoRow}>
        <View style={[styles.infoCard, { flex: 1 }]}>
          <Ionicons name="time-outline" size={22} color={Colors.light.primary} />
          <Text style={styles.infoValue}>1–2 Days</Text>
          <Text style={styles.infoLabel}>Est. Time</Text>
        </View>
        <View style={[styles.infoCard, { flex: 1 }]}>
          <Ionicons name="mail-outline" size={22} color={Colors.light.primary} />
          <Text style={styles.infoValue}>Email Alert</Text>
          <Text style={styles.infoLabel}>On Decision</Text>
        </View>
      </View>

      {/* Support */}
      <View style={styles.supportSection}>
        <Text style={styles.supportText}>Need help with your application?</Text>
        <TouchableOpacity style={styles.supportBtn}>
          <Ionicons name="headset-outline" size={18} color={Colors.light.primary} />
          <Text style={styles.supportBtnText}>Contact Support</Text>
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={() => router.replace('/(auth)/login')}>
        <Text style={styles.logoutText}>← Sign Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA', padding: 24 },
  topSection: { alignItems: 'center', marginTop: 30, marginBottom: 30 },
  iconRing: {
    height: 120,
    width: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,75,58,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  iconInner: {
    height: 80,
    width: 80,
    borderRadius: 40,
    backgroundColor: '#FFF5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 12 },
  subtitle: { fontSize: 15, color: '#757575', textAlign: 'center', lineHeight: 24, paddingHorizontal: 20 },
  card: { backgroundColor: 'white', borderRadius: 24, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  cardTitle: { fontSize: 14, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 18, textTransform: 'uppercase', letterSpacing: 0.5 },
  stepRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, position: 'relative' },
  connector: { position: 'absolute', left: 14, top: -14, width: 2, height: 14, backgroundColor: '#EEEEEE' },
  connectorDone: { backgroundColor: Colors.light.primary },
  stepDot: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#EEEEEE', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  stepDotDone: { backgroundColor: Colors.light.primary },
  stepDotActive: { backgroundColor: '#FF8C7A' },
  emptyDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#CCC' },
  stepLabel: { fontSize: 14, color: '#AAAAAA' },
  stepLabelDone: { color: '#1A1A1A', fontWeight: '600' },
  stepLabelActive: { color: Colors.light.primary, fontWeight: '700' },
  infoRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  infoCard: { backgroundColor: 'white', borderRadius: 20, padding: 16, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 },
  infoValue: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A', marginTop: 8 },
  infoLabel: { fontSize: 12, color: '#757575', marginTop: 2 },
  supportSection: { alignItems: 'center', marginBottom: 20 },
  supportText: { fontSize: 13, color: '#757575', marginBottom: 10 },
  supportBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 14, borderWidth: 1, borderColor: Colors.light.primary, backgroundColor: '#FFF5F5' },
  supportBtnText: { color: Colors.light.primary, fontWeight: 'bold', fontSize: 13 },
  logoutBtn: { alignItems: 'center' },
  logoutText: { color: '#AAAAAA', fontSize: 13 },
});
