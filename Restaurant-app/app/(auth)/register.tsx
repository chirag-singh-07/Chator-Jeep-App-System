import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

import { Alert, ActivityIndicator } from 'react-native';
import { useAuthStore } from '@/store/useAuthStore';

import * as ImagePicker from 'expo-image-picker';
import { Image } from 'react-native';

const { width } = Dimensions.get('window');

const STEPS = ['Account', 'Kitchen', 'Brand', 'Location'];

export default function RegisterScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const { register, uploadBranding, isLoading } = useAuthStore();

  // Step 1: Account
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Step 2: Kitchen Details
  const [kitchenName, setKitchenName] = useState('');
  const [phone, setPhone] = useState('');
  const [foodType, setFoodType] = useState('both'); // veg, non-veg, both

  // Step 3: Brand
  const [logo, setLogo] = useState<any>(null);
  const [banner, setBanner] = useState<any>(null);

  // Step 4: Location
  const [address, setAddress] = useState('');
  const [pinCode, setPinCode] = useState('');

  const pickImage = async (type: 'logo' | 'banner') => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: type === 'logo' ? [1, 1] : [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      if (type === 'logo') setLogo(result.assets[0]);
      else setBanner(result.assets[0]);
    }
  };

  const nextStep = async () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      try {
        await register({
          email,
          password,
          ownerName: kitchenName,
          restaurantName: kitchenName,
          phone,
          cuisines: [foodType],
          address: {
            line1: address,
            city: "Mumbai",
            state: "MH",
            pinCode: pinCode
          }
        });

        if (logo || banner) {
          await uploadBranding(logo, banner);
        }

        Alert.alert(
          'REGISTRATION SUCCESS',
          'Your restaurant details were submitted successfully and are now under review.',
          [{ text: 'OPEN STATUS', onPress: () => router.replace('/(auth)/pending') }]
        );
      } catch (error: any) {
        Alert.alert('REGISTRATION ERROR', typeof error === 'string' ? error : 'We could not submit your restaurant details right now.');
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.indicatorWrapper}>
      {STEPS.map((step, index) => (
        <View key={step} style={styles.stepItem}>
          <View style={[
            styles.dot, 
            index <= currentStep && styles.activeDot,
            index < currentStep && styles.completedDot
          ]}>
            {index < currentStep ? (
              <Ionicons name="checkmark" size={12} color="black" />
            ) : (
              <Text style={[styles.dotText, index === currentStep && {color: 'black'}]}>{index + 1}</Text>
            )}
          </View>
          <Text style={[styles.stepLabel, index === currentStep && styles.activeLabel]}>{step}</Text>
        </View>
      ))}
      <View style={styles.line} />
    </View>
  );

  const renderContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>CREATE ACCOUNT</Text>
            <Text style={styles.stepSub}>Set up your restaurant login to start managing orders and menu items.</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>BUSINESS EMAIL</Text>
              <TextInput 
                style={styles.input} 
                placeholder="ops@chatorjeep.com" 
                placeholderTextColor="#333"
                value={email} 
                onChangeText={setEmail} 
                keyboardType="email-address" 
                autoCapitalize="none"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>PASSWORD</Text>
              <TextInput 
                style={styles.input} 
                placeholder="••••••••" 
                placeholderTextColor="#333"
                value={password} 
                onChangeText={setPassword} 
                secureTextEntry 
              />
            </View>
          </View>
        );
      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>KITCHEN IDENTITY</Text>
            <Text style={styles.stepSub}>Tell us how your restaurant should appear to customers.</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>RESTAURANT NAME</Text>
              <TextInput 
                style={styles.input} 
                placeholder="E.g. GOLDEN GRILL" 
                placeholderTextColor="#333"
                value={kitchenName} 
                onChangeText={setKitchenName} 
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>PHONE NUMBER</Text>
              <TextInput 
                style={styles.input} 
                placeholder="+91 00000 00000" 
                placeholderTextColor="#333"
                value={phone} 
                onChangeText={setPhone} 
                keyboardType="phone-pad" 
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>FOOD TYPE</Text>
              <View style={styles.chipRow}>
                {['veg', 'non-veg', 'both'].map((type) => (
                  <TouchableOpacity 
                    key={type} 
                    style={[styles.chip, foodType === type && styles.activeChip]}
                    onPress={() => setFoodType(type)}
                  >
                    <Text style={[styles.chipText, foodType === type && styles.activeChipText]}>
                      {type.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        );
      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>BRAND IMAGES</Text>
            <Text style={styles.stepSub}>Upload your logo and banner so your restaurant looks great in the app.</Text>
            
            <View style={styles.uploadRow}>
              <TouchableOpacity style={styles.logoUpload} onPress={() => pickImage('logo')}>
                {logo ? (
                  <Image source={{ uri: logo.uri }} style={styles.previewImage} />
                ) : (
                  <>
                    <Ionicons name="finger-print" size={32} color={Colors.light.primary} />
                    <Text style={styles.uploadLabel}>LOGO</Text>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.bannerUpload} onPress={() => pickImage('banner')}>
                {banner ? (
                  <Image source={{ uri: banner.uri }} style={styles.previewImage} />
                ) : (
                  <>
                    <Ionicons name="images" size={32} color={Colors.light.primary} />
                    <Text style={styles.uploadLabel}>FLEET BANNER</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
            <Text style={styles.uploadHint}>OPTIMIZED FOR DARK INTERFACE. MAX 2MB.</Text>
          </View>
        );
      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>LOGISTICS NODE</Text>
            <Text style={styles.stepSub}>GPS coordinates and physical address for payload collection.</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>PHYSICAL ADDRESS</Text>
              <TextInput 
                style={[styles.input, {height: 120, paddingTop: 15, textAlignVertical: 'top'}]} 
                placeholder="STREET, BLOCK, LANDMARK..." 
                placeholderTextColor="#333"
                value={address} 
                onChangeText={setAddress} 
                multiline 
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>SECTOR CODE (PIN)</Text>
              <TextInput 
                style={styles.input} 
                placeholder="400001" 
                placeholderTextColor="#333"
                value={pinCode} 
                onChangeText={setPinCode} 
                keyboardType="numeric" 
              />
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={prevStep} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>SECURE ONBOARDING</Text>
        </View>

        {renderStepIndicator()}
        
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {renderContent()}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.mainBtn, isLoading && {opacity: 0.6}]} 
            onPress={nextStep}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="black" />
            ) : (
              <>
                <Text style={styles.mainBtnText}>
                  {currentStep === STEPS.length - 1 ? 'FINALIZE PROTOCOL' : 'NEXT SEQUENCE'}
                </Text>
                <Ionicons name="chevron-forward" size={18} color="black" style={{marginLeft: 8}} />
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 25,
  },
  backBtn: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#222',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '900',
    marginLeft: 15,
    color: '#FFF',
    letterSpacing: 2,
  },
  indicatorWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    paddingVertical: 20,
    position: 'relative',
  },
  line: {
    position: 'absolute',
    top: 35,
    left: 45,
    right: 45,
    height: 1,
    backgroundColor: '#111',
    zIndex: -1,
  },
  stepItem: {
    alignItems: 'center',
    width: width / 5,
  },
  dot: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#000',
    borderWidth: 1.5,
    borderColor: '#222',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  activeDot: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primary,
  },
  completedDot: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primary,
  },
  dotText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#333',
  },
  stepLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: '#333',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  activeLabel: {
    color: Colors.light.primary,
  },
  stepContent: {
    padding: 30,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFF',
    marginBottom: 10,
    letterSpacing: 1,
  },
  stepSub: {
    fontSize: 12,
    color: '#666',
    lineHeight: 20,
    marginBottom: 35,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 25,
  },
  label: {
    fontSize: 10,
    fontWeight: '900',
    color: '#444',
    marginBottom: 12,
    letterSpacing: 1.5,
    marginLeft: 5,
  },
  input: {
    backgroundColor: '#0A0A0A',
    height: 60,
    borderRadius: 18,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
    borderWidth: 1,
    borderColor: '#1A1A1A',
  },
  chipRow: {
    flexDirection: 'row',
    gap: 12,
  },
  chip: {
    flex: 1,
    height: 50,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0A0A0A',
  },
  activeChip: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#444',
    letterSpacing: 1,
  },
  activeChipText: {
    color: 'black',
  },
  uploadRow: {
    flexDirection: 'row',
    gap: 18,
  },
  logoUpload: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 22,
    backgroundColor: '#0A0A0A',
    borderWidth: 1.5,
    borderColor: '#222',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerUpload: {
    flex: 1.8,
    aspectRatio: 1,
    borderRadius: 22,
    backgroundColor: '#0A0A0A',
    borderWidth: 1.5,
    borderColor: '#222',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadLabel: {
    marginTop: 10,
    fontSize: 9,
    fontWeight: '900',
    color: Colors.light.primary,
    letterSpacing: 1,
  },
  uploadHint: {
    fontSize: 9,
    color: '#333',
    marginTop: 20,
    textAlign: 'center',
    fontWeight: '900',
    letterSpacing: 1,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  footer: {
    padding: 25,
    paddingBottom: 35,
  },
  mainBtn: {
    backgroundColor: Colors.light.primary,
    height: 65,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainBtnText: {
    color: 'black',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
});
