import React, { useMemo, useRef, useState } from 'react';
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
  ScrollView,
  StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useLocationStore } from '@/store/useLocationStore';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { ValidatedAddressField } from '@/components/ValidatedAddressField';
import {
  AddressDraft,
  AddressFieldName,
  emptyAddressDraft,
  formatAddressLine,
  sanitizeAddressInput,
  validateAddressDraft,
} from '@/lib/addressValidation';

const { width, height } = Dimensions.get('window');

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';

export default function AddressPickerScreen() {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [tempAddress, setTempAddress] = useState<any>(null);
  
  // Form fields
  const [addressDraft, setAddressDraft] = useState<AddressDraft>(emptyAddressDraft);
  const [touchedFields, setTouchedFields] = useState<Partial<Record<AddressFieldName, boolean>>>({});
  const [label, setLabel] = useState('Home'); // Home, Work, Other
  const [savingAddress, setSavingAddress] = useState(false);
  const landmarkRef = useRef<TextInput>(null);
  const stateRef = useRef<TextInput>(null);
  const districtRef = useRef<TextInput>(null);
  const cityRef = useRef<TextInput>(null);
  const pinCodeRef = useRef<TextInput>(null);
  
  const router = useRouter();
  const { setCurrentAddress, addAddress, savedAddresses, removeAddress } = useLocationStore();
  const addressValidation = useMemo(
    () => validateAddressDraft(addressDraft),
    [addressDraft],
  );

  const updateAddressField = (field: AddressFieldName, value: string) => {
    setTouchedFields((current) => ({ ...current, [field]: true }));
    setAddressDraft((current) => ({
      ...current,
      [field]: sanitizeAddressInput(field, value),
    }));
  };

  const markAllAddressFieldsTouched = () => {
    setTouchedFields({
      fullAddress: true,
      landmark: true,
      state: true,
      district: true,
      city: true,
      pinCode: true,
    });
  };

  const handleSearch = async (text: string) => {
    setSearch(text);
    if (text.length > 2 && GOOGLE_MAPS_API_KEY) {
      setLoading(true);
      try {
        const response = await fetch(`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(text)}&key=${GOOGLE_MAPS_API_KEY}&components=country:in`);
        const data = await response.json();
        if (data.status === 'OK') {
          const formattedResults = data.predictions.map((p: any) => ({
            id: p.place_id,
            name: p.structured_formatting.main_text,
            address: p.structured_formatting.secondary_text,
            isGooglePlace: true,
          }));
          setResults(formattedResults);
        } else {
          setResults([]);
        }
      } catch (error) {
        console.error("Google Maps API error:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    } else {
      setResults([]);
    }
  };

  const handleSelect = async (item: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    let addressDetails = item;

    if (item.isGooglePlace && GOOGLE_MAPS_API_KEY) {
      setLoading(true);
      try {
        const response = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${item.id}&key=${GOOGLE_MAPS_API_KEY}&fields=geometry,address_component,formatted_address,name`);
        const data = await response.json();
        if (data.status === 'OK') {
          const result = data.result;
          const lat = result.geometry.location.lat;
          const lng = result.geometry.location.lng;
          
          let city = '';
          let state = '';
          let district = '';
          let postalCode = '';
          
          result.address_components?.forEach((c: any) => {
            if (c.types.includes('locality')) city = c.long_name;
            if (c.types.includes('administrative_area_level_1')) state = c.long_name;
            if (c.types.includes('administrative_area_level_2')) district = c.long_name;
            if (c.types.includes('postal_code')) postalCode = c.long_name;
          });

          addressDetails = {
            id: item.id,
            name: result.name || item.name,
            address: result.formatted_address || item.address,
            city: city || district,
            district,
            region: state,
            postalCode,
            coordinates: { latitude: lat, longitude: lng }
          };
        }
      } catch (error) {
        console.error("Google Maps Details API error:", error);
      } finally {
        setLoading(false);
      }
    }

    setTempAddress(addressDetails);
    setAddressDraft({
      fullAddress: sanitizeAddressInput(
        "fullAddress",
        addressDetails.address || addressDetails.name || addressDetails.street || "Current Location",
      ),
      landmark: "",
      state: sanitizeAddressInput("state", addressDetails.region || ""),
      district: sanitizeAddressInput("district", addressDetails.district || ""),
      city: sanitizeAddressInput("city", addressDetails.city || ""),
      pinCode: sanitizeAddressInput("pinCode", addressDetails.postalCode || ""),
    });
    setTouchedFields({});
    setLabel('Home');
    setShowForm(true);
  };

  const openManualForm = () => {
    setTempAddress(null);
    setAddressDraft(emptyAddressDraft);
    setTouchedFields({});
    setLabel('Home');
    setShowForm(true);
  };

  const saveAddress = async () => {
    if (savingAddress) return;

    if (!addressValidation.isValid) {
      markAllAddressFieldsTouched();
      alert('Please correct the highlighted address fields.');
      return;
    }

    setSavingAddress(true);
    const id = Math.random().toString(36).substr(2, 9);
    const formattedAddress = formatAddressLine(addressDraft);
    const fullAddressValue = addressValidation.fields.fullAddress.value;
    const newAddr = {
      id,
      flat: fullAddressValue,
      area: `${addressValidation.fields.city.value}, ${addressValidation.fields.district.value}`,
      city: addressValidation.fields.city.value,
      state: addressValidation.fields.state.value,
      district: addressValidation.fields.district.value,
      landmark: addressValidation.fields.landmark.value,
      pincode: addressValidation.fields.pinCode.value,
      label,
      type: label,
      line1: formattedAddress,
      address: formattedAddress,
      coordinates: tempAddress?.coordinates || { latitude: 0, longitude: 0 },
    };

    addAddress(newAddr as any);
    setCurrentAddress(newAddr as any);

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowForm(false);
    setSavingAddress(false);
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
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Delivery Address</Text>
        </View>

        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={22} color={Colors.light.primary} />
            <TextInput
              style={styles.input}
              placeholder="Search for area, street..."
              value={search}
              onChangeText={handleSearch}
              placeholderTextColor="#A1A1AA"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => handleSearch('')} style={styles.clearBtn}>
                <Ionicons name="close-circle" size={20} color="#A1A1AA" />
              </TouchableOpacity>
            )}
          </View>
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

            <TouchableOpacity style={styles.manualBtn} onPress={openManualForm}>
              <View style={styles.manualBtnIcon}>
                <Ionicons name="create-outline" size={20} color={Colors.light.primary} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.manualBtnText}>Enter address manually</Text>
                <Text style={styles.manualBtnSubText}>Add flat, street, city and pin code</Text>
              </View>
            </TouchableOpacity>

            {savedAddresses.length === 0 && (
              <View style={styles.emptyHintBox}>
                <Text style={styles.emptyHintTitle}>No saved addresses yet</Text>
                <Text style={styles.emptyHintText}>Save your address here so checkout is faster next time.</Text>
              </View>
            )}

            {savedAddresses.length > 0 && (
              <View style={styles.savedSection}>
                {savedAddresses.map((addr, index) => (
                  <View key={addr.id} style={styles.addressCard}>
                    <TouchableOpacity 
                      style={{flex: 1}}
                      onPress={() => {
                        setCurrentAddress(addr);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        router.back();
                      }}
                    >
                      <View style={styles.addressTop}>
                        <View style={styles.addressTag}>
                          <View style={styles.addressTagIcon}>
                            <Ionicons 
                              name={addr.label === 'Home' ? 'home' : addr.label === 'Work' ? 'briefcase' : 'location'} 
                              size={16} 
                              color="#806900" 
                            />
                          </View>
                          <Text style={styles.addressTagText}>{addr.label}</Text>
                        </View>
                      </View>
                      <Text style={styles.addressText} numberOfLines={2}>{addr.flat}, {addr.area}</Text>
                    </TouchableOpacity>
                    
                    <View style={styles.addressActions}>
                       <TouchableOpacity style={styles.addressEditBtn}>
                         <Text style={styles.addressEditBtnText}>Edit</Text>
                       </TouchableOpacity>
                       <TouchableOpacity 
                         style={styles.addressDeleteBtn}
                         onPress={() => {
                           removeAddress(addr.id);
                           Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                         }}
                       >
                         <Text style={styles.addressDeleteBtnText}>Delete</Text>
                       </TouchableOpacity>
                    </View>
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
                <Ionicons name="close" size={24} color={Colors.light.text} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{padding: 20}}>
               <ValidatedAddressField
                 label="FULL ADDRESS / HOUSE NO / STREET"
                 placeholder="Flat 101, MG Road, Near Metro Gate"
                 value={addressDraft.fullAddress}
                 onChangeText={(value) => updateAddressField("fullAddress", value)}
                 onSubmitEditing={() => landmarkRef.current?.focus()}
                 returnKeyType="next"
                 maxLength={150}
                 touched={touchedFields.fullAddress}
                 valid={addressValidation.fields.fullAddress.isValid}
                 error={touchedFields.fullAddress ? addressValidation.fields.fullAddress.error : ""}
               />

               <ValidatedAddressField
                 ref={landmarkRef}
                 label="LANDMARK (OPTIONAL)"
                 placeholder="Near City Mall"
                 value={addressDraft.landmark}
                 onChangeText={(value) => updateAddressField("landmark", value)}
                 onSubmitEditing={() => stateRef.current?.focus()}
                 returnKeyType="next"
                 maxLength={90}
                 touched={touchedFields.landmark}
                 valid={addressValidation.fields.landmark.isValid}
                 error={touchedFields.landmark ? addressValidation.fields.landmark.error : ""}
               />

               <ValidatedAddressField
                 ref={stateRef}
                 label="STATE"
                 placeholder="Maharashtra"
                 value={addressDraft.state}
                 onChangeText={(value) => updateAddressField("state", value)}
                 onSubmitEditing={() => districtRef.current?.focus()}
                 returnKeyType="next"
                 maxLength={60}
                 touched={touchedFields.state}
                 valid={addressValidation.fields.state.isValid}
                 error={touchedFields.state ? addressValidation.fields.state.error : ""}
               />

               <ValidatedAddressField
                 ref={districtRef}
                 label="DISTRICT"
                 placeholder="Mumbai"
                 value={addressDraft.district}
                 onChangeText={(value) => updateAddressField("district", value)}
                 onSubmitEditing={() => cityRef.current?.focus()}
                 returnKeyType="next"
                 maxLength={70}
                 touched={touchedFields.district}
                 valid={addressValidation.fields.district.isValid}
                 error={touchedFields.district ? addressValidation.fields.district.error : ""}
               />

               <ValidatedAddressField
                 ref={cityRef}
                 label="CITY / POST OFFICE"
                 placeholder="Andheri East"
                 value={addressDraft.city}
                 onChangeText={(value) => updateAddressField("city", value)}
                 onSubmitEditing={() => pinCodeRef.current?.focus()}
                 returnKeyType="next"
                 maxLength={60}
                 touched={touchedFields.city}
                 valid={addressValidation.fields.city.isValid}
                 error={touchedFields.city ? addressValidation.fields.city.error : ""}
               />

               <ValidatedAddressField
                 ref={pinCodeRef}
                 label="PIN CODE"
                 placeholder="400001"
                 value={addressDraft.pinCode}
                 onChangeText={(value) => updateAddressField("pinCode", value)}
                 keyboardType="number-pad"
                 returnKeyType="done"
                 maxLength={6}
                 touched={touchedFields.pinCode}
                 valid={addressValidation.fields.pinCode.isValid}
                 error={touchedFields.pinCode ? addressValidation.fields.pinCode.error : ""}
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
                        color={label === l ? '#FFF' : '#666'} 
                      />
                      <Text style={[styles.labelBtnText, label === l && styles.activeLabelBtnText]}>{l}</Text>
                    </TouchableOpacity>
                  ))}
               </View>

               <TouchableOpacity
                 style={[
                   styles.saveBtn,
                   (!addressValidation.isValid || savingAddress) && styles.saveBtnDisabled,
                 ]}
                 onPress={saveAddress}
                 disabled={!addressValidation.isValid || savingAddress}
               >
                  {savingAddress ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={styles.saveBtnText}>SAVE ADDRESS</Text>
                  )}
               </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA', paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 40) + 15 : 0 },
  headerContainer: { backgroundColor: '#FFF', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 15, elevation: 3, paddingBottom: 15, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, zIndex: 10 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 15 },
  backBtn: { padding: 10, marginRight: 15, backgroundColor: '#F4F4F5', borderRadius: 14 },
  title: { fontSize: 22, fontWeight: '900', color: Colors.light.text },
  searchSection: { paddingHorizontal: 20, paddingBottom: 15 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F4F5',
    borderRadius: 18,
    paddingHorizontal: 18,
    height: 60,
    borderWidth: 1,
    borderColor: '#E4E4E7',
  },
  clearBtn: { padding: 5 },
  input: { flex: 1, marginLeft: 10, fontSize: 16, color: Colors.light.text, fontWeight: '600' },
  currentLocBtn: {
    marginTop: 25,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    borderRadius: 24,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: Colors.light.primary + '40',
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  locIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: Colors.light.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentLocText: { fontSize: 17, fontWeight: '900', color: Colors.light.primary },
  currentLocSub: { fontSize: 12, color: '#999', marginTop: 2, fontWeight: '500' },
  savedSection: { paddingHorizontal: 18, marginTop: 14 },
  addressCard: { borderWidth: 1, borderColor: '#ECECEC', borderRadius: 18, padding: 14, marginBottom: 11, backgroundColor: '#fff' },
  addressTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 },
  addressTag: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  addressTagIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#FFF8D0', alignItems: 'center', justifyContent: 'center' },
  addressTagText: { fontSize: 13, fontFamily: 'Inter-SemiBold', color: '#161616' },
  addressText: { fontSize: 12, color: '#737373', lineHeight: 16, fontFamily: 'Inter-Regular' },
  addressActions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  addressEditBtn: { backgroundColor: '#F2F2F2', borderRadius: 10, paddingVertical: 7, paddingHorizontal: 9 },
  addressEditBtnText: { fontSize: 11, fontFamily: 'Inter-Black', color: '#161616' },
  addressDeleteBtn: { backgroundColor: '#FFF0F0', borderRadius: 10, paddingVertical: 7, paddingHorizontal: 9 },
  addressDeleteBtnText: { fontSize: 11, fontFamily: 'Inter-Black', color: '#C94444' },
  list: { paddingHorizontal: 20 },
  resultItem: { flexDirection: 'row', paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: '#F4F4F5', alignItems: 'center' },
  resultIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#F4F4F5', alignItems: 'center', justifyContent: 'center' },
  resultText: { flex: 1, marginLeft: 15 },
  resultName: { fontSize: 16, fontWeight: '800', color: Colors.light.text },
  resultAddr: { fontSize: 13, color: '#999', marginTop: 2, fontWeight: '500' },
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { marginTop: 15, color: '#999', fontSize: 14, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 35, borderTopRightRadius: 35, maxHeight: height * 0.9, borderWidth: 1, borderColor: '#F4F4F5', shadowColor: '#000', shadowOffset: {width: 0, height: -10}, shadowOpacity: 0.1, shadowRadius: 20, elevation: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 25, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  modalTitle: { fontSize: 18, fontWeight: '900', color: Colors.light.text },
  inputLabel: { fontSize: 11, fontWeight: '900', color: '#999', letterSpacing: 1, marginBottom: 10, marginTop: 20 },
  formInput: { backgroundColor: '#F9FAFB', borderRadius: 15, padding: 15, fontSize: 15, fontWeight: '600', color: '#000', borderWidth: 1, borderColor: '#F3F4F6' },
  manualBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#F4F4F5',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  manualBtnIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#F4F4F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  manualBtnText: { fontSize: 16, fontWeight: '900', color: Colors.light.text },
  manualBtnSubText: { fontSize: 13, color: '#777', marginTop: 4, fontWeight: '600' },
  emptyHintBox: { backgroundColor: '#FEFBF5', borderRadius: 20, padding: 18, marginHorizontal: 20, marginBottom: 20, borderWidth: 1, borderColor: '#F7E9C8' },
  emptyHintTitle: { fontSize: 15, fontWeight: '900', color: '#333', marginBottom: 6 },
  emptyHintText: { fontSize: 13, color: '#666', lineHeight: 20 },
  labelRow: { flexDirection: 'row', gap: 12, marginTop: 10 },
  labelBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 15, backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#F3F4F6' },
  activeLabelBtn: { backgroundColor: Colors.light.primary, borderColor: Colors.light.primary },
  labelBtnText: { fontSize: 14, fontWeight: '800', color: '#666' },
  activeLabelBtnText: { color: '#FFF' },
  saveBtn: { backgroundColor: Colors.light.primary, height: 64, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginTop: 35, shadowColor: Colors.light.primary, shadowOpacity: 0.4, shadowRadius: 15, elevation: 8, marginBottom: 20 },
  saveBtnDisabled: { opacity: 0.45 },
  saveBtnText: { fontSize: 17, fontWeight: '900', color: '#FFF' },
});
