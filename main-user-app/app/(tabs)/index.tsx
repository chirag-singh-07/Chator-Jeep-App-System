import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  Modal,
  Pressable,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Animated, {
  FadeInRight,
  FadeInDown,
  FadeInUp,
  FadeIn,
  FadeOut,
  SlideInUp,
  SlideInDown,
  SlideOutDown,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from "react-native-reanimated";
import { useMenuStore } from "@/store/useMenuStore";
import { useLocationStore } from "@/store/useLocationStore";
import { useAuthStore } from "@/store/useAuthStore";
import * as Haptics from "expo-haptics";
import { getAvatarUrl } from "@/lib/utils";
import api from "@/lib/api";
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const { width, height } = Dimensions.get("window");

const Skeleton = ({
  width: w,
  height: h,
  borderRadius = 8,
  style = {},
}: any) => {
  const opacity = useAnimatedStyle(() => ({
    opacity: withRepeat(
      withSequence(
        withTiming(0.4, { duration: 800 }),
        withTiming(0.7, { duration: 800 }),
      ),
      -1,
      true,
    ),
  }));

  return (
    <Animated.View
      style={[
        style,
        { width: w, height: h, borderRadius, backgroundColor: "#E1E9EE" },
        opacity,
      ]}
    />
  );
};

// Dynamic banners will be fetched from useMenuStore

export default function HomeScreen() {
  const router = useRouter();
  const { restaurants, categories, popularItems, banners, isLoading, fetchHomeData } = useMenuStore();
  const { currentAddress, savedAddresses, setCurrentAddress, fetchAddresses } =
    useLocationStore();
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({ veg: false, fast: false, rating: false, offer: false });
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState("Nearby");
  const [isVegOnly, setIsVegOnly] = useState(false);
  const [showPopupAd, setShowPopupAd] = useState(true);
  const [showWelcomeCoupon, setShowWelcomeCoupon] = useState(false);
  const [welcomeCoupon, setWelcomeCoupon] = useState<any>(null);

  const homeBanners = banners.filter((b: any) => b.placement === 'HOME_SCREEN' || !b.placement);
  const popupAd = banners.find((b: any) => b.placement === 'APP_OPEN_POPUP');

  useEffect(() => {
    const fetchWelcomeCoupon = async () => {
      try {
        if (!user) return;
        const res = await api.get('/coupons/welcome');
        if (res.data?.success && res.data?.data) {
          setWelcomeCoupon(res.data.data);
          setShowWelcomeCoupon(true);
        }
      } catch (err) {
        console.log("No welcome coupon available", err);
      }
    };
    fetchWelcomeCoupon();
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchAddresses();
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [currentAddress]);

  const loadData = async () => {
    const lat = currentAddress?.coordinates?.latitude;
    const lng = currentAddress?.coordinates?.longitude;
    const city = currentAddress?.city;
    await fetchHomeData(lat, lng, city);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleBannerPress = (banner: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (banner.linkType === 'RESTAURANT' && banner.linkId) {
      router.push(`/restaurant/${banner.linkId}`);
    } else if (banner.linkType === 'CATEGORY' && banner.linkId) {
      router.push({ pathname: '/(tabs)/search', params: { categoryId: banner.linkId } });
    }
  };

  const handleAddressSelect = (addr: any) => {
    setCurrentAddress(addr);
    setShowLocationModal(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const getRestaurantCover = (res: any) => {
    if (res?.coverImage) return res.coverImage;
    if (res?.bannerUrls?.original) return res.bannerUrls.original;
    if (res?.bannerUrls?.medium) return res.bannerUrls.medium;
    if (res?.bannerUrls?.large) return res.bannerUrls.large;
    if (res?.logoUrls?.original) return res.logoUrls.original;
    return "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80";
  };

  const renderDietaryBadge = (res: any) => {
    const rType = res?.restaurantType || '';
    const foodTypeLower = res?.foodType?.toLowerCase() || '';
    const isVeg = rType === 'pure-veg' || rType === 'veg' || res?.isVeg === true || foodTypeLower === 'veg' || foodTypeLower === 'pure veg';
    const isNonVeg = rType === 'non-veg' || foodTypeLower === 'non-veg';

    if (isVeg) {
      return (
        <View style={styles.badgeVegPill}>
          <View style={styles.vegSquare}>
            <View style={styles.vegDot} />
          </View>
          <Text style={styles.badgeVegText}>PURE VEG</Text>
        </View>
      );
    }

    if (isNonVeg) {
      return (
        <View style={styles.badgeNonVegPill}>
          <View style={styles.nonVegSquare}>
            <View style={styles.nonVegDot} />
          </View>
          <Text style={styles.badgeNonVegText}>NON-VEG</Text>
        </View>
      );
    }

    // Both (Veg & Non-Veg)
    return (
      <View style={styles.badgeBothPill}>
        <View style={styles.dualDotsRow}>
          <View style={styles.vegSquareSmall}>
            <View style={styles.vegDotSmall} />
          </View>
          <View style={styles.nonVegSquareSmall}>
            <View style={styles.nonVegDotSmall} />
          </View>
        </View>
        <Text style={styles.badgeBothText}>VEG & NON-VEG</Text>
      </View>
    );
  };

  const displayedRestaurants = React.useMemo(() => {
    return restaurants.filter((res: any) => {
      const rType = res?.restaurantType || '';
      const foodTypeLower = res?.foodType?.toLowerCase() || '';
      const isPureVeg = rType === 'pure-veg' || rType === 'veg' || res?.isVeg === true || foodTypeLower === 'veg' || foodTypeLower === 'pure veg';
      
      if (isVegOnly) {
        if (!isPureVeg) return false;
      }
      
      if (activeFilter === "Pure Veg") {
        if (!isPureVeg) return false;
      }
      
      if (activeFilter === "Rating 4.0+") {
        if ((res.rating || 4.2) < 4.0) return false;
      }

      return true;
    });
  }, [restaurants, isVegOnly, activeFilter]);

  const renderRestaurantCard = (res: any, index: number) => (
    <Animated.View key={res._id} entering={FadeInDown.delay(index * 80)}>
      <TouchableOpacity
        activeOpacity={0.95}
        style={styles.restaurantCard}
        onPress={() => router.push(`/restaurant/${res._id}`)}
      >
        <View style={styles.cardImageContainer}>
          <Image
            source={{ uri: getRestaurantCover(res) }}
            style={styles.restaurantImage}
          />
          <View style={styles.imageOverlayGradient} />
          
          <View style={styles.topBadgeRow}>
            <View style={styles.offerBadge}>
              <Ionicons name="pricetag" size={11} color="#1A1A1A" />
              <Text style={styles.offerText}>50% OFF</Text>
            </View>
            <TouchableOpacity
              style={styles.heartBtn}
              onPress={() => Haptics.selectionAsync()}
            >
              <Ionicons name="heart-outline" size={18} color="#FFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.floatingMetaBadge}>
            <Ionicons name="time-outline" size={12} color="#1A1A1A" />
            <Text style={styles.floatingMetaText}>{res.estimatedDeliveryTimeMins ? `${res.estimatedDeliveryTimeMins} min` : "25-30 min"}</Text>
          </View>
        </View>

        <View style={styles.restaurantInfo}>
          <View style={styles.resRow}>
            <Text style={styles.resName} numberOfLines={1}>{res.name}</Text>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>{res.rating || "4.2"}</Text>
              <Ionicons name="star" size={11} color="#FFF" />
            </View>
          </View>

          <View style={styles.dietaryAndCuisineRow}>
            {renderDietaryBadge(res)}
            <Text style={styles.resTags} numberOfLines={1}>
              {res.cuisines?.join(" • ") || "North Indian • Fast Food"}
            </Text>
          </View>

          <View style={styles.resMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="bicycle" size={14} color="#22C55E" />
              <Text style={styles.metaText}>{res.deliveryFee > 0 ? `₹${res.deliveryFee} Delivery` : "Free Delivery"}</Text>
            </View>
            <View style={styles.metaDot} />
            <Text style={styles.metaText}>{res.freeDeliveryThreshold ? `Free delivery over ₹${res.freeDeliveryThreshold}` : "₹250 for two"}</Text>
            <View style={styles.metaDot} />
            <Text style={styles.metaText}>{res.address?.city || "Nearby"}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" />

      {/* Popup Ad Modal */}
      {popupAd && (
        <Modal
          visible={showPopupAd}
          transparent
          animationType="fade"
          onRequestClose={() => setShowPopupAd(false)}
        >
          <View style={styles.popupOverlay}>
            <View style={styles.popupContent}>
              <TouchableOpacity
                style={styles.popupCloseBtn}
                onPress={() => setShowPopupAd(false)}
              >
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.9}
                style={{ width: '100%', height: '100%' }}
                onPress={() => {
                  setShowPopupAd(false);
                  handleBannerPress(popupAd);
                }}
              >
                <Image
                  source={{ uri: popupAd.imageUrl }}
                  style={styles.popupImage}
                />
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Welcome Coupon Modal */}
      {welcomeCoupon && (
        <Modal
          visible={showWelcomeCoupon}
          transparent
          animationType="slide"
          onRequestClose={() => setShowWelcomeCoupon(false)}
        >
          <View style={styles.popupOverlay}>
            <View style={[styles.popupContent, { backgroundColor: '#fff', padding: 24, alignItems: 'center' }]}>
              <TouchableOpacity
                style={[styles.popupCloseBtn, { right: 10, top: 10, backgroundColor: 'rgba(0,0,0,0.1)' }]}
                onPress={() => setShowWelcomeCoupon(false)}
              >
                <Ionicons name="close" size={20} color="#000" />
              </TouchableOpacity>
              
              <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: Colors.light.primary + '20', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Ionicons name="gift" size={32} color={Colors.light.primary} />
              </View>
              
              <Text style={{ fontSize: 24, fontWeight: '900', color: Colors.light.primary, marginBottom: 8 }}>WELCOME BONUS!</Text>
              <Text style={{ fontSize: 16, textAlign: 'center', color: Colors.light.textMuted, marginBottom: 20 }}>
                Get {welcomeCoupon.discountType === 'PERCENTAGE' ? `${welcomeCoupon.discountValue}%` : `₹${welcomeCoupon.discountValue}`} OFF on your first order of ₹{welcomeCoupon.minOrderAmount} or more!
              </Text>
              
              <View style={{ backgroundColor: '#f4f4f5', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, borderWidth: 2, borderColor: Colors.light.primary, borderStyle: 'dashed', marginBottom: 24 }}>
                <Text style={{ fontSize: 20, fontWeight: '900', letterSpacing: 2, color: '#1A1A1A' }}>{welcomeCoupon.code}</Text>
              </View>

              <TouchableOpacity
                style={{ backgroundColor: Colors.light.primary, width: '100%', paddingVertical: 16, borderRadius: 16, alignItems: 'center' }}
                onPress={() => {
                  setShowWelcomeCoupon(false);
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                }}
              >
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>CLAIM OFFER NOW</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Filter Modal */}
      <Modal visible={showFilterModal} transparent animationType="slide" onRequestClose={() => setShowFilterModal(false)}>
        <View style={styles.sheetModal}>
          <View style={styles.sheetContent}>
            <View style={styles.sheetBar} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Filters</Text>
              <TouchableOpacity style={styles.sheetCloseBtn} onPress={() => setShowFilterModal(false)}>
                <Ionicons name="close" size={20} color="#1A1A1A" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.filterOptionRow}>
              <Text style={styles.filterOptionText}>Pure vegetarian</Text>
              <TouchableOpacity onPress={() => setFilters({...filters, veg: !filters.veg})}>
                <Ionicons name={filters.veg ? "checkbox" : "square-outline"} size={24} color={filters.veg ? "#ffd400" : "#ccc"} />
              </TouchableOpacity>
            </View>
            <View style={styles.filterOptionRow}>
              <Text style={styles.filterOptionText}>Delivery under 30 minutes</Text>
              <TouchableOpacity onPress={() => setFilters({...filters, fast: !filters.fast})}>
                <Ionicons name={filters.fast ? "checkbox" : "square-outline"} size={24} color={filters.fast ? "#ffd400" : "#ccc"} />
              </TouchableOpacity>
            </View>
            <View style={styles.filterOptionRow}>
              <Text style={styles.filterOptionText}>Rating 4.5+</Text>
              <TouchableOpacity onPress={() => setFilters({...filters, rating: !filters.rating})}>
                <Ionicons name={filters.rating ? "checkbox" : "square-outline"} size={24} color={filters.rating ? "#ffd400" : "#ccc"} />
              </TouchableOpacity>
            </View>
            <View style={styles.filterOptionRow}>
              <Text style={styles.filterOptionText}>Offers available</Text>
              <TouchableOpacity onPress={() => setFilters({...filters, offer: !filters.offer})}>
                <Ionicons name={filters.offer ? "checkbox" : "square-outline"} size={24} color={filters.offer ? "#ffd400" : "#ccc"} />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity style={styles.filterApplyBtn} onPress={() => setShowFilterModal(false)}>
              <Text style={styles.filterApplyBtnText}>Apply filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 130 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.light.primary} />
        }
      >
        {/* New Hero Header */}
        <View style={styles.hero}>
          <View style={styles.topbar}>
            <TouchableOpacity style={styles.location} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push('/address-picker'); }}>
              <View style={styles.iconBox}>
                <Ionicons name="location" size={16} color="#000" />
              </View>
              <View>
                <Text style={styles.locationSmall}>Delivering to</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.locationStrong}>{currentAddress ? (currentAddress.city || currentAddress.area) : "Select Location"}</Text>
                  <Ionicons name="chevron-down" size={12} color="#171717" style={{ marginLeft: 4 }} />
                </View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/notifications')}>
              <Ionicons name="notifications-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.heroCopy}>
            <View style={styles.brand}>
              <View style={styles.brandTag}>
                <Ionicons name="flash" size={12} color="#171717" />
                <Text style={styles.brandTagText}>FAST FOOD DELIVERY</Text>
              </View>
              <Text style={styles.brandTitle}>Chatori Jeeb</Text>
              <Text style={styles.brandSubtitle}>From your favourite local kitchens to your doorstep, hot & fresh.</Text>
            </View>
            <View style={styles.heroVisual}>
              <Text style={{ fontSize: 40 }}>🍜</Text>
            </View>
          </View>

          <View style={styles.heroSearchContainer}>
            <Ionicons name="search" size={18} color="#171717" />
            <TextInput 
              style={styles.heroSearchInput}
              placeholder="Search dishes, restaurants or cuisine"
              placeholderTextColor="#777"
              onPressIn={() => router.push("/(tabs)/search")}
            />
            <TouchableOpacity style={styles.heroFilterBtn} onPress={() => setShowFilterModal(true)}>
              <Ionicons name="options" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Banner Carousel */}
        {homeBanners.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.bannerList}
            snapToInterval={width - 65}
            decelerationRate="fast"
          >
            {homeBanners.map((banner: any, index: number) => (
              <Animated.View key={banner._id} entering={FadeInRight.delay(index * 100)}>
                <TouchableOpacity activeOpacity={0.9} style={styles.bannerCard} onPress={() => handleBannerPress(banner)}>
                  <Image source={{ uri: banner.imageUrl }} style={styles.bannerImage} />
                  <View style={styles.bannerOverlay}>
                    <Text style={styles.bannerTitle}>{banner.title}</Text>
                    {banner.subtitle && <Text style={styles.bannerSub}>{banner.subtitle}</Text>}
                    <View style={styles.bannerBtn}>
                      <Text style={styles.bannerBtnText}>ORDER NOW</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </ScrollView>
        )}

        {/* Categories Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>What's on your mind?</Text>
        </View>

        {isLoading && categories.length === 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ paddingLeft: 20, marginBottom: 30 }}
          >
            {[1, 2, 3, 4, 5].map((i) => (
              <View key={i} style={{ marginRight: 25, alignItems: "center" }}>
                <Skeleton width={75} height={75} borderRadius={25} />
                <Skeleton
                  width={50}
                  height={12}
                  borderRadius={4}
                  style={{ marginTop: 8 }}
                />
              </View>
            ))}
          </ScrollView>
        ) : (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={categories}
            contentContainerStyle={{ paddingLeft: 20, marginBottom: 30 }}
            renderItem={({ item, index }) => (
              <AnimatedTouchableOpacity
                entering={FadeInDown.delay(index * 100)}
                style={styles.categoryItem}
                onPress={() =>
                  router.push({
                    pathname: "/(tabs)/search",
                    params: { categoryId: item._id },
                  })
                }
              >
                <View style={styles.catImageCircle}>
                  {item.image ? (
                    <Image source={{ uri: item.image }} style={styles.catImg} />
                  ) : (
                    <Ionicons
                      name="restaurant-outline"
                      size={30}
                      color={Colors.light.primary}
                    />
                  )}
                </View>
                <Text style={styles.categoryName}>{item.name}</Text>
              </AnimatedTouchableOpacity>
            )}
          />
        )}

        {/* Bulk & Party Order Premium Card */}
        <Animated.View entering={FadeInUp.delay(400)} style={styles.bulkOrderSectionContainer}>
          <TouchableOpacity
            style={styles.bulkOrderCard}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push('/bulk-order');
            }}
            activeOpacity={0.92}
          >
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=800&q=80' }}
              style={styles.bulkOrderBgImage}
            />
            <View style={styles.bulkOrderOverlay} />

            <View style={styles.bulkOrderContent}>
              <View style={styles.bulkOrderBadge}>
                <Ionicons name="sparkles" size={12} color="#FDBE15" />
                <Text style={styles.bulkOrderBadgeText}>PARTY & BULK CATERING</Text>
              </View>

              <Text style={styles.bulkOrderTitle}>
                Planning a Party or Office Gathering? 🎊
              </Text>
              <Text style={styles.bulkOrderSubtitle}>
                Get special discounted prices on bulk meals from top-rated restaurants with custom packaging.
              </Text>

              <View style={styles.bulkFeatureRow}>
                <View style={styles.bulkFeatureItem}>
                  <Ionicons name="pricetags" size={12} color="#FDBE15" />
                  <Text style={styles.bulkFeatureText}>Special Rates</Text>
                </View>
                <View style={styles.bulkFeatureDot} />
                <View style={styles.bulkFeatureItem}>
                  <Ionicons name="time" size={12} color="#FDBE15" />
                  <Text style={styles.bulkFeatureText}>24hr Booking</Text>
                </View>
                <View style={styles.bulkFeatureDot} />
                <View style={styles.bulkFeatureItem}>
                  <Ionicons name="shield-checkmark" size={12} color="#22C55E" />
                  <Text style={styles.bulkFeatureText}>Guaranteed Delivery</Text>
                </View>
              </View>

              <View style={styles.bulkOrderBtn}>
                <Text style={styles.bulkOrderBtnText}>BOOK BULK ORDER</Text>
                <Ionicons name="arrow-forward" size={14} color="#1A1A1A" />
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Featured Selection (Horizontal) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured for You</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 20, marginBottom: 30 }}>
          {restaurants.slice(0, 5).map((res, index) => (
            <TouchableOpacity
              key={res._id + '_feat'}
              style={styles.featuredCard}
              onPress={() => router.push(`/restaurant/${res._id}`)}
            >
              <Image source={{ uri: res.bannerUrls?.original || "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800" }} style={styles.featuredImg} />
              <View style={styles.featuredOverlay}>
                <View style={styles.featuredBadge}>
                  <Text style={styles.featuredBadgeText}>TOP RATED</Text>
                </View>
                <Text style={styles.featuredName}>{res.name}</Text>
                <Text style={styles.featuredMeta}>{res.rating || '4.5'} • 20 mins</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Restaurants List & Veg Filter */}
        <View style={styles.resSectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Popular Near You</Text>
            <Text style={styles.sectionSubTitle}>
              {displayedRestaurants.length} restaurants serving in your area
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.vegToggleBtn, (isVegOnly || activeFilter === "Pure Veg") && styles.vegToggleBtnActive]}
            onPress={() => {
              const nextState = !isVegOnly;
              setIsVegOnly(nextState);
              if (nextState) {
                setActiveFilter("Pure Veg");
              } else if (activeFilter === "Pure Veg") {
                setActiveFilter("Nearby");
              }
              Haptics.selectionAsync();
            }}
          >
            <View style={styles.vegSquareSmall}>
              <View style={styles.vegDotSmall} />
            </View>
            <Text style={[styles.vegToggleText, (isVegOnly || activeFilter === "Pure Veg") && styles.vegToggleTextActive]}>
              Veg Only
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ paddingHorizontal: 20 }}>
          {isLoading && restaurants.length === 0 ? (
            [1, 2, 3].map((i) => (
              <View key={i} style={[styles.restaurantCard, { padding: 0 }]}>
                <Skeleton width="100%" height={200} borderRadius={0} />
                <View style={{ padding: 15 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <Skeleton width="60%" height={20} />
                    <Skeleton width="15%" height={20} />
                  </View>
                  <Skeleton width="40%" height={15} style={{ marginTop: 8 }} />
                  <Skeleton width="100%" height={1} style={{ marginTop: 15 }} />
                  <Skeleton width="50%" height={15} style={{ marginTop: 15 }} />
                </View>
              </View>
            ))
          ) : displayedRestaurants.length > 0 ? (
            displayedRestaurants.map((res, index) => renderRestaurantCard(res, index))
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="leaf-outline" size={60} color={Colors.light.primary} />
              <Text style={styles.emptyText}>
                {isVegOnly || activeFilter === "Pure Veg"
                  ? "No Pure Veg restaurants found nearby"
                  : "No restaurants found in this area"}
              </Text>
              {(isVegOnly || activeFilter === "Pure Veg") ? (
                <TouchableOpacity
                  style={styles.retryBtn}
                  onPress={() => {
                    setIsVegOnly(false);
                    setActiveFilter("Nearby");
                  }}
                >
                  <Text style={styles.retryText}>Show All Restaurants</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.retryBtn} onPress={onRefresh}>
                  <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Location Selection Modal */}
      <Modal visible={showLocationModal} transparent animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowLocationModal(false)}
        >
          <Pressable style={{width: '100%'}}>
            <Animated.View
              entering={SlideInDown.springify().damping(25)}
              exiting={SlideOutDown}
              style={styles.modalContent}
            >
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>Select a Location</Text>

              <ScrollView style={styles.addressList} showsVerticalScrollIndicator={false}>
                {/* Search Bar (Fake, goes to address-picker) */}
                <TouchableOpacity 
                  style={styles.fakeSearchBar}
                  onPress={() => {
                    setShowLocationModal(false);
                    router.push("/address-picker");
                  }}
                >
                  <Ionicons name="search" size={20} color={Colors.light.primary} />
                  <Text style={styles.fakeSearchText}>Search for area, street name...</Text>
                </TouchableOpacity>

                {/* Current Location Option */}
                <TouchableOpacity 
                  style={styles.currentLocModalBtn}
                  onPress={() => {
                    setShowLocationModal(false);
                    router.push("/address-picker");
                  }}
                >
                  <Ionicons name="locate" size={22} color={Colors.light.primary} />
                  <View style={{ marginLeft: 12 }}>
                    <Text style={styles.currentLocModalTitle}>Use current location</Text>
                    <Text style={styles.currentLocModalSub}>Using GPS</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#999" style={{ marginLeft: 'auto' }} />
                </TouchableOpacity>

                <View style={styles.modalDivider} />

                {savedAddresses.length > 0 && <Text style={styles.savedAddrLabel}>SAVED ADDRESSES</Text>}
                {savedAddresses.map((addr) => (
                  <TouchableOpacity
                    key={addr.id}
                    style={[
                      styles.addrCard,
                      currentAddress?.id === addr.id && styles.activeAddr,
                    ]}
                    onPress={() => handleAddressSelect(addr)}
                  >
                    <View style={[styles.addrIconCircle, currentAddress?.id === addr.id && { backgroundColor: Colors.light.primary }]}>
                      <Ionicons
                        name={
                          addr.type === "Home" || addr.label === "Home"
                            ? "home"
                            : addr.type === "Work" || addr.label === "Work"
                              ? "briefcase"
                              : "location"
                        }
                        size={18}
                        color={
                          currentAddress?.id === addr.id
                            ? "#FFF"
                            : Colors.light.primary
                        }
                      />
                    </View>
                    <View style={{ flex: 1, marginLeft: 15 }}>
                      <Text style={[styles.addrType, currentAddress?.id === addr.id && {color: Colors.light.primary}]}>
                        {addr.label || addr.type || "Address"}
                      </Text>
                      <Text style={styles.addrText} numberOfLines={2}>
                        {addr.flat ? addr.flat + ', ' : ''}{addr.area}
                      </Text>
                    </View>
                    {currentAddress?.id === addr.id && (
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color={Colors.light.primary}
                      />
                    )}
                  </TouchableOpacity>
                ))}

                <TouchableOpacity
                  style={styles.addNewAddr}
                  onPress={() => {
                    setShowLocationModal(false);
                    router.push("/address-picker");
                  }}
                >
                  <Ionicons name="add" size={20} color={Colors.light.primary} />
                  <Text style={styles.addNewText}>Add New Address</Text>
                </TouchableOpacity>
              </ScrollView>
            </Animated.View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: '#ffd400',
    paddingHorizontal: 18,
    paddingTop: 18 + (Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0),
    paddingBottom: 45,
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
    position: 'relative',
    marginBottom: 45,
  },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    paddingRight: 15,
  },
  iconBox: {
    width: 43,
    height: 43,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtn: {
    width: 43,
    height: 43,
    borderRadius: 15,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationSmall: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6d5d00',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  locationStrong: {
    fontSize: 14,
    fontWeight: '700',
    color: '#171717',
  },
  heroCopy: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
  },
  brand: {
    flex: 1,
    marginRight: 12,
  },
  brandTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.76)',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 99,
    alignSelf: 'flex-start',
    gap: 6,
  },
  brandTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#171717',
  },
  brandTitle: {
    fontSize: 33,
    fontWeight: '700',
    color: '#171717',
    marginTop: 9,
  },
  brandSubtitle: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
    color: '#514800',
    marginTop: 8,
  },
  heroVisual: {
    width: 82,
    height: 82,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroSearchContainer: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: -29,
    height: 58,
    backgroundColor: '#fff',
    borderRadius: 19,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 13 },
    shadowOpacity: 0.11,
    shadowRadius: 30,
    elevation: 8,
  },
  heroSearchInput: {
    flex: 1,
    fontSize: 13,
    color: '#171717',
    marginLeft: 11,
    marginRight: 11,
  },
  heroFilterBtn: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheetContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 20,
    maxHeight: '82%',
  },
  sheetBar: {
    width: 43,
    height: 4,
    borderRadius: 9,
    backgroundColor: '#ddd',
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#171717',
  },
  sheetCloseBtn: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: '#f4f4f4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterOptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterOptionText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#171717',
  },
  filterApplyBtn: {
    width: '100%',
    height: 47,
    backgroundColor: '#111',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  filterApplyBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#fff',
  },

  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    zIndex: 10,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerIconBtn: {
    width: 45,
    height: 45,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
  },
  notifDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  welcomeSection: {
    paddingHorizontal: 25,
    paddingVertical: 10,
    marginBottom: 5,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "900",
    color: Colors.light.text,
  },
  welcomeSubText: {
    fontSize: 14,
    color: Colors.light.textMuted,
    fontWeight: "600",
    marginTop: 2,
  },
  bulkOrderSectionContainer: {
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  bulkOrderCard: {
    position: 'relative',
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#1E232A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(253, 190, 21, 0.25)',
  },
  bulkOrderBgImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  bulkOrderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
  },
  bulkOrderContent: {
    padding: 20,
    zIndex: 2,
  },
  bulkOrderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(253, 190, 21, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(253, 190, 21, 0.4)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 5,
    marginBottom: 10,
  },
  bulkOrderBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FDBE15',
    letterSpacing: 0.8,
  },
  bulkOrderTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 25,
    letterSpacing: -0.3,
  },
  bulkOrderSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 6,
    lineHeight: 18,
  },
  bulkFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 6,
  },
  bulkFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bulkFeatureText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  bulkFeatureDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  bulkOrderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 12,
    marginTop: 16,
    gap: 6,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  bulkOrderBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#1A1A1A',
    letterSpacing: 0.6,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  locIndicator: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "#FFFDF5",
    alignItems: "center",
    justifyContent: "center",
  },
  locationLabel: {
    fontSize: 16,
    fontWeight: "900",
    color: Colors.light.text,
  },
  addressText: {
    fontSize: 12,
    color: Colors.light.textMuted,
    fontWeight: "500",
    width: width * 0.5,
  },
  profileCircle: {
    width: 45,
    height: 45,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#F3F4F6",
    overflow: "hidden",
  },
  profileImg: {
    width: "100%",
    height: "100%",
  },
  searchSection: {
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingHorizontal: 20,
    height: 64,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.02)",
  },
  searchPlaceholder: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: Colors.light.textMuted,
    fontWeight: "600",
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 12,
  },
  bannerList: {
    paddingLeft: 20,
    paddingRight: 10,
    marginBottom: 20,
    marginTop: 5,
  },
  bannerCard: {
    width: width - 80,
    height: 160,
    borderRadius: 25,
    marginRight: 15,
    backgroundColor: '#F3F4F6',
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
    padding: 20,
    justifyContent: 'center',
  },
  bannerTitle: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "900",
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  bannerSub: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
  },
  bannerBtn: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 15,
    alignSelf: "flex-start",
  },
  bannerBtnText: {
    fontSize: 11,
    fontWeight: "900",
    color: '#1A1A1A',
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 25,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: Colors.light.text,
    letterSpacing: -0.5,
  },
  viewAllText: {
    fontSize: 13,
    color: Colors.light.primary,
    fontWeight: "800",
  },
  categoryItem: {
    alignItems: "center",
    marginRight: 25,
  },
  catImageCircle: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  categoryName: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.light.text,
    marginTop: 8,
  },
  filterList: {
    paddingLeft: 20,
    paddingRight: 10,
    marginBottom: 20,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    marginRight: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  activeFilterChip: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#666',
  },
  activeFilterText: {
    color: '#1A1A1A',
  },
  foodCard: {
    width: 200,
    backgroundColor: '#FFF',
    borderRadius: 25,
    marginRight: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  foodImage: {
    width: '100%',
    height: 120,
  },
  foodBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: Colors.light.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  foodBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#1A1A1A',
  },
  foodInfo: {
    padding: 12,
  },
  foodName: {
    fontSize: 15,
    fontWeight: '900',
    color: Colors.light.text,
  },
  foodRes: {
    fontSize: 11,
    color: Colors.light.textMuted,
    marginTop: 2,
    fontWeight: '600',
  },
  foodFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  foodPrice: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.light.text,
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restaurantCard: {
    backgroundColor: "#FFF",
    borderRadius: 28,
    marginBottom: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 6,
  },
  cardImageContainer: {
    position: 'relative',
    width: '100%',
    height: 210,
    backgroundColor: '#F3F4F6',
  },
  restaurantImage: {
    width: "100%",
    height: "100%",
    resizeMode: 'cover',
  },
  imageOverlayGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  topBadgeRow: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 2,
  },
  offerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  offerText: {
    color: "#1A1A1A",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  heartBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  floatingMetaBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(255,255,255,0.94)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  floatingMetaText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  restaurantInfo: {
    padding: 16,
  },
  resRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  resName: {
    fontSize: 18,
    fontWeight: "900",
    color: Colors.light.text,
    flex: 1,
    marginRight: 10,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#22C55E",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  ratingText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "900",
  },
  dietaryAndCuisineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  resTags: {
    flex: 1,
    fontSize: 12,
    color: Colors.light.textMuted,
    fontWeight: "600",
  },
  badgeVegPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F4EA',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  badgeVegText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#137333',
    letterSpacing: 0.3,
  },
  badgeNonVegPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FCE8E6',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  badgeNonVegText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#C5221F',
    letterSpacing: 0.3,
  },
  badgeBothPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF7E0',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  badgeBothText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#B06000',
    letterSpacing: 0.3,
  },
  vegSquare: {
    width: 12,
    height: 12,
    borderWidth: 1.2,
    borderColor: '#137333',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 3,
  },
  vegDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#137333',
  },
  nonVegSquare: {
    width: 12,
    height: 12,
    borderWidth: 1.2,
    borderColor: '#C5221F',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 3,
  },
  nonVegDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#C5221F',
  },
  dualDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  vegSquareSmall: {
    width: 11,
    height: 11,
    borderWidth: 1.2,
    borderColor: '#137333',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 2,
  },
  vegDotSmall: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#137333',
  },
  nonVegSquareSmall: {
    width: 11,
    height: 11,
    borderWidth: 1.2,
    borderColor: '#C5221F',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 2,
  },
  nonVegDotSmall: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#C5221F',
  },
  resSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 25,
    marginBottom: 15,
  },
  sectionSubTitle: {
    fontSize: 12,
    color: Colors.light.textMuted,
    fontWeight: '600',
    marginTop: 2,
  },
  vegToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#EFEFEF',
  },
  vegToggleBtnActive: {
    backgroundColor: '#E6F4EA',
    borderColor: '#137333',
  },
  vegToggleText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#666',
    marginLeft: 4,
  },
  vegToggleTextActive: {
    color: '#137333',
  },
  resMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F9FAFB",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  metaText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#666",
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#CCC",
    marginHorizontal: 10,
  },
  catImg: {
    width: "100%",
    height: "100%",
    borderRadius: 25,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.light.textMuted,
    fontWeight: "600",
    marginTop: 15,
  },
  retryBtn: {
    marginTop: 20,
    paddingHorizontal: 30,
    paddingVertical: 12,
    backgroundColor: Colors.light.primary,
    borderRadius: 15,
  },
  retryText: {
    color: "#FFF",
    fontWeight: "900",
  },
  addressSubText: {
    fontSize: 12,
    color: Colors.light.textMuted,
    fontWeight: "500",
    width: width * 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
    paddingBottom: 40,
    maxHeight: '85%',
  },
  modalHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: Colors.light.text,
    marginBottom: 20,
  },
  addressList: {
    marginBottom: 10,
  },
  fakeSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 15,
    borderRadius: 16,
    marginBottom: 20,
  },
  fakeSearchText: {
    marginLeft: 10,
    fontSize: 15,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  currentLocModalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  currentLocModalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.light.primary,
  },
  currentLocModalSub: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 20,
  },
  savedAddrLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 1,
    marginBottom: 15,
  },
  addrCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  activeAddr: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primary + "05",
  },
  addrIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.primary + "15",
    alignItems: 'center',
    justifyContent: 'center',
  },
  addrType: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.light.text,
  },
  addrText: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
    lineHeight: 18,
  },
  addNewAddr: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 10,
    marginTop: 5,
  },
  addNewText: {
    color: Colors.light.primary,
    fontSize: 16,
    fontWeight: "800",
  },
  quickGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 25,
    marginBottom: 25,
    marginTop: 10,
  },
  quickItem: {
    alignItems: 'center',
    gap: 8,
  },
  quickIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  quickLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#444',
  },
  featuredCard: {
    width: 280,
    height: 160,
    borderRadius: 25,
    marginRight: 15,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  featuredImg: {
    width: '100%',
    height: '100%',
  },
  featuredOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 20,
    justifyContent: 'flex-end',
  },
  featuredBadge: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  featuredBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#1A1A1A',
  },
  featuredName: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '900',
  },
  featuredMeta: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  popupOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupContent: {
    width: width * 0.85,
    height: width * 1.1,
    backgroundColor: 'transparent',
    borderRadius: 24,
    alignItems: 'center',
    position: 'relative',
  },
  popupImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 24,
  },
  popupCloseBtn: {
    position: 'absolute',
    top: -45,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
});
