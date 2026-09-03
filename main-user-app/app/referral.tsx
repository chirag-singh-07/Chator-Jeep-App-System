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
  Share
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
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
        <View style={styles.pageHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color="#161616" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Refer & Earn</Text>
            <Text style={styles.headerSubtitle}>Invite friends, get rewards</Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <Animated.View entering={FadeInUp.delay(200)} style={styles.heroSection}>
            <View style={styles.imageBox}>
               <Ionicons name="gift" size={80} color="#FFD400" />
            </View>
            <Text style={styles.heroTitle}>Invite Friends,{"\n"}Get ₹100 Free!</Text>
            <Text style={styles.heroSub}>Share the joy of good food. When your friend places their first order, you both get ₹100 in your wallet.</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400)} style={styles.codeSection}>
            <Text style={styles.codeLabel}>YOUR REFERRAL CODE</Text>
            <View style={styles.codeBox}>
              <Text style={styles.codeText}>{referralCode}</Text>
              <TouchableOpacity onPress={onShare} style={styles.copyBtn}>
                <Ionicons name="copy-outline" size={20} color="#161616" />
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
            <Ionicons name="logo-whatsapp" size={24} color="#161616" />
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
  pageHeader: {
    paddingHorizontal: 18,
    paddingVertical: 17,
    paddingTop: Platform.OS === 'android' ? 45 : 25,
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
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#161616',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#838383',
    marginTop: 3,
    fontFamily: 'Inter-Regular',
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 30,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  imageBox: {
    width: 140,
    height: 140,
    borderRadius: 50,
    backgroundColor: '#FFF8D0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  heroTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Black',
    color: '#161616',
    textAlign: 'center',
    lineHeight: 34,
    letterSpacing: -0.5,
  },
  heroSub: {
    fontSize: 14,
    color: '#737373',
    textAlign: 'center',
    marginTop: 15,
    lineHeight: 20,
    paddingHorizontal: 10,
    fontFamily: 'Inter-Regular',
  },
  codeSection: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ECECEC',
    borderStyle: 'dashed',
    marginBottom: 40,
  },
  codeLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Black',
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
    fontFamily: 'Inter-Black',
    color: '#161616',
    letterSpacing: 4,
  },
  copyBtn: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: '#F4F4F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepsSection: {
    marginBottom: 20,
  },
  stepsTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Black',
    color: '#161616',
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
    backgroundColor: '#FFD400',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 18,
    fontFamily: 'Inter-Black',
    color: '#161616',
  },
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#161616',
    marginBottom: 5,
  },
  stepDesc: {
    fontSize: 14,
    color: '#737373',
    lineHeight: 18,
    fontFamily: 'Inter-Regular',
  },
  footer: {
    paddingHorizontal: 18,
    paddingBottom: 20,
    paddingTop: 10,
  },
  shareBtn: {
    backgroundColor: '#FFD400',
    height: 60,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  shareBtnText: {
    fontSize: 16,
    fontFamily: 'Inter-Black',
    color: '#161616',
    letterSpacing: 1,
  },
});
