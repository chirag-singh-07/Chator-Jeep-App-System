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
  ScrollView,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const STEPS = ['Account', 'Kitchen', 'Brand', 'Location'];

export default function RegisterScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();

  // Step 1: Account
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Step 2: Kitchen Details
  const [kitchenName, setKitchenName] = useState('');
  const [phone, setPhone] = useState('');
  const [foodType, setFoodType] = useState('both'); // veg, non-veg, both

  // Step 3: Brand
  const [logo, setLogo] = useState(null);
  const [banner, setBanner] = useState(null);

  // Step 4: Location
  const [address, setAddress] = useState('');
  const [pinCode, setPinCode] = useState('');

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      router.replace('/(tabs)');
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
              <Ionicons name="checkmark" size={12} color="white" />
            ) : (
              <Text style={[styles.dotText, index === currentStep && {color: 'white'}]}>{index + 1}</Text>
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
            <Text style={styles.stepTitle}>Account Security</Text>
            <Text style={styles.stepSub}>Start your partnership by setting up your credentials.</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Official Email</Text>
              <TextInput style={styles.input} placeholder="kitchen@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Secure Password</Text>
              <TextInput style={styles.input} placeholder="••••••••" value={password} onChangeText={setPassword} secureTextEntry />
            </View>
          </View>
        );
      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Kitchen Identity</Text>
            <Text style={styles.stepSub}>Tell us how customers will recognize your kitchen.</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Kitchen / Restaurant Name</Text>
              <TextInput style={styles.input} placeholder="E.g. Royal Spice Kitchen" value={kitchenName} onChangeText={setKitchenName} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contact Phone Number</Text>
              <TextInput style={styles.input} placeholder="+91 00000 00000" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Speciality Type</Text>
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
            <Text style={styles.stepTitle}>Brand Visuals</Text>
            <Text style={styles.stepSub}>Upload your logo and banner to stand out from the crowd.</Text>
            
            <View style={styles.uploadRow}>
              <TouchableOpacity style={styles.logoUpload}>
                <Ionicons name="camera" size={32} color={Colors.light.primary} />
                <Text style={styles.uploadLabel}>Logo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.bannerUpload}>
                <Ionicons name="image" size={32} color={Colors.light.primary} />
                <Text style={styles.uploadLabel}>Store Banner</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.uploadHint}>JPG or PNG. Max size 2MB.</Text>
          </View>
        );
      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Store Location</Text>
            <Text style={styles.stepSub}>Where should customers come to pick up their delicious food?</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Address</Text>
              <TextInput style={[styles.input, {height: 100, textAlignVertical: 'top'}]} placeholder="House/Shop No, Street, Landmark..." value={address} onChangeText={setAddress} multiline />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Pin Code</Text>
              <TextInput style={styles.input} placeholder="400001" value={pinCode} onChangeText={setPinCode} keyboardType="numeric" />
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={prevStep} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Kitchen Registration</Text>
        </View>

        {renderStepIndicator()}
        
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {renderContent()}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.mainBtn} 
            onPress={nextStep}
          >
            <Text style={styles.mainBtnText}>
              {currentStep === STEPS.length - 1 ? 'FINISH REGISTRATION' : 'CONTINUE'}
            </Text>
            <Ionicons name="arrow-forward" size={18} color="white" style={{marginLeft: 8}} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F8F8F8',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 15,
    color: Colors.light.text,
  },
  indicatorWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 30,
    position: 'relative',
  },
  line: {
    position: 'absolute',
    top: 45,
    left: 40,
    right: 40,
    height: 2,
    backgroundColor: '#F0F0F0',
    zIndex: -1,
  },
  stepItem: {
    alignItems: 'center',
    width: width / 4.5,
  },
  dot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#F0F0F0',
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
    fontSize: 12,
    fontWeight: 'bold',
    color: '#CCC',
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#CCC',
    textTransform: 'uppercase',
  },
  activeLabel: {
    color: Colors.light.primary,
  },
  stepContent: {
    padding: 25,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 10,
  },
  stepSub: {
    fontSize: 14,
    color: Colors.light.textMuted,
    lineHeight: 22,
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 10,
    marginLeft: 5,
  },
  input: {
    backgroundColor: '#F8F8F8',
    height: 55,
    borderRadius: 16,
    paddingHorizontal: 20,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  chipRow: {
    flexDirection: 'row',
    gap: 10,
  },
  chip: {
    flex: 1,
    height: 45,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFADA',
  },
  activeChip: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.light.textMuted,
  },
  activeChipText: {
    color: 'white',
  },
  uploadRow: {
    flexDirection: 'row',
    gap: 15,
  },
  logoUpload: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 20,
    backgroundColor: '#FFF5F5',
    borderWidth: 2,
    borderColor: Colors.light.primary,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerUpload: {
    flex: 2,
    aspectRatio: 1.8,
    borderRadius: 20,
    backgroundColor: '#FFF5F5',
    borderWidth: 2,
    borderColor: Colors.light.primary,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'end',
  },
  uploadLabel: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.light.primary,
  },
  uploadHint: {
    fontSize: 12,
    color: Colors.light.textMuted,
    marginTop: 15,
    textAlign: 'center',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  mainBtn: {
    backgroundColor: Colors.light.primary,
    height: 60,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  mainBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});
