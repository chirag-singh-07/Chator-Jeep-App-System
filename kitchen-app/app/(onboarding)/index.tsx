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

        <View style={{ marginBottom: 20 }}>
          {currentSlideIndex === SLIDES.length - 1 ? (
            <TouchableOpacity 
              style={styles.btn}
              onPress={() => router.replace('/(auth)/login')}
            >
              <Text style={styles.btnText}>PARTNER WITH US</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity
                onPress={() => router.replace('/(auth)/login')}
                style={[
                  styles.btn,
                  { backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.light.primary },
                ]}
              >
                <Text style={[styles.btnText, { color: Colors.light.primary }]}>SKIP</Text>
              </TouchableOpacity>
              <View style={{ width: 15 }} />
              <TouchableOpacity style={styles.btn} onPress={goToNextSlide}>
                <Text style={styles.btnText}>NEXT</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
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
        contentContainerStyle={{ height: height * 0.75 }}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <View style={styles.iconContainer}>
               <Ionicons name={item.icon as any} size={100} color={Colors.light.primary} />
            </View>
            <View style={{ paddingHorizontal: 40, alignItems: 'center' }}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
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
    paddingBottom: 50,
  },
  iconContainer: {
    height: 220,
    width: 220,
    borderRadius: 60,
    backgroundColor: '#FFF5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 50,
    transform: [{ rotate: '45deg' }], // Stylized rotated square
  },
  title: {
    color: Colors.light.text,
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  description: {
    color: Colors.light.textMuted,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    height: height * 0.25,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  indicator: {
    height: 6,
    width: 10,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 3,
    borderRadius: 3,
  },
  btn: {
    flex: 1,
    height: 55,
    borderRadius: 20,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: Colors.light.white,
    letterSpacing: 0.5,
  },
});
