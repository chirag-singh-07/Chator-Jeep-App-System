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
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import api from '@/lib/api';

const { height } = Dimensions.get('window');

export default function ForgotPasswordScreen() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRequestOtp = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }
    try {
      setLoading(true);
      await api.post('/auth/request-otp', { email, type: 'forgot_password' });
      setStep(2);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!otp || !newPassword) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }
    try {
      setLoading(true);
      await api.post('/auth/reset-password', { email, otp, password: newPassword });
      Alert.alert("Success", "Password reset successfully. Please login.");
      router.replace('/(auth)/login');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.headerBg} />
      
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => step === 1 ? router.back() : setStep(1)} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
              <Animated.Text entering={FadeInUp} style={styles.title}>
                {step === 1 ? "Forgot Password" : "Reset Password"}
              </Animated.Text>
              <Animated.Text entering={FadeInUp.delay(100)} style={styles.subtext}>
                {step === 1 ? "Enter your email to receive an OTP" : "Enter the code and your new password"}
              </Animated.Text>
            </View>

            <Animated.View entering={FadeInDown} style={styles.formSection}>
              {step === 1 ? (
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
                  <TouchableOpacity style={styles.primaryBtn} onPress={handleRequestOtp} disabled={loading}>
                    {loading ? <ActivityIndicator color="white" /> : <Text style={styles.primaryBtnText}>SEND OTP</Text>}
                  </TouchableOpacity>
                </View>
              ) : (
                <View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>6-Digit OTP</Text>
                    <View style={styles.inputContainer}>
                      <Ionicons name="key-outline" size={20} color={Colors.light.textMuted} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="000000"
                        value={otp}
                        onChangeText={setOtp}
                        keyboardType="number-pad"
                        maxLength={6}
                      />
                    </View>
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>New Password</Text>
                    <View style={styles.inputContainer}>
                      <Ionicons name="lock-closed-outline" size={20} color={Colors.light.textMuted} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="Min. 8 characters"
                        value={newPassword}
                        onChangeText={setNewPassword}
                        secureTextEntry
                      />
                    </View>
                  </View>
                  <TouchableOpacity style={styles.primaryBtn} onPress={handleResetPassword} disabled={loading}>
                    {loading ? <ActivityIndicator color="white" /> : <Text style={styles.primaryBtnText}>RESET PASSWORD</Text>}
                  </TouchableOpacity>
                </View>
              )}
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  headerBg: { position: 'absolute', top: 0, width: '100%', height: height * 0.3, backgroundColor: Colors.light.primary },
  header: { paddingHorizontal: 25, paddingTop: 20, paddingBottom: 30 },
  backBtn: { width: 45, height: 45, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  title: { fontSize: 30, fontWeight: '900', color: 'white' },
  subtext: { fontSize: 16, color: 'rgba(255,255,255,0.8)', marginTop: 5 },
  formSection: { flex: 1, backgroundColor: 'white', borderTopLeftRadius: 35, borderTopRightRadius: 35, paddingHorizontal: 30, paddingTop: 35, marginTop: 10 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '800', color: Colors.light.text, marginBottom: 8, textTransform: 'uppercase' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 18, paddingHorizontal: 16, height: 58, borderWidth: 1.5, borderColor: '#F3F4F6' },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: Colors.light.text, fontWeight: '600' },
  primaryBtn: { backgroundColor: Colors.light.primary, height: 62, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  primaryBtnText: { color: 'white', fontSize: 18, fontWeight: '900', letterSpacing: 1 },
});
