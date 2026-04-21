import React from "react";
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
  StatusBar
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Animated, { 
  FadeInRight, 
  FadeInDown, 
  FadeIn,
  SlideInRight
} from "react-native-reanimated";

const { width } = Dimensions.get("window");

const CATEGORIES = [
  { id: "1", name: "Pizza", icon: "pizza" },
  { id: "2", name: "Burgers", icon: "fast-food" },
  { id: "3", name: "Biryani", icon: "restaurant" },
  { id: "4", name: "Chicken", icon: "egg" },
  { id: "5", name: "Chinese", icon: "flame" },
  { id: "6", name: "Desserts", icon: "ice-cream" },
];

const BANNERS = [
  { id: "1", title: "Flat 50% OFF", sub: "On your first order", color: "#FF4D4D", icon: "gift" },
  { id: "2", title: "Free Delivery", sub: "For orders above ₹199", color: "#2D75F0", icon: "bicycle" },
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
      name: "Biryani Blues",
      rating: 4.6,
      time: "35-40 min",
      offers: "BOGO",
      image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400",
      tags: ["Biryani", "North Indian"],
    },
];

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header with Location */}
      <View style={styles.header}>
        <View style={styles.locationContainer}>
          <View style={styles.locIndicator}>
             <Ionicons name="location" size={18} color={Colors.light.primary} />
          </View>
          <View style={{marginLeft: 12}}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
              <Text style={styles.locationLabel}>Home</Text>
              <Ionicons name="chevron-down" size={14} color={Colors.light.text} />
            </View>
            <Text style={styles.addressText} numberOfLines={1}>Sector 62, Noida, Uttar Pradesh...</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.profileCircle} onPress={() => router.push('/(tabs)/profile')}>
           <Image source={{ uri: 'https://i.pravatar.cc/100?u=me' }} style={styles.profileImg} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Search Bar Landing */}
        <TouchableOpacity 
          activeOpacity={0.9} 
          style={styles.searchSection}
          onPress={() => router.push('/(tabs)/search')}
        >
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={Colors.light.primary} />
            <Text style={styles.searchPlaceholder}>Search "Biryani" or "Pizza"...</Text>
            <View style={styles.divider} />
            <Ionicons name="mic-outline" size={20} color={Colors.light.textMuted} />
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
                     <Text style={[styles.bannerBtnText, { color: banner.color }]}>GRAB NOW</Text>
                  </TouchableOpacity>
               </View>
               <Ionicons name={banner.icon as any} size={80} color="rgba(255,255,255,0.2)" style={styles.bannerIcon} />
            </Animated.View>
          ))}
        </ScrollView>

        {/* Categories Grid */}
        <View style={styles.sectionHeader}>
           <Text style={styles.sectionTitle}>What's on your mind?</Text>
        </View>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          contentContainerStyle={{ paddingLeft: 20, marginBottom: 30 }}
          renderItem={({ item, index }) => (
            <Animated.TouchableOpacity 
              entering={FadeInDown.delay(index * 100)}
              style={styles.categoryItem}
            >
              <View style={styles.catImageCircle}>
                 <Ionicons name={item.icon as any} size={30} color={Colors.light.primary} />
              </View>
              <Text style={styles.categoryName}>{item.name}</Text>
            </Animated.TouchableOpacity>
          )}
        />

        {/* Popular Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular Near You</Text>
          <TouchableOpacity onPress={() => router.push('/listing')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={{ paddingHorizontal: 20 }}>
          {RESTAURANTS.map((res, index) => (
            <Animated.View 
              key={res.id} 
              entering={FadeInDown.delay(index * 150)}
            >
              <TouchableOpacity 
                activeOpacity={0.95} 
                style={styles.restaurantCard}
                onPress={() => router.push(`/restaurant/${res.id}`)}
              >
                <Image
                  source={{ uri: res.image }}
                  style={styles.restaurantImage}
                />
                <View style={styles.offerBadge}>
                  <Text style={styles.offerText}>{res.offers}</Text>
                </View>
                <TouchableOpacity style={styles.heartBtn}>
                   <Ionicons name="heart-outline" size={18} color="#FFF" />
                </TouchableOpacity>

                <View style={styles.restaurantInfo}>
                  <View style={styles.resRow}>
                    <Text style={styles.resName}>{res.name}</Text>
                    <View style={styles.ratingBadge}>
                      <Text style={styles.ratingText}>{res.rating}</Text>
                      <Ionicons name="star" size={10} color="#FFF" />
                    </View>
                  </View>
                  <Text style={styles.resTags}>{res.tags.join(" • ")}</Text>
                  
                  <View style={styles.resMeta}>
                     <View style={styles.metaItem}>
                        <Ionicons name="bicycle" size={14} color="#48bb78" />
                        <Text style={styles.metaText}>{res.time}</Text>
                     </View>
                     <View style={styles.metaDot} />
                     <Text style={styles.metaText}>₹200 for two</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locIndicator: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#FFF5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationLabel: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.light.text,
  },
  addressText: {
    fontSize: 12,
    color: Colors.light.textMuted,
    fontWeight: '500',
    width: width * 0.5,
  },
  profileCircle: {
    width: 45,
    height: 45,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#F3F4F6',
    overflow: 'hidden',
  },
  profileImg: {
    width: '100%',
    height: '100%',
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
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  searchPlaceholder: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: Colors.light.textMuted,
    fontWeight: '600',
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: '#E5E7EB',
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
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  bannerText: {
    flex: 1,
    zIndex: 2,
  },
  bannerTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '900',
  },
  bannerSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  bannerBtn: {
    backgroundColor: '#FFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 15,
    alignSelf: 'flex-start',
  },
  bannerBtnText: {
    fontSize: 11,
    fontWeight: '900',
  },
  bannerIcon: {
    position: 'absolute',
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
      backgroundColor: '#F9FAFB',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: '#F3F4F6',
  },
  categoryName: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.light.text,
    marginTop: 8,
  },
  restaurantCard: {
    backgroundColor: '#FFF',
    borderRadius: 25,
    marginBottom: 25,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
  },
  restaurantImage: {
    width: '100%',
    height: 200,
  },
  offerBadge: {
    position: 'absolute',
    top: 15,
    left: 15,
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  offerText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '900',
  },
  heartBtn: {
     position: 'absolute',
     top: 15,
     right: 15,
     width: 36,
     height: 36,
     borderRadius: 12,
     backgroundColor: 'rgba(0,0,0,0.3)',
     alignItems: 'center',
     justifyContent: 'center',
  },
  restaurantInfo: {
    padding: 15,
  },
  resRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resName: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.light.text,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#48bb78',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  ratingText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  resTags: {
    fontSize: 13,
    color: Colors.light.textMuted,
    marginTop: 4,
    fontWeight: '500',
  },
  resMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F9FAFB',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666',
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#CCC',
    marginHorizontal: 10,
  },
});
