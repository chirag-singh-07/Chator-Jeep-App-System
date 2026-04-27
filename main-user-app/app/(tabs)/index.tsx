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
import * as Haptics from "expo-haptics";
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

const BANNERS = [
  {
    id: "1",
    title: "Flat 50% OFF",
    sub: "On your first order",
    color: "#FF4D4D",
    icon: "gift",
  },
  {
    id: "2",
    title: "Free Delivery",
    sub: "For orders above ₹199",
    color: "#2D75F0",
    icon: "bicycle",
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const { restaurants, categories, isLoading, fetchHomeData } = useMenuStore();
  const { currentAddress, savedAddresses, setCurrentAddress } =
    useLocationStore();
  const [refreshing, setRefreshing] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);

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
            source={{ uri: "https://i.pravatar.cc/100?u=me" }}
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

        {/* Feature Banners */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={width - 40}
          decelerationRate="fast"
          contentContainerStyle={styles.bannerList}
        >
          {BANNERS.map((banner, index) => (
            <Animated.View
              key={banner.id}
              entering={FadeInRight.delay(index * 200)}
              style={[styles.bannerCard, { backgroundColor: banner.color }]}
            >
              <View style={styles.bannerText}>
                <Text style={styles.bannerTitle}>{banner.title}</Text>
                <Text style={styles.bannerSub}>{banner.sub}</Text>
                <TouchableOpacity style={styles.bannerBtn}>
                  <Text style={[styles.bannerBtnText, { color: banner.color }]}>
                    GRAB NOW
                  </Text>
                </TouchableOpacity>
              </View>
              <Ionicons
                name={banner.icon as any}
                size={80}
                color="rgba(255,255,255,0.2)"
                style={styles.bannerIcon}
              />
            </Animated.View>
          ))}
        </ScrollView>

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
                  <div
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <Skeleton width="60%" height={20} />
                    <Skeleton width="15%" height={20} />
                  </div>
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
    backgroundColor: "#FFF5F5",
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
    marginBottom: 30,
  },
  bannerCard: {
    width: width - 80,
    height: 160,
    borderRadius: 25,
    marginRight: 15,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },
  bannerText: {
    flex: 1,
    zIndex: 2,
  },
  bannerTitle: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "900",
  },
  bannerSub: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
  },
  bannerBtn: {
    backgroundColor: "#FFF",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 15,
    alignSelf: "flex-start",
  },
  bannerBtnText: {
    fontSize: 11,
    fontWeight: "900",
  },
  bannerIcon: {
    position: "absolute",
    right: -10,
    bottom: -10,
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
    fontWeight: "700",
    color: Colors.light.text,
    marginTop: 8,
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
    color: "#FFF",
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
