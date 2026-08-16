import React, { useState, useEffect, useMemo } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions, 
  StatusBar,
  Platform,
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
  Extrapolate,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { useMenuStore } from '@/store/useMenuStore';
import { useCartStore } from '@/store/useCartStore';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const HEADER_HEIGHT = 280;

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
  const { selectedRestaurant: res, menu, reviews, isLoading, fetchRestaurantDetail, fetchReviews } = useMenuStore();
  const { addItem, updateQuantity, items, totalAmount, totalItems } = useCartStore();
  
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isFavorite, setIsFavorite] = useState(false);

  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  useEffect(() => {
    if (id) {
      console.log("[RestaurantDetailScreen] Fetching restaurant details for ID:", id);
      fetchRestaurantDetail(id as string).then(() => {
        const currentRes = useMenuStore.getState().selectedRestaurant;
        const currentMenu = useMenuStore.getState().menu;
        console.log("[RestaurantDetailScreen] Details fetched successfully:", {
          name: currentRes?.name,
          menuItemsCount: currentMenu?.length
        });
      });
      fetchReviews(id as string);
    }
  }, [id]);

  const categories = useMemo(() => {
    const cats = ["All", ...new Set(menu.map(item => item.category).filter(Boolean))];
    return cats;
  }, [menu]);

  const filteredMenu = useMemo(() => {
    if (selectedCategory === "All") return menu;
    return menu.filter(item => item.category === selectedCategory);
  }, [menu, selectedCategory]);

  const coverImageUri = useMemo(() => {
    return (
      res?.coverImage ||
      res?.bannerUrls?.original ||
      res?.bannerUrls?.large ||
      res?.bannerUrls?.medium ||
      res?.logoUrls?.original ||
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80"
    );
  }, [res]);

  const logoUri = useMemo(() => {
    return (
      res?.logoUrls?.original ||
      res?.logoUrls?.medium ||
      res?.logoUrl ||
      res?.imageUrl ||
      coverImageUri
    );
  }, [res, coverImageUri]);

  const headerStyle = useAnimatedStyle(() => {
    return {
      height: interpolate(
        scrollY.value,
        [-100, 0, HEADER_HEIGHT],
        [HEADER_HEIGHT + 100, HEADER_HEIGHT, 110],
        Extrapolate.CLAMP
      ),
      opacity: interpolate(
        scrollY.value,
        [0, HEADER_HEIGHT - 120],
        [1, 0.4],
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

  const renderDietaryBadge = () => {
    const foodTypeLower = res?.foodType?.toLowerCase() || '';
    const isVeg = res?.isVeg === true || foodTypeLower === 'veg' || foodTypeLower === 'pure veg';
    const isNonVeg = foodTypeLower === 'non-veg';

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
      
      {/* Cover Image Header */}
      <Animated.Image 
        source={{ uri: coverImageUri }}
        style={[styles.headerImage, headerStyle]}
      />

      {/* Header Gradient Overlay */}
      <View style={styles.headerOverlay} />

      {/* Floating Header Controls */}
      <SafeAreaView style={styles.floatingBtns} edges={['top']}>
        <TouchableOpacity style={styles.iconCircle} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#1A1A1A" />
        </TouchableOpacity>
        <View style={{flexDirection: 'row', gap: 10}}>
          <TouchableOpacity 
            style={styles.iconCircle}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <Ionicons name="share-social-outline" size={20} color="#1A1A1A" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconCircle}
            onPress={() => {
              setIsFavorite(!isFavorite);
              Haptics.selectionAsync();
            }}
          >
            <Ionicons 
              name={isFavorite ? "heart" : "heart-outline"} 
              size={20} 
              color={isFavorite ? "#EF4444" : "#1A1A1A"} 
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Scrollable Main Content */}
      <Animated.ScrollView 
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: HEADER_HEIGHT - 35, paddingBottom: totalItems > 0 ? 110 : 40 }}
      >
        <View style={styles.contentCard}>
          {/* Floating Logo Badge */}
          <View style={styles.logoBadgeContainer}>
            <Image source={{ uri: logoUri }} style={styles.logoImage} />
          </View>

          {/* Restaurant Main Info */}
          <View style={styles.infoCard}>
            <View style={styles.resTitleRow}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.resName}>{res?.name || "Loading..."}</Text>
                <View style={styles.locationRow}>
                  <Ionicons name="location-outline" size={14} color={Colors.light.textMuted} />
                  <Text style={styles.locationText} numberOfLines={1}>
                    {res?.address?.line1 ? `${res.address.line1}, ${res.address.city || ''}` : res?.address?.city || 'Downtown Area'}
                  </Text>
                </View>
              </View>

              <View style={styles.ratingBox}>
                <View style={styles.ratingRow}>
                  <Text style={styles.ratingText}>{res?.rating || "4.5"}</Text>
                  <Ionicons name="star" size={13} color="#FFF" />
                </View>
                <Text style={styles.ratingSubText}>500+ ratings</Text>
              </View>
            </View>

            {/* Cuisines & Dietary Row */}
            <View style={styles.tagsAndDietRow}>
              {renderDietaryBadge()}
              <Text style={styles.resTags} numberOfLines={1}>
                {res?.cuisines?.join(' • ') || "North Indian • Fast Food • Biryani"}
              </Text>
            </View>

            <View style={styles.divider} />

            {/* Restaurant Delivery & Price Meta Bar */}
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <View style={[styles.metaIconBg, { backgroundColor: '#FFF3E0' }]}>
                  <Ionicons name="time" size={16} color="#EF6C00" />
                </View>
                <View>
                  <Text style={styles.metaVal}>30-35 min</Text>
                  <Text style={styles.metaSub}>Delivery Time</Text>
                </View>
              </View>

              <View style={styles.metaDividerVertical} />

              <View style={styles.metaItem}>
                <View style={[styles.metaIconBg, { backgroundColor: '#E6F4EA' }]}>
                  <Ionicons name="bicycle" size={16} color="#137333" />
                </View>
                <View>
                  <Text style={styles.metaVal}>Free</Text>
                  <Text style={styles.metaSub}>Delivery Fee</Text>
                </View>
              </View>

              <View style={styles.metaDividerVertical} />

              <View style={styles.metaItem}>
                <View style={[styles.metaIconBg, { backgroundColor: '#E8F0FE' }]}>
                  <Ionicons name="wallet" size={16} color="#1A73E8" />
                </View>
                <View>
                  <Text style={styles.metaVal}>₹250</Text>
                  <Text style={styles.metaSub}>For Two</Text>
                </View>
              </View>
            </View>

            {/* Active Coupon Banner Strip */}
            <View style={styles.offerBannerStrip}>
              <Ionicons name="pricetag" size={16} color="#1A1A1A" />
              <Text style={styles.offerBannerText} numberOfLines={1}>
                50% OFF UPTO ₹100 • Use code <Text style={{fontWeight: '900'}}>CHATORI50</Text>
              </Text>
            </View>
          </View>

          {/* Category Tabs Scroll */}
          <View style={{ marginTop: 20 }}>
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
          </View>

          {/* Menu Food Items List */}
          <View style={styles.foodListContainer}>
            <View style={styles.menuSectionHeader}>
              <Text style={styles.menuSectionTitle}>
                {selectedCategory === "All" ? "Full Menu" : selectedCategory}
              </Text>
              <Text style={styles.menuSectionCount}>{filteredMenu.length} ITEMS</Text>
            </View>

            {filteredMenu.map((item, idx) => {
              const qty = getQuantity(item._id);
              const originalPrice = item.originalPrice || item.mrp || (item.price * 1.25);
              const hasDiscount = originalPrice > item.price;
              
              return (
                <Animated.View key={item._id} entering={FadeInDown.delay(idx * 60)}>
                  <View style={styles.foodCard}>
                    <View style={styles.foodInfo}>
                      <View style={styles.itemVegRow}>
                        <View style={item.isVeg ? styles.vegSquare : styles.nonVegSquare}>
                          <View style={item.isVeg ? styles.vegDot : styles.nonVegDot} />
                        </View>
                        {item.bestseller && (
                          <View style={styles.bestsellerBadge}>
                            <Ionicons name="star" size={9} color="#B06000" />
                            <Text style={styles.bestsellerText}>BESTSELLER</Text>
                          </View>
                        )}
                      </View>

                      <Text style={styles.foodName}>{item.name}</Text>
                      
                      <View style={styles.priceRow}>
                        <Text style={styles.foodPrice}>₹{item.price}</Text>
                        {hasDiscount && (
                          <Text style={styles.foodOriginalPrice}>₹{Math.round(originalPrice)}</Text>
                        )}
                        {hasDiscount && (
                          <View style={styles.offBadgePill}>
                            <Text style={styles.offBadgeText}>
                              {Math.round(((originalPrice - item.price) / originalPrice) * 100)}% OFF
                            </Text>
                          </View>
                        )}
                      </View>

                      <Text style={styles.foodDesc} numberOfLines={2}>
                        {item.description || item.shortDescription || "Prepared fresh with rich spices and authentic ingredients."}
                      </Text>
                    </View>

                    <View style={styles.foodImageContainer}>
                      <Image 
                        source={{ 
                          uri: item.imageUrl || item.images?.original || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400' 
                        }} 
                        style={styles.foodImage} 
                      />
                      
                      <View style={styles.addBtnWrapper}>
                        {qty > 0 ? (
                          <View style={styles.quantityContainer}>
                            <TouchableOpacity 
                              style={styles.qtyBtn}
                              onPress={() => { 
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); 
                                updateQuantity(item._id, -1); 
                              }}
                            >
                              <Ionicons name="remove" size={16} color="#1A1A1A" />
                            </TouchableOpacity>
                            <Text style={styles.quantityText}>{qty}</Text>
                            <TouchableOpacity 
                              style={styles.qtyBtn}
                              onPress={() => { 
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); 
                                updateQuantity(item._id, 1); 
                              }}
                            >
                              <Ionicons name="add" size={16} color="#1A1A1A" />
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <TouchableOpacity 
                            activeOpacity={0.8}
                            style={styles.addBtn}
                            onPress={() => handleAddItem(item)}
                          >
                            <Text style={styles.addBtnText}>ADD</Text>
                            <Ionicons name="add" size={14} color="#1A1A1A" />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </View>
                </Animated.View>
              );
            })}
          </View>

          {/* Customer Reviews Section */}
          <View style={styles.reviewSection}>
            <View style={styles.reviewsSectionHeader}>
              <View>
                <Text style={styles.reviewsTitle}>Customer Ratings & Reviews</Text>
                <Text style={styles.reviewsSubTitle}>Verified orders from local foodies</Text>
              </View>
              {reviews.length > 0 && (
                <TouchableOpacity>
                  <Text style={styles.seeAllText}>See all ({reviews.length})</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {reviews.length > 0 ? (
              reviews.slice(0, 3).map((item, i) => (
                <View key={i} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewUser}>
                      <View style={styles.userIconCircle}>
                        <Ionicons name="person" size={14} color="#666" />
                      </View>
                      <Text style={styles.reviewUserName}>{item.userId?.name || "Verified Customer"}</Text>
                    </View>
                    <View style={styles.reviewRating}>
                      {[1,2,3,4,5].map(s => (
                        <Ionicons key={s} name="star" size={12} color={s <= item.rating ? "#FFB800" : "#E5E7EB"} />
                      ))}
                    </View>
                  </View>
                  <Text style={styles.reviewComment}>{item.comment}</Text>
                </View>
              ))
            ) : (
              <View style={styles.noReviews}>
                <Ionicons name="chatbox-ellipses-outline" size={36} color={Colors.light.primary} />
                <Text style={styles.noReviewsText}>No reviews yet. Be the first to order and review!</Text>
              </View>
            )}
          </View>
        </View>
      </Animated.ScrollView>

      {/* Floating Bottom Cart Bar */}
      {totalItems > 0 && (
        <Animated.View entering={FadeInUp} style={styles.floatingCartContainer}>
          <TouchableOpacity 
            activeOpacity={0.9} 
            style={styles.floatingCart}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push('/cart');
            }}
          >
            <View style={styles.cartInfo}>
              <View style={styles.cartCountCircle}>
                <Text style={styles.cartBadgeText}>{totalItems}</Text>
              </View>
              <View style={{marginLeft: 12}}>
                <Text style={styles.viewCartText}>View Cart</Text>
                <Text style={styles.cartPriceText}>₹{totalAmount} • Plus Taxes</Text>
              </View>
            </View>
            <View style={styles.checkoutActionRow}>
              <Text style={styles.checkoutText}>CHECKOUT</Text>
              <Ionicons name="arrow-forward" size={18} color="#1A1A1A" />
            </View>
          </TouchableOpacity>
        </Animated.View>
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
    resizeMode: 'cover',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 1,
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
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  contentCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    minHeight: 900,
    paddingTop: 15,
  },
  logoBadgeContainer: {
    position: 'absolute',
    top: -40,
    left: 24,
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    padding: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 12,
  },
  logoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 19,
    resizeMode: 'cover',
  },
  infoCard: {
    paddingHorizontal: 24,
    paddingTop: 38,
  },
  resTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  resName: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.light.text,
    letterSpacing: -0.5,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  locationText: {
    fontSize: 13,
    color: Colors.light.textMuted,
    fontWeight: '500',
  },
  ratingBox: {
    alignItems: 'flex-end',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#22C55E',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 4,
  },
  ratingText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '900',
  },
  ratingSubText: {
    fontSize: 10,
    color: Colors.light.textMuted,
    fontWeight: '700',
    marginTop: 4,
  },
  tagsAndDietRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    gap: 10,
  },
  resTags: {
    flex: 1,
    fontSize: 13,
    color: Colors.light.textMuted,
    fontWeight: '600',
  },
  badgeVegPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F4EA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 5,
  },
  badgeVegText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#137333',
    letterSpacing: 0.3,
  },
  badgeNonVegPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FCE8E6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 5,
  },
  badgeNonVegText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#C5221F',
    letterSpacing: 0.3,
  },
  badgeBothPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF7E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 5,
  },
  badgeBothText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#B06000',
    letterSpacing: 0.3,
  },
  vegSquare: {
    width: 13,
    height: 13,
    borderWidth: 1.3,
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
    width: 13,
    height: 13,
    borderWidth: 1.3,
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
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 18,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  metaIconBg: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaVal: {
    fontSize: 13,
    fontWeight: '900',
    color: '#1A1A1A',
  },
  metaSub: {
    fontSize: 10,
    color: Colors.light.textMuted,
    fontWeight: '600',
  },
  metaDividerVertical: {
    width: 1,
    height: 25,
    backgroundColor: '#E5E7EB',
  },
  offerBannerStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primary + '20',
    borderWidth: 1,
    borderColor: Colors.light.primary + '40',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    marginTop: 14,
    gap: 10,
  },
  offerBannerText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  categoriesScroll: {
    paddingHorizontal: 24,
    gap: 10,
  },
  catBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
  },
  catBtnActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  catText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#666',
  },
  catTextActive: {
    color: '#1A1A1A',
  },
  foodListContainer: {
    paddingHorizontal: 24,
    marginTop: 25,
  },
  menuSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  menuSectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.light.text,
  },
  menuSectionCount: {
    fontSize: 11,
    fontWeight: '900',
    color: Colors.light.textMuted,
    letterSpacing: 1,
  },
  foodCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 22,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  foodInfo: {
    flex: 1,
    marginRight: 16,
  },
  itemVegRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  bestsellerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF7E0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  bestsellerText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#B06000',
    letterSpacing: 0.5,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.light.text,
    lineHeight: 22,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  foodPrice: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.light.text,
  },
  foodOriginalPrice: {
    fontSize: 13,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    fontWeight: '600',
  },
  offBadgePill: {
    backgroundColor: '#E6F4EA',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  offBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#137333',
  },
  foodDesc: {
    fontSize: 12,
    color: Colors.light.textMuted,
    marginTop: 8,
    lineHeight: 18,
    fontWeight: '500',
  },
  foodImageContainer: {
    width: 110,
    height: 110,
    position: 'relative',
    alignItems: 'center',
  },
  foodImage: {
    width: 110,
    height: 110,
    borderRadius: 20,
    resizeMode: 'cover',
  },
  addBtnWrapper: {
    position: 'absolute',
    bottom: -12,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 14,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    gap: 4,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#1A1A1A',
    letterSpacing: 0.5,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primary,
    borderRadius: 14,
    paddingHorizontal: 6,
    paddingVertical: 4,
    gap: 8,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  qtyBtn: {
    padding: 4,
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1A1A1A',
    minWidth: 16,
    textAlign: 'center',
  },
  reviewSection: {
    paddingHorizontal: 24,
    marginTop: 30,
    marginBottom: 40,
  },
  reviewsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  reviewsTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.light.text,
  },
  reviewsSubTitle: {
    fontSize: 12,
    color: Colors.light.textMuted,
    fontWeight: '600',
    marginTop: 2,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.light.primary,
  },
  reviewCard: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewUserName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  reviewRating: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewComment: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 19,
    fontWeight: '500',
  },
  noReviews: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    gap: 10,
  },
  noReviewsText: {
    fontSize: 13,
    color: Colors.light.textMuted,
    fontWeight: '600',
    textAlign: 'center',
  },
  floatingCartContainer: {
    position: 'absolute',
    bottom: 25,
    left: 20,
    right: 20,
    zIndex: 100,
  },
  floatingCart: {
    backgroundColor: Colors.light.primary,
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  cartInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartCountCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 14,
  },
  viewCartText: {
    color: '#1A1A1A',
    fontSize: 14,
    fontWeight: '900',
  },
  cartPriceText: {
    color: 'rgba(26, 26, 26, 0.7)',
    fontSize: 11,
    fontWeight: '700',
  },
  checkoutActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  checkoutText: {
    color: '#1A1A1A',
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: 1,
  },
});
