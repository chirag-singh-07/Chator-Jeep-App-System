import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, SafeAreaView, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/useAuthStore';
import * as Haptics from 'expo-haptics';
import { getAvatarUrl } from '@/lib/utils';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuthStore();

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

  const MenuItem = ({ icon, title, subtitle, onPress, isLogout = false }: { icon: string, title: string, subtitle: string, onPress: () => void, isLogout?: boolean }) => (
    <TouchableOpacity activeOpacity={0.7} style={[styles.menuItem, isLogout && styles.menuItemNoBorder]} onPress={onPress}>
      <View style={[styles.menuIcon, isLogout && styles.menuIconLogout]}>
        <Ionicons name={icon as any} size={18} color={isLogout ? "#d44747" : "#7A6500"} />
      </View>
      <View style={styles.menuTextContainer}>
        <Text style={[styles.menuTitle, isLogout && styles.logoutTitle]}>{title}</Text>
        <Text style={styles.menuSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={14} color="#aaa" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Profile Hero */}
        <LinearGradient
          colors={['#FFE86C', '#FFD400', '#FFC400']}
          locations={[0, 0.65, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileHero}
        >
          <SafeAreaView edges={['top']}>
            <View style={styles.heroTop}>
              <Text style={styles.heroTitle}>Profile</Text>
              <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/settings')}>
                <Ionicons name="settings-sharp" size={20} color="#111" />
              </TouchableOpacity>
            </View>

            <View style={styles.profileCard}>
              <View style={styles.avatarWrapper}>
                <View style={styles.avatar}>
                  {isAuthenticated ? (
                    <Image source={{ uri: getAvatarUrl(user?.email || 'guest') }} style={styles.avatarImg} />
                  ) : (
                    <Text style={styles.avatarInitials}>CJ</Text>
                  )}
                </View>
                <TouchableOpacity style={styles.avatarEdit} onPress={() => isAuthenticated ? router.push('/edit-profile') : router.push('/(auth)/login')}>
                  <Ionicons name="camera" size={12} color="#111" />
                </TouchableOpacity>
              </View>

              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{isAuthenticated ? (user?.name || "User") : "Guest User"}</Text>
                <Text style={styles.profilePhone}>{isAuthenticated ? (user?.phone || user?.email || "+91 98765 43210") : "Login to access all features"}</Text>
                <Text style={styles.profileTag}>Food lover • Silvassa</Text>
              </View>

              <TouchableOpacity 
                style={styles.editProfileBtn} 
                onPress={() => isAuthenticated ? router.push('/edit-profile') : router.push('/(auth)/login')}
              >
                <Text style={styles.editProfileBtnText}>{isAuthenticated ? 'Edit' : 'Login'}</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </LinearGradient>

        {/* Content */}
        <View style={styles.content}>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <View style={styles.menuCard}>
              <MenuItem 
                icon="person-outline" 
                title="Personal Information" 
                subtitle="Edit your name, phone number and profile picture" 
                onPress={() => router.push('/edit-profile')}
              />
              <MenuItem 
                icon="bag-handle-outline" 
                title="My Orders" 
                subtitle="Track current orders and view order history" 
                onPress={() => router.push('/orders')}
              />
              <MenuItem 
                icon="heart-outline" 
                title="Liked Restaurants" 
                subtitle="Restaurants you have saved or liked" 
                onPress={() => router.push('/favorites')}
              />
              <MenuItem 
                icon="location-outline" 
                title="Saved Addresses" 
                subtitle="Manage home, work and other delivery addresses" 
                onPress={() => router.push('/address-picker')}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Support & Legal</Text>
            <View style={styles.menuCard}>
              <MenuItem 
                icon="help-circle-outline" 
                title="Help & Support" 
                subtitle="Get help with orders, payments and delivery" 
                onPress={() => router.push('/support')}
              />
              <MenuItem 
                icon="scale-outline" 
                title="Legal & Policies" 
                subtitle="Privacy, terms, refunds, cancellation and more" 
                onPress={() => {
                  /* Create Legal screen or navigate to settings */
                  router.push('/settings')
                }}
              />
              <MenuItem 
                icon="information-circle-outline" 
                title="About Chatori Jeeb" 
                subtitle="App version, company details and information" 
                onPress={() => Alert.alert("About", "App version 1.0.0")}
              />
            </View>
          </View>

          {isAuthenticated && (
            <View style={styles.section}>
              <View style={styles.menuCard}>
                <MenuItem 
                  icon="log-out-outline" 
                  title="Log Out" 
                  subtitle="Sign out of your Chatori Jeeb account" 
                  onPress={handleLogout}
                  isLogout={true}
                />
              </View>
            </View>
          )}

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ececec', // Matched from body background
  },
  scrollContent: {
    paddingBottom: 120, // Tab bar padding
  },
  profileHero: {
    paddingHorizontal: 18,
    paddingBottom: 26,
    paddingTop: Platform.OS === 'android' ? 45 : 25,
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 10 : 0,
  },
  heroTitle: {
    fontSize: 24,
    fontFamily: 'Inter-SemiBold',
    color: '#161616',
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.84)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileCard: {
    marginTop: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 24,
    padding: 17,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#765B00',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 26,
    elevation: 5,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 14,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 23,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  avatarInitials: {
    color: '#fff',
    fontSize: 24,
    fontFamily: 'Inter-Black', // mapped 800
  },
  avatarEdit: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 26,
    height: 26,
    borderRadius: 9,
    backgroundColor: '#FFD400',
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#161616',
  },
  profilePhone: {
    fontSize: 12,
    color: '#6e6500',
    marginTop: 5,
    fontFamily: 'Inter-Regular',
  },
  profileTag: {
    fontSize: 11,
    color: '#6e6500',
    marginTop: 3,
    fontFamily: 'Inter-Regular',
  },
  editProfileBtn: {
    backgroundColor: '#111',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  editProfileBtnText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Inter-Black',
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 23,
    paddingBottom: 35,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Inter-Black',
    color: '#989898',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginHorizontal: 3,
    marginBottom: 9,
  },
  menuCard: {
    borderWidth: 1,
    borderColor: '#ECECEC',
    borderRadius: 21,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.025,
    shadowRadius: 18,
    elevation: 2,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
  },
  menuItemNoBorder: {
    borderBottomWidth: 0,
  },
  menuIcon: {
    width: 39,
    height: 39,
    borderRadius: 13,
    backgroundColor: '#FFF8D0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIconLogout: {
    backgroundColor: '#fff0f0',
  },
  menuTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  menuTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#161616',
  },
  logoutTitle: {
    color: '#c83f3f',
  },
  menuSubtitle: {
    fontSize: 11,
    color: '#898989',
    marginTop: 3,
    lineHeight: 14,
    fontFamily: 'Inter-Regular',
  },
});
