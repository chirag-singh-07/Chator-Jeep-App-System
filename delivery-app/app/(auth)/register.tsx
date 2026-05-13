import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
  Modal,
  FlatList,
  Image,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useDeliveryStore } from "@/store/useDeliveryStore";
import { useAuthStore } from "@/store/useAuthStore";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, Radius, Shadows } from "../../constants/Colors";
import { ScreenContainer } from "@/components/ScreenContainer";
import { ThemedInput } from "@/components/ThemedInput";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ValidatedAddressField } from "@/components/ValidatedAddressField";
import { apiClient } from "@/lib/api";
import {
  AddressDraft,
  AddressFieldName,
  formatAddressLine,
  sanitizeAddressInput,
  validateAddressDraft,
} from "@/lib/addressValidation";
import Animated, {
  FadeInRight,
  FadeOutLeft,
  Layout,
} from "react-native-reanimated";

type VehicleType = "Bike" | "Cycle" | "Car";
type FuelType = "Petrol" | "EV";
type PayoutMethod = "UPI" | "BANK_ACCOUNT";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[6-9]\d{9}$/;
const aadhaarRegex = /^\d{12}$/;
const dlRegex = /^[A-Z]{2}\d{2}\s?\d{11}$/;
const panRegex = /^[A-Z]{5}\d{4}[A-Z]$/;
const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
const vehicleNumberRegex = /^[A-Z]{2}\d{1,2}[A-Z]{1,3}\d{4}$/;

const normalizeVehicleNumber = (value: string) =>
  value.replace(/\s|-/g, "").toUpperCase();

export default function RegisterScreen() {
  const router = useRouter();
  const authRegister = useAuthStore((state) => state.register);
  const requestOtp = useAuthStore((state) => state.requestOtp);
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const deliveryRegister = useDeliveryStore((state) => state.register);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [addressTouched, setAddressTouched] = useState<Partial<Record<AddressFieldName, boolean>>>({});
  const landmarkRef = useRef<TextInput>(null);
  const stateRef = useRef<TextInput>(null);
  const districtRef = useRef<TextInput>(null);
  const cityRef = useRef<TextInput>(null);
  const pinCodeRef = useRef<TextInput>(null);
  const [documentPhotos, setDocumentPhotos] = useState<{
    aadhaarPhoto: ImagePicker.ImagePickerAsset | null;
    panPhoto: ImagePicker.ImagePickerAsset | null;
    drivingLicensePhoto: ImagePicker.ImagePickerAsset | null;
    vehicleRcPhoto: ImagePicker.ImagePickerAsset | null;
    bikeInsurancePhoto: ImagePicker.ImagePickerAsset | null;
    profilePhoto: ImagePicker.ImagePickerAsset | null;
    livePhoto: ImagePicker.ImagePickerAsset | null;
  }>({
    aadhaarPhoto: null,
    panPhoto: null,
    drivingLicensePhoto: null,
    vehicleRcPhoto: null,
    bikeInsurancePhoto: null,
    profilePhoto: null,
    livePhoto: null,
  });

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    otp: "",
    vehicleType: "Bike" as VehicleType,
    fuelType: "Petrol" as FuelType,
    bikeNumber: "",
    aadhaarNumber: "",
    panNumber: "",
    drivingLicenseNumber: "",
    address: {
      buildingName: "",
      streetName: "",
      landmark: "",
      area: "",
      state: "",
      district: "",
      city: "",
      pincode: "",
    },
    payoutMethod: "UPI" as PayoutMethod,
    upiId: "",
    bankDetails: {
      bankName: "",
      accountHolderName: "",
      accountNumber: "",
      ifscCode: "",
    },
    termsAccepted: false,
  });

  const isCompletingProfile = isAuthenticated && Boolean(user);
  const addressDraft: AddressDraft = {
    fullAddress: form.address.streetName,
    landmark: form.address.landmark,
    state: form.address.state,
    district: form.address.district,
    city: form.address.city,
    pinCode: form.address.pincode,
  };

  const addressValidation = useMemo(
    () => validateAddressDraft(addressDraft),
    [addressDraft],
  );

  const updateAddressField = (field: AddressFieldName, value: string) => {
    const sanitized = sanitizeAddressInput(field, value);
    setAddressTouched((current) => ({ ...current, [field]: true }));
    setForm((current) => ({
      ...current,
      address: {
        ...current.address,
        ...(field === "fullAddress" ? { buildingName: sanitized, streetName: sanitized, area: sanitized } : {}),
        ...(field === "landmark" ? { landmark: sanitized } : {}),
        ...(field === "state" ? { state: sanitized } : {}),
        ...(field === "district" ? { district: sanitized } : {}),
        ...(field === "city" ? { city: sanitized } : {}),
        ...(field === "pinCode" ? { pincode: sanitized } : {}),
      },
    }));
  };

  const touchAllAddressFields = () => {
    setAddressTouched({
      fullAddress: true,
      landmark: true,
      state: true,
      district: true,
      city: true,
      pinCode: true,
    });
  };

  useEffect(() => {
    if (!isCompletingProfile || !user) {
      return;
    }

    setForm((current) => ({
      ...current,
      name: current.name || user.name || "",
      email: current.email || user.email || "",
      phone: current.phone || user.phone || "",
      bankDetails: {
        ...current.bankDetails,
        accountHolderName: current.bankDetails.accountHolderName || user.name || "",
      },
    }));
  }, [isCompletingProfile, user]);

  const validation = useMemo(() => {
    const personal =
      form.name.trim().length > 2 &&
      emailRegex.test(form.email.trim()) &&
      phoneRegex.test(form.phone.trim()) &&
      (isCompletingProfile ||
        (form.password.length >= 8 && /^\d{6}$/.test(form.otp.trim()))) &&
      !!form.vehicleType &&
      !!form.fuelType &&
      vehicleNumberRegex.test(normalizeVehicleNumber(form.bikeNumber));

    const documents =
      aadhaarRegex.test(form.aadhaarNumber.trim()) &&
      panRegex.test(form.panNumber.trim().toUpperCase()) &&
      dlRegex.test(form.drivingLicenseNumber.trim().toUpperCase()) &&
      Boolean(documentPhotos.aadhaarPhoto) &&
      Boolean(documentPhotos.panPhoto) &&
      Boolean(documentPhotos.drivingLicensePhoto) &&
      Boolean(documentPhotos.vehicleRcPhoto) &&
      Boolean(documentPhotos.bikeInsurancePhoto) &&
      Boolean(documentPhotos.profilePhoto) &&
      Boolean(documentPhotos.livePhoto);

    const address = addressValidation.isValid;

    const bank =
      form.bankDetails.accountHolderName.trim().length >= 3 &&
      form.bankDetails.bankName.trim().length >= 3 &&
      /^\d{9,18}$/.test(form.bankDetails.accountNumber.trim()) &&
      ifscRegex.test(form.bankDetails.ifscCode.trim().toUpperCase());

    const payout =
      form.termsAccepted &&
      (form.payoutMethod === "UPI"
        ? upiRegex.test(form.upiId.trim())
        : bank);

    return { personal, documents, address, payout };
  }, [addressValidation.isValid, documentPhotos, form, isCompletingProfile]);

  const pickDocumentPhoto = async (
    key:
      | "aadhaarPhoto"
      | "panPhoto"
      | "drivingLicensePhoto"
      | "vehicleRcPhoto"
      | "bikeInsurancePhoto"
      | "profilePhoto",
  ) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.85,
    });

    if (!result.canceled) {
      setDocumentPhotos((current) => ({ ...current, [key]: result.assets[0] }));
    }
  };

  const captureLivePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Camera permission required", "Please allow camera access to capture your live photo.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (!result.canceled) {
      setDocumentPhotos((current) => ({ ...current, livePhoto: result.assets[0] }));
    }
  };

  const appendImage = (
    formData: FormData,
    fieldName: string,
    asset: ImagePicker.ImagePickerAsset,
  ) => {
    const extension = asset.uri.split(".").pop()?.toLowerCase() || "jpg";
    const mimeType = asset.mimeType || `image/${extension === "jpg" ? "jpeg" : extension}`;

    // @ts-ignore React Native FormData accepts file-like objects.
    formData.append(fieldName, {
      uri: asset.uri,
      name: `${fieldName}.${extension}`,
      type: mimeType,
    });
  };

  const uploadDeliveryDocuments = async () => {
    const {
      aadhaarPhoto,
      panPhoto,
      drivingLicensePhoto,
      vehicleRcPhoto,
      bikeInsurancePhoto,
      profilePhoto,
      livePhoto,
    } = documentPhotos;
    if (
      !aadhaarPhoto ||
      !panPhoto ||
      !drivingLicensePhoto ||
      !vehicleRcPhoto ||
      !bikeInsurancePhoto ||
      !profilePhoto ||
      !livePhoto
    ) {
      throw new Error("All document photos are required.");
    }

    const formData = new FormData();
    appendImage(formData, "aadhaarPhoto", aadhaarPhoto);
    appendImage(formData, "panPhoto", panPhoto);
    appendImage(formData, "drivingLicensePhoto", drivingLicensePhoto);
    appendImage(formData, "vehicleRcPhoto", vehicleRcPhoto);
    appendImage(formData, "bikeInsurancePhoto", bikeInsurancePhoto);
    appendImage(formData, "profilePhoto", profilePhoto);
    appendImage(formData, "livePhoto", livePhoto);

    const response = await apiClient.post("/uploads/delivery-docs", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 60000,
    });

    return response.data.data as {
      aadhaarPhoto: { medium?: string; full?: string; thumbnail?: string };
      panPhoto: { medium?: string; full?: string; thumbnail?: string };
      drivingLicensePhoto: { medium?: string; full?: string; thumbnail?: string };
      vehicleRcPhoto: { medium?: string; full?: string; thumbnail?: string };
      bikeInsurancePhoto: { medium?: string; full?: string; thumbnail?: string };
      profilePhoto: { medium?: string; full?: string; thumbnail?: string };
      livePhoto: { medium?: string; full?: string; thumbnail?: string };
    };
  };

  const isCurrentStepValid =
    (step === 1 && validation.personal) ||
    (step === 2 && validation.documents) ||
    (step === 3 && validation.address) ||
    (step === 4 && validation.payout);

  const handleSendOtp = async () => {
    if (!emailRegex.test(form.email.trim())) {
      Alert.alert("Invalid Email", "Please enter a valid email to receive the OTP.");
      return;
    }

    setLoading(true);
    try {
      await requestOtp(form.email.trim(), "register");
      setOtpSent(true);
      Alert.alert("OTP Sent", "Please check your email for the verification code.");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const showStepError = () => {
    if (step === 3) {
      touchAllAddressFields();
    }

    const messages: Record<number, string> = {
      1: "Enter a valid name, email, Indian phone number, OTP/password, and vehicle number.",
      2: "Add Aadhaar, PAN, driving license, vehicle RC, insurance, profile selfie, and live photo.",
      3: "Complete building, street, area, state, district, city, and PIN code in the address section.",
      4: "Add a valid UPI ID or bank details and accept the terms and conditions.",
    };

    Alert.alert("Check details", messages[step]);
  };

  const handleNext = () => {
    if (!isCurrentStepValid) {
      showStepError();
      return;
    }

    if (step < 4) {
      setStep(step + 1);
      return;
    }

    handleRegister();
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else router.replace("/(auth)/login");
  };

  const handleRegister = async () => {
    setLoading(true);
    try {
      if (!isCompletingProfile) {
        await authRegister({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          phone: form.phone.trim(),
          otp: form.otp.trim(),
        });
      }

      const uploadedDocs = await uploadDeliveryDocuments();
      const getUploadedUrl = (urls: { full?: string; medium?: string; thumbnail?: string }) =>
        urls.full || urls.medium || urls.thumbnail || "";
      const aadhaarPhotoUrl =
        getUploadedUrl(uploadedDocs.aadhaarPhoto);
      const panPhotoUrl = getUploadedUrl(uploadedDocs.panPhoto);
      const drivingLicensePhotoUrl =
        getUploadedUrl(uploadedDocs.drivingLicensePhoto);
      const vehicleRcPhotoUrl = getUploadedUrl(uploadedDocs.vehicleRcPhoto);
      const bikeInsurancePhotoUrl = getUploadedUrl(uploadedDocs.bikeInsurancePhoto);
      const profilePhotoUrl = getUploadedUrl(uploadedDocs.profilePhoto);
      const livePhotoUrl = getUploadedUrl(uploadedDocs.livePhoto);

      const bankDetails =
        form.payoutMethod === "BANK_ACCOUNT"
          ? {
              accountHolderName: form.bankDetails.accountHolderName.trim(),
              bankName: form.bankDetails.bankName.trim(),
              accountNumber: form.bankDetails.accountNumber.trim(),
              ifscCode: form.bankDetails.ifscCode.trim().toUpperCase(),
            }
          : undefined;

      await deliveryRegister({
        fullName: form.name.trim(),
        phoneNumber: form.phone.trim(),
        email: form.email.trim(),
        vehicleType: form.vehicleType,
        vehicleFuelType: form.fuelType,
        bikeNumber: normalizeVehicleNumber(form.bikeNumber),
        profilePhoto: profilePhotoUrl,
        drivingLicense: form.drivingLicenseNumber.trim().toUpperCase(),
        documents: {
          aadhaarNumber: form.aadhaarNumber.trim(),
          aadhaarPhoto: aadhaarPhotoUrl,
          panNumber: form.panNumber.trim().toUpperCase(),
          panPhoto: panPhotoUrl,
          drivingLicenseNumber: form.drivingLicenseNumber.trim().toUpperCase(),
          drivingLicensePhoto: drivingLicensePhotoUrl,
          vehicleRcNumber: normalizeVehicleNumber(form.bikeNumber),
          vehicleRcPhoto: vehicleRcPhotoUrl,
          bikeInsurancePhoto: bikeInsurancePhotoUrl,
          profilePhoto: profilePhotoUrl,
          livePhoto: livePhotoUrl,
        },
        address: {
          buildingName: addressValidation.fields.fullAddress.value,
          streetName: formatAddressLine(addressDraft),
          landmark: addressValidation.fields.landmark.value,
          area: addressValidation.fields.city.value,
          state: addressValidation.fields.state.value,
          district: addressValidation.fields.district.value,
          city: addressValidation.fields.city.value,
          pincode: addressValidation.fields.pinCode.value,
        },
        payoutMethod: form.payoutMethod,
        upiId: form.payoutMethod === "UPI" ? form.upiId.trim() : undefined,
        bankDetails,
        termsAccepted: form.termsAccepted,
      });

      Alert.alert("Success!", "Registration submitted for verification.");
      router.replace("/(onboarding)/verification-pending");
    } catch (error: any) {
      Alert.alert("Registration Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderOption = (
    label: string,
    active: boolean,
    onPress: () => void,
    icon?: keyof typeof Ionicons.glyphMap,
  ) => (
    <TouchableOpacity
      key={label}
      style={[styles.optionPill, active && styles.optionPillActive]}
      onPress={onPress}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={18}
          color={active ? Colors.light.black : Colors.light.primary}
        />
      )}
      <Text style={[styles.optionText, active && styles.optionTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderPhotoTile = (
    title: string,
    subtitle: string,
    asset: ImagePicker.ImagePickerAsset | null,
    onPress: () => void,
    icon: keyof typeof Ionicons.glyphMap,
  ) => (
    <TouchableOpacity style={styles.photoTile} onPress={onPress}>
      {asset ? (
        <Image source={{ uri: asset.uri }} style={styles.photoPreview} />
      ) : (
        <View style={styles.photoPlaceholder}>
          <Ionicons name={icon} size={30} color={Colors.light.primary} />
          <Text style={styles.photoTitle}>{title}</Text>
          <Text style={styles.photoSubtitle}>{subtitle}</Text>
        </View>
      )}
      {asset && (
        <View style={styles.photoOverlay}>
          <Ionicons name="checkmark-circle" size={18} color={Colors.light.success} />
          <Text style={styles.photoOverlayText}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Animated.View key="step1" entering={FadeInRight} exiting={FadeOutLeft} style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Personal & Vehicle</Text>
            <Text style={styles.stepSubtitle}>Enter your account details and the bike you will use for deliveries.</Text>

            <ThemedInput label="Full Name" placeholder="Rahul Sharma" icon="person-outline" value={form.name} maxLength={60} onChangeText={(text) => setForm({ ...form, name: text.replace(/[^a-zA-Z\s.'-]/g, "").slice(0, 60) })} />

            {isCompletingProfile ? (
              <ThemedInput label="Email Address" placeholder="rahul@example.com" icon="mail-outline" keyboardType="email-address" autoCapitalize="none" value={form.email} onChangeText={(text) => setForm({ ...form, email: text })} />
            ) : (
              <>
                <View style={styles.otpInputGroup}>
                  <View style={{ flex: 1 }}>
                    <ThemedInput label="Email Address" placeholder="rahul@example.com" icon="mail-outline" keyboardType="email-address" autoCapitalize="none" value={form.email} maxLength={120} onChangeText={(text) => setForm({ ...form, email: text.trim() })} containerStyle={{ marginBottom: 0 }} />
                  </View>
                  <TouchableOpacity style={[styles.otpBtn, otpSent && styles.otpBtnSent]} onPress={handleSendOtp} disabled={loading}>
                    <Text style={styles.otpBtnText}>{otpSent ? "Resend" : "Get OTP"}</Text>
                  </TouchableOpacity>
                </View>
                <ThemedInput label="Verification Code (OTP)" placeholder="Enter 6-digit code" icon="shield-checkmark-outline" keyboardType="numeric" maxLength={6} value={form.otp} onChangeText={(text) => setForm({ ...form, otp: text.replace(/\D/g, "") })} />
              </>
            )}

            <ThemedInput label="Phone Number" placeholder="10 digit number" icon="call-outline" keyboardType="phone-pad" maxLength={10} value={form.phone} onChangeText={(text) => setForm({ ...form, phone: text.replace(/\D/g, "") })} />
            {!isCompletingProfile && (
              <ThemedInput
                label="Password"
                placeholder="At least 8 characters"
                icon="lock-closed-outline"
                secureTextEntry={!showPassword}
                value={form.password}
                onChangeText={(text) => setForm({ ...form, password: text })}
                maxLength={64}
                rightIcon={showPassword ? "eye-off-outline" : "eye-outline"}
                rightIconAccessibilityLabel={showPassword ? "Hide password" : "Show password"}
                onRightIconPress={() => setShowPassword((current) => !current)}
              />
            )}

            <Text style={styles.groupLabel}>Vehicle Type</Text>
            <View style={styles.optionRow}>
              {(["Bike", "Cycle", "Car"] as VehicleType[]).map((type) =>
                renderOption(type, form.vehicleType === type, () => setForm({ ...form, vehicleType: type }), type === "Car" ? "car-outline" : "bicycle-outline"),
              )}
            </View>

            <Text style={styles.groupLabel}>Bike Fuel Type</Text>
            <View style={styles.optionRow}>
              {(["Petrol", "EV"] as FuelType[]).map((type) =>
                renderOption(type, form.fuelType === type, () => setForm({ ...form, fuelType: type }), type === "EV" ? "flash-outline" : "flame-outline"),
              )}
            </View>

            <ThemedInput label="Bike Number" placeholder="GJ01AB1234" icon="barcode-outline" autoCapitalize="characters" maxLength={10} value={form.bikeNumber} onChangeText={(text) => setForm({ ...form, bikeNumber: normalizeVehicleNumber(text).slice(0, 10) })} />

            <View style={styles.loginLinkContainer}>
              <Text style={styles.loginLinkText}>Already have an account?</Text>
              <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
                <Text style={styles.loginLinkAction}>Login</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        );
      case 2:
        return (
          <Animated.View key="step2" entering={FadeInRight} exiting={FadeOutLeft} style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Documents</Text>
            <Text style={styles.stepSubtitle}>Add identity, tax, vehicle, payout, and live photo verification details.</Text>
            <ThemedInput label="Aadhaar Number" placeholder="12 digit Aadhaar number" icon="id-card-outline" keyboardType="numeric" maxLength={12} value={form.aadhaarNumber} onChangeText={(text) => setForm({ ...form, aadhaarNumber: text.replace(/\D/g, "") })} />
            {renderPhotoTile("Aadhaar Card Photo", "Choose from gallery", documentPhotos.aadhaarPhoto, () => pickDocumentPhoto("aadhaarPhoto"), "image-outline")}
            <ThemedInput label="PAN Number" placeholder="ABCDE1234F" icon="card-outline" autoCapitalize="characters" maxLength={10} value={form.panNumber} onChangeText={(text) => setForm({ ...form, panNumber: text.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 10) })} />
            {renderPhotoTile("PAN Card Photo", "Choose from gallery", documentPhotos.panPhoto, () => pickDocumentPhoto("panPhoto"), "image-outline")}
            <ThemedInput label="Driving License Number" placeholder="GJ0120231234567" icon="card-outline" autoCapitalize="characters" maxLength={16} value={form.drivingLicenseNumber} onChangeText={(text) => setForm({ ...form, drivingLicenseNumber: text.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 16) })} />
            {renderPhotoTile("Driving License Photo", "Choose from gallery", documentPhotos.drivingLicensePhoto, () => pickDocumentPhoto("drivingLicensePhoto"), "image-outline")}
            {renderPhotoTile("Vehicle RC", `${form.fuelType} ${form.vehicleType} registration`, documentPhotos.vehicleRcPhoto, () => pickDocumentPhoto("vehicleRcPhoto"), "document-text-outline")}
            {renderPhotoTile("Bike Insurance", "Valid insurance document", documentPhotos.bikeInsurancePhoto, () => pickDocumentPhoto("bikeInsurancePhoto"), "shield-checkmark-outline")}
            {renderPhotoTile("Passport-size Photo / Selfie", "Choose from gallery", documentPhotos.profilePhoto, () => pickDocumentPhoto("profilePhoto"), "person-circle-outline")}
            {renderPhotoTile("One Live Photo", "Open camera to match Aadhaar", documentPhotos.livePhoto, captureLivePhoto, "camera-outline")}
          </Animated.View>
        );
      case 3:
        return (
          <Animated.View key="step3" entering={FadeInRight} exiting={FadeOutLeft} style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Address Info</Text>
            <Text style={styles.stepSubtitle}>Type every address detail manually for verification.</Text>
            <ValidatedAddressField
              label="Full Address / House No / Street"
              placeholder="House 18, Station Road"
              value={addressDraft.fullAddress}
              maxLength={150}
              returnKeyType="next"
              onSubmitEditing={() => landmarkRef.current?.focus()}
              onChangeText={(text) => updateAddressField("fullAddress", text)}
              touched={addressTouched.fullAddress}
              valid={addressValidation.fields.fullAddress.isValid}
              error={addressTouched.fullAddress ? addressValidation.fields.fullAddress.error : ""}
            />
            <ValidatedAddressField
              ref={landmarkRef}
              label="Landmark (optional)"
              placeholder="Near city mall"
              value={addressDraft.landmark}
              maxLength={90}
              returnKeyType="next"
              onSubmitEditing={() => stateRef.current?.focus()}
              onChangeText={(text) => updateAddressField("landmark", text)}
              touched={addressTouched.landmark}
              valid={addressValidation.fields.landmark.isValid}
              error={addressTouched.landmark ? addressValidation.fields.landmark.error : ""}
            />
            <ValidatedAddressField
              ref={stateRef}
              label="State"
              placeholder="Gujarat"
              value={addressDraft.state}
              maxLength={60}
              returnKeyType="next"
              onSubmitEditing={() => districtRef.current?.focus()}
              onChangeText={(text) => updateAddressField("state", text)}
              touched={addressTouched.state}
              valid={addressValidation.fields.state.isValid}
              error={addressTouched.state ? addressValidation.fields.state.error : ""}
            />
            <ValidatedAddressField
              ref={districtRef}
              label="District"
              placeholder="Ahmedabad"
              value={addressDraft.district}
              maxLength={70}
              returnKeyType="next"
              onSubmitEditing={() => cityRef.current?.focus()}
              onChangeText={(text) => updateAddressField("district", text)}
              touched={addressTouched.district}
              valid={addressValidation.fields.district.isValid}
              error={addressTouched.district ? addressValidation.fields.district.error : ""}
            />
            <ValidatedAddressField
              ref={cityRef}
              label="City / Post Office"
              placeholder="Navrangpura"
              value={addressDraft.city}
              maxLength={60}
              returnKeyType="next"
              onSubmitEditing={() => pinCodeRef.current?.focus()}
              onChangeText={(text) => updateAddressField("city", text)}
              touched={addressTouched.city}
              valid={addressValidation.fields.city.isValid}
              error={addressTouched.city ? addressValidation.fields.city.error : ""}
            />
            <ValidatedAddressField
              ref={pinCodeRef}
              label="PIN Code"
              placeholder="380009"
              value={addressDraft.pinCode}
              keyboardType="number-pad"
              maxLength={6}
              returnKeyType="done"
              onChangeText={(text) => updateAddressField("pinCode", text)}
              touched={addressTouched.pinCode}
              valid={addressValidation.fields.pinCode.isValid}
              error={addressTouched.pinCode ? addressValidation.fields.pinCode.error : ""}
            />
          </Animated.View>
        );
      case 4:
        return (
          <Animated.View key="step4" entering={FadeInRight} exiting={FadeOutLeft} style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Payout Details</Text>
            <Text style={styles.stepSubtitle}>Choose UPI or bank details for delivery payouts.</Text>
            <View style={styles.optionRow}>
              {renderOption("UPI ID", form.payoutMethod === "UPI", () => setForm({ ...form, payoutMethod: "UPI" }), "qr-code-outline")}
              {renderOption("Bank Details", form.payoutMethod === "BANK_ACCOUNT", () => setForm({ ...form, payoutMethod: "BANK_ACCOUNT" }), "business-outline")}
            </View>

            {form.payoutMethod === "UPI" ? (
              <ThemedInput label="UPI ID" placeholder="name@upi" icon="wallet-outline" autoCapitalize="none" maxLength={80} value={form.upiId} onChangeText={(text) => setForm({ ...form, upiId: text.trim().slice(0, 80) })} />
            ) : (
              <>
                <ThemedInput label="Account Holder Name" placeholder="Rahul Sharma" icon="person-outline" maxLength={80} value={form.bankDetails.accountHolderName} onChangeText={(text) => setForm({ ...form, bankDetails: { ...form.bankDetails, accountHolderName: text.replace(/[^a-zA-Z\s.'-]/g, "").slice(0, 80) } })} />
                <ThemedInput label="Bank Name" placeholder="HDFC Bank" icon="business-outline" maxLength={60} value={form.bankDetails.bankName} onChangeText={(text) => setForm({ ...form, bankDetails: { ...form.bankDetails, bankName: text.replace(/[^a-zA-Z\s.'-]/g, "").slice(0, 60) } })} />
                <ThemedInput label="Account Number" placeholder="Your bank account number" icon="card-outline" keyboardType="numeric" maxLength={18} value={form.bankDetails.accountNumber} onChangeText={(text) => setForm({ ...form, bankDetails: { ...form.bankDetails, accountNumber: text.replace(/\D/g, "").slice(0, 18) } })} />
                <ThemedInput label="IFSC Code" placeholder="HDFC0001234" icon="code-outline" autoCapitalize="characters" maxLength={11} value={form.bankDetails.ifscCode} onChangeText={(text) => setForm({ ...form, bankDetails: { ...form.bankDetails, ifscCode: text.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 11) } })} />
              </>
            )}

            <TouchableOpacity style={styles.termsRow} onPress={() => setForm({ ...form, termsAccepted: !form.termsAccepted })}>
              <View style={[styles.checkbox, form.termsAccepted && styles.checkboxActive]}>
                {form.termsAccepted && <Ionicons name="checkmark" size={18} color={Colors.light.black} />}
              </View>
              <Text style={styles.termsText}>I agree to the Terms & Conditions for delivery partners.</Text>
            </TouchableOpacity>
            <View style={styles.legalLinksRow}>
              <TouchableOpacity onPress={() => router.push("/legal/terms" as any)}>
                <Text style={styles.legalLink}>Terms</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push("/legal/privacy" as any)}>
                <Text style={styles.legalLink}>Privacy</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push("/legal/refund" as any)}>
                <Text style={styles.legalLink}>Refund</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        );
      default:
        return null;
    }
  };

  return (
    <ScreenContainer withSafeArea>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <View style={styles.container}>
          <View style={styles.progressHeader}>
            <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
            </TouchableOpacity>
            <View style={styles.progressBarWrapper}>
              <View style={styles.progressBar}>
                <Animated.View layout={Layout.springify()} style={[styles.progressFill, { width: `${(step / 4) * 100}%` }]} />
              </View>
              <Text style={styles.stepIndicator}>Step {step} of 4</Text>
            </View>
          </View>

          <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {renderStep()}
          </ScrollView>

          <View style={styles.footer}>
            <PrimaryButton
              label={step === 4 ? "Submit for Verification" : "Continue"}
              onPress={handleNext}
              loading={loading}
              disabled={loading || !isCurrentStepValid}
              style={styles.mainBtn}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: Spacing.lg },
  progressHeader: { flexDirection: "row", alignItems: "center", marginTop: Spacing.md, gap: Spacing.md, marginBottom: Spacing.xl },
  backBtn: { width: 44, height: 44, borderRadius: Radius.lg, backgroundColor: Colors.light.surface, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: Colors.light.border },
  progressBarWrapper: { flex: 1, gap: 6 },
  progressBar: { height: 6, backgroundColor: Colors.light.surface, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: Colors.light.primary },
  stepIndicator: { fontSize: 12, fontWeight: "700", color: Colors.light.textDim, textTransform: "uppercase", letterSpacing: 1 },
  content: { flex: 1 },
  scrollContent: { paddingBottom: Spacing.xl },
  stepContainer: { flex: 1 },
  stepTitle: { fontSize: 30, fontWeight: "900", color: Colors.light.text, marginBottom: Spacing.xs },
  stepSubtitle: { fontSize: 16, color: Colors.light.textDim, lineHeight: 24, marginBottom: Spacing.xl },
  otpInputGroup: { flexDirection: "row", alignItems: "flex-end", gap: Spacing.sm, marginBottom: Spacing.md },
  otpBtn: { height: 56, paddingHorizontal: Spacing.lg, backgroundColor: Colors.light.surfaceSecondary, borderRadius: Radius.md, alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: Colors.light.primary },
  otpBtnSent: { borderColor: Colors.light.success, opacity: 0.8 },
  otpBtnText: { color: Colors.light.primary, fontWeight: "800", fontSize: 13 },
  groupLabel: { color: Colors.light.textDim, fontSize: 14, fontWeight: "700", marginBottom: Spacing.sm, marginLeft: Spacing.xs },
  optionRow: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm, marginBottom: Spacing.md },
  optionPill: { minHeight: 46, paddingHorizontal: Spacing.md, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.light.border, backgroundColor: Colors.light.surface, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: Spacing.xs },
  optionPillActive: { backgroundColor: Colors.light.primary, borderColor: Colors.light.primary },
  optionText: { color: Colors.light.text, fontWeight: "800", fontSize: 14 },
  optionTextActive: { color: Colors.light.black },
  photoTile: { height: 156, borderRadius: Radius.lg, borderWidth: 1.5, borderStyle: "dashed", borderColor: Colors.light.border, backgroundColor: Colors.light.surface, marginBottom: Spacing.md, overflow: "hidden" },
  photoPreview: { width: "100%", height: "100%" },
  photoPlaceholder: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: Spacing.md },
  photoTitle: { color: Colors.light.text, fontSize: 15, fontWeight: "900", marginTop: Spacing.sm, textAlign: "center" },
  photoSubtitle: { color: Colors.light.textMuted, fontSize: 12, fontWeight: "600", marginTop: 4 },
  photoOverlay: { position: "absolute", left: 0, right: 0, bottom: 0, minHeight: 42, backgroundColor: "rgba(0,0,0,0.72)", flexDirection: "row", alignItems: "center", gap: Spacing.xs, paddingHorizontal: Spacing.md },
  photoOverlayText: { color: Colors.light.text, fontSize: 13, fontWeight: "800" },
  selectRow: { flexDirection: "row", gap: Spacing.md, marginBottom: Spacing.md },
  selectGroup: { flex: 1 },
  pickerTrigger: { minHeight: 56, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.light.border, backgroundColor: Colors.light.surface, paddingHorizontal: Spacing.md, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: Spacing.sm },
  pickerDisabled: { opacity: 0.55 },
  pickerText: { flex: 1, color: Colors.light.text, fontWeight: "700", fontSize: 14 },
  pickerPlaceholder: { color: Colors.light.textMuted },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.72)", alignItems: "center", justifyContent: "center", padding: Spacing.lg },
  modalContent: { width: "100%", maxHeight: "72%", backgroundColor: Colors.light.surface, borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.light.border, padding: Spacing.lg },
  modalTitle: { color: Colors.light.primary, fontSize: 18, fontWeight: "900", marginBottom: Spacing.md, textAlign: "center" },
  modalItem: { paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.light.border },
  modalItemText: { color: Colors.light.text, fontSize: 15, fontWeight: "600" },
  modalClose: { marginTop: Spacing.md, height: 48, borderRadius: Radius.md, backgroundColor: Colors.light.surfaceSecondary, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: Colors.light.border },
  modalCloseText: { color: Colors.light.primary, fontWeight: "900", fontSize: 14 },
  termsRow: { flexDirection: "row", alignItems: "center", gap: Spacing.md, marginTop: Spacing.sm, paddingVertical: Spacing.md },
  checkbox: { width: 26, height: 26, borderRadius: 6, borderWidth: 1.5, borderColor: Colors.light.border, backgroundColor: Colors.light.surface, alignItems: "center", justifyContent: "center" },
  checkboxActive: { backgroundColor: Colors.light.primary, borderColor: Colors.light.primary },
  termsText: { flex: 1, color: Colors.light.textDim, fontSize: 14, lineHeight: 20, fontWeight: "600" },
  legalLinksRow: { flexDirection: "row", justifyContent: "center", gap: Spacing.lg, marginTop: Spacing.sm },
  legalLink: { color: Colors.light.primary, fontSize: 12, fontWeight: "900", letterSpacing: 1 },
  footer: { paddingBottom: Spacing.xl, paddingTop: Spacing.md },
  mainBtn: { ...Shadows.gold },
  loginLinkContainer: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: Spacing.lg, gap: Spacing.xs },
  loginLinkText: { color: Colors.light.textDim, fontSize: 14 },
  loginLinkAction: { color: Colors.light.primary, fontSize: 14, fontWeight: "700" },
});
