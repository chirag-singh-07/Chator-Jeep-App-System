import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  Linking,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import * as Location from 'expo-location';
import messaging from '@react-native-firebase/messaging';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export default function PermissionsModal() {
  const [visible, setVisible] = useState(false);
  const [locGranted, setLocGranted] = useState(false);
  const [notifGranted, setNotifGranted] = useState(false);
  const [hasPrompted, setHasPrompted] = useState(false);

  const checkPermissions = async () => {
    try {
      // 1. Check Location
      const { status: locStatus } = await Location.getForegroundPermissionsAsync();
      const isLocOk = locStatus === 'granted';
      setLocGranted(isLocOk);

      // 2. Check Notifications
      const notifStatus = await messaging().hasPermission();
      const isNotifOk =
        notifStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        notifStatus === messaging.AuthorizationStatus.PROVISIONAL;
      setNotifGranted(isNotifOk);

      // Hide modal if both are granted
      if (isLocOk && isNotifOk) {
        setVisible(false);
      } else {
        setVisible(true);
      }
    } catch (e) {
      console.warn('Error checking permissions:', e);
    }
  };

  const requestPermissions = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      // 1. Request Location
      const { status: newLocStatus } = await Location.requestForegroundPermissionsAsync();
      const isLocOk = newLocStatus === 'granted';
      setLocGranted(isLocOk);

      // 2. Request Notifications
      const authStatus = await messaging().requestPermission();
      const isNotifOk =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      setNotifGranted(isNotifOk);

      setHasPrompted(true);

      if (isLocOk && isNotifOk) {
        setVisible(false);
      }
    } catch (e) {
      console.warn('Error requesting permissions:', e);
    }
  };

  const openSettings = () => {
    Haptics.selectionAsync();
    Linking.openSettings();
  };

  useEffect(() => {
    if (Platform.OS !== 'web') {
      checkPermissions();
      
      // Also check when app returns to foreground
      const subscription = Linking.addEventListener('url', checkPermissions);
      return () => {
        subscription.remove();
      };
    }
  }, []);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.shieldBg}>
              <Ionicons name="shield-checkmark" size={36} color={Colors.light.primary} />
            </View>
            <Text style={styles.title}>Permissions Required</Text>
            <Text style={styles.description}>
              Chatori Jeeb needs Location and Notification permissions to find nearby restaurants and deliver updates in real-time.
            </Text>
          </View>

          <View style={styles.itemsContainer}>
            {/* Location Permission Block */}
            <View style={styles.permissionRow}>
              <View style={[styles.iconContainer, locGranted ? styles.iconSuccess : styles.iconPending]}>
                <Ionicons name="location" size={20} color={locGranted ? '#10B981' : '#6B7280'} />
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={styles.itemTitle}>Location Access</Text>
                <Text style={styles.itemSub}>Used to discover restaurants and track delivery partners near you.</Text>
              </View>
              <Ionicons
                name={locGranted ? 'checkmark-circle' : 'close-circle'}
                size={22}
                color={locGranted ? '#10B981' : '#EF4444'}
              />
            </View>

            {/* Notifications Permission Block */}
            <View style={styles.permissionRow}>
              <View style={[styles.iconContainer, notifGranted ? styles.iconSuccess : styles.iconPending]}>
                <Ionicons name="notifications" size={20} color={notifGranted ? '#10B981' : '#6B7280'} />
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={styles.itemTitle}>Push Notifications</Text>
                <Text style={styles.itemSub}>Receive real-time updates for accepted orders and live tracking alerts.</Text>
              </View>
              <Ionicons
                name={notifGranted ? 'checkmark-circle' : 'close-circle'}
                size={22}
                color={notifGranted ? '#10B981' : '#EF4444'}
              />
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.footer}>
            {!hasPrompted ? (
              <TouchableOpacity style={styles.primaryBtn} onPress={requestPermissions}>
                <Text style={styles.primaryBtnText}>Grant Permissions</Text>
              </TouchableOpacity>
            ) : (
              <View style={{ width: '100%', gap: 12 }}>
                <Text style={styles.settingsWarning}>
                  Permissions are disabled in your system settings. Please enable them to continue using the app.
                </Text>
                <TouchableOpacity style={styles.primaryBtn} onPress={openSettings}>
                  <Text style={styles.primaryBtnText}>Open Settings</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryBtn} onPress={checkPermissions}>
                  <Text style={styles.secondaryBtnText}>I've Allowed Them (Check Status)</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)', // Deep slate overlay
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
  shieldBg: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: 'rgba(253, 190, 21, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
    paddingHorizontal: 10,
    fontWeight: '500',
  },
  itemsContainer: {
    gap: 16,
    marginBottom: 28,
  },
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  iconPending: {
    backgroundColor: '#E2E8F0',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
  },
  itemSub: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
    marginTop: 2,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
  },
  primaryBtn: {
    backgroundColor: Colors.light.primary,
    height: 52,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: {
    color: '#1E293B',
    fontSize: 15,
    fontWeight: '900',
  },
  secondaryBtn: {
    backgroundColor: '#F1F5F9',
    height: 48,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '800',
  },
  settingsWarning: {
    fontSize: 12,
    color: '#EF4444',
    textAlign: 'center',
    fontWeight: '700',
    lineHeight: 18,
    marginBottom: 8,
  },
});
