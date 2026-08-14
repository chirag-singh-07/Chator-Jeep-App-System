import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius, Shadows } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Welcome to\nChatori Jeeb',
    description: 'Join thousands of delivery partners bringing joy across the city — fast, reliable, and rewarding.',
    icon: 'bicycle-outline',
    showLogo: true,
    accent: '#1B4FD8',
  },
  {
    id: '2',
    title: 'Earn on\nYour Terms',
    description: 'Work whenever you want. Set your own schedule, take breaks, and track daily earnings in real-time.',
    icon: 'wallet-outline',
    accent: '#1338A8',
  },
  {
    id: '3',
    title: 'Smart\nNavigation',
    description: 'AI-powered routing that finds the fastest path, avoiding city traffic to save time and fuel.',
    icon: 'navigate-outline',
    accent: '#1B4FD8',
  },
  {
    id: '4',
    title: 'Safety\nFirst',
    description: 'Every trip is protected. We provide insurance and 24/7 emergency support for your peace of mind.',
    icon: 'shield-checkmark-outline',
    accent: '#1338A8',
  },
  {
    id: '5',
    title: 'Weekly\nBonuses',
    description: 'Complete targets to unlock massive weekly incentives and performance-based rewards.',
    icon: 'gift-outline',
    accent: '#1B4FD8',
  },
  {
    id: '6',
    title: 'Instant\nSettlements',
    description: 'No waiting periods. Get your earnings and tips settled directly to your wallet within minutes.',
    icon: 'cash-outline',
    accent: '#1338A8',
  },
  {
    id: '7',
    title: 'Ready\nto Roll?',
    description: "A few quick steps to verify your documents and you're good to go. Let's start your journey!",
    icon: 'checkmark-circle-outline',
    accent: '#1B4FD8',
  },
];

export default function OnboardingScreen() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();

  const updateCurrentSlideIndex = (e: any) => {
    const contentOffsetX = e.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / width);
    setCurrentSlideIndex(currentIndex);
  };

  const goToNextSlide = () => {
    const nextSlideIndex = currentSlideIndex + 1;
    if (nextSlideIndex < SLIDES.length) {
      const offset = nextSlideIndex * width;
      flatListRef?.current?.scrollToOffset({ offset });
      setCurrentSlideIndex(nextSlideIndex);
    } else {
      router.replace('/(auth)/register');
    }
  };

  const skip = () => {
    router.replace('/(auth)/register');
  };

  const isLastSlide = currentSlideIndex === SLIDES.length - 1;

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Background wave decoration */}
      <View style={styles.bgDecorTop} />
      <View style={styles.bgDecorBottom} />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.replace('/(auth)/login')}
            style={styles.loginTopButton}
          >
            <Ionicons name="person-outline" size={16} color={Colors.light.primary} />
            <Text style={styles.loginTopText}>LOG IN</Text>
          </TouchableOpacity>
          {!isLastSlide && (
            <TouchableOpacity onPress={skip} style={styles.skipButton}>
              <Text style={styles.skipText}>Skip</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.light.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Slides */}
        <FlatList
          ref={flatListRef}
          onMomentumScrollEnd={updateCurrentSlideIndex}
          pagingEnabled
          data={SLIDES}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.slide}>
              {/* Icon Area */}
              <Animated.View entering={FadeInDown.duration(700)} style={styles.iconArea}>
                <LinearGradient
                  colors={[item.accent, Colors.light.primaryLight]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.iconGradientCircle}
                >
                  {item.showLogo ? (
                    <Image
                      source={require('../../assets/delivery-app-logo.png')}
                      style={styles.logoImage}
                    />
                  ) : (
                    <Ionicons name={item.icon as any} size={72} color="#FFFFFF" />
                  )}
                </LinearGradient>
                {/* Decorative rings */}
                <View style={[styles.ring, styles.ring1]} />
                <View style={[styles.ring, styles.ring2]} />
              </Animated.View>

              {/* Text */}
              <View style={styles.textContainer}>
                <Animated.Text entering={FadeInUp.delay(150).duration(600)} style={styles.title}>
                  {item.title}
                </Animated.Text>
                <Animated.Text entering={FadeInUp.delay(300).duration(600)} style={styles.description}>
                  {item.description}
                </Animated.Text>
              </View>
            </View>
          )}
        />

        {/* Footer */}
        <View style={styles.footer}>
          {/* Pagination dots */}
          <View style={styles.paginationContainer}>
            {SLIDES.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  currentSlideIndex === index ? styles.activeDot : styles.inactiveDot,
                ]}
              />
            ))}
          </View>

          {/* Buttons */}
          <Animated.View entering={FadeInDown.delay(200)} style={styles.buttonRow}>
            {!isLastSlide && (
              <TouchableOpacity
                style={styles.outlineBtn}
                onPress={skip}
                activeOpacity={0.7}
              >
                <Text style={styles.outlineBtnText}>Skip All</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.nextBtn, isLastSlide && styles.fullWidthBtn]}
              onPress={goToNextSlide}
            >
              <LinearGradient
                colors={[Colors.light.primaryLight, Colors.light.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.nextBtnGradient}
              >
                <Text style={styles.nextBtnText}>
                  {isLastSlide ? 'Start Earning' : 'Next'}
                </Text>
                <Ionicons
                  name={isLastSlide ? 'rocket-outline' : 'arrow-forward'}
                  size={20}
                  color="#FFFFFF"
                />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  bgDecorTop: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: Colors.light.primary,
    opacity: 0.06,
  },
  bgDecorBottom: {
    position: 'absolute',
    bottom: -100,
    left: -60,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: Colors.light.primary,
    opacity: 0.05,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  loginTopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.light.overlay,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  loginTopText: {
    color: Colors.light.primary,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  skipText: {
    color: Colors.light.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 20,
    paddingHorizontal: Spacing.xl,
  },
  iconArea: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xxl,
  },
  iconGradientCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.blue,
  },
  ring: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: Colors.light.primary,
    opacity: 0.15,
  },
  ring1: {
    width: 200,
    height: 200,
  },
  ring2: {
    width: 220,
    height: 220,
    opacity: 0.08,
  },
  logoImage: {
    width: 150,
    height: 150,
    resizeMode: 'cover',
    borderRadius: 75,
  },
  textContainer: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  title: {
    color: Colors.light.text,
    fontSize: 36,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 44,
  },
  description: {
    color: Colors.light.textMuted,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 26,
    fontWeight: '500',
    maxWidth: 300,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    gap: Spacing.lg,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 7,
  },
  dot: {
    height: 7,
    borderRadius: Radius.full,
  },
  activeDot: {
    width: 30,
    backgroundColor: Colors.light.primary,
  },
  inactiveDot: {
    width: 8,
    backgroundColor: Colors.light.border,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
  },
  outlineBtn: {
    flex: 1,
    height: 58,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.surface,
    ...Shadows.soft,
  },
  outlineBtnText: {
    color: Colors.light.textMuted,
    fontWeight: '600',
    fontSize: 15,
  },
  nextBtn: {
    flex: 2,
    height: 58,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  fullWidthBtn: {
    flex: 1,
  },
  nextBtnGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  nextBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 0.3,
  },
});
