import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
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
  Image,
  TextInput,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useAuthStore } from "@/store/useAuthStore";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, Radius, Shadows } from "../../constants/Colors";
import { ScreenContainer } from "@/components/ScreenContainer";
import { ThemedInput } from "@/components/ThemedInput";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ValidatedAddressField } from "@/components/ValidatedAddressField";
import { apiClient } from "@/lib/api";
import { useRegistrationStore, DocumentType, DocumentInfo } from "@/store/useRegistrationStore";
import Animated, {
  FadeInRight,
  FadeOutLeft,
  Layout,
} from "react-native-reanimated";

type VehicleType = "Bike" | "Cycle" | "Car";
type FuelType = "Petrol" | "EV";
type PayoutMethod = "UPI" | "BANK_ACCOUNT";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

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
  const { register: authRegister, requestOtp: requestOtpAuth, user, isAuthenticated } = useAuthStore();

  // Registration store
  const {
    currentStep,
    formData,
    documents,
    setStep,
    updateFormField,
    updateAddressField,
    updateBankField,
    setDocument,
    clearDocument,
    clearAllData,
    hasHydrated,
  } = useRegistrationStore();

  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [previewModal, setPreviewModal] = useState<{ visible: boolean; uri: string | null; title: string }>({
    visible: false,
    uri: null,
    title: "",
  });
  const landmarkRef = useRef<TextInput>(null);
  const stateRef = useRef<TextInput>(null);
  const districtRef = useRef<TextInput>(null);
  const cityRef = useRef<TextInput>(null);
  const pinCodeRef = useRef<TextInput>(null);

  const isCompletingProfile = isAuthenticated && Boolean(user);

  const addressDraft = {
    fullAddress: formData.address.streetName,
    landmark: formData.address.landmark,
    state: formData.address.state,
    district: formData.address.district,
    city: formData.address.city,
    pinCode: formData.address.pincode,
  };

  const addressValidation = useMemo(() => {
    const fields = {
      fullAddress: { value: addressDraft.fullAddress, touched: true },
      landmark: { value: addressDraft.landmark, touched: true },
      state: { value: addressDraft.state, touched: true },
      district: { value: addressDraft.district, touched: true },
      city: { value: addressDraft.city, touched: true },
      pinCode: { value: addressDraft.pinCode, touched: true },
    };

    const isValid =
      addressDraft.fullAddress.trim().length >= 5 &&
      addressDraft.state.trim().length >= 2 &&
      addressDraft.district.trim().length >= 2 &&
      addressDraft.city.trim().length >= 2 &&
      /^\d{6}$/.test(addressDraft.pinCode.trim());

    return { isValid, fields };
  }, [addressDraft]);

  useEffect(() => {
    if (!isCompletingProfile || !user) return;

    updateFormField("name", user.name || "");
    updateFormField("email", user.email || "");
    updateFormField("phone", user.phone || "");
    if (formData.bankDetails.accountHolderName === "" && user.name) {
      updateBankField("accountHolderName", user.name);
    }
  }, [isCompletingProfile, user]);

  // Check for existing documents on app reopen
  useEffect(() => {
    if (hasHydrated) {
      checkExistingDocuments();
    }
  }, [hasHydrated]);

  const checkExistingDocuments = async () => {
    // Check if local files still exist
    for (const docType of Object.keys(documents) as DocumentType[]) {
      const doc = documents[docType];
      if (doc && doc.uri && doc.exists) {
        try {
          const fileInfo = await FileSystem.getInfoAsync(doc.uri);
          if (!fileInfo.exists) {
            clearDocument(docType);
          }
        } catch {
          // File doesn't exist, clear it
          clearDocument(docType);
        }
      }
    }
  };

  const validation = useMemo(() => {
    const personal =
      formData.name.trim().length > 2 &&
      emailRegex.test(formData.email.trim()) &&
      phoneRegex.test(formData.phone.trim()) &&
      (isCompletingProfile ||
        (formData.password.length >= 8 && /^\d{6}$/.test(formData.otp.trim()))) &&
      !!formData.vehicleType &&
      !!formData.fuelType &&
      vehicleNumberRegex.test(normalizeVehicleNumber(formData.bikeNumber));

    const documentsValid =
      aadhaarRegex.test(formData.aadhaarNumber.trim()) &&
      panRegex.test(formData.panNumber.trim().toUpperCase()) &&
      dlRegex.test(formData.drivingLicenseNumber.trim().toUpperCase()) &&
      Boolean(documents.aadhaarPhoto?.exists && documents.aadhaarPhoto?.uri) &&
      Boolean(documents.panPhoto?.exists && documents.panPhoto?.uri) &&
      Boolean(documents.drivingLicensePhoto?.exists && documents.drivingLicensePhoto?.uri) &&
      Boolean(documents.vehicleRcPhoto?.exists && documents.vehicleRcPhoto?.uri) &&
      Boolean(documents.bikeInsurancePhoto?.exists && documents.bikeInsurancePhoto?.uri) &&
      Boolean(documents.profilePhoto?.exists && documents.profilePhoto?.uri) &&
      Boolean(documents.livePhoto?.exists && documents.livePhoto?.uri);

    const address = addressValidation.isValid;

    const bank =
      formData.bankDetails.accountHolderName.trim().length >= 3 &&
      formData.bankDetails.bankName.trim().length >= 3 &&
      /^\d{9,18}$/.test(formData.bankDetails.accountNumber.trim()) &&
      ifscRegex.test(formData.bankDetails.ifscCode.trim().toUpperCase());

    const payout =
      formData.termsAccepted &&
      (formData.payoutMethod === "UPI"
        ? upiRegex.test(formData.upiId.trim())
        : bank);

    return { personal, documents: documentsValid, address, payout };
  }, [addressValidation.isValid, documents, formData, isCompletingProfile]);

  const pickDocumentPhoto = async (key: DocumentType) => {
    try {
      // Request permission first
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please allow photo library access to upload documents."
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        exif: false,
      });

      // Check if user cancelled
      if (result.canceled) {
        console.log("User cancelled image picker");
        return;
      }

      // Check if we have assets
      if (!result.assets || result.assets.length === 0) {
        console.log("No image selected");
        Alert.alert("Error", "No image was selected. Please try again.");
        return;
      }

      const asset = result.assets[0];
      setDocument(key, {
        uri: asset.uri,
        fileName: asset.fileName || `${key}.jpg`,
        type: asset.mimeType || "image/jpeg",
        fileSize: asset.fileSize,
        width: asset.width,
        height: asset.height,
        exists: true,
      });
    } catch (error: any) {
      console.error("Image picker error:", error?.message || error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const captureLivePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Camera Permission Required",
          "Please allow camera access to capture your live photo."
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) {
        console.log("User cancelled camera");
        return;
      }

      if (!result.assets || result.assets.length === 0) {
        console.log("No photo captured");
        Alert.alert("Error", "No photo was captured. Please try again.");
        return;
      }

      const asset = result.assets[0];
      setDocument("livePhoto", {
        uri: asset.uri,
        fileName: asset.fileName || "live.jpg",
        type: asset.mimeType || "image/jpeg",
        fileSize: asset.fileSize,
        width: asset.width,
        height: asset.height,
        exists: true,
      });
    } catch (error: any) {
      console.error("Camera error:", error?.message || error);
      Alert.alert("Error", "Failed to capture photo. Please try again.");
    }
  };

  const openPreview = (uri: string, title: string) => {
    setPreviewModal({ visible: true, uri, title });
  };

  const closePreview = () => {
    setPreviewModal({ visible: false, uri: null, title: "" });
  };

  const appendImage = (formData: FormData, fieldName: string, asset: any) => {
    const extension = asset.uri.split(".").pop()?.toLowerCase() || "jpg";
    const mimeType = asset.type || `image/${extension === "jpg" ? "jpeg" : extension}`;

    formData.append(fieldName, {
      uri: asset.uri,
      name: `${fieldName}.${extension}`,
      type: mimeType,
    });
  };

  const uploadDeliveryDocuments = async () => {
    const requiredDocs: DocumentType[] = [
      "aadhaarPhoto",
      "panPhoto",
      "drivingLicensePhoto",
      "vehicleRcPhoto",
      "bikeInsurancePhoto",
      "profilePhoto",
      "livePhoto",
    ];

    for (const docType of requiredDocs) {
      const doc = documents[docType];
      if (!doc || !doc.uri || !doc.exists) {
        throw new Error(`Please upload ${docType.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
      }
    }

    const formData = new FormData();
    appendImage(formData, "aadhaarPhoto", documents.aadhaarPhoto);
    appendImage(formData, "panPhoto", documents.panPhoto);
    appendImage(formData, "drivingLicensePhoto", documents.drivingLicensePhoto);
    appendImage(formData, "vehicleRcPhoto", documents.vehicleRcPhoto);
    appendImage(formData, "bikeInsurancePhoto", documents.bikeInsurancePhoto);
    appendImage(formData, "profilePhoto", documents.profilePhoto);
    appendImage(formData, "livePhoto", documents.livePhoto);

    try {
      const response = await apiClient.post("/uploads/delivery-docs", formData, {
        timeout: 60000,
      });

      return response.data.data as Record<string, { full?: string; medium?: string; thumbnail?: string }>;
    } catch (error: any) {
      console.log("Upload error details:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Failed to upload documents. Please try again.");
    }
  };

  const isCurrentStepValid =
    (currentStep === 1 && validation.personal) ||
    (currentStep === 2 && validation.documents) ||
    (currentStep === 3 && validation.address) ||
    (currentStep === 4 && validation.payout);

  const handleSendOtp = async () => {
    if (!emailRegex.test(formData.email.trim())) {
      Alert.alert("Invalid Email", "Please enter a valid email to receive the OTP.");
      return;
    }

    setLoading(true);
    try {
      await requestOtpAuth(formData.email.trim(), "register");
      setOtpSent(true);
      Alert.alert("OTP Sent", "Please check your email for the verification code.");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (!isCurrentStepValid) {
      const messages: Record<number, string> = {
        1: "Enter a valid name, email, Indian phone number, OTP/password, and vehicle number.",
        2: "Upload all required documents with photos.",
        3: "Complete your address details.",
        4: "Add valid payout details and accept terms.",
      };
      Alert.alert("Check details", messages[currentStep]);
      return;
    }

    if (currentStep < 4) {
      setStep(currentStep + 1);
      return;
    }

    handleRegister();
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setStep(currentStep - 1);
    } else {
      router.replace("/(auth)/login");
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    try {
      if (!isCompletingProfile) {
        await authRegister({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          phone: formData.phone.trim(),
          otp: formData.otp.trim(),
        });
      }

      const uploadedDocs = await uploadDeliveryDocuments();
      const getUploadedUrl = (urls: { full?: string; medium?: string; thumbnail?: string }) =>
        urls.full || urls.medium || urls.thumbnail || "";

      const bankDetails =
        formData.payoutMethod === "BANK_ACCOUNT"
          ? {
              accountHolderName: formData.bankDetails.accountHolderName.trim(),
              bankName: formData.bankDetails.bankName.trim(),
              accountNumber: formData.bankDetails.accountNumber.trim(),
              ifscCode: formData.bankDetails.ifscCode.trim().toUpperCase(),
            }
          : undefined;

      const { useDeliveryStore } = await import("@/store/useDeliveryStore");
      const deliveryRegister = useDeliveryStore.getState().register;

      await deliveryRegister({
        fullName: formData.name.trim(),
        phoneNumber: formData.phone.trim(),
        email: formData.email.trim(),
        vehicleType: formData.vehicleType,
        vehicleFuelType: formData.fuelType,
        bikeNumber: normalizeVehicleNumber(formData.bikeNumber),
        profilePhoto: getUploadedUrl(uploadedDocs.profilePhoto || {}),
        drivingLicense: formData.drivingLicenseNumber.trim().toUpperCase(),
        documents: {
          aadhaarNumber: formData.aadhaarNumber.trim(),
          aadhaarPhoto: getUploadedUrl(uploadedDocs.aadhaarPhoto || {}),
          panNumber: formData.panNumber.trim().toUpperCase(),
          panPhoto: getUploadedUrl(uploadedDocs.panPhoto || {}),
          drivingLicenseNumber: formData.drivingLicenseNumber.trim().toUpperCase(),
          drivingLicensePhoto: getUploadedUrl(uploadedDocs.drivingLicensePhoto || {}),
          vehicleRcNumber: normalizeVehicleNumber(formData.bikeNumber),
          vehicleRcPhoto: getUploadedUrl(uploadedDocs.vehicleRcPhoto || {}),
          bikeInsurancePhoto: getUploadedUrl(uploadedDocs.bikeInsurancePhoto || {}),
          profilePhoto: getUploadedUrl(uploadedDocs.profilePhoto || {}),
          livePhoto: getUploadedUrl(uploadedDocs.livePhoto || {}),
        },
        address: {
          buildingName: addressValidation.fields.fullAddress.value,
          streetName: addressDraft.fullAddress,
          landmark: addressValidation.fields.landmark.value,
          area: addressValidation.fields.city.value,
          state: addressValidation.fields.state.value,
          district: addressValidation.fields.district.value,
          city: addressValidation.fields.city.value,
          pincode: addressValidation.fields.pinCode.value,
        },
        payoutMethod: formData.payoutMethod,
        upiId: formData.payoutMethod === "UPI" ? formData.upiId.trim() : undefined,
        bankDetails,
        termsAccepted: formData.termsAccepted,
      });

      clearAllData();
      Alert.alert("Success!", "Registration submitted for verification.");
      router.replace("/(onboarding)/verification-pending");
    } catch (error: any) {
      Alert.alert("Registration Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderOption = (label: string, active: boolean, onPress: () => void, icon?: keyof typeof Ionicons.glyphMap) => (
    <TouchableOpacity key={label} style={[styles.optionPill, active && styles.optionPillActive]} onPress={onPress}>
      {icon && <Ionicons name={icon} size={18} color={active ? Colors.light.black : Colors.light.primary} />}
      <Text style={[styles.optionText, active && styles.optionTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  const renderPhotoTile = (title: string, subtitle: string, doc: any, onPress: () => void, onClear: () => void, icon: keyof typeof Ionicons.glyphMap, showCamera = false) => {
    const hasImage = doc && doc.uri && doc.exists;

    return (
      <View style={styles.photoTileWrapper}>
        <TouchableOpacity
          style={[styles.photoTile, hasImage && styles.photoTileWithImage]}
          onPress={onPress}
          activeOpacity={0.8}
        >
          {hasImage ? (
            <>
              <Image
                source={{ uri: doc.uri }}
                style={styles.photoPreview}
              />
              <View style={styles.photoOverlay}>
                <TouchableOpacity
                  style={styles.overlayBtn}
                  onPress={(e) => {
                    e.stopPropagation?.();
                    openPreview(doc.uri, title);
                  }}
                >
                  <Ionicons name="eye-outline" size={16} color={Colors.light.white} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.overlayBtn}
                  onPress={(e) => {
                    e.stopPropagation?.();
                    onClear();
                  }}
                >
                  <Ionicons name="trash-outline" size={16} color={Colors.light.error} />
                </TouchableOpacity>
              </View>
              <View style={styles.uploadedBadge}>
                <Ionicons name="checkmark-circle" size={14} color={Colors.light.success} />
              </View>
            </>
          ) : (
            <View style={styles.photoPlaceholder}>
              <Ionicons name={showCamera ? "camera-outline" : icon} size={32} color={Colors.light.primary} />
              <Text style={styles.photoTitle}>{title}</Text>
              <Text style={styles.photoSubtitle}>{subtitle}</Text>
              <View style={styles.uploadHint}>
                <Ionicons name="cloud-upload-outline" size={16} color={Colors.light.primary} />
                <Text style={styles.uploadHintText}>Tap to upload</Text>
              </View>
            </View>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Animated.View key="step1" entering={FadeInRight} exiting={FadeOutLeft} style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Personal & Vehicle</Text>
            <Text style={styles.stepSubtitle}>Enter your account details and the bike you will use for deliveries.</Text>

            <ThemedInput
              label="Full Name"
              placeholder="Rahul Sharma"
              icon="person-outline"
              value={formData.name}
              maxLength={60}
              onChangeText={(text) => updateFormField("name", text.replace(/[^a-zA-Z\s.'-]/g, "").slice(0, 60))}
            />

            {isCompletingProfile ? (
              <ThemedInput label="Email Address" placeholder="rahul@example.com" icon="mail-outline" keyboardType="email-address" autoCapitalize="none" value={formData.email} onChangeText={(text) => updateFormField("email", text)} />
            ) : (
              <>
                <View style={styles.otpInputGroup}>
                  <View style={{ flex: 1 }}>
                    <ThemedInput
                      label="Email Address"
                      placeholder="rahul@example.com"
                      icon="mail-outline"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={formData.email}
                      maxLength={120}
                      onChangeText={(text) => updateFormField("email", text.trim())}
                      containerStyle={{ marginBottom: 0 }}
                    />
                  </View>
                  <TouchableOpacity style={[styles.otpBtn, otpSent && styles.otpBtnSent]} onPress={handleSendOtp} disabled={loading}>
                    <Text style={styles.otpBtnText}>{otpSent ? "Resend" : "Get OTP"}</Text>
                  </TouchableOpacity>
                </View>
                <ThemedInput
                  label="Verification Code (OTP)"
                  placeholder="Enter 6-digit code"
                  icon="shield-checkmark-outline"
                  keyboardType="numeric"
                  maxLength={6}
                  value={formData.otp}
                  onChangeText={(text) => updateFormField("otp", text.replace(/\D/g, ""))}
                />
              </>
            )}

            <ThemedInput
              label="Phone Number"
              placeholder="10 digit number"
              icon="call-outline"
              keyboardType="phone-pad"
              maxLength={10}
              value={formData.phone}
              onChangeText={(text) => updateFormField("phone", text.replace(/\D/g, ""))}
            />

            {!isCompletingProfile && (
              <ThemedInput
                label="Password"
                placeholder="At least 8 characters"
                icon="lock-closed-outline"
                secureTextEntry={!showPassword}
                value={formData.password}
                onChangeText={(text) => updateFormField("password", text)}
                maxLength={64}
                rightIcon={showPassword ? "eye-off-outline" : "eye-outline"}
                rightIconAccessibilityLabel={showPassword ? "Hide password" : "Show password"}
                onRightIconPress={() => setShowPassword((current) => !current)}
              />
            )}

            <Text style={styles.groupLabel}>Vehicle Type</Text>
            <View style={styles.optionRow}>
              {(["Bike", "Cycle", "Car"] as VehicleType[]).map((type) =>
                renderOption(type, formData.vehicleType === type, () => updateFormField("vehicleType", type), type === "Car" ? "car-outline" : "bicycle-outline")
              )}
            </View>

            <Text style={styles.groupLabel}>Bike Fuel Type</Text>
            <View style={styles.optionRow}>
              {(["Petrol", "EV"] as FuelType[]).map((type) =>
                renderOption(type, formData.fuelType === type, () => updateFormField("fuelType", type), type === "EV" ? "flash-outline" : "flame-outline")
              )}
            </View>

            <ThemedInput
              label="Bike Number"
              placeholder="GJ01AB1234"
              icon="barcode-outline"
              autoCapitalize="characters"
              maxLength={10}
              value={formData.bikeNumber}
              onChangeText={(text) => updateFormField("bikeNumber", normalizeVehicleNumber(text).slice(0, 10))}
            />

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

            <ThemedInput
              label="Aadhaar Number"
              placeholder="12 digit Aadhaar number"
              icon="id-card-outline"
              keyboardType="numeric"
              maxLength={12}
              value={formData.aadhaarNumber}
              onChangeText={(text) => updateFormField("aadhaarNumber", text.replace(/\D/g, ""))}
            />
            {renderPhotoTile("Aadhaar Card Photo", "Tap to upload", documents.aadhaarPhoto, () => pickDocumentPhoto("aadhaarPhoto"), () => clearDocument("aadhaarPhoto"), "image-outline")}

            <ThemedInput
              label="PAN Number"
              placeholder="ABCDE1234F"
              icon="card-outline"
              autoCapitalize="characters"
              maxLength={10}
              value={formData.panNumber}
              onChangeText={(text) => updateFormField("panNumber", text.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 10))}
            />
            {renderPhotoTile("PAN Card Photo", "Tap to upload", documents.panPhoto, () => pickDocumentPhoto("panPhoto"), () => clearDocument("panPhoto"), "image-outline")}

            <ThemedInput
              label="Driving License Number"
              placeholder="GJ0120231234567"
              icon="card-outline"
              autoCapitalize="characters"
              maxLength={16}
              value={formData.drivingLicenseNumber}
              onChangeText={(text) => updateFormField("drivingLicenseNumber", text.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 16))}
            />
            {renderPhotoTile("Driving License Photo", "Tap to upload", documents.drivingLicensePhoto, () => pickDocumentPhoto("drivingLicensePhoto"), () => clearDocument("drivingLicensePhoto"), "image-outline")}

            {renderPhotoTile("Vehicle RC", `${formData.fuelType} ${formData.vehicleType} registration`, documents.vehicleRcPhoto, () => pickDocumentPhoto("vehicleRcPhoto"), () => clearDocument("vehicleRcPhoto"), "document-text-outline")}

            {renderPhotoTile("Bike Insurance", "Valid insurance document", documents.bikeInsurancePhoto, () => pickDocumentPhoto("bikeInsurancePhoto"), () => clearDocument("bikeInsurancePhoto"), "shield-checkmark-outline")}

            {renderPhotoTile("Passport-size Photo / Selfie", "Tap to upload", documents.profilePhoto, () => pickDocumentPhoto("profilePhoto"), () => clearDocument("profilePhoto"), "person-circle-outline")}

            {renderPhotoTile("One Live Photo", "Open camera to capture", documents.livePhoto, captureLivePhoto, () => clearDocument("livePhoto"), "camera-outline", true)}
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
              onChangeText={(text) => updateAddressField("streetName", text)}
              touched={true}
              valid={addressDraft.fullAddress.trim().length >= 5}
              error=""
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
              touched={true}
              valid={true}
              error=""
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
              touched={true}
              valid={addressDraft.state.trim().length >= 2}
              error=""
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
              touched={true}
              valid={addressDraft.district.trim().length >= 2}
              error=""
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
              touched={true}
              valid={addressDraft.city.trim().length >= 2}
              error=""
            />
            <ValidatedAddressField
              ref={pinCodeRef}
              label="PIN Code"
              placeholder="380009"
              value={addressDraft.pinCode}
              keyboardType="number-pad"
              maxLength={6}
              returnKeyType="done"
              onChangeText={(text) => updateAddressField("pincode", text.replace(/\D/g, ""))}
              touched={true}
              valid={/^\d{6}$/.test(addressDraft.pinCode.trim())}
              error=""
            />
          </Animated.View>
        );

      case 4:
        return (
          <Animated.View key="step4" entering={FadeInRight} exiting={FadeOutLeft} style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Payout Details</Text>
            <Text style={styles.stepSubtitle}>Choose UPI or bank details for delivery payouts.</Text>

            <View style={styles.optionRow}>
              {renderOption("UPI ID", formData.payoutMethod === "UPI", () => updateFormField("payoutMethod", "UPI"), "qr-code-outline")}
              {renderOption("Bank Details", formData.payoutMethod === "BANK_ACCOUNT", () => updateFormField("payoutMethod", "BANK_ACCOUNT"), "business-outline")}
            </View>

            {formData.payoutMethod === "UPI" ? (
              <ThemedInput
                label="UPI ID"
                placeholder="name@upi"
                icon="wallet-outline"
                autoCapitalize="none"
                maxLength={80}
                value={formData.upiId}
                onChangeText={(text) => updateFormField("upiId", text.trim().slice(0, 80))}
              />
            ) : (
              <>
                <ThemedInput
                  label="Account Holder Name"
                  placeholder="Rahul Sharma"
                  icon="person-outline"
                  maxLength={80}
                  value={formData.bankDetails.accountHolderName}
                  onChangeText={(text) => updateBankField("accountHolderName", text.replace(/[^a-zA-Z\s.'-]/g, "").slice(0, 80))}
                />
                <ThemedInput
                  label="Bank Name"
                  placeholder="HDFC Bank"
                  icon="business-outline"
                  maxLength={60}
                  value={formData.bankDetails.bankName}
                  onChangeText={(text) => updateBankField("bankName", text.replace(/[^a-zA-Z\s.'-]/g, "").slice(0, 60))}
                />
                <ThemedInput
                  label="Account Number"
                  placeholder="Your bank account number"
                  icon="card-outline"
                  keyboardType="numeric"
                  maxLength={18}
                  value={formData.bankDetails.accountNumber}
                  onChangeText={(text) => updateBankField("accountNumber", text.replace(/\D/g, "").slice(0, 18))}
                />
                <ThemedInput
                  label="IFSC Code"
                  placeholder="HDFC0001234"
                  icon="code-outline"
                  autoCapitalize="characters"
                  maxLength={11}
                  value={formData.bankDetails.ifscCode}
                  onChangeText={(text) => updateBankField("ifscCode", text.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 11))}
                />
              </>
            )}

            <TouchableOpacity style={styles.termsRow} onPress={() => updateFormField("termsAccepted", !formData.termsAccepted)}>
              <View style={[styles.checkbox, formData.termsAccepted && styles.checkboxActive]}>
                {formData.termsAccepted && <Ionicons name="checkmark" size={18} color={Colors.light.black} />}
              </View>
              <Text style={styles.termsText}>I agree to the Terms & Conditions for delivery partners.</Text>
            </TouchableOpacity>
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
                <Animated.View layout={Layout.springify()} style={[styles.progressFill, { width: `${(currentStep / 4) * 100}%` }]} />
              </View>
              <Text style={styles.stepIndicator}>Step {currentStep} of 4</Text>
            </View>
          </View>

          <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {renderStep()}
          </ScrollView>

          <View style={styles.footer}>
            <PrimaryButton
              label={currentStep === 4 ? "Submit for Verification" : "Continue"}
              onPress={handleNext}
              loading={loading}
              disabled={loading || !isCurrentStepValid}
              style={styles.mainBtn}
            />
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Image Preview Modal */}
      <Modal visible={previewModal.visible} transparent animationType="fade" onRequestClose={closePreview}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{previewModal.title}</Text>
              <TouchableOpacity onPress={closePreview} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={24} color={Colors.light.text} />
              </TouchableOpacity>
            </View>
            {previewModal.uri && (
              <Image source={{ uri: previewModal.uri }} style={styles.previewImage} resizeMode="contain" />
            )}
            <TouchableOpacity style={styles.modalDoneBtn} onPress={closePreview}>
              <Text style={styles.modalDoneText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  photoTileWrapper: { marginBottom: Spacing.md },
  photoTile: { height: 160, borderRadius: Radius.lg, borderWidth: 2, borderStyle: "dashed", borderColor: Colors.light.border, backgroundColor: Colors.light.surface, overflow: "hidden" },
  photoTileWithImage: { borderStyle: "solid" },
  photoPreview: { width: "100%", height: "100%" },
  photoPlaceholder: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: Spacing.md },
  photoTitle: { color: Colors.light.text, fontSize: 15, fontWeight: "900", marginTop: Spacing.sm, textAlign: "center" },
  photoSubtitle: { color: Colors.light.textMuted, fontSize: 12, fontWeight: "600", marginTop: 4, textAlign: "center" },
  uploadHint: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: Spacing.sm },
  uploadHintText: { color: Colors.light.primary, fontSize: 12, fontWeight: "700" },
  photoOverlay: { position: "absolute", left: 0, right: 0, bottom: 0, minHeight: 42, backgroundColor: "rgba(0,0,0,0.72)", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: Spacing.md, paddingHorizontal: Spacing.md },
  overlayBtn: { padding: Spacing.sm },
  uploadedBadge: { position: "absolute", top: Spacing.sm, right: Spacing.sm, backgroundColor: Colors.light.surface, borderRadius: Radius.full, padding: 4 },
  termsRow: { flexDirection: "row", alignItems: "center", gap: Spacing.md, marginTop: Spacing.sm, paddingVertical: Spacing.md },
  checkbox: { width: 26, height: 26, borderRadius: 6, borderWidth: 1.5, borderColor: Colors.light.border, backgroundColor: Colors.light.surface, alignItems: "center", justifyContent: "center" },
  checkboxActive: { backgroundColor: Colors.light.primary, borderColor: Colors.light.primary },
  termsText: { flex: 1, color: Colors.light.textDim, fontSize: 14, lineHeight: 20, fontWeight: "600" },
  footer: { paddingBottom: Spacing.xl, paddingTop: Spacing.md },
  mainBtn: { ...Shadows.yellow },
  loginLinkContainer: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: Spacing.lg, gap: Spacing.xs },
  loginLinkText: { color: Colors.light.textDim, fontSize: 14 },
  loginLinkAction: { color: Colors.light.primary, fontSize: 14, fontWeight: "700" },
  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.9)", alignItems: "center", justifyContent: "center", padding: Spacing.lg },
  modalContent: { width: "100%", maxHeight: "80%", backgroundColor: Colors.light.surface, borderRadius: Radius.xl, overflow: "hidden" },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.light.border },
  modalTitle: { color: Colors.light.text, fontSize: 18, fontWeight: "900" },
  modalCloseBtn: { padding: Spacing.xs },
  previewImage: { width: SCREEN_WIDTH - 48, height: SCREEN_WIDTH - 48 },
  modalDoneBtn: { padding: Spacing.md, alignItems: "center", borderTopWidth: 1, borderTopColor: Colors.light.border },
  modalDoneText: { color: Colors.light.primary, fontSize: 16, fontWeight: "800" },
});