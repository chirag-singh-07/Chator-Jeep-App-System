import React, { useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, Image, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInLeft } from 'react-native-reanimated';
import { useOrderStore } from '@/store/useOrderStore';
import { format } from 'date-fns';

export default function OrdersScreen() {
  const router = useRouter();
  const { orders, isLoading, fetchMyOrders } = useOrderStore();

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const onRefresh = useCallback(() => {
    fetchMyOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return '#48bb78';
      case 'CANCELLED': return '#e53e3e';
      case 'PENDING': return '#ebaf00';
      default: return Colors.light.primary;
    }
  };

  const renderItem = ({ item, index }: { item: any, index: number }) => (
    <Animated.View 
      entering={FadeInLeft.delay(index * 100)}
      style={styles.card}
    >
      <TouchableOpacity 
        activeOpacity={0.7}
        onPress={() => router.push(`/order-tracking/${item._id}`)}
      >
        <View style={styles.cardHeader}>
           <View style={styles.resImgPlaceholder}>
              <Ionicons name="restaurant" size={24} color="#DDD" />
           </View>
           <View style={{flex: 1, marginLeft: 15}}>
              <Text style={styles.resName}>{item.restaurantId?.name || "Restaurant"}</Text>
              <View style={styles.statusRow}>
                 <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
                 <Text style={styles.statusText}>{item.status}</Text>
                 <Text style={styles.dotSeparator}>•</Text>
                 <Text style={styles.orderId}>#{item._id.slice(-6).toUpperCase()}</Text>
              </View>
           </View>
           <Ionicons name="chevron-forward" size={20} color="#CCC" />
        </View>

        <View style={styles.divider} />
        
        <View style={styles.cardBody}>
           <Text style={styles.itemsList} numberOfLines={1}>
              {item.items.map((i: any) => i.name).join(', ')}
           </Text>
           <View style={styles.bottomRow}>
              <View>
                 <Text style={styles.dateText}>{format(new Date(item.createdAt), 'dd MMM yyyy, hh:mm a')}</Text>
                 <Text style={styles.priceText}>₹{item.totalAmount}</Text>
              </View>
              <TouchableOpacity 
                 style={styles.reorderBtn}
                 onPress={() => router.push(`/restaurant/${item.restaurantId?._id}`)}
              >
                 <Ionicons name="refresh" size={16} color={Colors.light.primary} />
                 <Text style={styles.reorderText}>REORDER</Text>
              </TouchableOpacity>
           </View>
        </View>
      </TouchableOpacity>
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
        data={orders}
        renderItem={renderItem}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isLoading && orders.length > 0} onRefresh={onRefresh} tintColor={Colors.light.primary} />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
               <Ionicons name="receipt-outline" size={80} color="#EEE" />
               <Text style={styles.emptyText}>No orders yet</Text>
            </View>
          ) : <ActivityIndicator size="large" color={Colors.light.primary} style={{ marginTop: 50 }} />
        }
        ListHeaderComponent={orders.length > 0 ? <Text style={styles.sectionTitle}>Your Orders</Text> : null}
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
  resImgPlaceholder: {
    width: 55,
    height: 55,
    borderRadius: 18,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '700',
    marginTop: 20,
  },
});
