import React, { useState, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Dimensions, 
  SafeAreaView,
  StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  FadeIn, 
  FadeInDown, 
  FadeInUp,
  useAnimatedStyle,
  withSpring
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Welcome to Fleet',
    description: 'Join thousands of partners delivering joy across the city every day.',
    icon: 'bicycle-outline',
    color: '#E6F0FF'
  },
  {
    id: '2',
    title: 'Earn on Your Terms',
    description: 'Work whenever you want. Set your own schedule and track daily earnings.',
    icon: 'wallet-outline',
    color: '#F0F7FF'
  },
  {
    id: '3',
    title: 'Smart Navigation',
    description: 'AI-powered routing that finds the fastest path to avoid city traffic.',
    icon: 'navigate-outline',
    color: '#E6F0FF'
  },
  {
    id: '4',
    title: 'Instant Settlements',
    description: 'No waiting periods. Get your incentives and tips settled directly to your wallet.',
    icon: 'cash-outline',
    color: '#F0F7FF'
  },
  {
    id: '5',
    title: 'Ready to Roll?',
    description: 'A few more steps to verify your documents and you are good to go!',
    icon: 'checkmark-circle-outline',
    color: '#E6F0FF'
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
      router.replace('/(auth)/login');
    }
  };

  const skip = () => {
    router.replace('/(auth)/login');
  };

  const Footer = () => {
    return (
      <View style={styles.footer}>
        <View style={styles.indicatorContainer}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                currentSlideIndex === index && {
                  backgroundColor: Colors.light.primary,
                  width: 25,
                },
              ]}
            />
          ))}
        </View>

        <Animated.View entering={FadeInDown.delay(200)} style={{ marginBottom: 30 }}>
          {currentSlideIndex === SLIDES.length - 1 ? (
            <TouchableOpacity 
              activeOpacity={0.8}
              style={styles.btn}
              onPress={() => router.replace('/(auth)/login')}
            >
              <Text style={styles.btnText}>START EARNING</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={skip}
                style={[
                  styles.btn,
                  { backgroundColor: 'transparent' },
                ]}
              >
                <Text style={[styles.btnText, { color: Colors.light.textMuted }]}>SKIP</Text>
              </TouchableOpacity>
              <View style={{ flex: 1 }} />
              <TouchableOpacity 
                activeOpacity={0.8}
                style={[styles.btn, { width: 140, flex: 0 }]} 
                onPress={goToNextSlide}
              >
                <Text style={styles.btnText}>NEXT</Text>
                <Ionicons name="arrow-forward" size={18} color="white" style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
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
              style={[styles.iconContainer, { backgroundColor: item.color }]}
            >
               <Ionicons name={item.icon as any} size={130} color={Colors.light.primary} />
            </Animated.View>
            <View style={{ paddingHorizontal: 40, alignItems: 'center' }}>
              <Animated.Text entering={FadeInUp.delay(200)} style={styles.title}>{item.title}</Animated.Text>
              <Animated.Text entering={FadeInUp.delay(400)} style={styles.description}>{item.description}</Animated.Text>
            </View>
          </View>
        )}
      />
      <Footer />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
  },
  iconContainer: {
    height: 300,
    width: 300,
    borderRadius: 150,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 60,
  },
  title: {
    color: Colors.light.text,
    fontSize: 32,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  description: {
    color: Colors.light.textMuted,
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 28,
    maxWidth: 300,
  },
  footer: {
    justifyContent: 'space-between',
    paddingHorizontal: 30,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
  },
  indicator: {
    height: 6,
    width: 10,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 4,
    borderRadius: 3,
  },
  btn: {
    flex: 1,
    height: 60,
    borderRadius: 20,
    backgroundColor: Colors.light.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 5,
  },
  btnText: {
    fontWeight: 'bold',
    fontSize: 18,
    color: Colors.light.white,
    letterSpacing: 1,
  },
});
