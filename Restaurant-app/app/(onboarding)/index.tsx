import React, { useState, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Dimensions, 
  SafeAreaView,
  StatusBar,
  ImageBackground
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Manage Your Kitchen',
    description: 'Effortlessly manage incoming orders and tracking status in real-time.',
    icon: 'restaurant',
  },
  {
    id: '2',
    title: 'Easy Menu Editing',
    description: 'Update your dishes, prices, and availability with just a few taps.',
    icon: 'list-circle',
  },
  {
    id: '3',
    title: 'Detailed Analytics',
    description: 'Track your growth, revenue, and customer feedback to improve your service.',
    icon: 'bar-chart',
  },
  {
    id: '4',
    title: 'Growth & Support',
    description: 'Get 24/7 dedicated support and tools to help your kitchen reach more customers.',
    icon: 'rocket',
  },
];

export default function OnboardingScreen() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

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
    }
  };

  const Footer = () => {
    return (
      <View style={styles.footer}>
        {/* Indicators */}
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

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          {currentSlideIndex === SLIDES.length - 1 ? (
            <Animated.View entering={FadeInUp} style={styles.finalButtons}>
              <TouchableOpacity 
                style={styles.primaryBtn}
                onPress={() => router.replace('/(auth)/register')}
              >
                <Text style={styles.primaryBtnText}>GET STARTED / REGISTER</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.secondaryBtn}
                onPress={() => router.replace('/(auth)/login')}
              >
                <Text style={styles.secondaryBtnText}>ALREADY A PARTNER? LOGIN</Text>
              </TouchableOpacity>
            </Animated.View>
          ) : (
            <View style={styles.rowButtons}>
              <TouchableOpacity
                onPress={() => router.replace('/(auth)/login')}
                style={styles.skipBtn}
              >
                <Text style={styles.skipBtnText}>SKIP</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.nextBtn} onPress={goToNextSlide}>
                <Text style={styles.nextBtnText}>NEXT</Text>
                <Ionicons name="arrow-forward" size={18} color={Colors.light.black} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <FlatList
        ref={flatListRef}
        onMomentumScrollEnd={updateCurrentSlideIndex}
        pagingEnabled
        data={SLIDES}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Animated.View entering={FadeInUp.duration(1000)}>
              <View style={styles.iconContainer}>
                <Ionicons name={item.icon as any} size={100} color={Colors.light.primary} />
              </View>
            </Animated.View>
            <Animated.View entering={FadeInDown.delay(200)} style={styles.textContainer}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </Animated.View>
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
    backgroundColor: '#000', // Black background for premium feel
  },
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
  },
  iconContainer: {
    height: 200,
    width: 200,
    borderRadius: 60,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 60,
    transform: [{ rotate: '45deg' }],
    borderWidth: 1,
    borderColor: '#333',
  },
  textContainer: {
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  title: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 15,
    letterSpacing: -1,
  },
  description: {
    color: '#AAA',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },
  footer: {
    height: height * 0.3,
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    paddingBottom: 40,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  indicator: {
    height: 6,
    width: 10,
    backgroundColor: '#333',
    marginHorizontal: 4,
    borderRadius: 3,
  },
  buttonContainer: {
    width: '100%',
  },
  rowButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 15,
  },
  finalButtons: {
    gap: 15,
  },
  primaryBtn: {
    height: 65,
    borderRadius: 20,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  primaryBtnText: {
    fontWeight: '900',
    fontSize: 16,
    color: '#000',
    letterSpacing: 1,
  },
  secondaryBtn: {
    height: 60,
    borderRadius: 20,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    borderWidth: 1.5,
    borderColor: '#333',
  },
  secondaryBtnText: {
    fontWeight: '800',
    fontSize: 14,
    color: '#FFF',
    letterSpacing: 0.5,
  },
  nextBtn: {
    flex: 1.5,
    height: 60,
    borderRadius: 20,
    backgroundColor: Colors.light.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  nextBtnText: {
    fontWeight: '900',
    fontSize: 15,
    color: '#000',
  },
  skipBtn: {
    flex: 1,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipBtnText: {
    fontWeight: '700',
    fontSize: 15,
    color: '#666',
  },
});
