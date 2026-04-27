import React, { useState, useEffect, useMemo } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions, 
  FlatList,
  StatusBar,
  ActivityIndicator
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
  withRepeat,
  withTiming,
  withSequence,
  Extrapolate
} from 'react-native-reanimated';
import { useMenuStore } from '@/store/useMenuStore';
import { useCartStore } from '@/store/useCartStore';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const HEADER_HEIGHT = 300;

const Skeleton = ({ width: w, height: h, borderRadius = 8, style = {} }: any) => {
  const opacity = useAnimatedStyle(() => ({
    opacity: withRepeat(
      withSequence(
        withTiming(0.4, { duration: 800 }),
        withTiming(0.7, { duration: 800 })
      ),
      -1,
      true
    ),
  }));

  return <Animated.View style={[style, { width: w, height: h, borderRadius, backgroundColor: '#E1E9EE' }, opacity]} />;
};

export default function RestaurantDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { selectedRestaurant: res, menu, isLoading, fetchRestaurantDetail } = useMenuStore();
  const { addItem, updateQuantity, items, totalAmount, totalItems } = useCartStore();
  
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  useEffect(() => {
    if (id) fetchRestaurantDetail(id as string);
  }, [id]);

  const categories = useMemo(() => {
    const cats = ["All", ...new Set(menu.map(item => item.category).filter(Boolean))];
    return cats;
  }, [menu]);

  const filteredMenu = useMemo(() => {
    if (selectedCategory === "All") return menu;
    return menu.filter(item => item.category === selectedCategory);
  }, [menu, selectedCategory]);

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

  const getQuantity = (itemId: string) => {
    return items.find(i => i.id === itemId)?.quantity || 0;
  };

  const handleAddItem = (item: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addItem(
      {
        id: item._id,
        name: item.name,
        price: item.price,
        restaurantId: id as string,
        image: item.imageUrl || item.images?.original
      },
      { id: id as string, name: res?.name || "Restaurant" }
    );
  };

  if (isLoading && !res) {
    return (
      <View style={styles.container}>
        <Skeleton width="100%" height={HEADER_HEIGHT} borderRadius={0} />
        <View style={{ padding: 25 }}>
          <Skeleton width="70%" height={30} />
          <Skeleton width="40%" height={20} style={{ marginTop: 10 }} />
          <Skeleton width="100%" height={80} style={{ marginTop: 30 }} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <Animated.Image 
        source={{ uri: res?.bannerUrls?.original || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800' }}
        style={[styles.headerImage, headerStyle]}
      />

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
              <Text style={styles.resName}>{res?.name}</Text>
              <View style={styles.ratingBox}>
                <Ionicons name="star" size={12} color="#FFF" />
                <Text style={styles.ratingText}>{res?.rating || "4.2"} (500+)</Text>
              </View>
            </View>
            <Text style={styles.resTags}>{res?.cuisines?.join(' • ') || "Fast Food • Indian"}</Text>
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
                <Text style={styles.metaLabel}>₹250 for two</Text>
              </View>
            </View>
          </View>

          {/* Categories Horizontal */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.categoriesScroll}
          >
            {categories.map((cat) => (
              <TouchableOpacity 
                key={cat} 
                onPress={() => {
                  setSelectedCategory(cat);
                  Haptics.selectionAsync();
                }}
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
            {filteredMenu.map((item) => (
              <View key={item._id} style={styles.foodCard}>
                <View style={styles.foodInfo}>
                  <Ionicons name="stop-circle" size={16} color={item.isVeg ? "#48bb78" : "#e53e3e"} />
                  <Text style={styles.foodName}>{item.name}</Text>
                  <Text style={styles.foodPrice}>₹{item.price}</Text>
                  <Text style={styles.foodDesc} numberOfLines={2}>{item.description || item.shortDescription}</Text>
                </View>
                <View style={styles.foodImageContainer}>
                  <Image source={{ uri: item.imageUrl || item.images?.original || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400' }} style={styles.foodImage} />
                  
                  {getQuantity(item._id) > 0 ? (
                    <View style={styles.quantityContainer}>
                      <TouchableOpacity onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); updateQuantity(item._id, -1); }}>
                         <Ionicons name="remove" size={18} color={Colors.light.primary} />
                      </TouchableOpacity>
                      <Text style={styles.quantityText}>{getQuantity(item._id)}</Text>
                      <TouchableOpacity onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); updateQuantity(item._id, 1); }}>
                         <Ionicons name="add" size={18} color={Colors.light.primary} />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity 
                      style={styles.addBtn}
                      onPress={() => handleAddItem(item)}
                    >
                      <Text style={styles.addBtnText}>ADD</Text>
                      <Ionicons name="add" size={14} color={Colors.light.primary} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>
      </Animated.ScrollView>

      {/* Floating Cart Button */}
      {totalItems > 0 && (
        <TouchableOpacity 
          activeOpacity={0.9} 
          style={styles.floatingCart}
          onPress={() => router.push('/cart')}
        >
          <View style={styles.cartInfo}>
            <View style={styles.cartCountCircle}>
              <Text style={styles.cartBadgeText}>{totalItems}</Text>
            </View>
            <View style={{marginLeft: 12}}>
              <Text style={styles.viewCartText}>View Cart</Text>
              <Text style={styles.cartPriceText}>₹{totalAmount} plus taxes</Text>
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
  quantityContainer: {
    position: 'absolute',
    bottom: -10,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
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
    gap: 15,
  },
  quantityText: {
    color: Colors.light.primary,
    fontWeight: '900',
    fontSize: 16,
  },
});
