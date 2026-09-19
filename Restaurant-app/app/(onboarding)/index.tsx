import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  StatusBar,
  FlatList,
  Animated as RNAnimated,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

/* ─────────────────────────────────────────
   THEME TOKENS  (mirrors style.css :root)
───────────────────────────────────────── */
const T = {
  red:       '#D71920',
  redBright: '#FF3B30',
  redDark:   '#A50E14',
  redSoft:   '#FFF0F0',
  redMid:    '#FFD9D9',
  white:     '#FFFFFF',
  bg:        '#F5F5F7',
  ink:       '#1A1A1A',
  ink2:      '#3A3A3A',
  muted:     '#7A7A8A',
  border:    '#E8E8EC',
  green:     '#25B45B',
  orange:    '#FF9500',
  blue:      '#007AFF',
};

/* ─────────────────────────────────────────
   SLIDE DATA
───────────────────────────────────────── */
const SLIDES = [
  {
    id: '1',
    step: '01 / 04',
    title: 'Your Restaurant,',
    titleSpan: 'Your Rules',
    desc: 'Join 50,000+ restaurant partners across India who manage everything from one powerful app.',
    highlights: ['Zero setup cost', 'Go live in 48 hours', 'Dedicated support'],
    bgColors: ['#FFF5F5', '#FFE5E5'],
    sceneType: 'identity',
  },
  {
    id: '2',
    step: '02 / 04',
    title: 'Real-Time',
    titleSpan: 'Order Alerts',
    desc: 'Receive instant notifications for new orders. Accept, prepare and track every order from one screen.',
    highlights: ['Instant push alerts', 'One-tap Accept / Reject', 'Order status tracking'],
    bgColors: ['#FFF8F0', '#FFE8CC'],
    sceneType: 'orders',
  },
  {
    id: '3',
    step: '03 / 04',
    title: 'Track Every',
    titleSpan: 'Rupee You Earn',
    desc: 'Get detailed earnings reports, daily payouts and complete transaction history right in the app.',
    highlights: ['Daily & weekly reports', 'Automatic bank transfers', 'GST invoicing support'],
    bgColors: ['#F0FFF6', '#C8F7DC'],
    sceneType: 'earnings',
  },
  {
    id: '4',
    step: '04 / 04',
    title: 'Everything',
    titleSpan: 'In One Place',
    desc: 'Menu management, live tracking, customer reviews, support — all built into one sleek partner app.',
    highlights: ['Menu editing anytime', 'Customer review replies', '24/7 partner support'],
    bgColors: ['#F0F4FF', '#D8E4FF'],
    sceneType: 'platform',
  },
];

/* ─────────────────────────────────────────
   ANIMATED FLOAT HOOK
───────────────────────────────────────── */
function useFloat(delay = 0, duration = 3000) {
  const translateY = useSharedValue(0);
  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-8, { duration, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      ),
    );
  }, []);
  return useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));
}

function usePulse() {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  useEffect(() => {
    scale.value = withRepeat(
      withSequence(withTiming(1.3, { duration: 750 }), withTiming(1, { duration: 750 })),
      -1,
    );
    opacity.value = withRepeat(
      withSequence(withTiming(0.5, { duration: 750 }), withTiming(1, { duration: 750 })),
      -1,
    );
  }, []);
  return useAnimatedStyle(() => ({ transform: [{ scale: scale.value }], opacity: opacity.value }));
}

function useSpin(duration = 12000, reverse = false) {
  const rotate = useSharedValue(0);
  useEffect(() => {
    rotate.value = withRepeat(
      withTiming(reverse ? -1 : 1, { duration, easing: Easing.linear }),
      -1,
    );
  }, []);
  return useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value * 360}deg` }],
  }));
}

/* ─────────────────────────────────────────
   SCENE 1 — Restaurant Identity
───────────────────────────────────────── */
function Scene1() {
  const floatMain = useFloat(0, 3000);
  const floatA    = useFloat(300, 3200);
  const floatB    = useFloat(600, 2900);
  const floatC    = useFloat(900, 3400);
  const spinFwd   = useSpin(12000);
  const spinRev   = useSpin(18000, true);

  return (
    <View style={s1.container}>
      {/* Spinning rings */}
      <Animated.View style={[s1.ring, s1.ring1, spinFwd]} />
      <Animated.View style={[s1.ring, s1.ring2, spinRev]} />

      {/* Central icon */}
      <Animated.View style={[s1.iconWrap, floatMain]}>
        <Ionicons name="restaurant" size={44} color={T.white} />
      </Animated.View>

      {/* Floating chips */}
      <Animated.View style={[s1.chip, s1.chipA, floatA]}>
        <Ionicons name="star" size={11} color={T.red} />
        <Text style={s1.chipText}>4.9 Rating</Text>
      </Animated.View>
      <Animated.View style={[s1.chip, s1.chipB, floatB]}>
        <Ionicons name="flame" size={11} color={T.red} />
        <Text style={s1.chipText}>Trending</Text>
      </Animated.View>
      <Animated.View style={[s1.chip, s1.chipC, floatC]}>
        <Ionicons name="shield-checkmark" size={11} color={T.red} />
        <Text style={s1.chipText}>Verified</Text>
      </Animated.View>
    </View>
  );
}
const s1 = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  ring: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 2,
    borderColor: 'rgba(215,25,32,0.15)',
  },
  ring1: { width: 140, height: 140 },
  ring2: { width: 182, height: 182 },
  iconWrap: {
    width: 90,
    height: 90,
    borderRadius: 28,
    backgroundColor: T.red,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: T.red,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.35,
    shadowRadius: 28,
    elevation: 12,
  },
  chip: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: T.white,
    borderRadius: 99,
    paddingHorizontal: 12,
    paddingVertical: 7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  chipA: { top: '18%', left: '4%' },
  chipB: { top: '18%', right: '4%' },
  chipC: { bottom: '22%', alignSelf: 'center' },
  chipText: { fontSize: 11.5, fontWeight: '700', color: T.ink },
});

/* ─────────────────────────────────────────
   SCENE 2 — Live Orders Card
───────────────────────────────────────── */
function Scene2() {
  const floatCard = useFloat(0, 3500);
  const pulse     = usePulse();

  return (
    <View style={s2.container}>
      <Animated.View style={[s2.card, floatCard]}>
        {/* Header */}
        <View style={s2.header}>
          <Animated.View style={[s2.dot, pulse]} />
          <Text style={s2.headerTitle}>Live Orders</Text>
          <View style={s2.badge}><Text style={s2.badgeText}>4 NEW</Text></View>
        </View>

        {/* Order row 1 */}
        <View style={s2.orderRow}>
          <View style={s2.avatar}><Text style={s2.avatarText}>AK</Text></View>
          <View style={s2.orderInfo}>
            <Text style={s2.orderName}>Arjun Kumar</Text>
            <Text style={s2.orderItem}>Butter Chicken × 2</Text>
          </View>
          <Text style={s2.orderAmt}>₹480</Text>
        </View>

        {/* Order row 2 (muted) */}
        <View style={[s2.orderRow, { opacity: 0.5 }]}>
          <View style={s2.avatar}><Text style={s2.avatarText}>PR</Text></View>
          <View style={s2.orderInfo}>
            <Text style={s2.orderName}>Priya Sharma</Text>
            <Text style={s2.orderItem}>Paneer Tikka × 1</Text>
          </View>
          <Text style={s2.orderAmt}>₹220</Text>
        </View>

        {/* Action buttons */}
        <View style={s2.btns}>
          <View style={s2.acceptBtn}><Text style={s2.acceptText}>✓ Accept</Text></View>
          <View style={s2.rejectBtn}><Text style={s2.rejectText}>✕</Text></View>
        </View>
      </Animated.View>

      {/* Notification toast */}
      <Animated.View style={[s2.notif, useFloat(1000, 2000)]}>
        <Ionicons name="notifications" size={13} color="#FFD700" />
        <Text style={s2.notifText}>New order just arrived!</Text>
      </Animated.View>
    </View>
  );
}
const s2 = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: {
    backgroundColor: T.white,
    borderRadius: 20,
    padding: 14,
    width: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.12,
    shadowRadius: 32,
    elevation: 10,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  dot: { width: 9, height: 9, borderRadius: 99, backgroundColor: T.red },
  headerTitle: { fontSize: 12, fontWeight: '700', color: T.ink, flex: 1 },
  badge: { backgroundColor: T.red, borderRadius: 99, paddingHorizontal: 7, paddingVertical: 3 },
  badgeText: { color: T.white, fontSize: 9, fontWeight: '800', letterSpacing: 0.4 },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: T.border,
  },
  avatar: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: T.redSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 10, fontWeight: '800', color: T.red },
  orderInfo: { flex: 1 },
  orderName: { fontSize: 11.5, fontWeight: '700', color: T.ink },
  orderItem: { fontSize: 10, color: T.muted, marginTop: 1 },
  orderAmt: { fontSize: 12, fontWeight: '800', color: T.ink },
  btns: { flexDirection: 'row', gap: 8, marginTop: 10 },
  acceptBtn: {
    flex: 1, backgroundColor: T.green,
    borderRadius: 10, alignItems: 'center', paddingVertical: 8,
  },
  acceptText: { color: T.white, fontSize: 11, fontWeight: '700' },
  rejectBtn: {
    width: 34, height: 34, borderRadius: 10,
    borderWidth: 1.5, borderColor: T.redMid,
    alignItems: 'center', justifyContent: 'center',
  },
  rejectText: { fontSize: 13, color: T.red, fontWeight: '700' },
  notif: {
    position: 'absolute',
    bottom: '14%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: T.ink,
    borderRadius: 99,
    paddingHorizontal: 16,
    paddingVertical: 9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  notifText: { color: T.white, fontSize: 11, fontWeight: '600' },
});

/* ─────────────────────────────────────────
   SCENE 3 — Earnings Dashboard
───────────────────────────────────────── */
const BAR_HEIGHTS = [40, 65, 50, 80, 55, 90, 70];

function Scene3() {
  const floatCard  = useFloat(0, 3500);
  const floatStatL = useFloat(200, 3000);
  const floatStatR = useFloat(400, 3200);

  return (
    <View style={s3.container}>
      <Animated.View style={[s3.card, floatCard]}>
        <Text style={s3.label}>Today's Earnings</Text>
        <Text style={s3.amount}>₹4,280</Text>
        <View style={s3.trend}>
          <Ionicons name="trending-up" size={12} color={T.green} />
          <Text style={s3.trendText}>+18% vs yesterday</Text>
        </View>
        <View style={s3.bars}>
          {BAR_HEIGHTS.map((h, i) => (
            <View
              key={i}
              style={[
                s3.bar,
                { height: `${h}%` as any },
                i === 5 && s3.barActive,
              ]}
            />
          ))}
        </View>
      </Animated.View>

      <Animated.View style={[s3.stat, s3.statLeft, floatStatL]}>
        <Ionicons name="receipt-outline" size={13} color={T.red} />
        <Text style={s3.statText}>24 orders</Text>
      </Animated.View>
      <Animated.View style={[s3.stat, s3.statRight, floatStatR]}>
        <Ionicons name="wallet-outline" size={13} color={T.red} />
        <Text style={s3.statText}>₹5,389 payout</Text>
      </Animated.View>
    </View>
  );
}
const s3 = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: {
    backgroundColor: T.white,
    borderRadius: 24,
    padding: 20,
    width: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: 32,
    elevation: 8,
  },
  label: { fontSize: 11, color: T.muted, fontWeight: '500' },
  amount: {
    fontSize: 30, fontWeight: '900', color: T.ink,
    marginVertical: 4, letterSpacing: -1,
  },
  trend: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#E6FAF0',
    borderRadius: 99, paddingHorizontal: 10, paddingVertical: 4,
    alignSelf: 'flex-start', marginBottom: 16,
  },
  trendText: { fontSize: 10.5, fontWeight: '700', color: T.green },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 60 },
  bar: { flex: 1, backgroundColor: T.redMid, borderRadius: 4 },
  barActive: { backgroundColor: T.red },
  stat: {
    position: 'absolute',
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: T.white,
    borderRadius: 99,
    paddingHorizontal: 14, paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  statLeft:  { bottom: '20%', left: '4%' },
  statRight: { bottom: '20%', right: '4%' },
  statText: { fontSize: 11, fontWeight: '700', color: T.ink },
});

/* ─────────────────────────────────────────
   SCENE 4 — Platform Features
───────────────────────────────────────── */
const PLATFORM_CHIPS: Array<{
  icon: string;
  label: string;
  pos: object;
}> = [
  { icon: 'book-outline',     label: 'Menu Manager',  pos: { top: '12%', alignSelf: 'center' } },
  { icon: 'location-outline', label: 'Live Tracking', pos: { left: '4%', top: '45%' } },
  { icon: 'headset-outline',  label: '24/7 Support',  pos: { right: '4%', top: '45%' } },
  { icon: 'star-outline',     label: 'Review System', pos: { bottom: '12%', alignSelf: 'center' } },
];

function Scene4() {
  const spinFwd = useSpin(12000);
  const spinRev = useSpin(18000, true);
  const spinR3  = useSpin(25000);
  const floatIcon = useFloat(0, 3000);

  return (
    <View style={s4.container}>
      {/* Rings */}
      <Animated.View style={[s4.ring, s4.ring1, spinFwd]} />
      <Animated.View style={[s4.ring, s4.ring2, spinRev]} />
      <Animated.View style={[s4.ring, s4.ring3, spinR3]} />

      {/* Central logo */}
      <Animated.View style={[s4.logo, floatIcon]}>
        <Ionicons name="restaurant" size={36} color={T.white} />
      </Animated.View>

      {/* Feature chips */}
      {PLATFORM_CHIPS.map((chip, i) => (
        <Animated.View key={i} style={[s4.chip, chip.pos, useFloat(i * 300, 3200 + i * 200)]}>
          <Ionicons name={chip.icon as any} size={12} color={T.red} />
          <Text style={s4.chipText}>{chip.label}</Text>
        </Animated.View>
      ))}
    </View>
  );
}
const s4 = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  ring: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: 'rgba(215,25,32,0.15)',
  },
  ring1: { width: 110, height: 110 },
  ring2: { width: 170, height: 170 },
  ring3: { width: 230, height: 230 },
  logo: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: T.red,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: T.red,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.35,
    shadowRadius: 28,
    elevation: 12,
  },
  chip: {
    position: 'absolute',
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: T.white,
    borderRadius: 99,
    paddingHorizontal: 12, paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  chipText: { fontSize: 11.5, fontWeight: '700', color: T.ink },
});

/* ─────────────────────────────────────────
   SLIDE ITEM
───────────────────────────────────────── */
function SlideItem({ item }: { item: typeof SLIDES[0] }) {
  const SceneMap: Record<string, React.FC> = {
    identity: Scene1,
    orders:   Scene2,
    earnings: Scene3,
    platform: Scene4,
  };
  const SceneComponent = SceneMap[item.sceneType];

  return (
    <View style={[slide.container, { width }]}>
      {/* Visual / scene area */}
      <View style={[slide.visual, { backgroundColor: item.bgColors[0] }]}>
        <View style={[slide.visOverlay, { backgroundColor: item.bgColors[1] }]} />
        <SceneComponent />
      </View>

      {/* Text area */}
      <View style={slide.textArea}>
        <View style={slide.stepPill}>
          <Text style={slide.stepPillText}>{item.step}</Text>
        </View>
        <Text style={slide.title}>
          {item.title}
          {'\n'}
          <Text style={slide.titleSpan}>{item.titleSpan}</Text>
        </Text>
        <Text style={slide.desc}>{item.desc}</Text>
        <View style={slide.highlights}>
          {item.highlights.map((h, i) => (
            <View key={i} style={slide.hlRow}>
              <Ionicons name="checkmark-circle" size={16} color={T.red} />
              <Text style={slide.hlText}>{h}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
const slide = StyleSheet.create({
  container: {
    height: '100%',
    flexDirection: 'column',
  },
  visual: {
    flex: 54,
    position: 'relative',
    overflow: 'hidden',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  visOverlay: {
    position: 'absolute',
    inset: 0,
    opacity: 0.5,
  },
  textArea: {
    flex: 46,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 8,
  },
  stepPill: {
    alignSelf: 'flex-start',
    backgroundColor: T.redSoft,
    borderRadius: 99,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 10,
  },
  stepPillText: { fontSize: 12, fontWeight: '700', color: T.red },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: T.ink,
    lineHeight: 32,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  titleSpan: {
    color: T.red,
  },
  desc: {
    fontSize: 13.5,
    color: T.muted,
    lineHeight: 20,
    fontWeight: '500',
    marginBottom: 14,
  },
  highlights: { gap: 7 },
  hlRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  hlText: { fontSize: 13, fontWeight: '600', color: T.ink2 },
});

/* ─────────────────────────────────────────
   MAIN ONBOARDING SCREEN
───────────────────────────────────────── */
export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const updateIndex = (e: any) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrentIndex(idx);
  };

  const goNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      const next = currentIndex + 1;
      flatListRef.current?.scrollToOffset({ offset: next * width });
      setCurrentIndex(next);
    }
  };

  const isLast = currentIndex === SLIDES.length - 1;

  return (
    <SafeAreaView style={root.container}>
      <StatusBar barStyle="dark-content" backgroundColor={T.white} />

      {/* ── Top Bar ── */}
      <View style={root.topBar}>
        <View style={root.logoPill}>
          <Ionicons name="restaurant" size={13} color={T.white} />
          <Text style={root.logoPillText}>Chatori Jeeb</Text>
        </View>
        <TouchableOpacity
          style={root.skipBtn}
          onPress={() => router.replace('/(auth)/login')}
        >
          <Text style={root.skipBtnText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* ── Slides ── */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={updateIndex}
        renderItem={({ item }) => <SlideItem item={item} />}
        style={{ flex: 1 }}
      />

      {/* ── Footer: Dots + Buttons ── */}
      <View style={root.footer}>
        {/* Dot indicators */}
        <View style={root.dots}>
          {SLIDES.map((_, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => {
                flatListRef.current?.scrollToOffset({ offset: i * width });
                setCurrentIndex(i);
              }}
              style={[root.dot, i === currentIndex && root.dotActive]}
            />
          ))}
        </View>

        {/* Action buttons */}
        {isLast ? (
          <Animated.View entering={FadeInUp.duration(400)} style={root.finalBtns}>
            <TouchableOpacity
              style={root.primaryBtn}
              onPress={() => router.replace('/(auth)/register')}
            >
              <Ionicons name="storefront-outline" size={18} color={T.white} />
              <Text style={root.primaryBtnText}>Register Your Restaurant</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={root.outlineBtn}
              onPress={() => router.replace('/(auth)/login')}
            >
              <Ionicons name="log-in-outline" size={18} color={T.red} />
              <Text style={root.outlineBtnText}>Already a Partner? Login</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <View style={root.rowBtns}>
            <TouchableOpacity
              style={root.skipRowBtn}
              onPress={() => router.replace('/(auth)/login')}
            >
              <Text style={root.skipRowBtnText}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity style={root.nextBtn} onPress={goNext}>
              <Text style={root.nextBtnText}>Next</Text>
              <Ionicons name="arrow-forward" size={16} color={T.white} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

/* ─────────────────────────────────────────
   ROOT STYLES
───────────────────────────────────────── */
const root = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: T.white,
  },

  /* Top bar */
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 6,
    zIndex: 5,
  },
  logoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: T.red,
    borderRadius: 99,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  logoPillText: {
    color: T.white,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  skipBtn: {
    backgroundColor: T.bg,
    borderWidth: 1.5,
    borderColor: T.border,
    borderRadius: 99,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  skipBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: T.muted,
  },

  /* Footer */
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 16,
    gap: 16,
    backgroundColor: T.white,
    borderTopWidth: 1,
    borderTopColor: T.border,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 99,
    backgroundColor: T.border,
  },
  dotActive: {
    width: 24,
    backgroundColor: T.red,
  },

  /* Row buttons (slides 1–3) */
  rowBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
  },
  skipRowBtn: {
    flex: 1,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: T.border,
  },
  skipRowBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: T.muted,
  },
  nextBtn: {
    flex: 2,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: T.red,
    borderRadius: 16,
    shadowColor: T.red,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  nextBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: T.white,
    letterSpacing: 0.2,
  },

  /* Final slide buttons */
  finalBtns: { gap: 12 },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 56,
    backgroundColor: T.red,
    borderRadius: 18,
    shadowColor: T.red,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.32,
    shadowRadius: 20,
    elevation: 10,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: T.white,
    letterSpacing: 0.2,
  },
  outlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: T.red,
    backgroundColor: 'transparent',
  },
  outlineBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: T.red,
  },
});
