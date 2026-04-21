import React from 'react';
import { StyleSheet, View, Text, FlatList, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInLeft } from 'react-native-reanimated';

const ORDERS = [
  {
    id: 'ORD123',
    restaurant: 'The Pizza Hub',
    status: 'Delivered',
    date: '21 Apr 2026, 10:30 PM',
    price: 543,
    items: ['Margherita x1', 'Breadsticks x2'],
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200',
  },
  {
    id: 'ORD122',
    restaurant: 'Burger King Royale',
    status: 'Delivered',
    date: '19 Apr 2026, 08:15 PM',
    price: 299,
    items: ['Whopper Junior x2'],
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200',
  }
];

export default function OrdersScreen() {
  const router = useRouter();

  const renderItem = ({ item, index }: { item: any, index: number }) => (
    <Animated.View 
      entering={FadeInLeft.delay(index * 100)}
      style={styles.card}
    >
      <View style={styles.cardHeader}>
         <Image source={{ uri: item.image }} style={styles.resImg} />
         <View style={{flex: 1, marginLeft: 15}}>
            <Text style={styles.resName}>{item.restaurant}</Text>
            <View style={styles.statusRow}>
               <View style={[styles.statusDot, { backgroundColor: item.status === 'Delivered' ? '#48bb78' : Colors.light.primary }]} />
               <Text style={styles.statusText}>{item.status}</Text>
               <Text style={styles.dotSeparator}>•</Text>
               <Text style={styles.orderId}>#{item.id}</Text>
            </View>
         </View>
         <TouchableOpacity style={styles.detailsBtn}>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
         </TouchableOpacity>
      </View>

      <View style={styles.divider} />
      
      <View style={styles.cardBody}>
         <Text style={styles.itemsList}>{item.items.join(', ')}</Text>
         <View style={styles.bottomRow}>
            <View>
               <Text style={styles.dateText}>{item.date}</Text>
               <Text style={styles.priceText}>₹{item.price}</Text>
            </View>
            <TouchableOpacity 
               style={styles.reorderBtn}
               onPress={() => router.push(`/restaurant/${item.id}`)}
            >
               <Ionicons name="refresh" size={16} color={Colors.light.primary} />
               <Text style={styles.reorderText}>REORDER</Text>
            </TouchableOpacity>
         </View>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>History</Text>
        <TouchableOpacity style={styles.filterBtn}>
           <Ionicons name="filter" size={20} color={Colors.light.text} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={ORDERS}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={<Text style={styles.sectionTitle}>Past Orders</Text>}
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
    paddingHorizontal: 25,
    paddingVertical: 20,
    backgroundColor: '#FFF',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.light.text,
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
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 20,
    marginTop: 10,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    marginBottom: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resImg: {
    width: 55,
    height: 55,
    borderRadius: 18,
  },
  resName: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.light.text,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
  },
  dotSeparator: {
    marginHorizontal: 6,
    color: '#DDD',
  },
  orderId: {
    fontSize: 12,
    color: '#AAA',
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 15,
    borderStyle: 'dashed',
    borderRadius: 1,
  },
  itemsList: {
    fontSize: 13,
    color: '#777',
    fontWeight: '500',
    lineHeight: 18,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 15,
  },
  dateText: {
    fontSize: 11,
    color: '#AAA',
    fontWeight: '700',
  },
  priceText: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.light.text,
    marginTop: 2,
  },
  reorderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.light.primary + '20',
  },
  reorderText: {
    fontSize: 12,
    fontWeight: '900',
    color: Colors.light.primary,
    letterSpacing: 0.5,
  },
});
