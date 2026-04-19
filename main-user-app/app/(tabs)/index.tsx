import React from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const CATEGORIES = [
  { id: "1", name: "Pizza", icon: "pizza-outline" },
  { id: "2", name: "Burger", icon: "fast-food-outline" },
  { id: "3", name: "Sushi", icon: "fish-outline" },
  { id: "4", name: "Pasta", icon: "restaurant-outline" },
  { id: "5", name: "Desserts", icon: "ice-cream-outline" },
  { id: "6", name: "Drinks", icon: "beer-outline" },
];

const RESTAURANTS = [
  {
    id: "1",
    name: "The Pizza Hub",
    rating: 4.8,
    time: "20-30 min",
    offers: "50% OFF",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400",
    tags: ["Pizza", "Italian"],
  },
  {
    id: "2",
    name: "Burger King Royale",
    rating: 4.5,
    time: "15-25 min",
    offers: "Free Delivery",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
    tags: ["Burger", "American"],
  },
  {
    id: "3",
    name: "Sushi ZenMaster",
    rating: 4.9,
    time: "30-45 min",
    offers: "Buy 1 Get 1",
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400",
    tags: ["Sushi", "Japanese"],
  },
];

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.locationLabel}>Delivering to</Text>
            <TouchableOpacity style={styles.locationContainer}>
              <Ionicons
                name="location"
                size={18}
                color={Colors.light.primary}
              />
              <Text style={styles.locationText}>Home • Noida Sector 62</Text>
              <Ionicons
                name="chevron-down"
                size={16}
                color={Colors.light.text}
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.notificationBtn}>
            <Ionicons
              name="notifications-outline"
              size={24}
              color={Colors.light.text}
            />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={Colors.light.textMuted} />
            <TextInput
              placeholder="Search for food, restaurants..."
              style={styles.searchInput}
            />
            <TouchableOpacity>
              <Ionicons
                name="options-outline"
                size={20}
                color={Colors.light.primary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Banner */}
        <View style={styles.bannerContainer}>
          <View style={styles.banner}>
            <View style={styles.bannerTextContainer}>
              <Text style={styles.bannerTitle}>Get 50% Cashback</Text>
              <Text style={styles.bannerSub}>On your first 3 orders</Text>
              <TouchableOpacity style={styles.bannerBtn}>
                <Text style={styles.bannerBtnText}>Order Now</Text>
              </TouchableOpacity>
            </View>
            <Ionicons
              name="fast-food-outline"
              size={80}
              color="rgba(255,255,255,0.3)"
              style={styles.bannerIcon}
            />
          </View>
        </View>

        {/* Categories */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          contentContainerStyle={{ paddingLeft: 20, marginBottom: 25 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.categoryItem}>
              <View style={styles.categoryIconCircle}>
                <Ionicons
                  name={item.icon as any}
                  size={24}
                  color={Colors.light.primary}
                />
              </View>
              <Text style={styles.categoryName}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />

        {/* Popular Restaurants */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular Restaurants</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        <View style={{ paddingHorizontal: 20 }}>
          {RESTAURANTS.map((res) => (
            <TouchableOpacity key={res.id} style={styles.restaurantCard}>
              <Image
                source={{ uri: res.image }}
                style={styles.restaurantImage}
              />
              <View style={styles.offerBadge}>
                <Text style={styles.offerText}>{res.offers}</Text>
              </View>
              <View style={styles.restaurantInfo}>
                <View style={styles.resRow}>
                  <Text style={styles.resName}>{res.name}</Text>
                  <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={12} color="#FFD700" />
                    <Text style={styles.ratingText}>{res.rating}</Text>
                  </View>
                </View>
                <Text style={styles.resTags}>{res.tags.join(" • ")}</Text>
                <View style={styles.resRow}>
                  <View style={styles.resMeta}>
                    <Ionicons
                      name="time-outline"
                      size={14}
                      color={Colors.light.textMuted}
                    />
                    <Text style={styles.resMetaText}>{res.time}</Text>
                  </View>
                  <View style={[styles.resMeta, { marginLeft: 15 }]}>
                    <Ionicons
                      name="bicycle-outline"
                      size={16}
                      color={Colors.light.textMuted}
                    />
                    <Text style={styles.resMetaText}>Free</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  locationLabel: {
    fontSize: 12,
    color: Colors.light.textMuted,
    fontWeight: "500",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  locationText: {
    fontSize: 14,
    fontWeight: "700",
    marginHorizontal: 4,
    color: Colors.light.text,
  },
  notificationBtn: {
    height: 45,
    width: 45,
    borderRadius: 15,
    backgroundColor: "#F8F8F8",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  notificationDot: {
    position: "absolute",
    top: 12,
    right: 14,
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.primary,
    borderWidth: 2,
    borderColor: "#F8F8F8",
  },
  searchSection: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
    borderRadius: 18,
    paddingHorizontal: 15,
    height: 55,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: Colors.light.text,
  },
  bannerContainer: {
    padding: 20,
  },
  banner: {
    backgroundColor: Colors.light.primary,
    borderRadius: 25,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    overflow: "hidden",
  },
  bannerTextContainer: {
    flex: 1,
    zIndex: 2,
  },
  bannerTitle: {
    color: Colors.light.white,
    fontSize: 22,
    fontWeight: "bold",
  },
  bannerSub: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    marginTop: 4,
  },
  bannerBtn: {
    backgroundColor: Colors.light.white,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 15,
    alignSelf: "start",
  },
  bannerBtnText: {
    color: Colors.light.primary,
    fontSize: 12,
    fontWeight: "bold",
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
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.light.text,
  },
  viewAllText: {
    fontSize: 13,
    color: Colors.light.primary,
    fontWeight: "bold",
  },
  categoryItem: {
    alignItems: "center",
    marginRight: 20,
  },
  categoryIconCircle: {
    height: 60,
    width: 60,
    borderRadius: 20,
    backgroundColor: "#FFF5F5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.light.text,
  },
  restaurantCard: {
    backgroundColor: Colors.light.white,
    borderRadius: 25,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 5,
    overflow: "hidden",
  },
  restaurantImage: {
    width: "100%",
    height: 180,
  },
  offerBadge: {
    position: "absolute",
    top: 15,
    left: 15,
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  offerText: {
    color: Colors.light.white,
    fontSize: 11,
    fontWeight: "bold",
  },
  restaurantInfo: {
    padding: 15,
  },
  resRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  resName: {
    fontSize: 17,
    fontWeight: "bold",
    color: Colors.light.text,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 4,
    color: "#B45309",
  },
  resTags: {
    fontSize: 13,
    color: Colors.light.textMuted,
    marginBottom: 10,
  },
  resMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  resMetaText: {
    fontSize: 12,
    color: Colors.light.textMuted,
    marginLeft: 4,
    fontWeight: "500",
  },
});
