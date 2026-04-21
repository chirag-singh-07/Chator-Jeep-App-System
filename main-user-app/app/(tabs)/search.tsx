import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, ScrollView, TouchableOpacity, FlatList, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

const RECENT_SEARCHES = ['Pizza Hub', 'Burger King', 'Sushi', 'Desserts near me'];
const TRENDING = [
  { id: '1', name: 'Butter Chicken', type: 'Dish' },
  { id: '2', name: 'Starbucks', type: 'Restaurant' },
  { id: '3', name: 'Cold Coffee', type: 'Dish' },
  { id: '4', name: 'Biryani Blues', type: 'Restaurant' },
];

export default function SearchScreen() {
  const [query, setQuery] = useState('');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Search Header */}
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={query ? Colors.light.primary : "#999"} />
          <TextInput 
            style={styles.input}
            placeholder="Search for restaurants or dishes..."
            value={query}
            onChangeText={setQuery}
            autoFocus={false}
          />
          {query ? (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={20} color="#CCC" />
            </TouchableOpacity>
          ) : (
            <Ionicons name="mic-outline" size={20} color="#999" />
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Chips / Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
           <TouchableOpacity style={[styles.chip, styles.chipActive]}>
              <Text style={styles.chipTextActive}>Everything</Text>
           </TouchableOpacity>
           <TouchableOpacity style={styles.chip}>
              <Text style={styles.chipText}>Dietary</Text>
              <Ionicons name="chevron-down" size={14} color="#666" />
           </TouchableOpacity>
           <TouchableOpacity style={styles.chip}>
              <Text style={styles.chipText}>Rating 4.0+</Text>
           </TouchableOpacity>
           <TouchableOpacity style={styles.chip}>
              <Text style={styles.chipText}>Pure Veg</Text>
           </TouchableOpacity>
        </ScrollView>

        {!query ? (
          <Animated.View entering={FadeIn.delay(200)}>
            {/* Recent Searches */}
            <View style={styles.section}>
               <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Recent Searches</Text>
                  <TouchableOpacity><Text style={styles.clearAll}>Clear All</Text></TouchableOpacity>
               </View>
               <View style={styles.recentGrid}>
                  {RECENT_SEARCHES.map((item, i) => (
                    <TouchableOpacity key={i} style={styles.recentItem}>
                       <Ionicons name="time-outline" size={16} color="#999" />
                       <Text style={styles.recentText}>{item}</Text>
                    </TouchableOpacity>
                  ))}
               </View>
            </View>

            {/* Trending */}
            <View style={styles.section}>
               <Text style={styles.sectionTitle}>Trending Searches</Text>
               <View style={styles.trendingList}>
                  {TRENDING.map((item, i) => (
                    <TouchableOpacity key={i} style={styles.trendingItem}>
                       <View style={styles.trendingIcon}>
                          <Ionicons name={item.type === 'Dish' ? "restaurant" : "business"} size={14} color={Colors.light.primary} />
                       </View>
                       <View style={{flex: 1, marginLeft: 15}}>
                          <Text style={styles.trendingName}>{item.name}</Text>
                          <Text style={styles.trendingType}>{item.type}</Text>
                       </View>
                       <Ionicons name="arrow-redo-outline" size={16} color="#DDD" />
                    </TouchableOpacity>
                  ))}
               </View>
            </View>

            {/* Popular Cuisines */}
            <View style={styles.section}>
               <Text style={styles.sectionTitle}>Cuisines To Explore</Text>
               <View style={styles.cuisineGrid}>
                  {['Indian', 'Chinese', 'Italian', 'Healthy', 'Bakery', 'American'].map((name, i) => (
                    <TouchableOpacity key={i} style={styles.cuisineCard}>
                       <View style={styles.cuisineCircle} />
                       <Text style={styles.cuisineName}>{name}</Text>
                    </TouchableOpacity>
                  ))}
               </View>
            </View>
          </Animated.View>
        ) : (
          <View style={styles.resultsContainer}>
             <Text style={styles.resultsLabel}>Top results for "{query}"</Text>
             {/* Simple result placeholder */}
             {[1,2,3].map(i => (
               <TouchableOpacity key={i} style={styles.resultItem}>
                  <Image source={{ uri: `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&q=80` }} style={styles.resultImg} />
                  <View style={{flex: 1, marginLeft: 15}}>
                     <Text style={styles.resultName}>Spicy Veg Burger {i}</Text>
                     <Text style={styles.resultContext}>In Burger King • ₹199</Text>
                  </View>
                  <TouchableOpacity style={styles.quickAdd}>
                     <Ionicons name="add" size={18} color={Colors.light.primary} />
                  </TouchableOpacity>
               </TouchableOpacity>
             ))}
          </View>
        )}
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
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: '#FFF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    height: 55,
    borderRadius: 18,
    paddingHorizontal: 15,
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.text,
  },
  scroll: {
    paddingBottom: 100,
  },
  chipsRow: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#EEE',
    gap: 6,
  },
  chipActive: {
    backgroundColor: Colors.light.text,
    borderColor: Colors.light.text,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#666',
  },
  chipTextActive: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
  },
  section: {
    paddingHorizontal: 25,
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: Colors.light.text,
    textTransform: 'uppercase',
    letterSpacing: 1,
    opacity: 0.8,
    marginBottom: 15,
  },
  clearAll: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.light.primary,
  },
  recentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  recentText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  trendingList: {
    gap: 20,
  },
  trendingItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendingIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFF5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendingName: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.light.text,
  },
  trendingType: {
    fontSize: 11,
    color: '#AAA',
    fontWeight: '700',
    marginTop: 1,
  },
  cuisineGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    justifyContent: 'space-between',
  },
  cuisineCard: {
    width: (width - 65) / 3,
    alignItems: 'center',
  },
  cuisineCircle: {
    width: 65,
    height: 65,
    borderRadius: 32,
    backgroundColor: '#F9FAFB',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  cuisineName: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.text,
  },
  resultsContainer: {
    paddingHorizontal: 25,
    marginTop: 10,
  },
  resultsLabel: {
    fontSize: 14,
    color: '#999',
    fontWeight: '700',
    marginBottom: 20,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#FFF',
  },
  resultImg: {
    width: 55,
    height: 55,
    borderRadius: 15,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.light.text,
  },
  resultContext: {
    fontSize: 12,
    color: '#AAA',
    marginTop: 2,
    fontWeight: '600',
  },
  quickAdd: {
     width: 36,
     height: 36,
     borderRadius: 12,
     backgroundColor: '#FFF5F5',
     alignItems: 'center',
     justifyContent: 'center',
     borderWidth: 1,
     borderColor: Colors.light.primary + '20',
  }
});
