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
  ActivityIndicator,
} from "react-native";

import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuthStore } from "@/store/useAuthStore";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, Radius, Shadows } from "../../constants/Colors";
import { ThemedInput } from "@/components/ThemedInput";
import { ValidatedAddressField } from "@/components/ValidatedAddressField";
import { API_URL, apiClient } from "@/lib/api";
import { useRegistrationStore, DocumentType, DocumentInfo } from "@/store/useRegistrationStore";
import { useDeliveryStore } from "@/store/useDeliveryStore";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Animated, {
  FadeInRight,
  FadeOutLeft,
  Layout,
} from "react-native-reanimated";

type VehicleType = "Bike" | "Cycle" | "Car";
type FuelType = "Petrol" | "EV";
type PayoutMethod = "UPI" | "BANK_ACCOUNT";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const getImagePickerMediaTypeImages = () => {
  // @ts-ignore
  if (ImagePicker?.MediaType?.Images) return ImagePicker.MediaType.Images;
  // @ts-ignore
  if (ImagePicker?.MediaTypeOptions?.Images) return ImagePicker.MediaTypeOptions.Images;
  return undefined;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[6-9]\d{9}$/;
const aadhaarRegex = /^\d{12}$/;
const dlRegex = /^[A-Z]{2}[A-Z0-9]{11,14}$/;
const panRegex = /^[A-Z]{5}\d{4}[A-Z]$/;
const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
const vehicleNumberRegex = /^[A-Z]{2}\d{1,2}[A-Z]{1,3}\d{4}$/;

const normalizeVehicleNumber = (value: string) =>
  value.replace(/\s|-/g, "").toUpperCase();

// Upload progress item
type UploadItem = {
  key: string;
  label: string;
  progress: number; // 0–100
  done: boolean;
  error?: boolean;
};

const STEP_LABELS = ["Personal", "Documents", "Address", "Payout"];

export default function RegisterScreen() {
  const router = useRouter();
  const { register: authRegister, requestOtp: requestOtpAuth, user, isAuthenticated, hasHydrated: hasHydratedAuth } = useAuthStore();
  const isCompletingProfile = isAuthenticated && Boolean(user);

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

  // If the user's token was cleared (e.g., they logged out or session expired)
  // but they still had a later step persisted, reset them to Step 1 so they can
  // re-verify their OTP and get a new token.
  useEffect(() => {
    if (hasHydratedAuth && hasHydrated) {
      if (!isAuthenticated && currentStep > 1) {
        setStep(1);
      }
    }
  }, [isAuthenticated, currentStep, hasHydratedAuth, hasHydrated]);

  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [previewModal, setPreviewModal] = useState<{ visible: boolean; uri: string | null; title: string }>({
    visible: false,
    uri: null,
    title: "",
  });
  // Upload progress modal
  const [uploadModal, setUploadModal] = useState<{ visible: boolean; items: UploadItem[] }>({
    visible: false,
    items: [],
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
    const isValid =
      addressDraft.fullAddress.trim().length >= 5 &&
      addressDraft.state.trim().length >= 2 &&
      addressDraft.district.trim().length >= 2 &&
      addressDraft.city.trim().length >= 2 &&
      /^\d{6}$/.test(addressDraft.pinCode.trim());
    return { isValid };
  }, [addressDraft]);

  useEffect(() => {
    if (!isCompletingProfile || !user) return;
    if (user.name) updateFormField("name", user.name);
    if (user.email) updateFormField("email", user.email);
    if (user.phone) updateFormField("phone", user.phone);
    if (formData.bankDetails.accountHolderName === "" && user.name) {
      updateBankField("accountHolderName", user.name);
    }
  }, [isCompletingProfile, user]);

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
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Please allow photo library access to upload documents.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: getImagePickerMediaTypeImages(),
        allowsEditing: true,
        quality: 0.8,
        exif: false,
      });
      if (result.canceled || !result.assets || result.assets.length === 0) return;
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
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const captureLivePhoto = async () => {
    try {
      // Check if the camera is actually available (not available on iOS Simulator)
      const isCameraAvailable = await ImagePicker.getCameraPermissionsAsync()
        .then(() => true)
        .catch(() => false);

      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
      const canUseCamera = cameraStatus.status === "granted" && isCameraAvailable;

      if (canUseCamera) {
        // Try launching camera
        try {
          const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          });
          if (result.canceled || !result.assets || result.assets.length === 0) return;
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
          return;
        } catch {
          // Camera failed (e.g. iOS Simulator) — fall through to gallery
        }
      }

      // Fallback: use gallery (for iOS Simulator or when camera is unavailable)
      Alert.alert(
        "Camera Not Available",
        "Camera is not available on this device (e.g. iOS Simulator). Please select a photo from your gallery instead.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Choose from Gallery",
            onPress: async () => {
              const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
              if (status !== "granted") {
                Alert.alert("Permission Required", "Please allow photo library access.");
                return;
              }
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: getImagePickerMediaTypeImages(),
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
              });
              if (result.canceled || !result.assets || result.assets.length === 0) return;
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
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert("Error", "Failed to capture photo. Please try again.");
    }
  };


  const openPreview = (uri: string, title: string) => setPreviewModal({ visible: true, uri, title });
  const closePreview = () => setPreviewModal({ visible: false, uri: null, title: "" });

  const appendImage = (fd: any, fieldName: string, asset: any) => {
    const extension = asset.uri.split(".").pop()?.toLowerCase() || "jpg";
    const mimeType = asset.type || `image/${extension === "jpg" ? "jpeg" : extension}`;
    const uri = asset.uri.startsWith("file://") || asset.uri.startsWith("content://")
      ? asset.uri
      : `file://${asset.uri}`;
    const fileName = asset.fileName || `${fieldName}.${extension}`;
    
    // Using standard React Native format for FormData uploads
    // fetch + standard FormData handles this perfectly!
    fd.append(fieldName, { uri, name: fileName, type: mimeType } as any);
  };

  // Upload documents with progress simulation
  const uploadDeliveryDocumentsWithProgress = async (): Promise<Record<string, { full?: string; medium?: string; thumbnail?: string }>> => {
    const docEntries: { key: string; label: string; docType: DocumentType }[] = [
      { key: "aadhaarPhoto", label: "Aadhaar Card", docType: "aadhaarPhoto" },
      { key: "panPhoto", label: "PAN Card", docType: "panPhoto" },
      { key: "drivingLicensePhoto", label: "Driving License", docType: "drivingLicensePhoto" },
      { key: "vehicleRcPhoto", label: "Vehicle RC", docType: "vehicleRcPhoto" },
      { key: "bikeInsurancePhoto", label: "Bike Insurance", docType: "bikeInsurancePhoto" },
      { key: "profilePhoto", label: "Profile Photo", docType: "profilePhoto" },
      { key: "livePhoto", label: "Live Photo", docType: "livePhoto" },
    ];

    // Validate all docs present
    for (const { label, docType } of docEntries) {
      const doc = documents[docType];
      if (!doc || !doc.uri || !doc.exists) {
        throw new Error(`Please upload ${label}`);
      }
    }

    // Initialize progress modal
    const initialItems: UploadItem[] = docEntries.map(({ key, label }) => ({
      key,
      label,
      progress: 0,
      done: false,
    }));
    setUploadModal({ visible: true, items: initialItems });

    const fd = new FormData();
    for (const { key, docType } of docEntries) {
      appendImage(fd, key, documents[docType]);
    }

    // Simulate incremental progress while fetching
    const progressInterval = setInterval(() => {
      setUploadModal((prev) => ({
        ...prev,
        items: prev.items.map((item) =>
          item.done ? item : { ...item, progress: Math.min(item.progress + Math.random() * 15, 85) }
        ),
      }));
    }, 400);

    try {
      // Get the token synchronously from the auth store, which is the source of truth
      // and avoids any AsyncStorage read delays or race conditions.
      const token = useAuthStore.getState().token;
      
      if (!token) {
        throw new Error("Your session expired or token is missing. Please restart the app or log in again to continue.");
      }

      // Use native XMLHttpRequest directly to completely bypass Expo's fetch
      // and Axios formatting bugs, which fixes the "Unsupported FormDataPart"
      // and "Network Error" issues.
      const responseData = await new Promise<any>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `${API_URL}/uploads/delivery-docs`);
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        
        xhr.onload = () => {
          try {
            const res = JSON.parse(xhr.responseText);
            if (xhr.status === 401) {
              useAuthStore.setState({ token: null, isAuthenticated: false, user: null });
              reject(new Error("Your session has expired. Please log in again."));
              return;
            }
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(res);
            } else {
              reject(new Error(res.message || "Failed to upload documents"));
            }
          } catch (e) {
            reject(new Error("Failed to parse server response"));
          }
        };

        xhr.onerror = () => {
          reject(new Error("Network error occurred while uploading documents. Please check your connection."));
        };

        xhr.send(fd as any);
      });

      clearInterval(progressInterval);

      // Mark all done
      setUploadModal((prev) => ({
        ...prev,
        items: prev.items.map((item) => ({ ...item, progress: 100, done: true })),
      }));

      return responseData.data as Record<string, { full?: string; medium?: string; thumbnail?: string }>;
    } catch (error: any) {
      clearInterval(progressInterval);
      setUploadModal((prev) => ({
        ...prev,
        items: prev.items.map((item) => ({ ...item, progress: 0, error: true })),
      }));
      throw new Error(error?.response?.data?.message || error?.message || "Failed to upload documents. Please try again.");
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
      Alert.alert("OTP Sent ✅", "Please check your email for the verification code.");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
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

    // FIX: Register (verify OTP) at step 1 → step 2 transition so OTP doesn't expire
    if (currentStep === 1 && !isCompletingProfile) {
      setLoading(true);
      try {
        await authRegister({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          phone: formData.phone.trim(),
          otp: formData.otp.trim(),
        });
        setStep(2);
      } catch (error: any) {
        Alert.alert("Registration Error", error.message);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (currentStep < 4) {
      setStep(currentStep + 1);
      return;
    }

    // On final step, ensure ALL previous steps are valid before submitting
    if (!validation.personal || !validation.documents || !validation.address || !validation.payout) {
      Alert.alert(
        "Missing Details",
        "Some details are missing from previous steps (like your phone number or documents). Please go back and ensure all steps are fully completed."
      );
      return;
    }

    handleRegister();
  };

  const handleBack = () => {
    if (currentStep > 1) {
      // If already authenticated (step 1 done), don't go back past step 2
      if (currentStep === 2 && isAuthenticated && !isCompletingProfile) {
        Alert.alert("Warning", "Going back will not undo your account creation. Continue from step 2.");
        return;
      }
      setStep(currentStep - 1);
    } else {
      router.replace("/(auth)/login");
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    try {
      const uploadedDocs = await uploadDeliveryDocumentsWithProgress();
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

      const deliveryRegister = useDeliveryStore.getState().register;

      try {
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
            buildingName: addressDraft.fullAddress,
            streetName: addressDraft.fullAddress,
            landmark: addressDraft.landmark,
            area: addressDraft.city,
            state: addressDraft.state,
            district: addressDraft.district,
            city: addressDraft.city,
            pincode: addressDraft.pinCode,
          },
          payoutMethod: formData.payoutMethod,
          upiId: formData.payoutMethod === "UPI" ? formData.upiId.trim() : undefined,
          bankDetails,
          termsAccepted: formData.termsAccepted,
        });
      } catch (deliveryError: any) {
        const msg: string = deliveryError?.message || "";
        // If the delivery profile is already created (e.g. user retried after a partial failure),
        // treat it as success and send them to the verification-pending screen.
        if (
          msg.toLowerCase().includes("already registered") ||
          msg.toLowerCase().includes("already exists")
        ) {
          console.log("[Register] Delivery partner already registered — treating as success.");
        } else {
          // Real error — bubble it up
          throw deliveryError;
        }
      }

      clearAllData();

      // Auto-close progress modal and navigate after short delay
      setTimeout(() => {
        setUploadModal({ visible: false, items: [] });
        router.replace("/(onboarding)/verification-pending");
      }, 1500);
    } catch (error: any) {
      setUploadModal((prev) => ({ ...prev, visible: false }));
      const msg = error?.message || "Something went wrong. Please try again.";
      Alert.alert("Submission Error", msg);
    } finally {
      setLoading(false);
    }
  };


  // ─── Render helpers ────────────────────────────────────────────────────────

  const renderOption = (label: string, active: boolean, onPress: () => void, icon?: keyof typeof Ionicons.glyphMap) => (
    <TouchableOpacity key={label} style={[styles.optionPill, active && styles.optionPillActive]} onPress={onPress}>
      {icon && <Ionicons name={icon} size={18} color={active ? "#FFFFFF" : Colors.light.primary} />}
      <Text style={[styles.optionText, active && styles.optionTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  const renderPhotoTile = (
    title: string,
    subtitle: string,
    doc: any,
    onPress: () => void,
    onClear: () => void,
    icon: keyof typeof Ionicons.glyphMap,
    showCamera = false
  ) => {
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
              <Image source={{ uri: doc.uri }} style={styles.photoPreview} />
              <View style={styles.photoOverlay}>
                <TouchableOpacity
                  style={styles.overlayBtn}
                  onPress={(e) => { e.stopPropagation?.(); openPreview(doc.uri, title); }}
                >
                  <Ionicons name="eye-outline" size={16} color="#FFFFFF" />
                  <Text style={styles.overlayBtnText}>View</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.overlayBtn}
                  onPress={(e) => { e.stopPropagation?.(); onClear(); }}
                >
                  <Ionicons name="trash-outline" size={16} color="#FCA5A5" />
                  <Text style={[styles.overlayBtnText, { color: "#FCA5A5" }]}>Remove</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.uploadedBadge}>
                <Ionicons name="checkmark-circle" size={22} color={Colors.light.success} />
              </View>
            </>
          ) : (
            <View style={styles.photoPlaceholder}>
              <View style={styles.photoIconCircle}>
                <Ionicons name={showCamera ? "camera-outline" : icon} size={28} color={Colors.light.primary} />
              </View>
              <Text style={styles.photoTitle}>{title}</Text>
              <Text style={styles.photoSubtitle}>{subtitle}</Text>
              <View style={styles.uploadHint}>
                <Ionicons name="cloud-upload-outline" size={14} color={Colors.light.primary} />
                <Text style={styles.uploadHintText}>{showCamera ? "Open camera" : "Tap to upload"}</Text>
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
            <Text style={styles.stepSubtitle}>Enter your account details and the vehicle you'll use for deliveries.</Text>

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
                  <TouchableOpacity
                    style={[styles.otpBtn, otpSent && styles.otpBtnSent]}
                    onPress={handleSendOtp}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color={Colors.light.primary} />
                    ) : (
                      <Text style={styles.otpBtnText}>{otpSent ? "Resend" : "Get OTP"}</Text>
                    )}
                  </TouchableOpacity>
                </View>

                <ThemedInput
                  label="Verification Code (OTP)"
                  placeholder="Enter 6-digit code from email"
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
              placeholder="10-digit mobile number"
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
                onRightIconPress={() => setShowPassword((c) => !c)}
              />
            )}

            <Text style={styles.groupLabel}>Vehicle Type</Text>
            <View style={styles.optionRow}>
              {(["Bike", "Cycle", "Car"] as VehicleType[]).map((type) =>
                renderOption(type, formData.vehicleType === type, () => updateFormField("vehicleType", type), type === "Car" ? "car-outline" : "bicycle-outline")
              )}
            </View>

            <Text style={styles.groupLabel}>Fuel Type</Text>
            <View style={styles.optionRow}>
              {(["Petrol", "EV"] as FuelType[]).map((type) =>
                renderOption(type, formData.fuelType === type, () => updateFormField("fuelType", type), type === "EV" ? "flash-outline" : "flame-outline")
              )}
            </View>

            <ThemedInput
              label="Vehicle Number"
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
            <Text style={styles.stepSubtitle}>Upload identity, vehicle, and verification documents below.</Text>

            <View style={styles.docSection}>
              <View style={styles.docSectionHeader}>
                <Ionicons name="person-circle-outline" size={20} color={Colors.light.primary} />
                <Text style={styles.docSectionTitle}>Identity Documents</Text>
              </View>

              <ThemedInput
                label="Aadhaar Number"
                placeholder="12-digit Aadhaar number"
                icon="id-card-outline"
                keyboardType="numeric"
                maxLength={12}
                value={formData.aadhaarNumber}
                onChangeText={(text) => updateFormField("aadhaarNumber", text.replace(/\D/g, ""))}
              />
              {renderPhotoTile("Aadhaar Card Photo", "Front side of Aadhaar", documents.aadhaarPhoto, () => pickDocumentPhoto("aadhaarPhoto"), () => clearDocument("aadhaarPhoto"), "image-outline")}

              <ThemedInput
                label="PAN Number"
                placeholder="ABCDE1234F"
                icon="card-outline"
                autoCapitalize="characters"
                maxLength={10}
                value={formData.panNumber}
                onChangeText={(text) => updateFormField("panNumber", text.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 10))}
              />
              {renderPhotoTile("PAN Card Photo", "Clear photo of PAN card", documents.panPhoto, () => pickDocumentPhoto("panPhoto"), () => clearDocument("panPhoto"), "image-outline")}

              <ThemedInput
                label="Driving License Number"
                placeholder="GJ0120231234567"
                icon="card-outline"
                autoCapitalize="characters"
                maxLength={15}
                value={formData.drivingLicenseNumber}
                onChangeText={(text) => updateFormField("drivingLicenseNumber", text.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 15))}
              />
              {renderPhotoTile("Driving License Photo", "Front side of license", documents.drivingLicensePhoto, () => pickDocumentPhoto("drivingLicensePhoto"), () => clearDocument("drivingLicensePhoto"), "image-outline")}
            </View>

            <View style={styles.docSection}>
              <View style={styles.docSectionHeader}>
                <Ionicons name="bicycle-outline" size={20} color={Colors.light.primary} />
                <Text style={styles.docSectionTitle}>Vehicle Documents</Text>
              </View>
              {renderPhotoTile("Vehicle RC", `${formData.fuelType} ${formData.vehicleType} registration`, documents.vehicleRcPhoto, () => pickDocumentPhoto("vehicleRcPhoto"), () => clearDocument("vehicleRcPhoto"), "document-text-outline")}
              {renderPhotoTile("Bike Insurance", "Valid insurance document", documents.bikeInsurancePhoto, () => pickDocumentPhoto("bikeInsurancePhoto"), () => clearDocument("bikeInsurancePhoto"), "shield-checkmark-outline")}
            </View>

            <View style={styles.docSection}>
              <View style={styles.docSectionHeader}>
                <Ionicons name="camera-outline" size={20} color={Colors.light.primary} />
                <Text style={styles.docSectionTitle}>Photo Verification</Text>
              </View>
              {renderPhotoTile("Profile Photo / Selfie", "Clear passport-size photo", documents.profilePhoto, () => pickDocumentPhoto("profilePhoto"), () => clearDocument("profilePhoto"), "person-circle-outline")}
              {renderPhotoTile("Live Photo", "Open camera to capture now", documents.livePhoto, captureLivePhoto, () => clearDocument("livePhoto"), "camera-outline", true)}
            </View>
          </Animated.View>
        );

      case 3:
        return (
          <Animated.View key="step3" entering={FadeInRight} exiting={FadeOutLeft} style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Address Info</Text>
            <Text style={styles.stepSubtitle}>Type all address details manually for verification purposes.</Text>

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
            <Text style={styles.stepSubtitle}>Choose how you'd like to receive your delivery earnings.</Text>

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

            <View style={styles.termsRow}>
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => updateFormField("termsAccepted", !formData.termsAccepted)}
                activeOpacity={0.8}
              >
                <View style={[styles.checkbox, formData.termsAccepted && styles.checkboxActive]}>
                  {formData.termsAccepted && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                </View>
              </TouchableOpacity>
              <View style={styles.termsTextContainer}>
                <Text style={styles.termsText}>I agree to the </Text>
                <TouchableOpacity onPress={() => router.push("/terms")}>
                  <Text style={styles.termsLink}>Terms & Conditions</Text>
                </TouchableOpacity>
                <Text style={styles.termsText}> and </Text>
                <TouchableOpacity onPress={() => router.push("/privacy")}>
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </TouchableOpacity>
                <Text style={styles.termsText}> for delivery partners.</Text>
              </View>
            </View>
          </Animated.View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor={Colors.light.primary} />

      {/* Header gradient */}
      <LinearGradient
        colors={[Colors.light.primaryLight, Colors.light.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <SafeAreaView edges={["top"]} style={styles.headerInner}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.stepsIndicator}>
              {STEP_LABELS.map((label, idx) => {
                const step = idx + 1;
                const isActive = currentStep === step;
                const isDone = currentStep > step;
                return (
                  <View key={step} style={styles.stepDot}>
                    <View style={[
                      styles.stepDotCircle,
                      isActive && styles.stepDotActive,
                      isDone && styles.stepDotDone,
                    ]}>
                      {isDone
                        ? <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                        : <Text style={[styles.stepDotText, isActive && styles.stepDotTextActive]}>{step}</Text>
                      }
                    </View>
                    {idx < STEP_LABELS.length - 1 && (
                      <View style={[styles.stepConnector, isDone && styles.stepConnectorDone]} />
                    )}
                  </View>
                );
              })}
            </View>
            <Text style={styles.stepLabel}>Step {currentStep} / 4</Text>
          </View>
          <Text style={styles.headerStepName}>{STEP_LABELS[currentStep - 1]}</Text>
        </SafeAreaView>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior="padding"
        style={styles.formContainer}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
        >
          {renderStep()}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.continueBtn, (!isCurrentStepValid || loading) && styles.continueBtnDisabled]}
            onPress={handleNext}
            disabled={!isCurrentStepValid || loading}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={
                !isCurrentStepValid || loading
                  ? ["#B0C4FF", "#B0C4FF"]
                  : [Colors.light.primaryLight, Colors.light.primaryDark]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.continueBtnGradient}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.continueBtnText}>
                    {currentStep === 4 ? "Submit for Verification" : "Continue"}
                  </Text>
                  <Ionicons name={currentStep === 4 ? "checkmark-circle-outline" : "arrow-forward"} size={20} color="#FFFFFF" />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Image Preview Modal */}
      <Modal visible={previewModal.visible} transparent animationType="fade" onRequestClose={closePreview}>
        <View style={styles.modalOverlay}>
          <View style={styles.previewModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{previewModal.title}</Text>
              <TouchableOpacity onPress={closePreview} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={22} color={Colors.light.text} />
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

      {/* Upload Progress Modal */}
      <Modal visible={uploadModal.visible} transparent animationType="slide" onRequestClose={() => {}}>
        <View style={styles.uploadModalOverlay}>
          <View style={styles.uploadModalContent}>
            <View style={styles.uploadModalHeader}>
              <View style={styles.uploadModalIcon}>
                <Ionicons name="cloud-upload-outline" size={28} color={Colors.light.primary} />
              </View>
              <Text style={styles.uploadModalTitle}>Uploading Documents</Text>
              <Text style={styles.uploadModalSubtitle}>Please wait while we securely upload your files...</Text>
            </View>

            <View style={styles.uploadItemsList}>
              {uploadModal.items.map((item) => (
                <View key={item.key} style={styles.uploadItem}>
                  <View style={styles.uploadItemLeft}>
                    <View style={[
                      styles.uploadItemIcon,
                      item.done && styles.uploadItemIconDone,
                      item.error && styles.uploadItemIconError,
                    ]}>
                      <Ionicons
                        name={item.error ? "alert-circle-outline" : item.done ? "checkmark" : "document-outline"}
                        size={16}
                        color={item.error ? "#EF4444" : item.done ? "#FFFFFF" : Colors.light.primary}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.uploadItemLabel}>{item.label}</Text>
                      <View style={styles.progressBarOuter}>
                        <View style={[
                          styles.progressBarInner,
                          { width: `${item.progress}%` },
                          item.done && styles.progressBarDone,
                          item.error && styles.progressBarError,
                        ]} />
                      </View>
                    </View>
                  </View>
                  <Text style={[
                    styles.uploadItemPct,
                    item.done && styles.uploadItemPctDone,
                    item.error && styles.uploadItemPctError,
                  ]}>
                    {item.error ? "Error" : item.done ? "Done" : `${Math.round(item.progress)}%`}
                  </Text>
                </View>
              ))}
            </View>

            {uploadModal.items.every((i) => i.done) && (
              <View style={styles.uploadDoneRow}>
                <Ionicons name="checkmark-circle" size={24} color={Colors.light.success} />
                <Text style={styles.uploadDoneText}>All documents uploaded successfully!</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  formContainer: {
    flex: 1,
    marginTop: -20,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: Colors.light.background,
    overflow: 'hidden',
  },
  // ── Form & Terms ────────────────────────────────────────
  termsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.xs,
  },
  checkboxContainer: {
    paddingRight: Spacing.sm,
    paddingTop: 2,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: Radius.sm,
    borderWidth: 2,
    borderColor: Colors.light.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.surface,
  },
  checkboxActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  termsTextContainer: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  termsText: {
    color: Colors.light.textDim,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "500",
  },
  termsLink: {
    color: Colors.light.primary,
    fontSize: 13,
    fontWeight: "700",
    textDecorationLine: "underline",
    lineHeight: 20,
  },
  // ── Header ─────────────────────────────────────────────
  header: {
    paddingBottom: 20,
  },
  headerInner: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: Spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  stepsIndicator: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  stepDot: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  stepDotCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  stepDotActive: {
    backgroundColor: "#FFFFFF",
  },
  stepDotDone: {
    backgroundColor: Colors.light.success,
  },
  stepDotText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
    fontWeight: "700",
  },
  stepDotTextActive: {
    color: Colors.light.primary,
  },
  stepConnector: {
    flex: 1,
    height: 2,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginHorizontal: 3,
  },
  stepConnectorDone: {
    backgroundColor: Colors.light.success,
  },
  stepLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    fontWeight: "600",
  },
  headerStepName: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  // ── Scroll content ──────────────────────────────────────
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  stepSubtitle: {
    fontSize: 14,
    color: Colors.light.textMuted,
    lineHeight: 22,
    marginBottom: Spacing.xl,
    fontWeight: "500",
  },
  // ── OTP row ─────────────────────────────────────────────
  otpInputGroup: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  otpBtn: {
    height: 56,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.light.surface,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: Colors.light.primary,
    minWidth: 80,
  },
  otpBtnSent: {
    borderColor: Colors.light.success,
  },
  otpBtnText: {
    color: Colors.light.primary,
    fontWeight: "800",
    fontSize: 13,
  },
  // ── Option pills ────────────────────────────────────────
  groupLabel: {
    color: Colors.light.text,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: Spacing.sm,
  },
  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  optionPill: {
    minHeight: 46,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  optionPillActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  optionText: {
    color: Colors.light.text,
    fontWeight: "700",
    fontSize: 14,
  },
  optionTextActive: {
    color: "#FFFFFF",
  },
  // ── Document sections ───────────────────────────────────
  docSection: {
    marginBottom: Spacing.xl,
    backgroundColor: Colors.light.surface,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
    ...Shadows.card,
  },
  docSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  docSectionTitle: {
    color: Colors.light.text,
    fontWeight: "800",
    fontSize: 15,
  },
  // ── Photo tiles ─────────────────────────────────────────
  photoTileWrapper: {
    marginBottom: Spacing.md,
  },
  photoTile: {
    height: 140,
    borderRadius: Radius.lg,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.surfaceSecondary,
    overflow: "hidden",
  },
  photoTileWithImage: {
    borderStyle: "solid",
    borderColor: Colors.light.primary,
    borderWidth: 2,
  },
  photoPreview: {
    width: "100%",
    height: "100%",
  },
  photoPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.md,
    gap: 6,
  },
  photoIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.light.overlay,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  photoTitle: {
    color: Colors.light.text,
    fontSize: 14,
    fontWeight: "800",
    textAlign: "center",
  },
  photoSubtitle: {
    color: Colors.light.textMuted,
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
  uploadHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  uploadHintText: {
    color: Colors.light.primary,
    fontSize: 12,
    fontWeight: "700",
  },
  photoOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 44,
    backgroundColor: "rgba(13,27,75,0.82)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  overlayBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    padding: 6,
  },
  overlayBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  uploadedBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: Radius.full,
    padding: 2,
    ...Shadows.soft,
  },
  // ── Login link ──────────────────────────────────────────
  loginLinkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.lg,
    gap: Spacing.xs,
  },
  loginLinkText: {
    color: Colors.light.textMuted,
    fontSize: 14,
  },
  loginLinkAction: {
    color: Colors.light.primary,
    fontSize: 14,
    fontWeight: "700",
  },
  // ── Footer / CTA ────────────────────────────────────────
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.md,
    backgroundColor: Colors.light.background,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  continueBtn: {
    borderRadius: Radius.full,
    overflow: "hidden",
    ...Shadows.blue,
  },
  continueBtnDisabled: {
    opacity: 0.65,
  },
  continueBtnGradient: {
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  continueBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  // ── Preview modal ───────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.88)",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
  },
  previewModalContent: {
    width: "100%",
    maxHeight: "80%",
    backgroundColor: Colors.light.surface,
    borderRadius: Radius.xl,
    overflow: "hidden",
    ...Shadows.blue,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  modalTitle: {
    color: Colors.light.text,
    fontSize: 16,
    fontWeight: "800",
  },
  modalCloseBtn: {
    padding: Spacing.xs,
  },
  previewImage: {
    width: SCREEN_WIDTH - 48,
    height: SCREEN_WIDTH - 48,
  },
  modalDoneBtn: {
    padding: Spacing.md,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  modalDoneText: {
    color: Colors.light.primary,
    fontSize: 16,
    fontWeight: "800",
  },
  // ── Upload progress modal ───────────────────────────────
  uploadModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(13,27,75,0.7)",
    justifyContent: "flex-end",
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  uploadModalContent: {
    backgroundColor: Colors.light.surface,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    ...Shadows.blue,
  },
  uploadModalHeader: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  uploadModalIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.light.overlay,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  uploadModalTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: Colors.light.text,
    marginBottom: 4,
  },
  uploadModalSubtitle: {
    fontSize: 13,
    color: Colors.light.textMuted,
    textAlign: "center",
    fontWeight: "500",
  },
  uploadItemsList: {
    gap: Spacing.md,
  },
  uploadItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.sm,
  },
  uploadItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  uploadItemIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  uploadItemIconDone: {
    backgroundColor: Colors.light.success,
    borderColor: Colors.light.success,
  },
  uploadItemIconError: {
    backgroundColor: "#FEE2E2",
    borderColor: "#FCA5A5",
  },
  uploadItemLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 4,
  },
  progressBarOuter: {
    height: 5,
    backgroundColor: Colors.light.surfaceSecondary,
    borderRadius: Radius.full,
    overflow: "hidden",
  },
  progressBarInner: {
    height: "100%",
    backgroundColor: Colors.light.primary,
    borderRadius: Radius.full,
  },
  progressBarDone: {
    backgroundColor: Colors.light.success,
  },
  progressBarError: {
    backgroundColor: Colors.light.error,
  },
  uploadItemPct: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.light.textMuted,
    minWidth: 36,
    textAlign: "right",
  },
  uploadItemPctDone: {
    color: Colors.light.success,
  },
  uploadItemPctError: {
    color: Colors.light.error,
  },
  uploadDoneRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: Spacing.xl,
    padding: Spacing.md,
    backgroundColor: "#F0FDF4",
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  uploadDoneText: {
    color: Colors.light.success,
    fontWeight: "700",
    fontSize: 14,
  },
});