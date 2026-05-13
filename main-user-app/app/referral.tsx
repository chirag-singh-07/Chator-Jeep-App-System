import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Image,
  Share
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  FadeInDown, 
  FadeInUp, 
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export default function ReferralScreen() {
  const router = useRouter();
  const referralCode = "CHATORI500";

  const onShare = async () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await Share.share({
        message: `Hey! Use my referral code ${referralCode} to get ₹100 OFF on your first 3 orders on Chatori Jeeb! Download now: https://chatorijeeb.com`,
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.navBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Refer & Earn</Text>
          <View style={{ width: 45 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <Animated.View entering={FadeInUp.delay(200)} style={styles.heroSection}>
            <View style={styles.imageBox}>
               <Ionicons name="gift" size={80} color={Colors.light.primary} />
            </View>
            <Text style={styles.heroTitle}>Invite Friends,{"\n"}Get ₹100 Free!</Text>
            <Text style={styles.heroSub}>Share the joy of good food. When your friend places their first order, you both get ₹100 in your wallet.</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400)} style={styles.codeSection}>
            <Text style={styles.codeLabel}>YOUR REFERRAL CODE</Text>
            <View style={styles.codeBox}>
              <Text style={styles.codeText}>{referralCode}</Text>
              <TouchableOpacity onPress={onShare} style={styles.copyBtn}>
                <Ionicons name="copy-outline" size={20} color={Colors.light.primary} />
              </TouchableOpacity>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(600)} style={styles.stepsSection}>
            <Text style={styles.stepsTitle}>How it works</Text>
            
            <View style={styles.step}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
              <View style={styles.stepInfo}>
                <Text style={styles.stepTitle}>Share your code</Text>
                <Text style={styles.stepDesc}>Send your unique code to friends via WhatsApp, SMS, or Social Media.</Text>
              </View>
            </View>

            <View style={styles.step}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
              <View style={styles.stepInfo}>
                <Text style={styles.stepTitle}>They sign up & order</Text>
                <Text style={styles.stepDesc}>They get ₹100 OFF on their first 3 orders using your special referral code.</Text>
              </View>
            </View>

            <View style={styles.step}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
              <View style={styles.stepInfo}>
                <Text style={styles.stepTitle}>You get rewarded</Text>
                <Text style={styles.stepDesc}>Once their first order is delivered, ₹100 will be added to your wallet instantly!</Text>
              </View>
            </View>
          </Animated.View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity onPress={onShare} style={styles.shareBtn}>
            <Ionicons name="logo-whatsapp" size={24} color="#1A1A1A" />
            <Text style={styles.shareBtnText}>INVITE VIA WHATSAPP</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backBtn: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1A1A1A',
  },
  content: {
    paddingHorizontal: 30,
    paddingTop: 20,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  imageBox: {
    width: 160,
    height: 160,
    borderRadius: 60,
    backgroundColor: '#FFFDF0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1A1A1A',
    textAlign: 'center',
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  heroSub: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginTop: 15,
    lineHeight: 22,
    paddingHorizontal: 10,
    fontWeight: '500',
  },
  codeSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 30,
    padding: 30,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F3F4F6',
    borderStyle: 'dashed',
    marginBottom: 40,
  },
  codeLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: '#999',
    letterSpacing: 2,
    marginBottom: 15,
  },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  codeText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1A1A1A',
    letterSpacing: 4,
  },
  copyBtn: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  stepsSection: {
    marginBottom: 20,
  },
  stepsTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1A1A1A',
    marginBottom: 25,
  },
  step: {
    flexDirection: 'row',
    marginBottom: 30,
    gap: 20,
  },
  stepNumber: {
    width: 35,
    height: 35,
    borderRadius: 12,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1A1A1A',
  },
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 5,
  },
  stepDesc: {
    fontSize: 13,
    color: '#777',
    lineHeight: 20,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 25,
    paddingBottom: 20,
    paddingTop: 10,
  },
  shareBtn: {
    backgroundColor: Colors.light.primary,
    height: 65,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 5,
  },
  shareBtnText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1A1A1A',
    letterSpacing: 1,
  },
});
