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
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  FadeIn, 
  FadeInDown, 
  FadeInUp,
  SlideInRight
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Discover Gourmet',
    description: 'Explore the best local kitchens and premium restaurants curated just for you.',
    image: require('@/assets/images/onboarding_food_discover.png'),
    color: '#FFFDF5'
  },
  {
    id: '2',
    title: 'Swift Delivery',
    description: 'Get your favorites delivered at lightning speed by our dedicated fleet.',
    image: require('@/assets/images/onboarding_delivery_speed.png'),
    color: '#FFFDF5'
  },
  {
    id: '3',
    title: 'Real-time Tracking',
    description: 'Watch your meal travel on the map with hyper-accurate live updates.',
    image: require('@/assets/images/onboarding_tracking.png'),
    color: '#FFFDF5'
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



  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Improved Skip Button */}
      {currentSlideIndex < SLIDES.length - 1 && (
        <View style={styles.header}>
          <TouchableOpacity onPress={skip} style={styles.skipBtn}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        ref={flatListRef}
        onMomentumScrollEnd={updateCurrentSlideIndex}
        pagingEnabled
        data={SLIDES}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <View style={styles.slide}>
            <View style={styles.topSection}>
              <Animated.View 
                entering={FadeInDown.duration(1000)}
                style={styles.imageContainer}
              >
                <Image 
                  source={item.image} 
                  style={styles.illustration} 
                  resizeMode="contain"
                />
              </Animated.View>
            </View>
            
            <View style={styles.bottomSection}>
              <View style={styles.card}>
                <View style={styles.textContainer}>
                  <Animated.Text entering={FadeInDown.delay(200)} style={styles.title}>{item.title}</Animated.Text>
                  <Animated.Text entering={FadeInDown.delay(400)} style={styles.description}>{item.description}</Animated.Text>
                </View>

                <View style={styles.footerContainer}>
                  {index < SLIDES.length - 1 ? (
                    <View style={styles.footerRow}>
                      <View style={styles.indicatorRow}>
                        {SLIDES.map((_, i) => (
                          <View
                            key={i}
                            style={[
                              styles.indicator,
                              currentSlideIndex === i && styles.activeIndicator,
                            ]}
                          />
                        ))}
                      </View>
                      <TouchableOpacity 
                        style={styles.nextBtn}
                        onPress={goToNextSlide}
                      >
                        <Ionicons name="arrow-forward" size={24} color="#1A1A1A" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.authContainer}>
                      <TouchableOpacity 
                        style={styles.primaryBtn}
                        onPress={() => router.replace('/(auth)/register')}
                      >
                        <Text style={styles.primaryBtnText}>GET STARTED</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.secondaryBtn}
                        onPress={() => router.replace('/(auth)/login')}
                      >
                        <Text style={styles.secondaryBtnText}>I already have an account</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.primary, // Yellow top
  },
  header: {
    position: 'absolute',
    top: 60,
    right: 25,
    zIndex: 100,
  },
  skipBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  skipText: {
    color: '#1A1A1A',
    fontWeight: '800',
    fontSize: 14,
  },
  slide: {
    width,
    height: height,
  },
  topSection: {
    flex: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primary,
  },
  imageContainer: {
    width: width * 0.8,
    height: width * 0.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustration: {
    width: '100%',
    height: '100%',
  },
  bottomSection: {
    flex: 1,
    backgroundColor: Colors.light.primary,
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    padding: 40,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  title: {
    color: '#1A1A1A',
    fontSize: 32,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -1,
  },
  description: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  footerContainer: {
    marginBottom: 20,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  indicatorRow: {
    flexDirection: 'row',
    gap: 8,
  },
  indicator: {
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: '#EEEEEE',
  },
  activeIndicator: {
    width: 24,
    backgroundColor: Colors.light.primary,
  },
  nextBtn: {
    width: 65,
    height: 65,
    borderRadius: 32,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  authContainer: {
    gap: 15,
  },
  primaryBtn: {
    height: 65,
    borderRadius: 22,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  primaryBtnText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1A1A1A',
    letterSpacing: 1,
  },
  secondaryBtn: {
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#666',
  },
});
