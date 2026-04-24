import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useAuthStore } from '@/store/useAuthStore';
import { useOrderStore } from '@/store/useOrderStore';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Restaurant Profile</Text>
          <Text style={styles.headerSub}>Business settings and preferences</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.userCard}>
          <View style={styles.avatarContainer}>
             <View style={styles.avatarGlow} />
             <View style={styles.avatarPlaceholder}>
               <Ionicons name="shield-checkmark" size={35} color={Colors.light.primary} />
             </View>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name?.toUpperCase() || 'KITCHEN PARTNER'}</Text>
            <Text style={styles.userEmail}>{user?.email?.toLowerCase()}</Text>
            <View style={styles.statusRow}>
               <View style={styles.statusDot} />
               <Text style={styles.statusText}>STATUS: {user?.status || 'ACTIVE'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>BRAND & OPERATIONS</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.iconBox}>
              <Ionicons name="images" size={18} color={Colors.light.primary} />
            </View>
            <View style={styles.menuInfo}>
               <Text style={styles.menuText}>Brand Assets & Identity</Text>
               <Text style={styles.menuSub}>Logo, banner and visuals</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#222" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.iconBox}>
              <Ionicons name="time" size={18} color={Colors.light.primary} />
            </View>
            <View style={styles.menuInfo}>
               <Text style={styles.menuText}>Operational Clock</Text>
               <Text style={styles.menuSub}>Business hours and schedule</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#222" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>APP SETTINGS</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.iconBox}>
              <Ionicons name="notifications" size={18} color={Colors.light.primary} />
            </View>
            <View style={styles.menuInfo}>
               <Text style={styles.menuText}>Order Notifications</Text>
               <Text style={styles.menuSub}>Alerts for new orders and updates</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#222" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.iconBox}>
              <Ionicons name="volume-high" size={18} color={Colors.light.primary} />
            </View>
            <View style={styles.menuInfo}>
               <Text style={styles.menuText}>Alert Sounds</Text>
               <Text style={styles.menuSub}>Manage order sounds and audio cues</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#222" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.iconBox}>
              <Ionicons name="lock-closed" size={18} color={Colors.light.primary} />
            </View>
            <View style={styles.menuInfo}>
               <Text style={styles.menuText}>Account Security</Text>
               <Text style={styles.menuSub}>Password, access, and account safety</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#222" />
          </TouchableOpacity>
        </View>

        <View style={styles.actionSection}>
           <TouchableOpacity 
             style={styles.testBtn} 
             onPress={() => {
                const { setIncomingOrder } = useOrderStore.getState();
                setIncomingOrder({
                  _id: 'mock_123',
                  orderNumber: 'TEST-999',
                  customerData: { name: 'Demo Customer', phone: '9999999999' },
                  items: [{ name: 'Smoky Paneer Burger', quantity: 1, price: 150 }],
                  totalAmount: 150,
                  status: 'PENDING',
                  createdAt: new Date().toISOString()
                });
              }}
            >
              <Ionicons name="pulse" size={20} color={Colors.light.primary} />
              <Text style={styles.testBtnText}>SEND TEST ORDER</Text>
            </TouchableOpacity>

           <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
             <Ionicons name="log-out" size={20} color="#FF4B3A" />
             <Text style={styles.logoutText}>SIGN OUT</Text>
           </TouchableOpacity>
        </View>

        <Text style={styles.versionText}>Restaurant Console v1.0.5</Text>
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    padding: 25,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 1,
  },
  headerSub: {
     fontSize: 10,
     color: Colors.light.primary,
     fontWeight: "800",
     letterSpacing: 2,
     textTransform: "uppercase",
     marginTop: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 25,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A0A0A',
    padding: 25,
    borderRadius: 30,
    marginBottom: 35,
    borderWidth: 1,
    borderColor: '#111',
  },
  avatarContainer: {
     position: 'relative',
  },
  avatarGlow: {
     position: 'absolute',
     width: 70,
     height: 70,
     borderRadius: 35,
     backgroundColor: Colors.light.primary,
     opacity: 0.1,
     transform: [{ scale: 1.2 }],
  },
  avatarPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 25,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#222',
  },
  userInfo: {
    flex: 1,
    marginLeft: 20,
  },
  userName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 1,
  },
  userEmail: {
    fontSize: 12,
    color: '#555',
    fontWeight: '600',
    marginTop: 4,
  },
  statusRow: {
     flexDirection: 'row',
     alignItems: 'center',
     gap: 6,
     marginTop: 10,
  },
  statusDot: {
     width: 6,
     height: 6,
     borderRadius: 3,
     backgroundColor: Colors.light.primary,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '900',
    color: Colors.light.primary,
    letterSpacing: 1,
  },
  section: {
    marginBottom: 35,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#333',
    letterSpacing: 2,
    marginBottom: 20,
    marginLeft: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A0A0A',
    padding: 18,
    borderRadius: 25,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#111',
  },
  iconBox: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#222',
  },
  menuInfo: {
     flex: 1,
     marginLeft: 15,
  },
  menuText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EEE',
    letterSpacing: 0.5,
  },
  menuSub: {
     fontSize: 10,
     color: '#444',
     fontWeight: '600',
     marginTop: 4,
  },
  actionSection: {
     gap: 15,
     marginBottom: 30,
  },
  testBtn: {
     flexDirection: 'row',
     alignItems: 'center',
     justifyContent: 'center',
     backgroundColor: '#0A0A0A',
     height: 65,
     borderRadius: 25,
     borderWidth: 1,
     borderColor: '#111',
     gap: 12,
  },
  testBtnText: {
     fontSize: 12,
     fontWeight: '900',
     color: '#CCC',
     letterSpacing: 1,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0A0A0A',
    height: 65,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#300',
    gap: 12,
  },
  logoutText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FF4B3A',
    letterSpacing: 1,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 9,
    color: '#222',
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 10,
  },
});
