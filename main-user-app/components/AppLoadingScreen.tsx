import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  withDelay,
  Easing 
} from 'react-native-reanimated';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export const AppLoadingScreen = ({ onFinish }: { onFinish?: () => void }) => {
  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Logo entrance animation
    opacity.value = withTiming(1, { duration: 800 });
    scale.value = withSequence(
      withTiming(1.2, { duration: 600, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }),
      withTiming(1, { duration: 400, easing: Easing.bounce })
    );

    // If onFinish is provided, we can simulate a min display time
    if (onFinish) {
      const timer = setTimeout(() => {
        opacity.value = withTiming(0, { duration: 500 });
        scale.value = withTiming(1.5, { duration: 500 }, () => {
          // call onFinish after the exit animation
        });
        setTimeout(onFinish, 500);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
        <View style={styles.iconCircle}>
          <Ionicons name="fast-food" size={80} color={Colors.light.white} />
        </View>
        <Animated.Text style={[styles.title, logoAnimatedStyle]}>
          Chatori Jeeb
        </Animated.Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.primary, // Vibrant Yellow
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 9999,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: Colors.light.white,
    letterSpacing: -1,
  }
});
