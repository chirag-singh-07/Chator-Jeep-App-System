import React, { useState } from 'react';
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
  StatusBar,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { 
  FadeInDown, 
  FadeInUp, 
} from 'react-native-reanimated';
import api from '@/lib/api';

const { width, height } = Dimensions.get('window');

export default function ForgotPasswordScreen() {
  const [step, setStep] = useState<'EMAIL' | 'OTP' | 'NEW_PASSWORD'>('EMAIL');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSendOtp = async () => {
    if (!email) {
      Alert.alert("Email Required", "Please enter your email to receive a reset code.");
      return;
    }
    try {
      setLoading(true);
      await api.post('/auth/request-otp', { email, type: 'forgot_password' });
      setStep('OTP');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Code Sent", "A 6-digit reset code has been sent to your email.");
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.message || "Failed to send reset code.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      Alert.alert("Invalid Code", "Please enter the 6-digit code sent to your email.");
      return;
    }
    setStep('NEW_PASSWORD');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      Alert.alert("Invalid Password", "Password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Mismatch", "Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      await api.post('/auth/reset-password', { 
        email, 
        otp, 
        password: newPassword 
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Success", "Your password has been reset successfully.", [
        { text: "Login Now", onPress: () => router.replace('/(auth)/login') }
      ]);
    } catch (error: any) {
      Alert.alert("Reset Failed", error.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View style={styles.header}>
              <TouchableOpacity 
                style={styles.backBtn}
                onPress={() => step === 'EMAIL' ? router.back() : setStep(step === 'OTP' ? 'EMAIL' : 'OTP')}
              >
                <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
              </TouchableOpacity>
              
              <Animated.View entering={FadeInUp.delay(200)} style={styles.iconContainer}>
                <View style={styles.iconCircle}>
                  <Ionicons 
                    name={step === 'EMAIL' ? "mail-open-outline" : step === 'OTP' ? "shield-checkmark-outline" : "lock-closed-outline"} 
                    size={40} 
                    color={Colors.light.primary} 
                  />
                </View>
              </Animated.View>

              <Animated.Text entering={FadeInUp.delay(300)} style={styles.title}>
                {step === 'EMAIL' ? "Forgot Password?" : step === 'OTP' ? "Verify Code" : "New Password"}
              </Animated.Text>
              <Animated.Text entering={FadeInUp.delay(400)} style={styles.subText}>
                {step === 'EMAIL' ? "No worries! Enter your email and we'll send you a reset code." : 
                 step === 'OTP' ? `Enter the 6-digit code sent to ${email}` : 
                 "Set a strong password to protect your account."}
              </Animated.Text>
            </View>

            <Animated.View entering={FadeInDown.delay(500)} style={styles.form}>
              {step === 'EMAIL' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email Address</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="mail-outline" size={20} color={Colors.light.textMuted} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="name@example.com"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                </View>
              )}

              {step === 'OTP' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>6-Digit Code</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="keypad-outline" size={20} color={Colors.light.textMuted} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { letterSpacing: 10, fontWeight: '900' }]}
                      placeholder="000000"
                      value={otp}
                      onChangeText={setOtp}
                      keyboardType="number-pad"
                      maxLength={6}
                    />
                  </View>
                </View>
              )}

              {step === 'NEW_PASSWORD' && (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>New Password</Text>
                    <View style={styles.inputContainer}>
                      <Ionicons name="lock-closed-outline" size={20} color={Colors.light.textMuted} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="••••••••"
                        value={newPassword}
                        onChangeText={setNewPassword}
                        secureTextEntry
                      />
                    </View>
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Confirm Password</Text>
                    <View style={styles.inputContainer}>
                      <Ionicons name="checkmark-circle-outline" size={20} color={Colors.light.textMuted} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                      />
                    </View>
                  </View>
                </>
              )}

              <TouchableOpacity 
                style={[styles.actionBtn, loading && { opacity: 0.7 }]}
                onPress={step === 'EMAIL' ? handleSendOtp : step === 'OTP' ? handleVerifyOtp : handleResetPassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#1A1A1A" />
                ) : (
                  <Text style={styles.actionBtnText}>
                    {step === 'EMAIL' ? "SEND RESET CODE" : step === 'OTP' ? "VERIFY CODE" : "RESET PASSWORD"}
                  </Text>
                )}
              </TouchableOpacity>
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
  header: {
    paddingTop: 20,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  backBtn: {
    alignSelf: 'flex-start',
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  iconContainer: {
    marginBottom: 25,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 35,
    backgroundColor: '#FFFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.light.text,
    textAlign: 'center',
  },
  subText: {
    fontSize: 15,
    color: Colors.light.textMuted,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  form: {
    paddingHorizontal: 30,
    paddingTop: 40,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 60,
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
    fontWeight: '600',
  },
  actionBtn: {
    backgroundColor: Colors.light.primary,
    height: 62,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
  },
  actionBtnText: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
