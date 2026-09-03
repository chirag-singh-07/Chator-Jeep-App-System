import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/useAuthStore';
import * as Haptics from 'expo-haptics';
import { getAvatarUrl } from '@/lib/utils';
// import api from '@/lib/api';

const indianPhoneRegex = /^[6-9]\d{9}$/;

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || ''); 
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!name || !email) {
      Alert.alert("Error", "Name and Email are required.");
      return;
    }
    if (phone && !indianPhoneRegex.test(phone.trim())) {
      Alert.alert("Invalid Phone", "Please enter a valid Indian 10-digit phone number starting with 6, 7, 8, or 9.");
      return;
    }

    try {
      setLoading(true);
      // Mock update API call
      // await api.patch('/users/profile', { name, email, phone });
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Success", "Profile updated successfully!");
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.pageHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color="#161616" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Personal Information</Text>
            <Text style={styles.headerSubtitle}>Edit your profile details</Text>
          </View>
        </View>

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.pageBody}>
            <View style={styles.avatarEditor}>
              <View style={styles.bigAvatar}>
                {isAuthenticated ? (
                  <Image source={{ uri: getAvatarUrl(user?.email || 'guest') }} style={styles.avatarImg} />
                ) : (
                  <Text style={styles.avatarInitials}>CJ</Text>
                )}
              </View>
              
              <View style={styles.avatarActions}>
                <TouchableOpacity style={[styles.smallBtn, styles.smallBtnPrimary]}>
                  <Ionicons name="camera" size={12} color="#111" style={{ marginRight: 4 }} />
                  <Text style={styles.primaryBtnText}>Change Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.smallBtn}>
                  <Text style={styles.smallBtnText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.field}
                value={name}
                onChangeText={setName}
                placeholder="Chatori Jeeb User"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.field}
                value={phone}
                onChangeText={(value) => setPhone(value.replace(/\D/g, ""))}
                placeholder="+91 98765 43210"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.field}
                value={email}
                onChangeText={setEmail}
                placeholder="user@chatorijeeb.com"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            
            <TouchableOpacity 
              style={[styles.saveBtn, loading && { opacity: 0.7 }]} 
              onPress={handleUpdate}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveBtnText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  pageHeader: {
    paddingHorizontal: 18,
    paddingVertical: 17,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ECECEC',
    backgroundColor: '#fff',
    zIndex: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: '#F4F4F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: 'Inter-SemiBold',
    color: '#161616',
  },
  headerSubtitle: {
    fontSize: 10, // adjusted slightly for readability from 8px
    color: '#838383',
    marginTop: 3,
    fontFamily: 'Inter-Regular',
  },
  pageBody: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 35,
  },
  avatarEditor: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 22,
  },
  bigAvatar: {
    width: 104,
    height: 104,
    borderRadius: 32,
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
    fontSize: 32,
    fontFamily: 'Inter-Black',
  },
  avatarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
  },
  smallBtn: {
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    borderRadius: 11,
    paddingVertical: 8,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  smallBtnPrimary: {
    backgroundColor: '#FFD400',
    borderColor: '#FFD400',
  },
  primaryBtnText: {
    fontSize: 10, // Adjusted from 9px
    fontFamily: 'Inter-Black',
    color: '#111',
  },
  smallBtnText: {
    fontSize: 10, // Adjusted from 9px
    fontFamily: 'Inter-Black',
    color: '#111',
  },
  formGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 11, // Adjusted from 9px for readability
    fontFamily: 'Inter-Black',
    color: '#161616',
    marginBottom: 6,
  },
  field: {
    width: '100%',
    height: 47,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 13,
    paddingHorizontal: 13,
    backgroundColor: '#fff',
    fontSize: 13, // Adjusted from 11px
    fontFamily: 'Inter-Regular',
    color: '#161616',
  },
  saveBtn: {
    width: '100%',
    height: 47,
    borderRadius: 14,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 12, // Adjusted from 10px
    fontFamily: 'Inter-Black',
  }
});
