import React from 'react';
import { StyleSheet, View, Text, FlatList, Image, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

const RESTAURANTS = [
  {
    id: '1',
    name: 'The Pizza Hub',
    rating: 4.8,
    time: '20-30 min',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
    tags: ['Pizza', 'Italian'],
    offers: '50% OFF',
  },
  {
    id: '2',
    name: 'Burger King Royale',
    rating: 4.5,
    time: '15-25 min',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
    tags: ['Burger', 'American'],
    offers: 'Free Delivery',
  },
  {
    id: '3',
    name: 'Sushi ZenMaster',
    rating: 4.9,
    time: '30-45 min',
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400',
    tags: ['Sushi', 'Japanese'],
    offers: 'BOGO',
  },
  {
    id: '4',
    name: 'Biryani Blues',
    rating: 4.6,
    time: '35-40 min',
    image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400',
    tags: ['Biryani', 'North Indian'],
    offers: '20% OFF',
  }
];

export default function ListingScreen() {
  const router = useRouter();

  const renderItem = ({ item, index }: { item: any, index: number }) => (
    <Animated.TouchableOpacity 
      entering={FadeInDown.delay(index * 100)}
      activeOpacity={0.9}
      style={styles.card}
      onPress={() => router.push(`/restaurant/${item.id}`)}
    >
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.badge}>
         <Text style={styles.badgeText}>{item.offers}</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={styles.name}>{item.name}</Text>
          <View style={styles.rating}>
            <Text style={styles.ratingText}>{item.rating}</Text>
            <Ionicons name="star" size={10} color="#FFF" />
          </View>
        </View>
        <Text style={styles.tags}>{item.tags.join(' • ')}</Text>
        <View style={styles.meta}>
          <Ionicons name="bicycle" size={16} color="#48bb78" />
          <Text style={styles.metaText}>{item.time} • Free Delivery</Text>
        </View>
      </View>
    </Animated.TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>All Restaurants</Text>
          <Text style={styles.subtitle}>86 restaurants near you</Text>
        </View>
        <TouchableOpacity style={styles.filterBtn}>
           <Ionicons name="options-outline" size={22} color={Colors.light.text} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={RESTAURANTS}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backBtn: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.light.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: Colors.light.textMuted,
    textAlign: 'center',
    fontWeight: '600',
  },
  filterBtn: {
     width: 45,
     height: 45,
     borderRadius: 15,
     backgroundColor: '#F9FAFB',
     alignItems: 'center',
     justifyContent: 'center',
  },
  list: {
    padding: 20,
    paddingBottom: 50,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 25,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 180,
  },
  badge: {
     position: 'absolute',
     top: 15,
     left: 15,
     backgroundColor: Colors.light.primary,
     paddingHorizontal: 12,
     paddingVertical: 6,
     borderRadius: 10,
  },
  badgeText: {
     color: '#FFF',
     fontSize: 12,
     fontWeight: '900',
  },
  content: {
    padding: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 17,
    fontWeight: '900',
    color: Colors.light.text,
  },
  rating: {
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
  tags: {
    fontSize: 13,
    color: Colors.light.textMuted,
    marginTop: 4,
    fontWeight: '500',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666',
  },
});
