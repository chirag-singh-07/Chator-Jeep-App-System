import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const ICONS: Record<string, { active: any, inactive: any, label: string }> = {
  index: { active: 'home', inactive: 'home-outline', label: 'Home' },
  search: { active: 'search', inactive: 'search-outline', label: 'Search' },
  // favorites: { active: 'heart', inactive: 'heart-outline', label: 'Favorites' },
  // orders: { active: 'receipt', inactive: 'receipt-outline', label: 'Orders' },
  "bulk-order": { active: 'cube', inactive: 'cube-outline', label: 'Bulk Order' },
  profile: { active: 'person', inactive: 'person-outline', label: 'Profile' }
};

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  // Exclude tabs with href: null (like favorites, orders) if they shouldn't be shown
  const routes = state.routes.filter(route => {
    const { options } = descriptors[route.key];
    return (options as any).href !== null;
  });

  return (
    <View style={[styles.container, { bottom: Math.max(insets.bottom, 12) }]}>
      <View style={styles.shadowContainer}>
        <BlurView intensity={80} tint="light" style={styles.blurView}>
          <View style={styles.tabContent}>
            {routes.map((route, index) => {
              const { options } = descriptors[route.key];
              const isFocused = state.index === state.routes.findIndex(r => r.key === route.key);

              const iconName = ICONS[route.name] || ICONS['index'];
              const label = options.title !== undefined ? options.title : iconName.label;

              const onPress = () => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name, route.params);
                }
              };

              const onLongPress = () => {
                navigation.emit({
                  type: 'tabLongPress',
                  target: route.key,
                });
              };

              return (
                <TabItem
                  key={route.key}
                  isFocused={isFocused}
                  label={label}
                  iconConfig={iconName}
                  onPress={onPress}
                  onLongPress={onLongPress}
                />
              );
            })}
          </View>
        </BlurView>
      </View>
    </View>
  );
}

function TabItem({ isFocused, label, iconConfig, onPress, onLongPress }: any) {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: withSpring(isFocused ? -2 : 0, {
            damping: 15,
            stiffness: 150,
          }),
        },
      ],
    };
  });

  return (
    <AnimatedTouchableOpacity
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      onPress={onPress}
      onLongPress={onLongPress}
      style={[
        styles.tabItem,
        animatedStyle,
        isFocused && styles.tabItemFocused
      ]}
    >
      <Ionicons
        name={isFocused ? iconConfig.active : iconConfig.inactive}
        size={isFocused ? 24 : 22}
        color={isFocused ? '#151515' : '#9B9B9B'}
      />
      <Text style={[styles.tabLabel, isFocused && styles.tabLabelFocused]}>
        {label}
      </Text>
    </AnimatedTouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 18,
    right: 18,
  },
  shadowContainer: {
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  blurView: {
    borderRadius: 28,
    overflow: 'hidden',
    height: 76,
  },
  tabContent: {
    flexDirection: 'row',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  tabItemFocused: {
    backgroundColor: '#FFD400',
    shadowColor: '#FFD400',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 4,
    color: '#9B9B9B',
    fontWeight: '600',
  },
  tabLabelFocused: {
    color: '#151515',
    fontWeight: '800',
  },
});
