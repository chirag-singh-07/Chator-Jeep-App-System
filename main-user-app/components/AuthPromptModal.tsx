import React from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useCartStore } from '@/store/useCartStore';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export function AuthPromptModal() {
  const { showAuthPrompt, clearPendingItem } = useCartStore();
  const router = useRouter();

  if (!showAuthPrompt) return null;

  const handleLogin = () => {
    // Keep pendingItem so it can be flushed after login, just close the modal
    useCartStore.getState().setShowAuthPrompt(false);
    router.push('/(auth)/login');
  };

  const handleCancel = () => {
    clearPendingItem();
  };

  return (
    <Modal visible={showAuthPrompt} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.iconBg}>
              <Ionicons name="person-circle" size={48} color={Colors.light.primary} />
            </View>
            <Text style={styles.title}>Sign in to order</Text>
            <Text style={styles.description}>
              You need to be logged in to add items to your cart and place an order.
            </Text>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.primaryBtn} onPress={handleLogin}>
              <Text style={styles.primaryBtnText}>Log In / Register</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={handleCancel}>
              <Text style={styles.secondaryBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    width: '100%',
    maxWidth: width - 40,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconBg: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1E293B',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    gap: 12,
  },
  primaryBtn: {
    backgroundColor: Colors.light.primary,
    height: 52,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: '#1E293B',
    fontSize: 15,
    fontWeight: '900',
  },
  secondaryBtn: {
    height: 48,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    color: '#64748B',
    fontSize: 15,
    fontWeight: '800',
  },
});
