import React from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, SafeAreaView, StatusBar, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const FAVORITES = [
  {
    id: '1',
    name: 'Pizza Junction',
    desc: 'Italian • Pizza • Fast Food',
    rating: 4.6,
    time: '25–30 min',
    emoji: '🍕',
    gradient: ['#FFE7A7', '#FFC75B']
  },
  {
    id: '2',
    name: 'Biryani Adda',
    desc: 'Biryani • Mughlai • North Indian',
    rating: 4.8,
    time: '30–35 min',
    emoji: '🍛',
    gradient: ['#FFD2C4', '#FE8B6A']
  },
  {
    id: '3',
    name: 'Fresh Bowl',
    desc: 'Healthy • Bowls • Beverages',
    rating: 4.5,
    time: '20–25 min',
    emoji: '🥗',
    gradient: ['#D8F5DA', '#87D58F']
  },
];

export default function FavoritesScreen() {
  const router = useRouter();

  const renderItem = ({ item, index }: { item: any, index: number }) => (
    <Animated.View 
      entering={FadeInDown.delay(index * 100)}
      style={styles.restaurantCard}
    >
      <LinearGradient
        colors={item.gradient as [string, string]}
        style={styles.restImg}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.emoji}>{item.emoji}</Text>
      </LinearGradient>
      
      <View style={styles.restInfo}>
        <Text style={styles.restTitle} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.restDesc} numberOfLines={1}>{item.desc}</Text>
        <Text style={styles.restMeta}>★ {item.rating} • {item.time}</Text>
      </View>

      <TouchableOpacity style={styles.heartBtn}>
        <Ionicons name="heart" size={16} color="#e64949" />
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.pageHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color="#161616" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Liked Restaurants</Text>
            <Text style={styles.headerSubtitle}>Your saved restaurant favourites</Text>
          </View>
        </View>

        <FlatList
          data={FAVORITES}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.pageBody}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIcon}>
                <Ionicons name="heart-outline" size={30} color="#7A6500" />
              </View>
              <Text style={styles.emptyTitle}>No liked restaurants</Text>
              <Text style={styles.emptySub}>Restaurants you save will appear here.</Text>
            </View>
          }
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  pageHeader: {
    paddingHorizontal: 18,
    paddingVertical: 17,
    paddingTop: Platform.OS === 'android' ? 45 : 25,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ECECEC',
    backgroundColor: '#fff',
    zIndex: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: '#F4F4F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#161616',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#838383',
    marginTop: 3,
    fontFamily: 'Inter-Regular',
  },
  pageBody: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 35,
  },
  restaurantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    borderWidth: 1,
    borderColor: '#ECECEC',
    borderRadius: 18,
    padding: 10,
    marginBottom: 11,
    backgroundColor: '#fff',
  },
  restImg: {
    width: 76,
    height: 76,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 38,
  },
  restInfo: {
    flex: 1,
  },
  restTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#161616',
  },
  restDesc: {
    fontSize: 12,
    color: '#7f7f7f',
    marginTop: 4,
    fontFamily: 'Inter-Regular',
  },
  restMeta: {
    fontSize: 12,
    fontFamily: 'Inter-Bold', // HTML had 700
    color: '#161616',
    marginTop: 7,
  },
  heartBtn: {
    width: 35,
    height: 35,
    borderRadius: 11,
    backgroundColor: '#fff0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 50,
  },
  emptyIcon: {
    width: 82,
    height: 82,
    borderRadius: 26,
    backgroundColor: '#FFF8D0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 13,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#161616',
  },
  emptySub: {
    fontSize: 13,
    color: '#777',
    marginTop: 6,
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
    lineHeight: 18,
  },
});
