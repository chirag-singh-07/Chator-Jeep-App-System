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
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = () => {
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.header}>
          <View style={styles.logoSquare}>
             <Ionicons name="restaurant" size={32} color={Colors.light.white} />
          </View>
          <Text style={styles.title}>Kitchen Console</Text>
          <Text style={styles.subtitle}>Partner Portal</Text>
        </View>

        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputField}>
               <Ionicons name="mail-outline" size={20} color={Colors.light.textMuted} />
               <TextInput 
                 style={styles.input} 
                 placeholder="kitchen@example.com" 
                 value={email} 
                 onChangeText={setEmail}
                 autoCapitalize="none"
               />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputField}>
               <Ionicons name="lock-closed-outline" size={20} color={Colors.light.textMuted} />
               <TextInput 
                 style={styles.input} 
                 placeholder="••••••••" 
                 value={password} 
                 onChangeText={setPassword} 
                 secureTextEntry
               />
            </View>
          </View>

          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
            <Text style={styles.loginBtnText}>LOGIN TO DASHBOARD</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Not a partner yet? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.registerText}>Register Kitchen</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.primary,
  },
  header: {
    padding: 40,
    alignItems: 'center',
  },
  logoSquare: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginTop: 5,
  },
  formSection: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 30,
    paddingTop: 50,
  },
  inputGroup: {
    marginBottom: 25,
  },
  label: {
    fontSize: 13,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 10,
    marginLeft: 5,
  },
  inputField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    height: 60,
    borderRadius: 18,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  input: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
    color: Colors.light.text,
  },
  loginBtn: {
    backgroundColor: Colors.light.primary,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  loginBtnText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
  },
  footerText: {
    color: Colors.light.textMuted,
  },
  registerText: {
    color: Colors.light.primary,
    fontWeight: 'bold',
  },
});
