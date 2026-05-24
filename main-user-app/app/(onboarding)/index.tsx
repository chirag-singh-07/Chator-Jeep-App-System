import React, { useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Dimensions, 
  StatusBar,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  withSpring,
  FadeInDown,
  FadeInUp
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Discover Gourmet',
    description: 'Explore the best local kitchens and premium restaurants curated just for you.',
    image: require('@/assets/images/onboarding_food_discover.jpg'),
    color: '#FFFDF5'
  },
  {
    id: '2',
    title: 'Swift Delivery',
    description: 'Get your favorites delivered at lightning speed by our dedicated fleet.',
    image: require('@/assets/images/onboarding_delivery_speed.jpg'),
    color: '#FFFDF5'
  },
  {
    id: '3',
    title: 'Real-time Tracking',
    description: 'Watch your meal travel on the map with hyper-accurate live updates.',
    image: require('@/assets/images/onboarding_tracking.jpg'),
    color: '#FFFDF5'
  },
];

const BouncingNextButton = ({ onPress, isLast }: { onPress: () => void, isLast: boolean }) => {
  return (
    <Animated.View entering={FadeInUp.delay(200).springify()}>
      <TouchableOpacity 
        style={styles.nextBtn}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Ionicons name={isLast ? "checkmark" : "arrow-forward"} size={28} color="#FFF" />
      </TouchableOpacity>
    </Animated.View>
  );
};

const SlideItem = ({ item, index, scrollX }: { item: typeof SLIDES[0], index: number, scrollX: any }) => {
  const inputRange = [
    (index - 1) * width,
    index * width,
    (index + 1) * width
  ];

  // Parallax and Scale for image
  const imageAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollX.value,
      inputRange,
      [100, 0, -100],
      Extrapolation.CLAMP
    );
    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.6, 1, 0.6],
      Extrapolation.CLAMP
    );
    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0, 1, 0],
      Extrapolation.CLAMP
    );
    return {
      opacity,
      transform: [{ translateY }, { scale }],
    };
  });

  // Text animation
  const textAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollX.value,
      inputRange,
      [40, 0, -40],
      Extrapolation.CLAMP
    );
    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0, 1, 0],
      Extrapolation.CLAMP
    );
    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  return (
    <View style={styles.slide}>
      <View style={styles.imageContainerWrapper}>
        <Animated.View style={[styles.imageContainer, imageAnimatedStyle]}>
          <Image 
            source={item.image} 
            style={styles.illustration} 
            resizeMode="contain"
          />
        </Animated.View>
      </View>

      <Animated.View style={[styles.textContainerWrapper, textAnimatedStyle]}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </Animated.View>
    </View>
  );
};

export default function OnboardingScreen() {
  const router = useRouter();
  const scrollX = useSharedValue(0);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const flatListRef = useRef<Animated.FlatList<any>>(null);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems[0]) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const goToNextSlide = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < SLIDES.length) {
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    } else {
      router.replace('/(auth)/login');
    }
  };

  const skip = () => {
    router.replace('/(auth)/login');
  };

  // Animated Pagination Indicator
  const Pagination = () => {
    return (
      <View style={styles.indicatorRow}>
        {SLIDES.map((_, index) => {
          const animatedDotStyle = useAnimatedStyle(() => {
            const widthAnim = interpolate(
              scrollX.value,
              [(index - 1) * width, index * width, (index + 1) * width],
              [8, 28, 8],
              Extrapolation.CLAMP
            );
            const opacityAnim = interpolate(
              scrollX.value,
              [(index - 1) * width, index * width, (index + 1) * width],
              [0.3, 1, 0.3],
              Extrapolation.CLAMP
            );
            return {
              width: widthAnim,
              opacity: opacityAnim,
            };
          });

          return (
            <Animated.View
              key={index}
              style={[styles.indicator, animatedDotStyle]}
            />
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Background that subtle changes color if needed */}
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#F8F9FA' }]} />

      <View style={styles.header}>
        <Animated.View entering={FadeInDown.duration(800).delay(100)}>
          <TouchableOpacity onPress={skip} style={styles.skipBtn}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      <Animated.FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        onScroll={onScroll}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        scrollEventThrottle={16}
        renderItem={({ item, index }) => <SlideItem item={item} index={index} scrollX={scrollX} />}
      />

      <View style={styles.bottomControls}>
        <Pagination />
        <BouncingNextButton 
          onPress={goToNextSlide} 
          isLast={currentIndex === SLIDES.length - 1} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    position: 'absolute',
    top: 60,
    right: 25,
    zIndex: 100,
  },
  skipBtn: {
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  skipText: {
    color: '#1A1A1A',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  slide: {
    width,
    height,
    alignItems: 'center',
    paddingTop: height * 0.15,
  },
  imageContainerWrapper: {
    width: width * 0.9,
    height: width * 0.9,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 10,
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 40,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  illustration: {
    width: '110%',
    height: '110%',
  },
  textContainerWrapper: {
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  title: {
    color: '#1A1A1A',
    fontSize: 34,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
    lineHeight: 40,
  },
  description: {
    color: '#666666',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 26,
    fontWeight: '500',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 50,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  indicatorRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  indicator: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.primary,
  },
  nextBtn: {
    width: 65,
    height: 65,
    borderRadius: 33,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
});
