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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Animated, {
  FadeInRight,
  FadeInDown,
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
  const { currentAddress, savedAddresses, setCurrentAddress } =
    useLocationStore();
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState("Nearby");

  useEffect(() => {
    loadData();
  }, [currentAddress]);

  const loadData = async () => {
    const lat = currentAddress?.coordinates?.latitude;
    const lng = currentAddress?.coordinates?.longitude;
    await fetchHomeData(lat, lng);
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

  const renderRestaurantCard = (res: any, index: number) => (
    <Animated.View key={res._id} entering={FadeInDown.delay(index * 100)}>
      <TouchableOpacity
        activeOpacity={0.95}
        style={styles.restaurantCard}
        onPress={() => router.push(`/restaurant/${res._id}`)}
      >
        <Image
          source={{
            uri:
              res.bannerUrls?.original ||
              "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800",
          }}
          style={styles.restaurantImage}
        />
        <View style={styles.offerBadge}>
          <Text style={styles.offerText}>50% OFF</Text>
        </View>
        <TouchableOpacity
          style={styles.heartBtn}
          onPress={() => Haptics.selectionAsync()}
        >
          <Ionicons name="heart-outline" size={18} color="#FFF" />
        </TouchableOpacity>

        <View style={styles.restaurantInfo}>
          <View style={styles.resRow}>
            <Text style={styles.resName}>{res.name}</Text>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>{res.rating || "4.2"}</Text>
              <Ionicons name="star" size={10} color="#FFF" />
            </View>
          </View>
          <Text style={styles.resTags}>
            {res.cuisines?.join(" • ") || "Fast Food • Pizza"}
          </Text>

          <View style={styles.resMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="bicycle" size={14} color="#48bb78" />
              <Text style={styles.metaText}>25-30 min</Text>
            </View>
            <View style={styles.metaDot} />
            <Text style={styles.metaText}>₹250 for two</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" />

      {/* Header with Location */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.locationContainer}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setShowLocationModal(true);
          }}
        >
          <View style={styles.locIndicator}>
            <Ionicons name="location" size={18} color={Colors.light.primary} />
          </View>
          <View style={{ marginLeft: 12 }}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
            >
              <Text style={styles.locationLabel}>
                {currentAddress?.type || "Select Location"}
              </Text>
              <Ionicons
                name="chevron-down"
                size={14}
                color={Colors.light.text}
              />
            </View>
            <Text style={styles.addressSubText} numberOfLines={1}>
              {currentAddress
                ? `${currentAddress.flat}, ${currentAddress.area}`
                : "Tap to set location..."}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.profileCircle}
          onPress={() => router.push("/(tabs)/profile")}
        >
          <Image
            source={{ uri: getAvatarUrl(user?.email || 'user') }}
            style={styles.profileImg}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.light.primary}
          />
        }
      >
        {/* Banner Carousel */}
        {banners.length > 0 && (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.bannerList}
            snapToInterval={width - 65}
            decelerationRate="fast"
          >
            {banners.map((banner, index) => (
              <Animated.View key={banner._id} entering={FadeInRight.delay(index * 100)}>
                <TouchableOpacity 
                  activeOpacity={0.9} 
                  style={styles.bannerCard}
                  onPress={() => handleBannerPress(banner)}
                >
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

        {/* Search Bar */}
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.searchSection}
          onPress={() => router.push("/(tabs)/search")}
        >
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={Colors.light.primary} />
            <Text style={styles.searchPlaceholder}>
              Search "Biryani" or "Pizza"...
            </Text>
            <View style={styles.divider} />
            <Ionicons
              name="mic-outline"
              size={20}
              color={Colors.light.textMuted}
            />
          </View>
        </TouchableOpacity>

        {/* Filter Chips */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.filterList}
        >
          {["Nearby", "Rating 4.0+", "Fast Delivery", "Pure Veg", "Offers"].map((filter) => (
            <TouchableOpacity 
              key={filter} 
              style={[styles.filterChip, activeFilter === filter && styles.activeFilterChip]}
              onPress={() => {
                setActiveFilter(filter);
                Haptics.selectionAsync();
              }}
            >
              <Text style={[styles.filterText, activeFilter === filter && styles.activeFilterText]}>{filter}</Text>
              {activeFilter === filter && <Ionicons name="close-circle" size={14} color="#1A1A1A" style={{ marginLeft: 4 }} />}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Trending Dishes Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Trending Dishes</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>See More</Text>
          </TouchableOpacity>
        </View>

        {isLoading && popularItems.length === 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: 20, marginBottom: 30 }}>
            {[1, 2, 3].map((i) => (
              <View key={i} style={{ marginRight: 20 }}>
                <Skeleton width={200} height={140} borderRadius={20} />
                <Skeleton width={120} height={15} style={{ marginTop: 10 }} />
                <Skeleton width={80} height={12} style={{ marginTop: 6 }} />
              </View>
            ))}
          </ScrollView>
        ) : (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={popularItems}
            contentContainerStyle={{ paddingLeft: 20, marginBottom: 30 }}
            renderItem={({ item, index }) => (
              <AnimatedTouchableOpacity
                entering={FadeInRight.delay(index * 100)}
                style={styles.foodCard}
                onPress={() => router.push(`/restaurant/${item.restaurantId?._id}`)}
              >
                <Image source={{ uri: item.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400" }} style={styles.foodImage} />
                <View style={styles.foodBadge}>
                   <Ionicons name="star" size={10} color="#1A1A1A" />
                   <Text style={styles.foodBadgeText}>BESTSELLER</Text>
                </View>
                <View style={styles.foodInfo}>
                  <Text style={styles.foodName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.foodRes} numberOfLines={1}>{item.restaurantId?.name || "Premium Kitchen"}</Text>
                  <View style={styles.foodFooter}>
                    <Text style={styles.foodPrice}>₹{item.price}</Text>
                    <TouchableOpacity style={styles.addBtn} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
                      <Ionicons name="add" size={20} color="#1A1A1A" />
                    </TouchableOpacity>
                  </View>
                </View>
              </AnimatedTouchableOpacity>
            )}
          />
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

        {/* Restaurants List */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular Near You</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
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
          ) : restaurants.length > 0 ? (
            restaurants.map((res, index) => renderRestaurantCard(res, index))
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={60} color="#DDD" />
              <Text style={styles.emptyText}>
                No restaurants found in this area
              </Text>
              <TouchableOpacity style={styles.retryBtn} onPress={onRefresh}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Location Selection Modal */}
      <Modal visible={showLocationModal} transparent animationType="none">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowLocationModal(false)}
        >
          <Animated.View
            entering={SlideInDown}
            exiting={SlideOutDown}
            style={styles.modalContent}
          >
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Choose a delivery location</Text>

            <ScrollView style={styles.addressList}>
              {savedAddresses.map((addr) => (
                <TouchableOpacity
                  key={addr.id}
                  style={[
                    styles.addrCard,
                    currentAddress?.id === addr.id && styles.activeAddr,
                  ]}
                  onPress={() => handleAddressSelect(addr)}
                >
                  <Ionicons
                    name={
                      addr.type === "Home"
                        ? "home"
                        : addr.type === "Work"
                          ? "briefcase"
                          : "location"
                    }
                    size={20}
                    color={
                      currentAddress?.id === addr.id
                        ? Colors.light.primary
                        : "#666"
                    }
                  />
                  <View style={{ flex: 1, marginLeft: 15 }}>
                    <Text style={styles.addrType}>{addr.type}</Text>
                    <Text style={styles.addrText}>
                      {addr.flat}, {addr.area}
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
                <Ionicons name="add" size={24} color={Colors.light.primary} />
                <Text style={styles.addNewText}>Add New Address</Text>
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
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
    backgroundColor: "#F8F9FA",
    borderRadius: 20,
    paddingHorizontal: 18,
    height: 60,
    borderWidth: 1.5,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
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
    width: 75,
    height: 75,
    borderRadius: 25,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
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
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#F9FAFB',
    marginRight: 10,
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
    borderRadius: 25,
    marginBottom: 25,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
  },
  restaurantImage: {
    width: "100%",
    height: 200,
  },
  offerBadge: {
    position: "absolute",
    top: 15,
    left: 15,
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  offerText: {
    color: "#1A1A1A",
    fontSize: 12,
    fontWeight: "900",
  },
  heartBtn: {
    position: "absolute",
    top: 15,
    right: 15,
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  restaurantInfo: {
    padding: 15,
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
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#48bb78",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  ratingText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  resTags: {
    fontSize: 13,
    color: Colors.light.textMuted,
    marginTop: 4,
    fontWeight: "500",
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
    maxHeight: height * 0.7,
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
    marginBottom: 25,
  },
  addressList: {
    marginBottom: 20,
  },
  addrCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  activeAddr: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primary + "05",
  },
  addrType: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.light.text,
  },
  addrText: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  addNewAddr: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    gap: 15,
  },
  addNewText: {
    color: Colors.light.primary,
    fontSize: 16,
    fontWeight: "900",
  },
});
