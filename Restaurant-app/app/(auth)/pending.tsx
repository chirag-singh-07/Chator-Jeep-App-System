import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/useAuthStore';
import { apiClient } from '@/lib/api';

const { width } = Dimensions.get('window');

export default function PendingVerificationScreen() {
  const { user, updateUserStatus, logout } = useAuthStore();
  const [checking, setChecking] = useState(false);

  const checkStatus = async () => {
    setChecking(true);
    try {
      const res = await apiClient.get('/restaurants/me/status');
      const newStatus = res.data.data.status;
      updateUserStatus(newStatus);
      
      if (newStatus === 'ACTIVE') {
        router.replace('/(tabs)');
      } else if (newStatus === 'REJECTED') {
        router.replace('/(auth)/rejected');
      }
    } catch (e) {
      console.warn('Failed to refresh status:', e);
    } finally {
      setChecking(false);
    }
  };

  const STEPS = [
    { label: 'Application Submitted', done: true },
    { label: 'Restaurant Review', done: false, active: true },
    { label: 'Final Approval', done: false },
    { label: 'Go Live', done: false },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Animated top section */}
      <View style={styles.topSection}>
        <View style={styles.iconRing}>
          <View style={styles.iconInner}>
            <Ionicons name="time" size={48} color={Colors.light.primary} />
          </View>
        </View>
        <Text style={styles.title}>IN REVIEW</Text>
        <Text style={styles.subtitle}>
          We are reviewing your restaurant details. Approval usually takes 24-48 hours.
        </Text>
      </View>

      {/* Progress Tracker */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Approval Progress</Text>
        {STEPS.map((step, index) => (
          <View key={step.label} style={styles.stepRow}>
            {index > 0 && (
              <View style={[styles.connector, step.done && styles.connectorDone]} />
            )}
            <View style={[
              styles.stepDot,
              step.done && styles.stepDotDone,
              step.active && styles.stepDotActive,
            ]}>
              {step.done ? (
                <Ionicons name="checkmark" size={14} color="black" />
              ) : step.active ? (
                <Ionicons name="ellipsis-horizontal" size={14} color="black" />
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
          <Ionicons name="shield-checkmark" size={22} color={Colors.light.primary} />
          <Text style={styles.infoValue}>1–2 Days</Text>
          <Text style={styles.infoLabel}>EST. REVIEW</Text>
        </View>
        <View style={[styles.infoCard, { flex: 1 }]}>
          <Ionicons name="notifications" size={22} color={Colors.light.primary} />
          <Text style={styles.infoValue}>Alerts On</Text>
          <Text style={styles.infoLabel}>NOTIFICATIONS</Text>
        </View>
      </View>

      {/* Refresh Button */}
      <TouchableOpacity 
        style={[styles.primaryBtn, checking && styles.disabledBtn]} 
        onPress={checkStatus}
        disabled={checking}
      >
        {checking ? (
          <ActivityIndicator color="black" />
        ) : (
          <>
            <Ionicons name="refresh" size={20} color="black" />
            <Text style={styles.primaryBtnText}>REFRESH STATUS</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Ionicons name="log-out-outline" size={18} color="#444" />
        <Text style={styles.logoutText}>SIGN OUT</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 24 },
  topSection: { alignItems: 'center', marginTop: 40, marginBottom: 40 },
  iconRing: {
    height: 120,
    width: 120,
    borderRadius: 60,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#222',
  },
  iconInner: {
    height: 80,
    width: 80,
    borderRadius: 40,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 28, fontWeight: '900', color: '#FFF', marginBottom: 12, letterSpacing: 2 },
  subtitle: { fontSize: 13, color: '#666', textAlign: 'center', lineHeight: 22, paddingHorizontal: 15, fontWeight: '600' },
  card: { backgroundColor: '#111', borderRadius: 30, padding: 25, marginBottom: 20, borderWidth: 1, borderColor: '#222' },
  cardTitle: { fontSize: 11, fontWeight: '900', color: '#444', marginBottom: 25, textTransform: 'uppercase', letterSpacing: 2 },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primary,
    padding: 18,
    borderRadius: 22,
    marginTop: 10,
    gap: 12,
  },
  primaryBtnText: { color: 'black', fontWeight: '900', fontSize: 15, letterSpacing: 1 },
  disabledBtn: { opacity: 0.5 },
  stepRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, position: 'relative' },
  connector: { position: 'absolute', left: 14, top: -18, width: 2, height: 18, backgroundColor: '#222' },
  connectorDone: { backgroundColor: Colors.light.primary },
  stepDot: { width: 30, height: 30, borderRadius: 12, backgroundColor: '#111', alignItems: 'center', justifyContent: 'center', marginRight: 15, borderWidth: 2, borderColor: '#333' },
  stepDotDone: { backgroundColor: Colors.light.primary, borderColor: Colors.light.primary },
  stepDotActive: { backgroundColor: '#FFC107', borderColor: '#FFC107' },
  emptyDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#222' },
  stepLabel: { fontSize: 14, color: '#444', fontWeight: 'bold' },
  stepLabelDone: { color: '#EEE' },
  stepLabelActive: { color: Colors.light.primary },
  infoRow: { flexDirection: 'row', gap: 15, marginBottom: 20 },
  infoCard: { backgroundColor: '#111', borderRadius: 25, padding: 18, alignItems: 'center', borderWidth: 1, borderColor: '#1A1A1A' },
  infoValue: { fontSize: 16, fontWeight: '800', color: '#FFF', marginTop: 10 },
  infoLabel: { fontSize: 9, color: '#444', marginTop: 4, fontWeight: '900', letterSpacing: 1 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 'auto', marginBottom: 20 },
  logoutText: { color: '#444', fontSize: 11, fontWeight: '900', letterSpacing: 1 },
});
