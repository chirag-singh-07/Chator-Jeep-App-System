import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  Alert,
  StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import Animated, { 
  FadeInDown, 
  FadeInUp,
} from 'react-native-reanimated';

import api from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';

const { width, height } = Dimensions.get('window');

export default function RegisterScreen() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    homeAddress: '',
    coordinates: null as { latitude: number; longitude: number } | null,
    locationName: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const router = useRouter();

  const handleNext = async () => {
    if (step === 1) {
      if (!formData.name || !formData.email || !formData.phone || !formData.password) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert("Missing Information", "Please fill all fields to continue.");
        return;
      }
      setStep(2);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else if (step === 2) {
      if (!formData.homeAddress || !formData.locationName) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert("Location Required", "Please provide your delivery address.");
        return;
      }
      
      try {
        setLoading(true);
        // Request OTP from backend
        const response = await api.post('/auth/request-otp', {
          email: formData.email,
          type: 'register'
        });
        
        if (response.data.success) {
          setStep(3);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } catch (error: any) {
        Alert.alert("Error", error.response?.data?.message || "Failed to send OTP. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const getCurrentLocation = async () => {
    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Allow location access to fetch your current address.');
        return;
      }

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;
      
      // Reverse geocode
      let reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude
      });

      if (reverseGeocode.length > 0) {
        const addr = reverseGeocode[0];
        const formattedAddr = `${addr.name || ''} ${addr.street || ''}, ${addr.city || ''}, ${addr.region || ''}`;
        setFormData({
          ...formData,
          coordinates: { latitude, longitude },
          locationName: formattedAddr,
          // Prefill home address if empty
          homeAddress: formData.homeAddress || formattedAddr
        });
      }
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Alert.alert('Error', 'Could not fetch your location. Please enter it manually.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!otp || otp.length < 6) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Invalid OTP", "Please enter the 6-digit code sent to your email.");
      return;
    }

    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      
      const response = await api.post('/auth/register', {
        ...formData,
        otp
      });
      
      const { user, accessToken, refreshToken } = response.data;
      await useAuthStore.getState().setAuth(user, { accessToken, refreshToken });
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert("Registration Failed", error.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.headerBg} />
      
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView 
            contentContainerStyle={{ flexGrow: 1 }} 
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <TouchableOpacity 
                onPress={() => step === 1 ? router.back() : setStep(step - 1)}
                style={styles.backBtn}
              >
                <Ionicons name="arrow-back" size={24} color={Colors.light.white} />
              </TouchableOpacity>
              
              <Animated.Text entering={FadeInUp} style={styles.title}>
                {step === 1 ? "Create Account" : step === 2 ? "Location Details" : "Verify Email"}
              </Animated.Text>
              <Animated.Text entering={FadeInUp.delay(100)} style={styles.subtext}>
                {step === 1 ? "Join the family and start ordering!" : step === 2 ? "Where should we deliver your food?" : "Enter the code sent to your inbox"}
              </Animated.Text>
              
              <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { width: `${(step / 3) * 100}%` }]} />
              </View>
            </View>

            <Animated.View 
              entering={FadeInDown.duration(600)}
              style={styles.formSection}
            >
              {step === 1 && (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Full Name</Text>
                    <View style={styles.inputContainer}>
                      <Ionicons name="person-outline" size={20} color={Colors.light.textMuted} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="e.g. John Doe"
                        value={formData.name}
                        onChangeText={(v) => setFormData({...formData, name: v})}
                      />
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email Address</Text>
                    <View style={styles.inputContainer}>
                      <Ionicons name="mail-outline" size={20} color={Colors.light.textMuted} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="john@example.com"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={formData.email}
                        onChangeText={(v) => setFormData({...formData, email: v})}
                      />
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Phone Number</Text>
                    <View style={styles.inputContainer}>
                      <Ionicons name="call-outline" size={20} color={Colors.light.textMuted} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="Required for order delivery"
                        keyboardType="phone-pad"
                        value={formData.phone}
                        onChangeText={(v) => setFormData({...formData, phone: v})}
                      />
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Password</Text>
                    <View style={styles.inputContainer}>
                      <Ionicons name="lock-closed-outline" size={20} color={Colors.light.textMuted} style={styles.inputIcon} />
                      <TextInput
                        style={[styles.input, { flex: 1 }]}
                        placeholder="Min. 8 characters"
                        secureTextEntry={!showPassword}
                        value={formData.password}
                        onChangeText={(v) => setFormData({...formData, password: v})}
                      />
                      <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Ionicons 
                          name={showPassword ? "eye-off-outline" : "eye-outline"} 
                          size={20} 
                          color={Colors.light.textMuted} 
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <TouchableOpacity 
                    activeOpacity={0.8}
                    style={styles.primaryBtn} 
                    onPress={handleNext}
                  >
                    <Text style={styles.primaryBtnText}>NEXT STEP</Text>
                    <Ionicons name="arrow-forward" size={20} color="white" style={{marginLeft: 10}} />
                  </TouchableOpacity>
                </>
              )}

              {step === 2 && (
                <>
                  <TouchableOpacity 
                    activeOpacity={0.7}
                    style={styles.locationPulseBtn}
                    onPress={getCurrentLocation}
                    disabled={loading}
                  >
                    {loading ? (
                       <ActivityIndicator color={Colors.light.primary} />
                    ) : (
                      <>
                        <Ionicons name="location" size={24} color={Colors.light.primary} />
                        <Text style={styles.locationPulseText}>Use Current Location</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <View style={[styles.inputGroup, { marginTop: 10 }]}>
                    <Text style={styles.label}>Fetched Address</Text>
                    <View style={[styles.inputContainer, styles.textArea, !formData.locationName && { borderColor: '#FFEBEB' }]}>
                      <TextInput
                        style={[styles.input, { textAlignVertical: 'top', paddingTop: 12 }]}
                        placeholder="Click the button above to fetch..."
                        multiline
                        numberOfLines={3}
                        value={formData.locationName}
                        editable={false}
                      />
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Complete Home Address (Floor/Flat/Landmark)</Text>
                    <View style={[styles.inputContainer, styles.textArea]}>
                      <TextInput
                        style={[styles.input, { textAlignVertical: 'top', paddingTop: 12 }]}
                        placeholder="e.g. Flat 402, Green Valley Apartments, Near City Park"
                        multiline
                        numberOfLines={3}
                        value={formData.homeAddress}
                        onChangeText={(v) => setFormData({...formData, homeAddress: v})}
                      />
                    </View>
                  </View>

                  <View style={styles.infoBox}>
                    <Ionicons name="shield-checkmark" size={20} color="#666" />
                    <Text style={styles.infoText}>Your location is used to show you the best nearby restaurants and ensure accurate delivery.</Text>
                  </View>

                  <TouchableOpacity 
                    activeOpacity={0.8}
                    style={styles.primaryBtn} 
                    onPress={handleNext}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <>
                        <Text style={styles.primaryBtnText}>VERIFY EMAIL</Text>
                        <Ionicons name="mail-outline" size={20} color="white" style={{marginLeft: 10}} />
                      </>
                    )}
                  </TouchableOpacity>
                </>
              )}

              {step === 3 && (
                <>
                  <View style={styles.otpHeader}>
                    <Ionicons name="mail-open-outline" size={64} color={Colors.light.primary} />
                    <Text style={styles.otpTitle}>Verify your email</Text>
                    <Text style={styles.otpSubtext}>We've sent a 6-digit code to</Text>
                    <Text style={styles.otpEmail}>{formData.email}</Text>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Enter OTP</Text>
                    <View style={[styles.inputContainer, { justifyContent: 'center' }]}>
                      <TextInput
                        style={[styles.input, { textAlign: 'center', fontSize: 28, letterSpacing: 10 }]}
                        placeholder="000000"
                        keyboardType="number-pad"
                        maxLength={6}
                        value={otp}
                        onChangeText={setOtp}
                      />
                    </View>
                  </View>

                  <TouchableOpacity 
                    activeOpacity={0.8}
                    style={styles.primaryBtn} 
                    onPress={handleRegister}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text style={styles.primaryBtnText}>COMPLETE REGISTRATION</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.resendBtn}
                    onPress={() => setStep(2)}
                  >
                    <Text style={styles.resendText}>Change Email or Re-send Code</Text>
                  </TouchableOpacity>
                </>
              )}

              <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                  <Text style={styles.loginText}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerBg: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: height * 0.3,
    backgroundColor: Colors.light.primary,
  },
  header: {
    paddingHorizontal: 25,
    paddingTop: 20,
    paddingBottom: 30,
  },
  backBtn: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: -0.5,
  },
  subtext: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
  },
  progressContainer: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    marginTop: 25,
    width: '100%',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFF',
    borderRadius: 3,
  },
  formSection: {
    flex: 1,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    paddingHorizontal: 30,
    paddingTop: 35,
    marginTop: 10,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.light.text,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    opacity: 0.7,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 18,
    paddingHorizontal: 16,
    height: 58,
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
  },
  textArea: {
    height: 100,
    alignItems: 'flex-start',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
    fontWeight: '600',
  },
  locationPulseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF5F5',
    borderWidth: 1.5,
    borderColor: Colors.light.primary,
    borderStyle: 'dashed',
    borderRadius: 20,
    height: 65,
    marginBottom: 10,
    gap: 10,
  },
  locationPulseText: {
    color: Colors.light.primary,
    fontSize: 16,
    fontWeight: '900',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    padding: 15,
    borderRadius: 15,
    gap: 10,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
    fontWeight: '500',
  },
  primaryBtn: {
    backgroundColor: Colors.light.primary,
    height: 62,
    borderRadius: 22,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
  },
  primaryBtnText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
  otpHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  otpTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.light.text,
    marginTop: 15,
  },
  otpSubtext: {
    fontSize: 14,
    color: Colors.light.textMuted,
    marginTop: 5,
  },
  otpEmail: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.light.primary,
    marginTop: 2,
  },
  resendBtn: {
    marginTop: 25,
    alignItems: 'center',
  },
  resendText: {
    color: Colors.light.primary,
    fontWeight: '800',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 30,
    paddingBottom: 40,
  },
  footerText: {
    color: Colors.light.textMuted,
    fontSize: 15,
  },
  loginText: {
    color: Colors.light.primary,
    fontWeight: '900',
    fontSize: 15,
  },
});
