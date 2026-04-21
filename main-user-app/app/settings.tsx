import React, { useState } from 'react';
import { StyleSheet, View, Text, Switch, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const router = useRouter();
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [locationSharing, setLocationSharing] = useState(true);

  const SettingToggle = ({ icon, title, value, onValueChange, color = '#666' }: { icon: string, title: string, value: boolean, onValueChange: (v: boolean) => void, color?: string }) => (
    <View style={styles.settingItem}>
       <View style={[styles.iconBox, { backgroundColor: color + '10' }]}>
          <Ionicons name={icon as any} size={20} color={color} />
       </View>
       <Text style={styles.settingTitle}>{title}</Text>
       <Switch 
         value={value} 
         onValueChange={onValueChange}
         trackColor={{ false: '#767577', true: Colors.light.primary + '50' }}
         thumbColor={value ? Colors.light.primary : '#f4f3f4'} 
       />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={{width: 45}} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>App Preferences</Text>
          <SettingToggle 
            icon="notifications" 
            title="Push Notifications" 
            value={notifEnabled} 
            onValueChange={setNotifEnabled}
            color="#FF9500"
          />
          <SettingToggle 
            icon="moon" 
            title="Dark Mode" 
            value={darkMode} 
            onValueChange={setDarkMode}
            color="#5856D6"
          />
          <SettingToggle 
            icon="location" 
            title="Location Features" 
            value={locationSharing} 
            onValueChange={setLocationSharing}
            color="#34C759"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Security</Text>
          <TouchableOpacity style={styles.actionItem}>
             <Ionicons name="lock-closed-outline" size={20} color="#666" />
             <Text style={styles.actionText}>Change Password</Text>
             <Ionicons name="chevron-forward" size={18} color="#CCC" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem}>
             <Ionicons name="finger-print-outline" size={20} color="#666" />
             <Text style={styles.actionText}>Biometric Login</Text>
             <Ionicons name="chevron-forward" size={18} color="#CCC" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Support</Text>
          <TouchableOpacity style={styles.actionItem}>
             <Ionicons name="help-circle-outline" size={20} color="#666" />
             <Text style={styles.actionText}>Contact Support</Text>
             <Ionicons name="chevron-forward" size={18} color="#CCC" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem}>
             <Ionicons name="document-text-outline" size={20} color="#666" />
             <Text style={styles.actionText}>Privacy Policy</Text>
             <Ionicons name="chevron-forward" size={18} color="#CCC" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.deleteBtn}>
           <Text style={styles.deleteText}>Delete Account</Text>
        </TouchableOpacity>
        
        <View style={{height: 50}} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFF',
  },
  backBtn: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.light.text,
  },
  section: {
    paddingHorizontal: 25,
    marginTop: 25,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.light.text,
    marginLeft: 15,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 18,
    borderRadius: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  actionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.light.text,
    marginLeft: 15,
  },
  deleteBtn: {
    marginTop: 40,
    alignSelf: 'center',
  },
  deleteText: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: 'bold',
  }
});
