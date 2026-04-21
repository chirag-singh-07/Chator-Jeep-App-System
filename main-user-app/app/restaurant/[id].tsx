import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions, 
  FlatList,
  StatusBar
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { 
  interpolate, 
  useAnimatedScrollHandler, 
  useAnimatedStyle, 
  useSharedValue,
  Extrapolate
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const HEADER_HEIGHT = 300;

const MENU_CATEGORIES = ["Recommended", "New Arrivals", "Best Sellers", "Pizza", "Sides"];

const FOOD_ITEMS = [
  {
    id: '1',
    name: 'Margherita Pepperoni',
    price: 349,
    description: 'A classic pizza with fresh mozzarella, sun-dried tomatoes, and spicy pepperoni.',
    image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400',
    isVeg: false,
    rating: 4.5,
  },
  {
    id: '2',
    name: 'Tandoori Paneer',
    price: 299,
    description: 'Soft cottage cheese chunks marinated in yogurt and Indian spices.',
    image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400',
    isVeg: true,
    rating: 4.8,
  },
  {
    id: '3',
    name: 'Garlic Breadsticks',
    price: 149,
    description: 'Oven-baked breadsticks brushed with garlic butter and herbs.',
    image: 'https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?w=400',
    isVeg: true,
    rating: 4.2,
  },
];

export default function RestaurantDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("Recommended");
  const [cartCount, setCartCount] = useState(0);
  
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const headerStyle = useAnimatedStyle(() => {
    return {
      height: interpolate(
        scrollY.value,
        [-100, 0, HEADER_HEIGHT],
        [HEADER_HEIGHT + 100, HEADER_HEIGHT, 100],
        Extrapolate.CLAMP
      ),
      opacity: interpolate(
        scrollY.value,
        [0, HEADER_HEIGHT - 100],
        [1, 0.5],
        Extrapolate.CLAMP
      )
    };
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Animated Header Image */}
      <Animated.Image 
        source={{ uri: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800' }}
        style={[styles.headerImage, headerStyle]}
      />

      {/* Floating Buttons */}
      <SafeAreaView style={styles.floatingBtns} edges={['top']}>
        <TouchableOpacity style={styles.iconCircle} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.light.text} />
        </TouchableOpacity>
        <View style={{flexDirection: 'row', gap: 10}}>
          <TouchableOpacity style={styles.iconCircle}>
            <Ionicons name="share-social-outline" size={22} color={Colors.light.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconCircle}>
            <Ionicons name="heart-outline" size={22} color={Colors.light.text} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <Animated.ScrollView 
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: HEADER_HEIGHT - 30 }}
      >
        <View style={styles.content}>
          <View style={styles.infoCard}>
            <View style={styles.resHeader}>
              <Text style={styles.resName}>The Pizza Hub</Text>
              <View style={styles.ratingBox}>
                <Ionicons name="star" size={12} color="#FFF" />
                <Text style={styles.ratingText}>4.8 (500+)</Text>
              </View>
            </View>
            <Text style={styles.resTags}>Pizza • Italian • Fast Food</Text>
            <View style={styles.divider} />
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={18} color={Colors.light.primary} />
                <Text style={styles.metaLabel}>30 min</Text>
              </View>
              <View style={styles.metaDivider} />
              <View style={styles.metaItem}>
                <Ionicons name="bicycle-outline" size={18} color="#48bb78" />
                <Text style={styles.metaLabel}>Free Delivery</Text>
              </View>
              <View style={styles.metaDivider} />
              <View style={styles.metaItem}>
                <Ionicons name="cash-outline" size={18} color="#ebaf00" />
                <Text style={styles.metaLabel}>₹200 for two</Text>
              </View>
            </View>
          </View>

          {/* Categories Horizontal */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.categoriesScroll}
          >
            {MENU_CATEGORIES.map((cat) => (
              <TouchableOpacity 
                key={cat} 
                onPress={() => setSelectedCategory(cat)}
                style={[styles.catBtn, selectedCategory === cat && styles.catBtnActive]}
              >
                <Text style={[styles.catText, selectedCategory === cat && styles.catTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Food List */}
          <View style={styles.foodList}>
            {FOOD_ITEMS.map((item) => (
              <View key={item.id} style={styles.foodCard}>
                <View style={styles.foodInfo}>
                  <Ionicons name="stop-circle" size={16} color={item.isVeg ? "#48bb78" : "#e53e3e"} />
                  <Text style={styles.foodName}>{item.name}</Text>
                  <Text style={styles.foodPrice}>₹{item.price}</Text>
                  <Text style={styles.foodDesc} numberOfLines={2}>{item.description}</Text>
                </View>
                <View style={styles.foodImageContainer}>
                  <Image source={{ uri: item.image }} style={styles.foodImage} />
                  <TouchableOpacity 
                    style={styles.addBtn}
                    onPress={() => setCartCount(c => c + 1)}
                  >
                    <Text style={styles.addBtnText}>ADD</Text>
                    <Ionicons name="add" size={14} color={Colors.light.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>
      </Animated.ScrollView>

      {/* Floating Cart Button */}
      {cartCount > 0 && (
        <TouchableOpacity 
          activeOpacity={0.9} 
          style={styles.floatingCart}
          onPress={() => router.push('/cart')}
        >
          <View style={styles.cartInfo}>
            <View style={styles.cartCountCircle}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
            <View style={{marginLeft: 12}}>
              <Text style={styles.viewCartText}>View Cart</Text>
              <Text style={styles.cartPriceText}>₹{cartCount * 349} plus taxes</Text>
            </View>
          </View>
          <Ionicons name="arrow-forward" size={20} color="#FFF" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerImage: {
    width: '100%',
    position: 'absolute',
    top: 0,
    zIndex: 0,
  },
  floatingBtns: {
    position: 'absolute',
    top: 0,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    minHeight: 1000,
    paddingTop: 25,
  },
  infoCard: {
    paddingHorizontal: 20,
  },
  resHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resName: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.light.text,
  },
  ratingBox: {
    backgroundColor: '#48bb78',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  resTags: {
    fontSize: 14,
    color: Colors.light.textMuted,
    marginTop: 5,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaItem: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
  },
  metaLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  metaDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#E5E7EB',
  },
  categoriesScroll: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  catBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 15,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  catBtnActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  catText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.textMuted,
  },
  catTextActive: {
    color: '#FFF',
  },
  foodList: {
    paddingHorizontal: 20,
  },
  foodCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  foodInfo: {
    flex: 1,
    marginRight: 20,
  },
  foodName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.light.text,
    marginTop: 4,
  },
  foodPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
    marginTop: 2,
  },
  foodDesc: {
    fontSize: 13,
    color: Colors.light.textMuted,
    lineHeight: 18,
    marginTop: 8,
  },
  foodImageContainer: {
    width: 120,
    height: 120,
  },
  foodImage: {
    width: 120,
    height: 120,
    borderRadius: 20,
  },
  addBtn: {
    position: 'absolute',
    bottom: -10,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: Colors.light.primary,
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
    borderWidth: 1,
    borderColor: Colors.light.primary + '30',
  },
  addBtnText: {
    color: Colors.light.primary,
    fontWeight: '900',
    fontSize: 14,
    marginRight: 4,
  },
  floatingCart: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: Colors.light.primary,
    height: 70,
    borderRadius: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: Colors.light.primary,
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
  },
  cartInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartCountCircle: {
      width: 34,
      height: 34,
      borderRadius: 10,
      backgroundColor: 'rgba(255,255,255,0.2)',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.3)',
  },
  cartBadgeText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  viewCartText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
  },
  cartPriceText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    fontWeight: '600',
  },
});
