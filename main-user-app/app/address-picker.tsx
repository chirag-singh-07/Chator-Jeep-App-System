import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useLocationStore } from '@/store/useLocationStore';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

// Mock data for address search results
const MOCK_RESULTS = [
  { id: '1', name: 'Connaught Place', address: 'New Delhi, Delhi 110001', coordinates: { latitude: 28.6315, longitude: 77.2167 } },
  { id: '2', name: 'Hauz Khas Village', address: 'Deer Park, Hauz Khas, New Delhi, Delhi 110016', coordinates: { latitude: 28.5521, longitude: 77.1948 } },
  { id: '3', name: 'Cyber Hub', address: 'DLF Cyber City, DLF Phase 2, Sector 24, Gurugram, Haryana 122002', coordinates: { latitude: 28.4951, longitude: 77.0878 } },
  { id: '4', name: 'India Gate', address: 'Rajpath, India Gate, New Delhi, Delhi 110001', coordinates: { latitude: 28.6129, longitude: 77.2295 } },
];

export default function AddressPickerScreen() {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setCurrentAddress } = useLocationStore();

  const handleSearch = (text: string) => {
    setSearch(text);
    if (text.length > 2) {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setResults(MOCK_RESULTS.filter(r => r.name.toLowerCase().includes(text.toLowerCase()) || r.address.toLowerCase().includes(text.toLowerCase())));
        setLoading(false);
      }, 500);
    } else {
      setResults([]);
    }
  };

  const handleSelect = (item: any) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCurrentAddress({
      id: Math.random().toString(),
      type: 'Selected Location',
      flat: item.name,
      area: item.address,
      coordinates: item.coordinates
    });
    router.back();
  };

  const useCurrentLocation = async () => {
    try {
      setLoading(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      let reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });

      if (reverseGeocode.length > 0) {
        const addr = reverseGeocode[0];
        handleSelect({
          name: addr.name || 'Current Location',
          address: `${addr.street || ''}, ${addr.city || ''}, ${addr.region || ''}`,
          coordinates: { latitude: location.coords.latitude, longitude: location.coords.longitude }
        });
      }
    } catch (error) {
      alert('Error fetching location');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Search Address</Text>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={Colors.light.primary} />
          <TextInput
            style={styles.input}
            placeholder="Search for area, street name..."
            value={search}
            onChangeText={handleSearch}
            autoFocus
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={20} color="#CCC" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <TouchableOpacity style={styles.currentLocBtn} onPress={useCurrentLocation}>
        <Ionicons name="locate" size={20} color={Colors.light.primary} />
        <Text style={styles.currentLocText}>Use Current Location</Text>
        <ActivityIndicator animating={loading && search === ''} size="small" color={Colors.light.primary} style={{marginLeft: 10}} />
      </TouchableOpacity>

      <FlatList
        data={results}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => (
          <Animated.TouchableOpacity 
            entering={FadeInDown.delay(index * 50)}
            style={styles.resultItem}
            onPress={() => handleSelect(item)}
          >
            <View style={styles.resultIcon}>
              <Ionicons name="location-outline" size={22} color="#666" />
            </View>
            <View style={styles.resultText}>
              <Text style={styles.resultName}>{item.name}</Text>
              <Text style={styles.resultAddr}>{item.address}</Text>
            </View>
          </Animated.TouchableOpacity>
        )}
        ListEmptyComponent={
          search.length > 2 && !loading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={50} color="#EEE" />
              <Text style={styles.emptyText}>No results found for "{search}"</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  backBtn: { padding: 5, marginRight: 15 },
  title: { fontSize: 20, fontWeight: '900', color: Colors.light.text },
  searchSection: { paddingHorizontal: 20, paddingBottom: 15 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 55,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  input: { flex: 1, marginLeft: 10, fontSize: 16, color: Colors.light.text, fontWeight: '600' },
  currentLocBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  currentLocText: { marginLeft: 15, fontSize: 16, fontWeight: '800', color: Colors.light.primary },
  list: { paddingHorizontal: 20 },
  resultItem: { flexDirection: 'row', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#F9FAFB', alignItems: 'center' },
  resultIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F9FAFB', alignItems: 'center', justifyContent: 'center' },
  resultText: { flex: 1, marginLeft: 15 },
  resultName: { fontSize: 16, fontWeight: '800', color: Colors.light.text },
  resultAddr: { fontSize: 13, color: '#999', marginTop: 2, fontWeight: '500' },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 15, color: '#999', fontSize: 14, fontWeight: '600' },
});
