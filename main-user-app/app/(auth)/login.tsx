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
import { useAuthStore } from '@/store/useAuthStore';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const [loginMethod, setLoginMethod] = useState<'PASSWORD' | 'OTP'>('PASSWORD');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || (loginMethod === 'PASSWORD' && !password) || (loginMethod === 'OTP' && !otp)) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", `Please enter ${loginMethod === 'PASSWORD' ? 'email and password' : 'email and OTP'}`);
      return;
    }
    
    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      let response;
      if (loginMethod === 'PASSWORD') {
        response = await api.post('/auth/login', { email, password });
      } else {
        response = await api.post('/auth/login-otp', { email, otp });
      }

      const { user, accessToken, refreshToken } = response.data;
      await useAuthStore.getState().setAuth(user, { accessToken, refreshToken });
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert("Login Failed", error.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const requestLoginOtp = async () => {
    if (!email) {
      Alert.alert("Email Required", "Please enter your email to receive an OTP.");
      return;
    }
    try {
      setLoading(true);
      await api.post('/auth/request-otp', { email, type: 'login' });
      setOtpSent(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("OTP Sent", "A 6-digit code has been sent to your email.");
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.bgCircle} />
      
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
              <Animated.View 
                entering={FadeInUp.delay(200).duration(1000)}
                style={styles.logoContainer}
              >
                <View style={styles.logoCircle}>
                  <Ionicons name="restaurant" size={45} color={Colors.light.primary} />
                </View>
              </Animated.View>
              
              <Animated.Text 
                entering={FadeInUp.delay(400)} 
                style={styles.welcomeText}
              >
                Welcome Back
              </Animated.Text>
              <Animated.Text 
                entering={FadeInUp.delay(500)} 
                style={styles.subText}
              >
                The flavors you love are waiting for you.
              </Animated.Text>
            </View>

            <Animated.View 
              entering={FadeInDown.delay(600).duration(800)}
              style={styles.formSection}
            >
              {/* Login Method Toggle */}
              <View style={styles.methodToggle}>
                <TouchableOpacity 
                  style={[styles.methodBtn, loginMethod === 'PASSWORD' && styles.activeMethod]}
                  onPress={() => setLoginMethod('PASSWORD')}
                >
                  <Text style={[styles.methodText, loginMethod === 'PASSWORD' && styles.activeMethodText]}>Password</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.methodBtn, loginMethod === 'OTP' && styles.activeMethod]}
                  onPress={() => setLoginMethod('OTP')}
                >
                  <Text style={[styles.methodText, loginMethod === 'OTP' && styles.activeMethodText]}>OTP Login</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={20} color={Colors.light.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="name@example.com"
                    placeholderTextColor="#A0A0A0"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {loginMethod === 'PASSWORD' ? (
                <View style={styles.inputGroup}>
                  <View style={styles.labelRow}>
                    <Text style={styles.label}>Password</Text>
                    <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
                      <Text style={styles.forgotText}>Forgot?</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.inputContainer}>
                    <Ionicons name="lock-closed-outline" size={20} color={Colors.light.textMuted} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { flex: 1 }]}
                      placeholder="Your secure password"
                      placeholderTextColor="#A0A0A0"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity 
                      onPress={() => {
                          setShowPassword(!showPassword);
                          Haptics.selectionAsync();
                      }}
                      style={styles.eyeBtn}
                    >
                      <Ionicons 
                        name={showPassword ? "eye-off-outline" : "eye-outline"} 
                        size={20} 
                        color={Colors.light.textMuted} 
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.inputGroup}>
                  <View style={styles.labelRow}>
                    <Text style={styles.label}>OTP Code</Text>
                    {otpSent && (
                      <TouchableOpacity onPress={requestLoginOtp}>
                        <Text style={styles.forgotText}>Resend?</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <View style={styles.inputContainer}>
                    <Ionicons name="shield-checkmark-outline" size={20} color={Colors.light.textMuted} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { letterSpacing: otp ? 8 : 0 }]}
                      placeholder={otpSent ? "ENTER OTP" : "REQUEST CODE"}
                      placeholderTextColor="#A0A0A0"
                      value={otp}
                      onChangeText={setOtp}
                      keyboardType="number-pad"
                      maxLength={6}
                      editable={otpSent}
                    />
                    {!otpSent && (
                      <TouchableOpacity onPress={requestLoginOtp} disabled={loading}>
                        <Text style={styles.forgotText}>GET OTP</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}

              <TouchableOpacity 
                activeOpacity={0.8}
                style={[styles.loginBtn, loading && { opacity: 0.7 }]} 
                onPress={handleLogin}
                disabled={loading || (loginMethod === 'OTP' && !otpSent)}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.loginBtnText}>{loginMethod === 'OTP' && !otpSent ? 'WAITING FOR OTP' : 'LOGIN'}</Text>
                )}
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.line} />
                <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
                <View style={styles.line} />
              </View>

              <View style={styles.socialRow}>
                <TouchableOpacity style={styles.socialBtn}>
                  <Ionicons name="logo-google" size={24} color="#DB4437" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialBtn}>
                  <Ionicons name="logo-apple" size={24} color="#000000" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialBtn}>
                  <Ionicons name="logo-facebook" size={24} color="#4267B2" />
                </TouchableOpacity>
              </View>

              <View style={styles.footer}>
                <Text style={styles.footerText}>New to our kitchen? </Text>
                <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                  <Text style={styles.registerText}>Get Started</Text>
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
  bgCircle: {
    position: 'absolute',
    top: -height * 0.1,
    right: -width * 0.2,
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: width * 0.6,
    backgroundColor: Colors.light.primary,
    opacity: 0.05,
  },
  header: {
    paddingTop: height * 0.08,
    paddingBottom: 40,
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoCircle: {
    height: 90,
    width: 90,
    borderRadius: 30,
    backgroundColor: '#FFF5F5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    transform: [{ rotate: '-10deg' }],
  },
  welcomeText: {
    fontSize: 34,
    fontWeight: '900',
    color: Colors.light.text,
    letterSpacing: -1,
  },
  subText: {
    fontSize: 16,
    color: Colors.light.textMuted,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  methodToggle: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 18,
    padding: 6,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  methodBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeMethod: {
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  methodText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#666',
  },
  activeMethodText: {
    color: Colors.light.primary,
  },
  formSection: {
    paddingHorizontal: 30,
    paddingTop: 10,
  },
  inputGroup: {
    marginBottom: 24,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  label: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  forgotText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.light.primary,
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
    fontWeight: '500',
  },
  eyeBtn: {
    padding: 4,
  },
  loginBtn: {
    backgroundColor: Colors.light.primary,
    height: 62,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
  },
  loginBtnText: {
    color: Colors.light.white,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 2,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 30,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#F0F0F0',
  },
  dividerText: {
    marginHorizontal: 15,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#BDBDBD',
    letterSpacing: 1,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 40,
  },
  socialBtn: {
    width: 65,
    height: 65,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  footerText: {
    color: Colors.light.textMuted,
    fontSize: 15,
    fontWeight: '500',
  },
  registerText: {
    color: Colors.light.primary,
    fontWeight: '900',
    fontSize: 15,
  },
});

