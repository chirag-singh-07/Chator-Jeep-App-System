import React, { useMemo, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useLocationStore, Address } from '@/store/useLocationStore';
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
import api from '@/lib/api';

const { width, height } = Dimensions.get('window');

export default function AddressPickerScreen() {
  const router = useRouter();
  const { setCurrentAddress, addAddress, savedAddresses, removeAddress } = useLocationStore();

  const [search, setSearch] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [tempAddress, setTempAddress] = useState<any>(null);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

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
    if (text.trim().length > 2) {
      setLoading(true);
      try {
        const res = await api.get(`/maps/autocomplete?input=${encodeURIComponent(text.trim())}`);
        if (res.data?.status === 'OK' && res.data?.predictions) {
          const formattedResults = res.data.predictions.map((p: any) => ({
            id: p.place_id,
            name: p.structured_formatting?.main_text || p.description,
            address: p.structured_formatting?.secondary_text || p.description,
            isGooglePlace: true,
          }));
          setResults(formattedResults);
        } else {
          setResults([]);
        }
      } catch (error) {
        console.error('Maps Autocomplete API error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    } else {
      setResults([]);
    }
  };

  const handleSelectPlace = async (item: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    let addressDetails = item;

    if (item.isGooglePlace) {
      setLoading(true);
      try {
        const res = await api.get(`/maps/details?place_id=${item.id}`);
        if (res.data?.status === 'OK' && res.data?.result) {
          const result = res.data.result;
          const lat = result.geometry?.location?.lat;
          const lng = result.geometry?.location?.lng;

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
            coordinates: { latitude: lat || 28.7041, longitude: lng || 77.1025 },
          };
        }
      } catch (error) {
        console.error('Maps Details API error:', error);
      } finally {
        setLoading(false);
      }
    }

    setEditingAddressId(null);
    setTempAddress(addressDetails);
    setAddressDraft({
      fullAddress: sanitizeAddressInput(
        'fullAddress',
        addressDetails.address || addressDetails.name || addressDetails.street || 'Current Location',
      ),
      landmark: '',
      state: sanitizeAddressInput('state', addressDetails.region || ''),
      district: sanitizeAddressInput('district', addressDetails.district || ''),
      city: sanitizeAddressInput('city', addressDetails.city || ''),
      pinCode: sanitizeAddressInput('pinCode', addressDetails.postalCode || ''),
    });
    setTouchedFields({});
    setLabel('Home');
    setShowForm(true);
  };

  const openManualForm = () => {
    setEditingAddressId(null);
    setTempAddress(null);
    setAddressDraft(emptyAddressDraft);
    setTouchedFields({});
    setLabel('Home');
    setShowForm(true);
  };

  const handleEditAddress = (addr: Address) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditingAddressId(addr.id || addr._id || null);
    setTempAddress({ coordinates: addr.coordinates });
    setAddressDraft({
      fullAddress: addr.flat || addr.line1 || '',
      landmark: (addr as any).landmark || '',
      state: (addr as any).state || '',
      district: (addr as any).district || '',
      city: addr.city || '',
      pinCode: addr.pincode || '',
    });
    setLabel(addr.label || addr.type || 'Home');
    setTouchedFields({});
    setShowForm(true);
  };

  const saveAddress = async () => {
    if (savingAddress) return;

    if (!addressValidation.isValid) {
      markAllAddressFieldsTouched();
      Alert.alert('Incomplete Form', 'Please correct the highlighted address fields before saving.');
      return;
    }

    setSavingAddress(true);
    try {
      const id = editingAddressId || Math.random().toString(36).substr(2, 9);
      const formattedAddress = formatAddressLine(addressDraft);
      const fullAddressValue = addressValidation.fields.fullAddress.value;

      const newAddr: Address = {
        id,
        _id: id,
        flat: fullAddressValue,
        area: `${addressValidation.fields.city.value}, ${addressValidation.fields.district.value}`,
        city: addressValidation.fields.city.value,
        pincode: addressValidation.fields.pinCode.value,
        label,
        type: label,
        line1: formattedAddress,
        address: formattedAddress,
        coordinates: tempAddress?.coordinates || { latitude: 28.7041, longitude: 77.1025 },
      };

      if (editingAddressId) {
        await removeAddress(editingAddressId);
      }

      await addAddress(newAddr);
      setCurrentAddress(newAddr);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowForm(false);
      setEditingAddressId(null);
      router.back();
    } catch (err) {
      console.error('Failed to save address:', err);
      Alert.alert('Error', 'Failed to save address. Please try again.');
    } finally {
      setSavingAddress(false);
    }
  };

  const useCurrentLocation = async () => {
    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const enabled = await Location.hasServicesEnabledAsync();
      if (!enabled) {
        Alert.alert('Location Disabled', 'Location services are disabled on your device. Please turn on GPS.');
        return;
      }

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Permission to access current location was denied.');
        return;
      }

      let location;
      try {
        location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
      } catch {
        location = await Location.getLastKnownPositionAsync();
      }

      if (!location) {
        Alert.alert('Location Error', 'Could not fetch your current GPS position. Please try searching your area.');
        return;
      }

      let reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (reverseGeocode.length > 0) {
        const addr = reverseGeocode[0];
        handleSelectPlace({
          name: addr.name || addr.street || 'Current GPS Location',
          address: `${addr.name || ''} ${addr.street || ''}, ${addr.city || ''}, ${addr.region || ''} ${addr.postalCode || ''}`,
          postalCode: addr.postalCode || '',
          city: addr.city || addr.subregion || '',
          district: addr.subregion || addr.city || '',
          region: addr.region || '',
          coordinates: { latitude: location.coords.latitude, longitude: location.coords.longitude },
        });
      } else {
        handleSelectPlace({
          name: 'Current Location',
          address: 'Selected via GPS',
          coordinates: { latitude: location.coords.latitude, longitude: location.coords.longitude },
        });
      }
    } catch (error) {
      console.error('GPS Location Error:', error);
      Alert.alert('Error', 'Failed to acquire location. Please search for your street manually.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeHeader} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Delivery Address</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#D97706" />
            <TextInput
              style={styles.input}
              placeholder="Search area, apartment, street name..."
              value={search}
              onChangeText={handleSearch}
              placeholderTextColor="#9CA3AF"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => handleSearch('')} style={styles.clearBtn}>
                <Ionicons name="close-circle" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {!search && (
          <View style={styles.bodyContent}>
            {/* GPS Location Action Card */}
            <TouchableOpacity style={styles.currentLocBtn} onPress={useCurrentLocation} activeOpacity={0.88}>
              <View style={styles.locIconCircle}>
                <Ionicons name="locate" size={22} color="#D97706" />
              </View>

              <View style={{ marginLeft: 14, flex: 1 }}>
                <Text style={styles.currentLocText}>Use Current Location</Text>
                <Text style={styles.currentLocSub}>Using GPS for pinpoint accuracy</Text>
              </View>
              {loading ? (
                <ActivityIndicator size="small" color="#D97706" />
              ) : (
                <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
              )}
            </TouchableOpacity>

            {/* Enter Address Manually Card */}
            <TouchableOpacity style={styles.manualBtn} onPress={openManualForm} activeOpacity={0.88}>
              <View style={styles.manualBtnIcon}>
                <Ionicons name="create-outline" size={20} color="#374151" />
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={styles.manualBtnText}>Enter Address Manually</Text>
                <Text style={styles.manualBtnSubText}>Add flat, building, landmark, city & pincode</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </TouchableOpacity>

            {savedAddresses.length === 0 ? (
              <View style={styles.emptyHintBox}>
                <Ionicons name="location-outline" size={32} color="#F59E0B" style={{ marginBottom: 8 }} />
                <Text style={styles.emptyHintTitle}>No Saved Addresses Yet</Text>
                <Text style={styles.emptyHintText}>Save your home or office location here for 1-click checkout next time.</Text>
              </View>
            ) : (
              <View style={styles.savedSection}>
                <Text style={styles.savedSectionTitle}>SAVED ADDRESSES ({savedAddresses.length})</Text>

                {savedAddresses.map((addr, index) => {
                  const labelType = (addr.label || addr.type || 'Home').toUpperCase();
                  const getIcon = () => {
                    if (labelType.includes('HOME')) return 'home';
                    if (labelType.includes('WORK') || labelType.includes('OFFICE')) return 'briefcase';
                    return 'location';
                  };

                  return (
                    <Animated.View key={addr.id || addr._id || index} entering={FadeInDown.delay(index * 50)}>
                      <View style={styles.addressCard}>
                        <TouchableOpacity
                          style={{ flex: 1 }}
                          activeOpacity={0.8}
                          onPress={() => {
                            setCurrentAddress(addr);
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            router.back();
                          }}
                        >
                          <View style={styles.addressTop}>
                            <View style={styles.addressTag}>
                              <View style={styles.addressTagIcon}>
                                <Ionicons name={getIcon()} size={16} color="#D97706" />
                              </View>
                              <Text style={styles.addressTagText}>{addr.label || addr.type || 'Home'}</Text>
                            </View>
                          </View>
                          <Text style={styles.addressFlatLine} numberOfLines={1}>{addr.flat || addr.line1}</Text>
                          <Text style={styles.addressSubLine} numberOfLines={2}>{addr.area || addr.city}</Text>
                        </TouchableOpacity>

                        <View style={styles.addressActions}>
                          <TouchableOpacity style={styles.addressEditBtn} onPress={() => handleEditAddress(addr)}>
                            <Ionicons name="pencil" size={12} color="#1F2937" style={{ marginRight: 4 }} />
                            <Text style={styles.addressEditBtnText}>Edit</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.addressDeleteBtn}
                            onPress={() => {
                              Alert.alert('Delete Address', 'Are you sure you want to delete this saved address?', [
                                { text: 'Cancel', style: 'cancel' },
                                {
                                  text: 'Delete',
                                  style: 'destructive',
                                  onPress: () => {
                                    removeAddress(addr.id || (addr as any)._id);
                                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                                  },
                                },
                              ]);
                            }}
                          >
                            <Ionicons name="trash-outline" size={12} color="#EF4444" style={{ marginRight: 4 }} />
                            <Text style={styles.addressDeleteBtnText}>Delete</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </Animated.View>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* Search Results Autocomplete Dropdown */}
        {search.length > 0 && (
          <View style={{ paddingHorizontal: 20, paddingTop: 10 }}>
            {loading ? (
              <ActivityIndicator style={{ marginTop: 30 }} color="#D97706" size="large" />
            ) : results.length > 0 ? (
              results.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.resultItem}
                  onPress={() => handleSelectPlace(item)}
                  activeOpacity={0.8}
                >
                  <View style={styles.resultIcon}>
                    <Ionicons name="location-outline" size={20} color="#D97706" />
                  </View>
                  <View style={styles.resultText}>
                    <Text style={styles.resultName}>{item.name}</Text>
                    <Text style={styles.resultAddr} numberOfLines={2}>{item.address}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                </TouchableOpacity>
              ))
            ) : search.length > 2 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={48} color="#D1D5DB" />
                <Text style={styles.emptyText}>No matching locations found</Text>
                <Text style={styles.emptySubText}>Try searching for a landmark, city, or pincode</Text>
              </View>
            ) : null}
          </View>
        )}
      </ScrollView>

      {/* Address Details Form Modal */}
      <Modal visible={showForm} animationType="slide" transparent statusBarTranslucent>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setShowForm(false)} />

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContent}
          >
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingAddressId ? 'Edit Address' : 'Add Delivery Address'}</Text>
              <TouchableOpacity onPress={() => setShowForm(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={20} color="#374151" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
              <ValidatedAddressField
                label="HOUSE NO / FLAT / BUILDING / STREET"
                placeholder="e.g. Flat 402, Sunshine Heights, MG Road"
                value={addressDraft.fullAddress}
                onChangeText={(value) => updateAddressField('fullAddress', value)}
                onSubmitEditing={() => landmarkRef.current?.focus()}
                returnKeyType="next"
                maxLength={150}
                touched={touchedFields.fullAddress}
                valid={addressValidation.fields.fullAddress.isValid}
                error={touchedFields.fullAddress ? addressValidation.fields.fullAddress.error : ''}
              />

              <ValidatedAddressField
                ref={landmarkRef}
                label="LANDMARK (OPTIONAL)"
                placeholder="e.g. Near Metro Station / Opposite City Hospital"
                value={addressDraft.landmark}
                onChangeText={(value) => updateAddressField('landmark', value)}
                onSubmitEditing={() => cityRef.current?.focus()}
                returnKeyType="next"
                maxLength={90}
                touched={touchedFields.landmark}
                valid={addressValidation.fields.landmark.isValid}
                error={touchedFields.landmark ? addressValidation.fields.landmark.error : ''}
              />

              <View style={styles.formRow2}>
                <View style={{ flex: 1 }}>
                  <ValidatedAddressField
                    ref={cityRef}
                    label="CITY / TOWN"
                    placeholder="e.g. Mumbai"
                    value={addressDraft.city}
                    onChangeText={(value) => updateAddressField('city', value)}
                    onSubmitEditing={() => districtRef.current?.focus()}
                    returnKeyType="next"
                    maxLength={60}
                    touched={touchedFields.city}
                    valid={addressValidation.fields.city.isValid}
                    error={touchedFields.city ? addressValidation.fields.city.error : ''}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <ValidatedAddressField
                    ref={pinCodeRef}
                    label="PIN CODE"
                    placeholder="e.g. 400001"
                    value={addressDraft.pinCode}
                    onChangeText={(value) => updateAddressField('pinCode', value)}
                    keyboardType="number-pad"
                    returnKeyType="next"
                    maxLength={6}
                    touched={touchedFields.pinCode}
                    valid={addressValidation.fields.pinCode.isValid}
                    error={touchedFields.pinCode ? addressValidation.fields.pinCode.error : ''}
                  />
                </View>
              </View>

              <View style={styles.formRow2}>
                <View style={{ flex: 1 }}>
                  <ValidatedAddressField
                    ref={districtRef}
                    label="DISTRICT"
                    placeholder="e.g. Suburban"
                    value={addressDraft.district}
                    onChangeText={(value) => updateAddressField('district', value)}
                    onSubmitEditing={() => stateRef.current?.focus()}
                    returnKeyType="next"
                    maxLength={70}
                    touched={touchedFields.district}
                    valid={addressValidation.fields.district.isValid}
                    error={touchedFields.district ? addressValidation.fields.district.error : ''}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <ValidatedAddressField
                    ref={stateRef}
                    label="STATE"
                    placeholder="e.g. Maharashtra"
                    value={addressDraft.state}
                    onChangeText={(value) => updateAddressField('state', value)}
                    returnKeyType="done"
                    maxLength={60}
                    touched={touchedFields.state}
                    valid={addressValidation.fields.state.isValid}
                    error={touchedFields.state ? addressValidation.fields.state.error : ''}
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>SAVE ADDRESS AS</Text>
              <View style={styles.labelRow}>
                {['Home', 'Work', 'Other'].map((l) => (
                  <TouchableOpacity
                    key={l}
                    style={[styles.labelBtn, label === l && styles.activeLabelBtn]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setLabel(l);
                    }}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={l === 'Home' ? 'home' : l === 'Work' ? 'briefcase' : 'location'}
                      size={16}
                      color={label === l ? '#FFF' : '#4B5563'}
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
                activeOpacity={0.9}
              >
                {savingAddress ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.saveBtnText}>{editingAddressId ? 'UPDATE ADDRESS' : 'SAVE ADDRESS'}</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  safeHeader: { backgroundColor: '#FFF', paddingBottom: 12 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#111827' },
  searchSection: { paddingHorizontal: 20, paddingTop: 4 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 52,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  input: { flex: 1, marginLeft: 10, fontSize: 15, color: '#111827', fontWeight: '600' },
  clearBtn: { padding: 4 },
  bodyContent: { padding: 20 },
  currentLocBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  locIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentLocText: { fontSize: 16, fontWeight: '900', color: '#D97706' },
  currentLocSub: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  manualBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  manualBtnIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  manualBtnText: { fontSize: 15, fontWeight: '900', color: '#111827' },
  manualBtnSubText: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  emptyHintBox: {
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderRadius: 20,
    padding: 20,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  emptyHintTitle: { fontSize: 16, fontWeight: '900', color: '#92400E' },
  emptyHintText: { fontSize: 13, color: '#B45309', textAlign: 'center', marginTop: 4, lineHeight: 18 },
  savedSection: { marginTop: 10 },
  savedSectionTitle: { fontSize: 12, fontWeight: '800', color: '#6B7280', letterSpacing: 0.8, marginBottom: 12 },
  addressCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  addressTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  addressTag: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  addressTagIcon: { width: 28, height: 28, borderRadius: 10, backgroundColor: '#FEF3C7', alignItems: 'center', justifyContent: 'center' },
  addressTagText: { fontSize: 13, fontWeight: '800', color: '#B45309' },
  addressFlatLine: { fontSize: 14, fontWeight: '800', color: '#111827', marginBottom: 2 },
  addressSubLine: { fontSize: 12, color: '#6B7280', lineHeight: 17 },
  addressActions: { flexDirection: 'row', gap: 10, marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  addressEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  addressEditBtnText: { fontSize: 12, fontWeight: '800', color: '#1F2937' },
  addressDeleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  addressDeleteBtnText: { fontSize: 12, fontWeight: '800', color: '#EF4444' },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  resultIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultText: { flex: 1, marginLeft: 12, marginRight: 8 },
  resultName: { fontSize: 15, fontWeight: '800', color: '#111827' },
  resultAddr: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 50 },
  emptyText: { fontSize: 16, fontWeight: '800', color: '#374151', marginTop: 12 },
  emptySubText: { fontSize: 13, color: '#9CA3AF', marginTop: 4 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: height * 0.9,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginTop: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: { fontSize: 18, fontWeight: '900', color: '#111827' },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formRow2: { flexDirection: 'row' },
  inputLabel: { fontSize: 11, fontWeight: '900', color: '#6B7280', letterSpacing: 0.8, marginBottom: 10, marginTop: 15 },
  labelRow: { flexDirection: 'row', gap: 10 },
  labelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activeLabelBtn: { backgroundColor: '#F59E0B', borderColor: '#F59E0B' },
  labelBtnText: { fontSize: 14, fontWeight: '800', color: '#4B5563' },
  activeLabelBtnText: { color: '#FFF' },
  saveBtn: {
    backgroundColor: '#111827',
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
  },
  saveBtnDisabled: { opacity: 0.45 },
  saveBtnText: { fontSize: 16, fontWeight: '900', color: '#FFF', letterSpacing: 0.5 },
});
