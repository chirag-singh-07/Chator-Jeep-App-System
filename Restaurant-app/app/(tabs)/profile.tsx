import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useAuthStore } from '@/store/useAuthStore';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Kitchen Profile</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.userCard}>
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="restaurant" size={40} color={Colors.light.primary} />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || 'Kitchen Partner'}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
          <View style={styles.statusChip}>
            <Text style={styles.statusText}>{user?.status || 'ACTIVE'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Identity</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={[styles.iconBox, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="images-outline" size={20} color="#FF9800" />
            </View>
            <Text style={styles.menuText}>Brand Assets & Images</Text>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={[styles.iconBox, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="time-outline" size={20} color="#4CAF50" />
            </View>
            <Text style={styles.menuText}>Business Hours</Text>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Preferences</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={[styles.iconBox, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="notifications-outline" size={20} color="#2196F3" />
            </View>
            <Text style={styles.menuText}>Order Notifications</Text>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={[styles.iconBox, { backgroundColor: '#FCE4EC' }]}>
              <Ionicons name="volume-high-outline" size={20} color="#E91E63" />
            </View>
            <Text style={styles.menuText}>Sound & Alarms</Text>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={[styles.iconBox, { backgroundColor: '#F3E5F5' }]}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#9C27B0" />
            </View>
            <Text style={styles.menuText}>Security & Account</Text>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.logoutBtn, { backgroundColor: '#E3F2FD', borderColor: '#BBDEFB', marginBottom: 10 }]} 
          onPress={() => {
            const { setIncomingOrder } = useOrderStore.getState();
            setIncomingOrder({
              _id: 'mock_123',
              orderNumber: 'TEST-999',
              customerData: { name: 'Test User', phone: '9999999999' },
              items: [{ name: 'Test Burger', quantity: 2, price: 150 }],
              totalAmount: 300,
              status: 'pending',
              createdAt: new Date().toISOString()
            });
          }}
        >
          <Ionicons name="notifications-circle-outline" size={22} color="#1976D2" />
          <Text style={[styles.logoutText, { color: '#1976D2' }]}>Test Incoming Order Alarm</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color={Colors.light.error} />
          <Text style={styles.logoutText}>Logout from Console</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>v1.0.0 (Stable)</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

import { useOrderStore } from '@/store/useOrderStore';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 25,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  avatarPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFF5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flex: 1,
    marginLeft: 15,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.light.textMuted,
    marginTop: 2,
  },
  statusChip: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'black',
    color: '#2E7D32',
    textTransform: 'uppercase',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.light.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 15,
    marginLeft: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 20,
    marginBottom: 10,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
    fontWeight: 'medium',
    color: Colors.light.text,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0F0',
    padding: 18,
    borderRadius: 20,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#FFE0E0',
  },
  logoutText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.error,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.light.textMuted,
    marginTop: 30,
    marginBottom: 50,
  },
});
