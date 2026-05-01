import React, { useState, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Dimensions, 
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius, Shadows } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Animated, { 
  FadeInDown, 
  FadeInUp,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Welcome to Fleet',
    description: 'Join thousands of partners delivering joy across the city every day with speed and reliability.',
    icon: 'bicycle-outline',
  },
  {
    id: '2',
    title: 'Earn on Your Terms',
    description: 'Work whenever you want. Set your own schedule, take breaks, and track daily earnings in real-time.',
    icon: 'wallet-outline',
  },
  {
    id: '3',
    title: 'Smart Navigation',
    description: 'AI-powered routing that finds the fastest path to avoid city traffic and save your fuel.',
    icon: 'navigate-outline',
  },
  {
    id: '4',
    title: 'Safety First',
    description: 'Every trip is protected. We provide insurance and 24/7 emergency support for your peace of mind.',
    icon: 'shield-checkmark-outline',
  },
  {
    id: '5',
    title: 'Weekly Bonuses',
    description: 'Complete targets to unlock massive weekly incentives and performance-based rewards.',
    icon: 'gift-outline',
  },
  {
    id: '6',
    title: 'Instant Settlements',
    description: 'No waiting periods. Get your incentives and tips settled directly to your wallet within minutes.',
    icon: 'cash-outline',
  },
  {
    id: '7',
    title: 'Community Support',
    description: 'Connect with a thriving community of riders and get dedicated support whenever you need it.',
    icon: 'people-outline',
  },
  {
    id: '8',
    title: 'Ready to Roll?',
    description: "A few more steps to verify your documents and you're good to go! Let's start your journey.",
    icon: 'checkmark-circle-outline',
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

  const Pagination = () => (
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
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor={Colors.light.background} />
      
      {/* Header with Skip Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/(auth)/login')} style={styles.loginTopButton}>
          <Text style={styles.loginTopText}>LOGIN</Text>
        </TouchableOpacity>
        {currentSlideIndex < SLIDES.length - 1 && (
          <TouchableOpacity onPress={skip} style={styles.skipButton}>
            <Text style={styles.skipText}>SKIP</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        ref={flatListRef}
        onMomentumScrollEnd={updateCurrentSlideIndex}
        pagingEnabled
        data={SLIDES}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Animated.View 
              entering={FadeInDown.duration(800)}
              style={styles.iconWrapper}
            >
              <View style={styles.glowCircle} />
              <Ionicons name={item.icon as any} size={100} color={Colors.light.primary} />
            </Animated.View>
            
            <View style={styles.textContainer}>
              <Animated.Text entering={FadeInUp.delay(200)} style={styles.title}>
                {item.title}
              </Animated.Text>
              <Animated.Text entering={FadeInUp.delay(400)} style={styles.description}>
                {item.description}
              </Animated.Text>
            </View>
          </View>
        )}
      />

      <View style={styles.footer}>
        <Pagination />
        
        <Animated.View entering={FadeInDown.delay(200)} style={styles.buttonContainer}>
          <TouchableOpacity 
            activeOpacity={0.8}
            style={[
              styles.nextBtn, 
              currentSlideIndex === SLIDES.length - 1 && styles.startBtn
            ]} 
            onPress={goToNextSlide}
          >
            <Text style={[
              styles.btnText,
              currentSlideIndex === SLIDES.length - 1 && styles.startBtnText
            ]}>
              {currentSlideIndex === SLIDES.length - 1 ? 'START EARNING' : 'NEXT'}
            </Text>
            {currentSlideIndex < SLIDES.length - 1 && (
              <Ionicons name="arrow-forward" size={20} color={Colors.light.black} />
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  loginTopButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  loginTopText: {
    color: Colors.light.textDim,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
  skipButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  skipText: {
    color: Colors.light.primary,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  iconWrapper: {
    height: 240,
    width: 240,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xxl,
  },
  glowCircle: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.light.primary,
    opacity: 0.08,
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
  textContainer: {
    paddingHorizontal: 40,
    alignItems: 'center',
    gap: Spacing.md,
  },
  title: {
    color: Colors.light.text,
    fontSize: 34,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 42,
  },
  description: {
    color: Colors.light.textDim,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 26,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: Spacing.xxl,
    gap: 8,
  },
  dot: {
    height: 6,
    borderRadius: Radius.full,
  },
  activeDot: {
    width: 28,
    backgroundColor: Colors.light.primary,
  },
  inactiveDot: {
    width: 8,
    backgroundColor: '#333333',
  },
  buttonContainer: {
    width: '100%',
  },
  nextBtn: {
    height: 64,
    borderRadius: Radius.full,
    backgroundColor: Colors.light.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    ...Shadows.gold,
  },
  startBtn: {
    backgroundColor: Colors.light.primary,
  },
  btnText: {
    fontWeight: '900',
    fontSize: 16,
    color: Colors.light.black,
    letterSpacing: 1,
  },
  startBtnText: {
    fontSize: 18,
  }
});
