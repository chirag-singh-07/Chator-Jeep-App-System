import React from 'react';
import { StyleSheet, View, Text, FlatList, Image, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const FAVORITES = [
  {
    id: '1',
    name: 'Sushi ZenMaster',
    rating: 4.9,
    time: '30-45 min',
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400',
    tags: ['Sushi', 'Japanese'],
    isVeg: false,
  },
  {
    id: '2',
    name: 'The Pizza Hub',
    rating: 4.8,
    time: '20-30 min',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
    tags: ['Pizza', 'Italian'],
    isVeg: true,
  },
];

export default function FavoritesScreen() {
  const renderItem = ({ item, index }: { item: any, index: number }) => (
    <Animated.View 
      entering={FadeInDown.delay(index * 100)}
      style={styles.card}
    >
      <Image source={{ uri: item.image }} style={styles.image} />
      <TouchableOpacity style={styles.heartBtn}>
        <Ionicons name="heart" size={20} color={Colors.light.primary} />
      </TouchableOpacity>
      <View style={styles.content}>
        <View style={styles.row}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Ionicons name="stop-circle" size={16} color={item.isVeg ? "#48bb78" : "#e53e3e"} />
            <Text style={styles.name}>{item.name}</Text>
          </View>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={12} color="#FFF" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        </View>
        <Text style={styles.tags}>{item.tags.join(' • ')}</Text>
        <View style={styles.meta}>
          <Ionicons name="time-outline" size={14} color={Colors.light.textMuted} />
          <Text style={styles.metaText}>{item.time} • Free Delivery</Text>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Favorites</Text>
        <Text style={styles.subtitle}>Restaurants you liked the most</Text>
      </View>

      <FlatList
        data={FAVORITES}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={80} color="#EEE" />
            <Text style={styles.emptyText}>No favorites yet</Text>
            <Text style={styles.emptySub}>Start exploring and like some restaurants!</Text>
          </View>
        }
      />
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
    paddingVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.light.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.light.textMuted,
    marginTop: 4,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 4,
  },
  image: {
    width: '100%',
    height: 180,
  },
  heartBtn: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: '#FFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  content: {
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginLeft: 6,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#48bb78',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  tags: {
    fontSize: 14,
    color: Colors.light.textMuted,
    marginBottom: 8,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: Colors.light.textMuted,
    marginLeft: 4,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginTop: 20,
  },
  emptySub: {
    fontSize: 14,
    color: Colors.light.textMuted,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
