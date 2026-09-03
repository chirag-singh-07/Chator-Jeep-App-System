import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, TextInput, ScrollView, TouchableOpacity, Image, ActivityIndicator, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useMenuStore } from '@/store/useMenuStore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import debounce from 'lodash/debounce';

const { width } = Dimensions.get('window');

export default function SearchScreen() {
  const { categoryId } = useLocalSearchParams();
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Everything');
  const { restaurants, isLoading, fetchRestaurants, categories } = useMenuStore();
  const router = useRouter();

  // Initial load or category-based search
  useEffect(() => {
    if (categoryId) {
      fetchRestaurants({ categoryId });
    }
  }, [categoryId]);

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((q: string) => {
      const params: any = { search: q };
      if (activeFilter === 'Rating 4.0+') params.minRating = 4;
      if (activeFilter === 'Pure Veg') params.isVeg = true;
      fetchRestaurants(params);
    }, 500),
    [activeFilter]
  );

  useEffect(() => {
    if (query) {
      debouncedSearch(query);
    }
  }, [query, activeFilter]);

  const clearSearch = () => {
    setQuery('');
    fetchRestaurants({});
  };

  const renderResult = (item: any, index: number) => (
    <Animated.View entering={FadeInDown.delay(index * 50)} key={item._id}>
      <TouchableOpacity 
        style={styles.restaurantCard}
        onPress={() => router.push(`/restaurant/${item._id}`)}
      >
        <View style={styles.restaurantImgContainer}>
          <Image 
            source={{ uri: item.bannerUrls?.original || `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&q=80` }} 
            style={styles.restaurantImg} 
          />
          <View style={styles.timeBadge}>
            <Text style={styles.timeBadgeText}>25–30 min</Text>
          </View>
        </View>
        
        <View style={styles.rInfo}>
          <View style={styles.rTop}>
            <Text style={styles.rName} numberOfLines={1}>{item.name}</Text>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>★ {item.rating || '4.0'}</Text>
            </View>
          </View>
          <Text style={styles.rCategories}>{item.cuisines?.join(' • ') || 'Various Cuisines'}</Text>
          <View style={styles.rMeta}>
            <Text style={styles.rMetaText}><Ionicons name="navigate-outline" size={10} color="#626262" /> 1.2 km</Text>
            <Text style={styles.rMetaText}><Ionicons name="pricetag-outline" size={10} color="#626262" /> ₹149 for one</Text>
          </View>
          <TouchableOpacity style={styles.openBtn} onPress={() => router.push(`/restaurant/${item._id}`)}>
            <Text style={styles.openBtnText}>Open restaurant</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Search Header */}
      <View style={styles.header}>
        <View style={styles.topline}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#151515" />
          </TouchableOpacity>
          <View style={styles.titleWrap}>
            <Text style={styles.titleText}>Search</Text>
            <Text style={styles.titleSub}>Find food, dishes and restaurants near you</Text>
          </View>
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#6D6D6D" />
          <TextInput 
            style={styles.input}
            placeholder="Search 'Biryani', 'Pizza', 'Burger'..."
            placeholderTextColor="#999"
            value={query}
            onChangeText={setQuery}
            autoFocus={!!categoryId}
          />
          {query ? (
            <TouchableOpacity onPress={clearSearch} style={styles.clearBtn}>
              <Ionicons name="close" size={16} color="#666" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {!query && !categoryId ? (
          <Animated.View entering={FadeIn.delay(200)}>
            
            {/* Recent searches */}
            <View style={styles.section}>
              <View style={styles.sectionHead}>
                <Text style={styles.sectionHeadText}>Recent searches</Text>
                <TouchableOpacity><Text style={styles.linkBtn}>Clear all</Text></TouchableOpacity>
              </View>
              <View style={styles.recentList}>
                {['Chicken Biryani', 'Pizza Junction', 'Burger'].map((item, i) => (
                  <View key={i} style={styles.recentItem}>
                    <TouchableOpacity style={styles.recentLeft} onPress={() => setQuery(item)}>
                      <View style={styles.recentIcon}>
                        <Ionicons name="time-outline" size={16} color="#777" />
                      </View>
                      <Text style={styles.recentItemText}>{item}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteRecent}>
                      <Ionicons name="close" size={16} color="#AAA" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>

            {/* Trending searches */}
            <View style={[styles.section, {marginTop: 30}]}>
              <View style={styles.sectionHead}>
                <Text style={styles.sectionHeadText}>Trending searches</Text>
              </View>
              <View style={styles.trends}>
                <TouchableOpacity style={styles.chip} onPress={() => setQuery('Biryani')}>
                  <Text style={styles.chipText}>🔥 Biryani</Text>
                </TouchableOpacity>
                {['Pizza', 'Momos', 'South Indian', 'Burger', 'Dessert'].map(trend => (
                  <TouchableOpacity key={trend} style={styles.chip} onPress={() => setQuery(trend)}>
                    <Text style={styles.chipText}>{trend}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Browse categories */}
            <View style={[styles.section, {marginTop: 30}]}>
              <View style={styles.sectionHead}>
                <Text style={styles.sectionHeadText}>Browse categories</Text>
              </View>
              <View style={styles.categoryRow}>
                {categories.map((cat: any) => (
                  <TouchableOpacity 
                    key={cat._id} 
                    style={styles.cat} 
                    onPress={() => router.setParams({ categoryId: cat._id })}
                  >
                    <View style={styles.catIcon}>
                      {cat.image ? (
                         <Image source={{uri: cat.image}} style={{width: '100%', height: '100%'}} />
                      ) : (
                         <Text style={{fontSize: 32}}>🍲</Text>
                      )}
                    </View>
                    <Text style={styles.catText}>{cat.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

          </Animated.View>
        ) : (
          <View style={styles.resultsArea}>
            <View style={styles.resultCount}>
              <View>
                <Text style={styles.resultsTitle}>{isLoading ? "Searching..." : `Results for "${query || 'Category'}"`}</Text>
                <Text style={styles.resultSubtitle}>{restaurants.length} matches found near you</Text>
              </View>
              <TouchableOpacity style={styles.filterBtn}>
                <Ionicons name="options" size={12} color="#FFF" />
                <Text style={styles.filterBtnText}>Filters</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.restaurantResults}>
              {restaurants.length > 0 ? (
                restaurants.map((res, index) => renderResult(res, index))
              ) : !isLoading && (
                <View style={styles.empty}>
                  <View style={styles.emptyIcon}>
                    <Ionicons name="search" size={35} color="#151515" />
                  </View>
                  <Text style={styles.emptyTitle}>No results found</Text>
                  <Text style={styles.emptyDesc}>Try a different food, dish, cuisine or restaurant name.</Text>
                  <TouchableOpacity style={styles.emptyBtn} onPress={clearSearch}>
                    <Text style={styles.emptyBtnText}>Clear search</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 16,
    backgroundColor: '#FFF5B4',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
    zIndex: 20,
  },
  topline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    marginBottom: 15,
  },
  backBtn: {
    width: 41,
    height: 41,
    borderRadius: 13,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.07,
    shadowRadius: 18,
    elevation: 2,
  },
  titleWrap: {
    flex: 1,
  },
  titleText: {
    fontSize: 19,
    fontWeight: '800',
    color: '#151515',
  },
  titleSub: {
    fontSize: 10,
    color: '#777',
    marginTop: 3,
    fontWeight: '500',
  },
  searchBox: {
    height: 56,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#E7E7E7',
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 22,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#151515',
    fontWeight: '500',
  },
  clearBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#F4F4F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 18,
    paddingBottom: 120,
    backgroundColor: '#FFF',
  },
  section: {
    marginTop: 10,
  },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionHeadText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#151515',
  },
  linkBtn: {
    fontSize: 11,
    fontWeight: '800',
    color: '#806A00',
  },
  recentList: {
    gap: 7,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
  },
  recentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  recentIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentItemText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#151515',
  },
  deleteRecent: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trends: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 30,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#151515',
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  cat: {
    width: (width - 36 - 24) / 3, // 36 is screen padding, 24 is total gap
    alignItems: 'center',
    marginBottom: 15,
  },
  catIcon: {
    width: 76,
    height: 76,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#F3F3F3',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
  },
  catText: {
    marginTop: 9,
    fontSize: 12,
    fontWeight: '800',
    color: '#151515',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  resultsArea: {
    marginTop: 0,
  },
  resultCount: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#151515',
  },
  resultSubtitle: {
    fontSize: 11,
    color: '#777',
    fontWeight: '500',
    marginTop: 3,
  },
  filterBtn: {
    backgroundColor: '#111',
    borderRadius: 11,
    paddingHorizontal: 12,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  filterBtnText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  restaurantResults: {
    marginTop: 5,
  },
  restaurantCard: {
    borderWidth: 1,
    borderColor: '#ECECEC',
    borderRadius: 20,
    marginBottom: 15,
    padding: 10,
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.035,
    shadowRadius: 20,
    elevation: 2,
  },
  restaurantImgContainer: {
    width: 100,
    height: 100,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  restaurantImg: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F0F0F0',
  },
  timeBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  timeBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#151515',
  },
  rInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  rTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  rName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#151515',
    flex: 1,
  },
  ratingBadge: {
    backgroundColor: '#FFD400',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#151515',
  },
  rCategories: {
    fontSize: 11,
    color: '#7f7f7f',
    marginTop: 5,
    fontWeight: '500',
  },
  rMeta: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  rMetaText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#626262',
  },
  openBtn: {
    marginTop: 10,
    backgroundColor: '#111',
    borderRadius: 9,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  openBtnText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 15,
  },
  emptyIcon: {
    width: 88,
    height: 88,
    borderRadius: 28,
    backgroundColor: '#FFF8D0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#151515',
  },
  emptyDesc: {
    fontSize: 12,
    color: '#777',
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 18,
  },
  emptyBtn: {
    marginTop: 15,
    backgroundColor: '#111',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  emptyBtnText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
  },
});
