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
  Dimensions,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useLocationStore } from '@/store/useLocationStore';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

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
  const [showForm, setShowForm] = useState(false);
  const [tempAddress, setTempAddress] = useState<any>(null);
  
  // Form fields
  const [flat, setFlat] = useState('');
  const [area, setArea] = useState('');
  const [label, setLabel] = useState('Home'); // Home, Work, Other
  
  const router = useRouter();
  const { setCurrentAddress, addAddress, savedAddresses, setDefaultAddress, removeAddress } = useLocationStore();

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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setTempAddress(item);
    setArea(item.address);
    setShowForm(true);
  };

  const saveAddress = () => {
    if (!flat || !area) {
      alert('Please enter flat/house no and area');
      return;
    }

    const id = Math.random().toString(36).substr(2, 9);
    const newAddr = {
      id,
      flat,
      area,
      label,
      type: label,
      coordinates: tempAddress?.coordinates || { latitude: 28.6139, longitude: 77.2090 },
      city: tempAddress?.city || '',
    };

    addAddress(newAddr);
    // Also set as current
    setCurrentAddress(newAddr);
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowForm(false);
    router.back();
  };

  const useCurrentLocation = async () => {
    try {
      setLoading(true);
      
      // Check if location services are enabled
      const enabled = await Location.hasServicesEnabledAsync();
      if (!enabled) {
        alert('Location services are disabled. Please enable them in settings.');
        return;
      }

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access location was denied');
        return;
      }

      // Try to get current position with timeout and fallback
      let location;
      try {
        location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
      } catch (err) {
        // Fallback to last known position if current fails
        location = await Location.getLastKnownPositionAsync();
      }

      if (!location) {
        alert('Could not fetch your location. Please try searching for your area.');
        return;
      }

      let reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });

      if (reverseGeocode.length > 0) {
        const addr = reverseGeocode[0];
        handleSelect({
          name: addr.name || 'Current Location',
          address: `${addr.name || ''} ${addr.street || ''}, ${addr.city || ''}, ${addr.region || ''}`,
          coordinates: { latitude: location.coords.latitude, longitude: location.coords.longitude }
        });
      } else {
        // Just use coordinates if reverse geocode fails
        handleSelect({
          name: 'Current Location',
          address: 'Selected via GPS',
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
        <Text style={styles.title}>Delivery Address</Text>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={Colors.light.primary} />
          <TextInput
            style={styles.input}
            placeholder="Search for area, street..."
            value={search}
            onChangeText={handleSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={20} color="#CCC" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {!search && (
          <>
            <TouchableOpacity style={styles.currentLocBtn} onPress={useCurrentLocation}>
              <View style={styles.locIconCircle}>
                <Ionicons name="locate" size={20} color={Colors.light.primary} />
              </View>
              <View style={{marginLeft: 15, flex: 1}}>
                <Text style={styles.currentLocText}>Use Current Location</Text>
                <Text style={styles.currentLocSub}>Using GPS for better accuracy</Text>
              </View>
              <ActivityIndicator animating={loading} size="small" color={Colors.light.primary} />
            </TouchableOpacity>

            {savedAddresses.length > 0 && (
              <View style={styles.savedSection}>
                <Text style={styles.sectionLabel}>SAVED ADDRESSES</Text>
                {savedAddresses.map((addr, index) => (
                  <View key={addr.id} style={styles.savedItemContainer}>
                    <TouchableOpacity 
                      style={styles.savedItem}
                      onPress={() => {
                        setCurrentAddress(addr);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        router.back();
                      }}
                    >
                      <View style={styles.savedIcon}>
                        <Ionicons 
                          name={addr.label === 'Home' ? 'home' : addr.label === 'Work' ? 'briefcase' : 'location'} 
                          size={20} 
                          color="#666" 
                        />
                      </View>
                      <View style={{marginLeft: 15, flex: 1}}>
                        <Text style={styles.savedLabel}>{addr.label}</Text>
                        <Text style={styles.savedAddr} numberOfLines={1}>{addr.flat}, {addr.area}</Text>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.deleteBtn}
                      onPress={() => {
                        removeAddress(addr.id);
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                      }}
                    >
                      <Ionicons name="trash-outline" size={18} color="#FF4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </>
        )}

        {search.length > 0 && (
          <View style={{paddingHorizontal: 20}}>
             {loading ? (
               <ActivityIndicator style={{marginTop: 20}} color={Colors.light.primary} />
             ) : (
               results.map((item, index) => (
                <TouchableOpacity 
                  key={item.id}
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
                </TouchableOpacity>
               ))
             )}
             {results.length === 0 && search.length > 2 && !loading && (
                <View style={styles.emptyContainer}>
                  <Ionicons name="search-outline" size={50} color="#EEE" />
                  <Text style={styles.emptyText}>No results found</Text>
                </View>
             )}
          </View>
        )}
      </ScrollView>

      {/* Address Details Form Modal */}
      <Modal visible={showForm} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContent}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Address Details</Text>
              <TouchableOpacity onPress={() => setShowForm(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{padding: 20}}>
               <Text style={styles.inputLabel}>FLAT / HOUSE NO / FLOOR</Text>
               <TextInput
                 style={styles.formInput}
                 placeholder="E.g. Flat 101, Ground Floor"
                 value={flat}
                 onChangeText={setFlat}
               />

               <Text style={styles.inputLabel}>AREA / LOCALITY</Text>
               <TextInput
                 style={[styles.formInput, { height: 80 }]}
                 placeholder="E.g. Sector 44, Near Huda City Center"
                 multiline
                 value={area}
                 onChangeText={setArea}
               />

               <Text style={styles.inputLabel}>SAVE AS</Text>
               <View style={styles.labelRow}>
                  {['Home', 'Work', 'Other'].map(l => (
                    <TouchableOpacity 
                      key={l}
                      style={[styles.labelBtn, label === l && styles.activeLabelBtn]}
                      onPress={() => setLabel(l)}
                    >
                      <Ionicons 
                        name={l === 'Home' ? 'home' : l === 'Work' ? 'briefcase' : 'location'} 
                        size={16} 
                        color={label === l ? '#1A1A1A' : '#666'} 
                      />
                      <Text style={[styles.labelBtnText, label === l && styles.activeLabelBtnText]}>{l}</Text>
                    </TouchableOpacity>
                  ))}
               </View>

               <TouchableOpacity style={styles.saveBtn} onPress={saveAddress}>
                  <Text style={styles.saveBtnText}>Save and Continue</Text>
               </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
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
    backgroundColor: '#FFFDF5',
    marginHorizontal: 20,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.light.primary + '20',
  },
  locIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  currentLocText: { fontSize: 16, fontWeight: '900', color: Colors.light.primary },
  currentLocSub: { fontSize: 12, color: '#999', marginTop: 2, fontWeight: '500' },
  savedSection: { paddingHorizontal: 20, marginTop: 10 },
  sectionLabel: { fontSize: 12, fontWeight: '900', color: '#999', letterSpacing: 1, marginBottom: 15 },
  savedItemContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
  savedItem: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  savedIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F9FAFB', alignItems: 'center', justifyContent: 'center' },
  savedLabel: { fontSize: 16, fontWeight: '900', color: Colors.light.text },
  savedAddr: { fontSize: 13, color: '#999', marginTop: 2, fontWeight: '500' },
  deleteBtn: { padding: 10 },
  list: { paddingHorizontal: 20 },
  resultItem: { flexDirection: 'row', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#F9FAFB', alignItems: 'center' },
  resultIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F9FAFB', alignItems: 'center', justifyContent: 'center' },
  resultText: { flex: 1, marginLeft: 15 },
  resultName: { fontSize: 16, fontWeight: '800', color: Colors.light.text },
  resultAddr: { fontSize: 13, color: '#999', marginTop: 2, fontWeight: '500' },
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { marginTop: 15, color: '#999', fontSize: 14, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, maxHeight: height * 0.8 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 25, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  modalTitle: { fontSize: 18, fontWeight: '900', color: Colors.light.text },
  inputLabel: { fontSize: 11, fontWeight: '900', color: '#999', letterSpacing: 1, marginBottom: 10, marginTop: 20 },
  formInput: { backgroundColor: '#F9FAFB', borderRadius: 15, padding: 15, fontSize: 15, fontWeight: '600', color: '#000', borderWidth: 1, borderColor: '#F3F4F6' },
  labelRow: { flexDirection: 'row', gap: 12, marginTop: 10 },
  labelBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 15, backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#F3F4F6' },
  activeLabelBtn: { backgroundColor: Colors.light.primary, borderColor: Colors.light.primary },
  labelBtnText: { fontSize: 14, fontWeight: '800', color: '#666' },
  activeLabelBtnText: { color: '#1A1A1A' },
  saveBtn: { backgroundColor: Colors.light.primary, height: 60, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginTop: 35, shadowColor: Colors.light.primary, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  saveBtnText: { fontSize: 17, fontWeight: '900', color: '#1A1A1A' },
});
