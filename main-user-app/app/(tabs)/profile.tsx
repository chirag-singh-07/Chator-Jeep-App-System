import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, SafeAreaView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useAuthStore } from '@/store/useAuthStore';
import * as Haptics from 'expo-haptics';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive", 
          onPress: async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            await logout();
            router.replace('/(auth)/login');
          } 
        }
      ]
    );
  };

  const ProfileItem = ({ icon, title, subtitle, onPress, color = Colors.light.text }: { icon: string, title: string, subtitle?: string, onPress?: () => void, color?: string }) => (
    <TouchableOpacity style={styles.item} onPress={onPress}>
      <View style={[styles.iconCircle, { backgroundColor: color + '10' }]}>
        <Ionicons name={icon as any} size={22} color={color} />
      </View>
      <View style={{ flex: 1, marginLeft: 15 }}>
        <Text style={styles.itemTitle}>{title}</Text>
        {subtitle && <Text style={styles.itemSubtitle}>{subtitle}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={18} color="#CCC" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.header}>
           <Animated.View entering={FadeInUp} style={styles.avatarContainer}>
              <Image 
                source={{ uri: `https://i.pravatar.cc/150?u=${user?.email}` }} 
                style={styles.avatar} 
              />
              <TouchableOpacity style={styles.editBadge}>
                 <Ionicons name="camera" size={16} color="#FFF" />
              </TouchableOpacity>
           </Animated.View>
           <Text style={styles.userName}>{user?.name || "Guest User"}</Text>
           <Text style={styles.userEmail}>{user?.email || "guest@example.com"}</Text>
           
           <View style={styles.statsRow}>
              <View style={styles.statBox}>
                 <Text style={styles.statVal}>0</Text>
                 <Text style={styles.statLab}>Orders</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                 <Text style={styles.statVal}>₹0</Text>
                 <Text style={styles.statLab}>Spent</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                 <Text style={styles.statVal}>100</Text>
                 <Text style={styles.statLab}>Points</Text>
              </View>
           </View>
        </View>

        {/* Account Settings */}
        <View style={styles.section}>
           <Text style={styles.sectionLabel}>Account Settings</Text>
           <ProfileItem 
              icon="person-outline" 
              title="Personal Information" 
              subtitle="Name, Email, Phone number" 
           />
           <ProfileItem 
              icon="location-outline" 
              title="Saved Addresses" 
              subtitle="Home, Office, Other" 
           />
           <ProfileItem 
              icon="card-outline" 
              title="Payment Methods" 
              subtitle="Visa **4242, GPay" 
           />
           <ProfileItem 
              icon="heart-outline" 
              title="Favorite Restaurants" 
              subtitle="0 saved places" 
              onPress={() => {}}
           />
        </View>

        {/* Preferences */}
        <View style={styles.section}>
           <Text style={styles.sectionLabel}>Preferences</Text>
           <ProfileItem 
              icon="notifications-outline" 
              title="Notifications" 
              subtitle="Push alerts, Email, SMS" 
           />
           <ProfileItem 
              icon="shield-checkmark-outline" 
              title="Privacy & Security" 
              subtitle="Passwords, App lock" 
           />
           <ProfileItem 
              icon="help-circle-outline" 
              title="Help & Support" 
              subtitle="FAQs, Contact us" 
           />
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
           <Ionicons name="log-out-outline" size={22} color={Colors.light.primary} />
           <Text style={styles.logoutText}>SIGN OUT</Text>
        </TouchableOpacity>
        
        <Text style={styles.version}>Version 1.0.4 (Production)</Text>
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  avatarContainer: {
    marginBottom: 20,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#F9FAFB',
  },
  editBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: Colors.light.primary,
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
  },
  userName: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.light.text,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.light.textMuted,
    marginTop: 4,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 25,
  },
  statBox: {
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  statVal: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.light.text,
  },
  statLab: {
    fontSize: 11,
    color: Colors.light.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E5E7EB',
  },
  section: {
    paddingHorizontal: 25,
    paddingTop: 30,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '900',
    color: Colors.light.text,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 20,
    opacity: 0.4,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.light.text,
  },
  itemSubtitle: {
    fontSize: 12,
    color: Colors.light.textMuted,
    marginTop: 2,
    fontWeight: '500',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 25,
    marginTop: 40,
    height: 60,
    borderRadius: 20,
    backgroundColor: '#FFF5F5',
    gap: 10,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '900',
    color: Colors.light.primary,
    letterSpacing: 1,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color:Colors.light.textMuted,
    marginTop: 20,
    fontWeight: '600',
  }
});
