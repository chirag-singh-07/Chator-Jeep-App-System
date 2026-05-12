import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Modal,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";

import { Alert, ActivityIndicator } from "react-native";
import { useAuthStore } from "@/store/useAuthStore";
import { apiClient } from "@/lib/api";

import * as ImagePicker from "expo-image-picker";
import { Image } from "react-native";
import {
  getCities,
  getDistricts,
  getPincodes,
  getStates,
} from "@/constants/india-pincode";

const { width, height } = Dimensions.get("window");

const STEPS = ["Account", "Kitchen", "Brand", "Location", "Legal", "Menu"];
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const indianPhoneRegex = /^[6-9]\d{9}$/;
const fssaiRegex = /^\d{14}$/;
const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const accountNumberRegex = /^\d{9,18}$/;

type OnboardingMenuItem = {
  id: string;
  name: string;
  price: string;
  category: string;
  subcategory: string;
  shortDescription: string;
  isVeg: boolean;
  image: any | null;
};

type MenuCategory = {
  _id: string;
  name: string;
  subcategories?: string[];
};

const createMenuDraft = (): OnboardingMenuItem => ({
  id: `${Date.now()}-${Math.random()}`,
  name: "",
  price: "",
  category: "",
  subcategory: "",
  shortDescription: "",
  isVeg: true,
  image: null,
});

export default function RegisterScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<{
    message: string;
    isUploading: boolean;
  }>({
    message: "",
    isUploading: false,
  });
  const { register, uploadBranding, uploadLegalDocs, isLoading } =
    useAuthStore();

  // Step 1: Account
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Step 2: Kitchen Details
  const [kitchenName, setKitchenName] = useState("");
  const [phone, setPhone] = useState("");
  const [foodType, setFoodType] = useState("both");

  // Step 3: Brand
  const [logo, setLogo] = useState<any>(null);
  const [banner, setBanner] = useState<any>(null);

  // Step 4: Location (Enhanced)
  const [street, setStreet] = useState("");
  const [landmark, setLandmark] = useState("");
  const [fullAddress, setFullAddress] = useState("");
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");
  const [pinCode, setPinCode] = useState("");

  const [showStateModal, setShowStateModal] = useState(false);
  const [showDistrictModal, setShowDistrictModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [showPincodeModal, setShowPincodeModal] = useState(false);
  const [categoryPickerItemId, setCategoryPickerItemId] = useState<string | null>(null);
  const [subcategoryPickerItemId, setSubcategoryPickerItemId] = useState<string | null>(null);

  // Step 5: Legal
  const [aadhar, setAadhar] = useState<any>(null);
  const [pan, setPan] = useState<any>(null);
  const [livePhoto, setLivePhoto] = useState<any>(null);
  const [fssaiLicense, setFssaiLicense] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [fssaiDoc, setFssaiDoc] = useState<any>(null);
  const [gstDoc, setGstDoc] = useState<any>(null);
  const [addressProofDoc, setAddressProofDoc] = useState<any>(null);
  const [premisesProofDoc, setPremisesProofDoc] = useState<any>(null);
  const [bankAccountHolder, setBankAccountHolder] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankIfsc, setBankIfsc] = useState("");
  const [bankName, setBankName] = useState("");

  // Step 6: Menu
  const [menuDrafts, setMenuDrafts] = useState<OnboardingMenuItem[]>([
    createMenuDraft(),
  ]);
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      try {
        const response = await apiClient.get("/categories?active=true");
        setMenuCategories(response.data.data || []);
      } catch (error) {
        console.warn("Failed to fetch menu categories", error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    void fetchCategories();
  }, []);

  const pickImage = async (type: "logo" | "banner") => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: type === "logo" ? [1, 1] : [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      if (type === "logo") setLogo(result.assets[0]);
      else setBanner(result.assets[0]);
    }
  };

  const pickDoc = async (
    type: "aadhar" | "pan" | "fssai" | "gst" | "addressProof" | "premisesProof",
  ) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      if (type === "aadhar") setAadhar(result.assets[0]);
      else if (type === "pan") setPan(result.assets[0]);
      else if (type === "fssai") setFssaiDoc(result.assets[0]);
      else if (type === "gst") setGstDoc(result.assets[0]);
      else if (type === "addressProof") setAddressProofDoc(result.assets[0]);
      else setPremisesProofDoc(result.assets[0]);
    }
  };

  const pickMenuImage = async (id: string) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.85,
    });

    if (!result.canceled) {
      updateMenuDraft(id, { image: result.assets[0] });
    }
  };

  const takeLivePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "PERMISSION DENIED",
        "Camera access is required for identity verification.",
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setLivePhoto(result.assets[0]);
    }
  };

  const isPinCodeValidForSelectedState = () => {
    const normalizedPin = pinCode.trim();
    if (!/^\d{6}$/.test(normalizedPin)) return false;
    const availablePincodes = getPincodes(state, district, city);
    if (!availablePincodes.length) return true;
    return availablePincodes.includes(normalizedPin);
  };

  const selectedMenuCategory = (categoryId: string) =>
    menuCategories.find((category) => category._id === categoryId || category.name === categoryId);

  const getMenuCategoryName = (categoryId: string) =>
    selectedMenuCategory(categoryId)?.name || categoryId || "Select category";

  const updateMenuDraft = (
    id: string,
    updates: Partial<OnboardingMenuItem>,
  ) => {
    setMenuDrafts((current) =>
      current.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    );
  };

  const addMenuDraft = () => {
    setMenuDrafts((current) => [...current, createMenuDraft()]);
  };

  const removeMenuDraft = (id: string) => {
    setMenuDrafts((current) =>
      current.length === 1 ? current : current.filter((item) => item.id !== id),
    );
  };

  const getValidMenuDrafts = () =>
    menuDrafts
      .map((item) => ({
        ...item,
        name: item.name.trim(),
        price: item.price.trim(),
        category: item.category.trim(),
        subcategory: item.subcategory.trim(),
        shortDescription: item.shortDescription.trim(),
      }))
      .filter((item) => item.name || item.price || item.category);

  const sanitizePrice = (value: string) => {
    const normalized = value.replace(/[^0-9.]/g, "");
    const [whole, decimal = ""] = normalized.split(".");
    return decimal ? `${whole.slice(0, 5)}.${decimal.slice(0, 2)}` : whole.slice(0, 5);
  };

  const uploadMenuImage = async (image: any) => {
    if (!image?.uri) return {};

    const formData = new FormData();
    // @ts-ignore React Native FormData accepts file-like objects.
    formData.append("file", {
      uri: image.uri,
      name: "menu-item.jpg",
      type: "image/jpeg",
    });
    formData.append("folder", "menu-items");
    formData.append("profiles", "thumbnail,medium,full");

    const response = await apiClient.post("/uploads/single", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data.data.urls || {};
  };

  const nextStep = async () => {
    // Validation for each step
    if (currentStep === 0) {
      if (!email || !password) {
        Alert.alert(
          "VALIDATION ERROR",
          "Please enter both email and password to proceed.",
        );
        return;
      }
      if (!emailRegex.test(email.trim())) {
        Alert.alert("VALIDATION ERROR", "Please enter a valid business email address.");
        return;
      }
      if (password.length < 8 || password.length > 64) {
        Alert.alert(
          "VALIDATION ERROR",
          "Password must be between 8 and 64 characters long.",
        );
        return;
      }
    } else if (currentStep === 1) {
      if (!kitchenName || !phone) {
        Alert.alert(
          "VALIDATION ERROR",
          "Restaurant name and phone number are required.",
        );
        return;
      }
      if (kitchenName.trim().length < 3 || kitchenName.trim().length > 80) {
        Alert.alert("VALIDATION ERROR", "Restaurant name must be between 3 and 80 characters.");
        return;
      }
      if (!indianPhoneRegex.test(phone.trim())) {
        Alert.alert(
          "VALIDATION ERROR",
          "Please enter a valid Indian 10-digit phone number starting with 6, 7, 8, or 9.",
        );
        return;
      }
    } else if (currentStep === 2) {
      if (!logo || !banner) {
        Alert.alert(
          "VALIDATION ERROR",
          "Please upload both your Logo and Fleet Banner.",
        );
        return;
      }
    } else if (currentStep === 3) {
      if (!street || !fullAddress || !state || !district || !city || !pinCode) {
        Alert.alert(
          "VALIDATION ERROR",
          "Please fill all required address fields.",
        );
        return;
      }
      if (street.trim().length < 3 || fullAddress.trim().length < 8) {
        Alert.alert("VALIDATION ERROR", "Street/building and full address need more detail.");
        return;
      }
      if (!getDistricts(state).includes(district)) {
        Alert.alert(
          "VALIDATION ERROR",
          "Please select a district that belongs to the selected state.",
        );
        return;
      }
      if (!getCities(state, district).includes(city)) {
        Alert.alert(
          "VALIDATION ERROR",
          "Please select a city/post office that belongs to the selected district.",
        );
        return;
      }
      if (!isPinCodeValidForSelectedState()) {
        Alert.alert(
          "VALIDATION ERROR",
          getPincodes(state, district, city).length
            ? "This PIN code does not match the selected city/post office."
            : "PIN code must be exactly 6 digits.",
        );
        return;
      }
    } else if (currentStep === 4) {
      if (
        !aadhar ||
        !pan ||
        !livePhoto ||
        !fssaiLicense.trim() ||
        !fssaiDoc ||
        !addressProofDoc ||
        !premisesProofDoc ||
        !bankAccountHolder.trim() ||
        !bankAccountNumber.trim() ||
        !bankIfsc.trim() ||
        !bankName.trim()
      ) {
        Alert.alert(
          "VALIDATION ERROR",
          "Aadhar, PAN, live photo, FSSAI license, address proof, premises proof, and bank details are required.",
        );
        return;
      }
      if (gstNumber.trim() && !gstDoc) {
        Alert.alert(
          "VALIDATION ERROR",
          "Please upload GST registration proof or clear the GST number if it is not applicable.",
        );
        return;
      }
      if (!fssaiRegex.test(fssaiLicense.trim())) {
        Alert.alert("VALIDATION ERROR", "FSSAI license number must be exactly 14 digits.");
        return;
      }
      if (gstNumber.trim() && !gstRegex.test(gstNumber.trim().toUpperCase())) {
        Alert.alert("VALIDATION ERROR", "Please enter a valid 15-character GST number.");
        return;
      }
      if (bankAccountHolder.trim().length < 3 || bankAccountHolder.trim().length > 80) {
        Alert.alert("VALIDATION ERROR", "Account holder name must be between 3 and 80 characters.");
        return;
      }
      if (!accountNumberRegex.test(bankAccountNumber.trim())) {
        Alert.alert("VALIDATION ERROR", "Bank account number must be 9 to 18 digits.");
        return;
      }
      if (!ifscRegex.test(bankIfsc.trim().toUpperCase())) {
        Alert.alert("VALIDATION ERROR", "Please enter a valid IFSC code, for example HDFC0001234.");
        return;
      }
      if (bankName.trim().length < 3 || bankName.trim().length > 60) {
        Alert.alert("VALIDATION ERROR", "Bank name must be between 3 and 60 characters.");
        return;
      }
    } else if (currentStep === 5) {
      const validMenuDrafts = getValidMenuDrafts();
      const hasInvalidItem = validMenuDrafts.some(
        (item) =>
          item.name.length < 2 ||
          item.name.length > 80 ||
          !item.price ||
          !item.category ||
          !item.image?.uri ||
          Number.isNaN(Number(item.price)) ||
          Number(item.price) <= 0 ||
          Number(item.price) > 99999 ||
          item.shortDescription.length > 160,
      );

      if (validMenuDrafts.length === 0 || hasInvalidItem) {
        Alert.alert(
          "VALIDATION ERROR",
          "Add at least one food item with image, name, category, and a valid price before sending for verification.",
        );
        return;
      }
    }

    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      try {
        setUploadStatus({ message: "CREATING ACCOUNT...", isUploading: true });
        const finalAddress = `${street}, ${landmark ? landmark + ", " : ""}${fullAddress}, ${city}, ${district}, ${state} - ${pinCode}`;

        await register({
          email,
          password,
          ownerName: kitchenName,
          restaurantName: kitchenName,
          phone,
          fssaiLicense: fssaiLicense.trim(),
          cuisines: [foodType],
          address: {
            line1: finalAddress,
            city: city,
            state: state,
            pinCode: pinCode,
          },
          bankDetails: {
            accountHolderName: bankAccountHolder.trim(),
            accountNumber: bankAccountNumber.trim(),
            ifscCode: bankIfsc.trim().toUpperCase(),
            bankName: bankName.trim(),
          },
        });

        if (logo || banner) {
          setUploadStatus({
            message: "UPLOADING BRAND ASSETS...",
            isUploading: true,
          });
          await uploadBranding(logo, banner);
        }

        if (aadhar || pan || livePhoto) {
          setUploadStatus({
            message: "UPLOADING LEGAL DOCUMENTS...",
            isUploading: true,
          });
          await uploadLegalDocs(
            aadhar,
            pan,
            livePhoto,
            [
              { label: `FSSAI License (${fssaiLicense.trim()})`, file: fssaiDoc },
              ...(gstDoc
                ? [
                    {
                      label: gstNumber.trim()
                        ? `GST Registration (${gstNumber.trim()})`
                        : "GST Registration",
                      file: gstDoc,
                    },
                  ]
                : []),
              { label: "Address Proof", file: addressProofDoc },
              {
                label: "Electricity Bill / Rent Agreement / Property Tax Receipt",
                file: premisesProofDoc,
              },
            ],
          );
        }

        setUploadStatus({
          message: "ADDING MENU ITEMS...",
          isUploading: true,
        });
        for (const item of getValidMenuDrafts()) {
          const imageUrls = await uploadMenuImage(item.image);
          await apiClient.post("/restaurants/me/menu", {
            name: item.name,
            price: Number(item.price),
            category: item.category,
            subcategory: item.subcategory || undefined,
            shortDescription: item.shortDescription || undefined,
            description: item.shortDescription || undefined,
            imageUrl:
              (imageUrls as any).medium ||
              (imageUrls as any).full ||
              (imageUrls as any).thumbnail ||
              undefined,
            images: Object.keys(imageUrls).length ? imageUrls : undefined,
            isVeg: item.isVeg,
            isAvailable: true,
            showInMenu: true,
            availabilitySlots: ["Lunch", "Dinner"],
          });
        }

        setUploadStatus({
          message: "REGISTRATION COMPLETE",
          isUploading: false,
        });
        Alert.alert(
          "REGISTRATION SUCCESS",
          "Your restaurant details were submitted successfully.",
          [
            {
              text: "OPEN STATUS",
              onPress: () => router.replace("/(auth)/pending"),
            },
          ],
        );
      } catch (error: any) {
        setUploadStatus({ message: "", isUploading: false });

        const rawMsg: string = error?.message || "";
        const lowerMsg = rawMsg.toLowerCase();

        // Map backend messages → user-friendly title + description
        let title = "REGISTRATION ERROR";
        let description = "We could not submit your details. Please try again.";

        if (lowerMsg.includes("email already registered") || lowerMsg.includes("already registered")) {
          title = "EMAIL ALREADY IN USE";
          description = "This email is already registered with us.\n\nPlease use a different email, or go back to the login screen if this is your account.";
        } else if (lowerMsg.includes("network") || lowerMsg.includes("timeout") || lowerMsg.includes("econnrefused")) {
          title = "CONNECTION FAILED";
          description = "We couldn't reach our servers. Please check your internet connection and try again.";
        } else if (lowerMsg.includes("phone")) {
          title = "PHONE NUMBER ERROR";
          description = "The phone number you entered is invalid or already in use. Please check and try again.";
        } else if (lowerMsg.includes("password")) {
          title = "PASSWORD ERROR";
          description = rawMsg;
        } else if (lowerMsg.includes("upload") || lowerMsg.includes("image") || lowerMsg.includes("file")) {
          title = "UPLOAD FAILED";
          description = "Your account was created but we couldn't upload your documents. Please try uploading them again from your profile.";
        } else if (rawMsg.length > 0) {
          // Use the backend's message directly if it's meaningful
          description = rawMsg;
        }

        Alert.alert(title, description, [{ text: "OK", style: "default" }]);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
    else router.back();
  };

  const renderContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>CREATE ACCOUNT</Text>
            <Text style={styles.stepSub}>Set up your restaurant login.</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>BUSINESS EMAIL</Text>
              <TextInput
                style={styles.input}
                placeholder="ops@chatorjeep.com"
                placeholderTextColor="#666"
                value={email}
                onChangeText={(value) => setEmail(value.trim())}
                keyboardType="email-address"
                autoCapitalize="none"
                maxLength={120}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>PASSWORD</Text>
              <View style={styles.passwordInputRow}>
              <TextInput
                style={styles.passwordInput}
                placeholder="••••••••"
                placeholderTextColor="#666"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                maxLength={64}
              />
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel={
                    showPassword ? "Hide password" : "Show password"
                  }
                  onPress={() => setShowPassword((current) => !current)}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );
      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>KITCHEN IDENTITY</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>RESTAURANT NAME</Text>
              <TextInput
                style={styles.input}
                placeholder="E.g. GOLDEN GRILL"
                value={kitchenName}
                onChangeText={(value) => setKitchenName(value.slice(0, 80))}
                maxLength={80}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>PHONE NUMBER</Text>
              <TextInput
                style={styles.input}
                placeholder="10 digit mobile number"
                value={phone}
                onChangeText={(value) => setPhone(value.replace(/\D/g, ""))}
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>
          </View>
        );
      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>BRAND IMAGES</Text>
            <View style={styles.uploadRow}>
              <TouchableOpacity
                style={styles.logoUpload}
                onPress={() => pickImage("logo")}
              >
                {logo ? (
                  <Image
                    source={{ uri: logo.uri }}
                    style={styles.previewImage}
                  />
                ) : (
                  <View style={{ alignItems: "center" }}>
                    <Ionicons
                      name="finger-print"
                      size={32}
                      color={Colors.light.primary}
                    />
                    <Text style={styles.uploadLabel}>LOGO</Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.bannerUpload}
                onPress={() => pickImage("banner")}
              >
                {banner ? (
                  <Image
                    source={{ uri: banner.uri }}
                    style={styles.previewImage}
                  />
                ) : (
                  <View style={{ alignItems: "center" }}>
                    <Ionicons
                      name="images"
                      size={32}
                      color={Colors.light.primary}
                    />
                    <Text style={styles.uploadLabel}>BANNER</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        );
      case 3:
        const availableStates = getStates();
        const availableDistricts = getDistricts(state);
        const availableCities = getCities(state, district);
        const availablePincodes = getPincodes(state, district, city);
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>LOGISTICS NODE</Text>
            <Text style={styles.stepSub}>
              Specify your collection point with precision.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>STREET NAME / BUILDING</Text>
              <TextInput
                style={styles.input}
                placeholder="Flat 402, Sunshine Heights"
                placeholderTextColor="#444"
                value={street}
                onChangeText={(value) => setStreet(value.slice(0, 90))}
                maxLength={90}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>LANDMARK (OPTIONAL)</Text>
              <TextInput
                style={styles.input}
                placeholder="Near City Mall"
                placeholderTextColor="#444"
                value={landmark}
                onChangeText={(value) => setLandmark(value.slice(0, 80))}
                maxLength={80}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>FULL ADDRESS DETAILS</Text>
              <TextInput
                style={[styles.input, { height: 80, paddingTop: 15 }]}
                multiline
                placeholder="Sector 4, Main Road..."
                placeholderTextColor="#444"
                value={fullAddress}
                onChangeText={(value) => setFullAddress(value.slice(0, 220))}
                maxLength={220}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.label}>STATE</Text>
                <TouchableOpacity
                  style={styles.pickerTrigger}
                  onPress={() => setShowStateModal(true)}
                >
                  <Text
                    style={[styles.pickerText, !state && { color: "#666" }]}
                  >
                    {state || "Select State"}
                  </Text>
                  <Ionicons
                    name="chevron-down"
                    size={16}
                    color={Colors.light.primary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.label}>DISTRICT</Text>
                <TouchableOpacity
                  style={[styles.pickerTrigger, !state && { opacity: 0.5 }]}
                  onPress={() => (state ? setShowDistrictModal(true) : null)}
                >
                  <Text style={[styles.pickerText, !district && { color: "#666" }]}>
                    {district || "Select District"}
                  </Text>
                  <Ionicons
                    name="chevron-down"
                    size={16}
                    color={Colors.light.primary}
                  />
                </TouchableOpacity>
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>CITY</Text>
                <TouchableOpacity
                  style={[styles.pickerTrigger, !district && { opacity: 0.5 }]}
                  onPress={() => (district ? setShowCityModal(true) : null)}
                >
                  <Text style={[styles.pickerText, !city && { color: "#666" }]}>
                    {city || "Select City/Post Office"}
                  </Text>
                  <Ionicons
                    name="chevron-down"
                    size={16}
                    color={Colors.light.primary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>PIN CODE</Text>
              {availablePincodes.length ? (
                <TouchableOpacity
                  style={styles.pickerTrigger}
                  onPress={() => setShowPincodeModal(true)}
                >
                  <Text style={[styles.pickerText, !pinCode && { color: "#666" }]}>
                    {pinCode || "Select PIN code"}
                  </Text>
                  <Ionicons
                    name="chevron-down"
                    size={16}
                    color={Colors.light.primary}
                  />
                </TouchableOpacity>
              ) : (
                <TextInput
                  style={styles.input}
                  placeholder="400001"
                  placeholderTextColor="#444"
                  value={pinCode}
                  onChangeText={(value) => setPinCode(value.replace(/\D/g, ""))}
                  keyboardType="numeric"
                  maxLength={6}
                />
              )}
              {pinCode.length === 6 && !isPinCodeValidForSelectedState() && (
                <Text style={styles.errorText}>
                  PIN code does not match the selected state data.
                </Text>
              )}
            </View>

            {/* State Modal */}
            <Modal visible={showStateModal} transparent animationType="slide">
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>SELECT STATE</Text>
                  <FlatList
                    data={availableStates}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.modalItem}
                        onPress={() => {
                          setState(item);
                          setDistrict("");
                          setCity("");
                          setPinCode("");
                          setShowStateModal(false);
                        }}
                      >
                        <Text style={styles.modalItemText}>{item}</Text>
                      </TouchableOpacity>
                    )}
                  />
                  <TouchableOpacity
                    style={styles.modalClose}
                    onPress={() => setShowStateModal(false)}
                  >
                    <Text style={styles.modalCloseText}>CLOSE</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            <Modal visible={showDistrictModal} transparent animationType="slide">
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>SELECT DISTRICT</Text>
                  <FlatList
                    data={availableDistricts}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.modalItem}
                        onPress={() => {
                          setDistrict(item);
                          setCity("");
                          setPinCode("");
                          setShowDistrictModal(false);
                        }}
                      >
                        <Text style={styles.modalItemText}>{item}</Text>
                      </TouchableOpacity>
                    )}
                  />
                  <TouchableOpacity
                    style={styles.modalClose}
                    onPress={() => setShowDistrictModal(false)}
                  >
                    <Text style={styles.modalCloseText}>CLOSE</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            {/* City Modal */}
            <Modal visible={showCityModal} transparent animationType="slide">
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>SELECT CITY</Text>
                  <FlatList
                    data={availableCities}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.modalItem}
                        onPress={() => {
                          setCity(item);
                          const nextPincodes = getPincodes(state, district, item);
                          setPinCode(nextPincodes[0] || "");
                          setShowCityModal(false);
                        }}
                      >
                        <Text style={styles.modalItemText}>{item}</Text>
                      </TouchableOpacity>
                    )}
                  />
                  <TouchableOpacity
                    style={styles.modalClose}
                    onPress={() => setShowCityModal(false)}
                  >
                    <Text style={styles.modalCloseText}>CLOSE</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            <Modal visible={showPincodeModal} transparent animationType="slide">
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>SELECT PIN CODE</Text>
                  <FlatList
                    data={availablePincodes}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.modalItem}
                        onPress={() => {
                          setPinCode(item);
                          setShowPincodeModal(false);
                        }}
                      >
                        <Text style={styles.modalItemText}>{item}</Text>
                      </TouchableOpacity>
                    )}
                  />
                  <TouchableOpacity
                    style={styles.modalClose}
                    onPress={() => setShowPincodeModal(false)}
                  >
                    <Text style={styles.modalCloseText}>CLOSE</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </View>
        );
      case 4:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>LEGAL PROTOCOL</Text>
            <View style={styles.docGrid}>
              <TouchableOpacity
                style={styles.docItem}
                onPress={() => pickDoc("aadhar")}
              >
                {aadhar ? (
                  <Image
                    source={{ uri: aadhar.uri }}
                    style={styles.previewImage}
                  />
                ) : (
                  <View style={styles.docIcon}>
                    <Ionicons
                      name="card"
                      size={24}
                      color={Colors.light.primary}
                    />
                  </View>
                )}
                <Text style={styles.docLabel}>AADHAR</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.docItem}
                onPress={() => pickDoc("pan")}
              >
                {pan ? (
                  <Image
                    source={{ uri: pan.uri }}
                    style={styles.previewImage}
                  />
                ) : (
                  <View style={styles.docIcon}>
                    <Ionicons
                      name="document-text"
                      size={24}
                      color={Colors.light.primary}
                    />
                  </View>
                )}
                <Text style={styles.docLabel}>PAN</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.legalSectionTitle}>FSSAI & GST</Text>
            <TextInput
              style={styles.input}
              placeholder="FSSAI License Number"
              placeholderTextColor="#666"
              value={fssaiLicense}
              keyboardType="number-pad"
              maxLength={14}
              onChangeText={(value) => setFssaiLicense(value.replace(/\D/g, ""))}
            />
            <View style={[styles.docGrid, { marginTop: 15 }]}>
              <TouchableOpacity
                style={styles.docItem}
                onPress={() => pickDoc("fssai")}
              >
                {fssaiDoc ? (
                  <Image
                    source={{ uri: fssaiDoc.uri }}
                    style={styles.previewImage}
                  />
                ) : (
                  <View style={styles.docIcon}>
                    <Ionicons
                      name="shield-checkmark"
                      size={24}
                      color={Colors.light.primary}
                    />
                  </View>
                )}
                <Text style={styles.docLabel}>FSSAI LICENSE</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.docItem}
                onPress={() => pickDoc("gst")}
              >
                {gstDoc ? (
                  <Image
                    source={{ uri: gstDoc.uri }}
                    style={styles.previewImage}
                  />
                ) : (
                  <View style={styles.docIcon}>
                    <Ionicons
                      name="receipt"
                      size={24}
                      color={Colors.light.primary}
                    />
                  </View>
                )}
                <Text style={styles.docLabel}>GST OPTIONAL</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={[styles.input, { marginTop: 15 }]}
              placeholder="GST Number (if applicable)"
              placeholderTextColor="#666"
              value={gstNumber}
              autoCapitalize="characters"
              maxLength={15}
              onChangeText={(value) => setGstNumber(value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase())}
            />

            <Text style={styles.legalSectionTitle}>BANK ACCOUNT DETAILS</Text>
            <TextInput
              style={styles.input}
              placeholder="Account Holder Name"
              placeholderTextColor="#666"
              value={bankAccountHolder}
              maxLength={80}
              onChangeText={(value) => setBankAccountHolder(value.replace(/[^a-zA-Z\s.'-]/g, "").slice(0, 80))}
            />
            <TextInput
              style={[styles.input, { marginTop: 12 }]}
              placeholder="Account Number"
              placeholderTextColor="#666"
              value={bankAccountNumber}
              keyboardType="number-pad"
              maxLength={18}
              onChangeText={(value) => setBankAccountNumber(value.replace(/\D/g, ""))}
            />
            <View style={[styles.row, { marginTop: 12 }]}>
              <TextInput
                style={[styles.input, { flex: 1, marginRight: 10 }]}
                placeholder="IFSC"
                placeholderTextColor="#666"
                value={bankIfsc}
                autoCapitalize="characters"
                maxLength={11}
                onChangeText={(value) => setBankIfsc(value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase())}
              />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Bank Name"
                placeholderTextColor="#666"
                value={bankName}
                maxLength={60}
                onChangeText={(value) => setBankName(value.replace(/[^a-zA-Z\s.'-]/g, "").slice(0, 60))}
              />
            </View>

            <Text style={styles.legalSectionTitle}>ADDRESS & PREMISES PROOF</Text>
            <View style={styles.docGrid}>
              <TouchableOpacity
                style={styles.docItem}
                onPress={() => pickDoc("addressProof")}
              >
                {addressProofDoc ? (
                  <Image
                    source={{ uri: addressProofDoc.uri }}
                    style={styles.previewImage}
                  />
                ) : (
                  <View style={styles.docIcon}>
                    <Ionicons
                      name="location"
                      size={24}
                      color={Colors.light.primary}
                    />
                  </View>
                )}
                <Text style={styles.docLabel}>ADDRESS PROOF</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.docItem}
                onPress={() => pickDoc("premisesProof")}
              >
                {premisesProofDoc ? (
                  <Image
                    source={{ uri: premisesProofDoc.uri }}
                    style={styles.previewImage}
                  />
                ) : (
                  <View style={styles.docIcon}>
                    <Ionicons
                      name="business"
                      size={24}
                      color={Colors.light.primary}
                    />
                  </View>
                )}
                <Text style={styles.docLabel}>BILL / RENT / TAX</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.livePhotoBox}
              onPress={takeLivePhoto}
            >
              {livePhoto ? (
                <Image
                  source={{ uri: livePhoto.uri }}
                  style={styles.previewImage}
                />
              ) : (
                <View style={{ alignItems: "center" }}>
                  <Ionicons
                    name="camera"
                    size={40}
                    color={Colors.light.primary}
                  />
                  <Text style={styles.livePhotoText}>CAPTURE LIVE PHOTO</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        );
      case 5:
        return (
          <View style={styles.stepContent}>
            <View style={styles.menuHero}>
              <View>
                <Text style={styles.stepTitle}>STARTER MENU</Text>
                <Text style={styles.stepSub}>
                  Add at least one food item before your restaurant goes to admin verification.
                </Text>
              </View>
              <View style={styles.menuCountBadge}>
                <Text style={styles.menuCountNumber}>{menuDrafts.length}</Text>
                <Text style={styles.menuCountLabel}>items</Text>
              </View>
            </View>
            <Text style={styles.stepSub}>
              {categoriesLoading
                ? "Loading food categories..."
                : `${menuCategories.length || 0} backend categories available`}
            </Text>

            {menuDrafts.map((item, index) => (
              <View key={item.id} style={styles.menuDraftCard}>
                <View style={styles.menuDraftHeader}>
                  <View>
                    <Text style={styles.menuDraftTitle}>FOOD ITEM {index + 1}</Text>
                    <Text style={styles.menuDraftMeta}>
                      {item.name.trim() || "New dish"} • {getMenuCategoryName(item.category)}
                    </Text>
                  </View>
                  {menuDrafts.length > 1 && (
                    <TouchableOpacity style={styles.deleteMenuButton} onPress={() => removeMenuDraft(item.id)}>
                      <Ionicons name="trash-outline" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  )}
                </View>

                <TouchableOpacity
                  style={styles.menuImagePicker}
                  onPress={() => pickMenuImage(item.id)}
                >
                  {item.image?.uri ? (
                    <Image
                      source={{ uri: item.image.uri }}
                      style={styles.menuImagePreview}
                    />
                  ) : (
                    <View style={styles.menuImagePlaceholder}>
                      <Ionicons
                        name="image-outline"
                        size={34}
                        color={Colors.light.primary}
                      />
                      <Text style={styles.menuImageText}>ADD FOOD IMAGE</Text>
                      <Text style={styles.menuImageHint}>Clear, bright dish photo works best</Text>
                    </View>
                  )}
                </TouchableOpacity>

                <Text style={styles.label}>DISH NAME</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Paneer Butter Masala"
                  placeholderTextColor="#666"
                  value={item.name}
                  maxLength={80}
                  onChangeText={(value) => updateMenuDraft(item.id, { name: value.slice(0, 80) })}
                />

                <View style={styles.row}>
                  <View style={[styles.inputGroup, { flex: 1, marginRight: 10, marginTop: 14 }]}>
                    <Text style={styles.label}>PRICE</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="199"
                      placeholderTextColor="#666"
                      value={item.price}
                      keyboardType="decimal-pad"
                      onChangeText={(value) =>
                        updateMenuDraft(item.id, {
                          price: sanitizePrice(value),
                        })
                      }
                    />
                  </View>
                  <View style={[styles.inputGroup, { flex: 1, marginTop: 14 }]}>
                    <Text style={styles.label}>CATEGORY</Text>
                    <TouchableOpacity
                      style={styles.menuPickerTrigger}
                      onPress={() => setCategoryPickerItemId(item.id)}
                    >
                      <Text
                        style={[styles.menuPickerText, !item.category && { color: "#666" }]}
                        numberOfLines={1}
                      >
                        {getMenuCategoryName(item.category)}
                      </Text>
                      <Ionicons name="chevron-down" size={16} color={Colors.light.primary} />
                    </TouchableOpacity>
                  </View>
                </View>

                {selectedMenuCategory(item.category)?.subcategories?.length ? (
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>SUBCATEGORY</Text>
                    <TouchableOpacity
                      style={styles.menuPickerTrigger}
                      onPress={() => setSubcategoryPickerItemId(item.id)}
                    >
                      <Text
                        style={[styles.menuPickerText, !item.subcategory && { color: "#666" }]}
                        numberOfLines={1}
                      >
                        {item.subcategory || "Select subcategory"}
                      </Text>
                      <Ionicons name="chevron-down" size={16} color={Colors.light.primary} />
                    </TouchableOpacity>
                  </View>
                ) : null}

                <Text style={styles.label}>SHORT DESCRIPTION</Text>
                <TextInput
                  style={[styles.input, styles.menuDescriptionInput]}
                  placeholder="Creamy, rich, and perfect with naan."
                  placeholderTextColor="#666"
                  value={item.shortDescription}
                  multiline
                  maxLength={160}
                  onChangeText={(value) =>
                    updateMenuDraft(item.id, { shortDescription: value.slice(0, 160) })
                  }
                />
                <Text style={styles.characterHint}>{item.shortDescription.length}/160</Text>

                <View style={styles.foodTypeRow}>
                  <TouchableOpacity
                    style={[
                      styles.foodTypeChip,
                      item.isVeg && styles.foodTypeChipActive,
                    ]}
                    onPress={() => updateMenuDraft(item.id, { isVeg: true })}
                  >
                    <Text
                      style={[
                        styles.foodTypeChipText,
                        item.isVeg && styles.foodTypeChipTextActive,
                      ]}
                    >
                      VEG
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.foodTypeChip,
                      !item.isVeg && styles.foodTypeChipActive,
                    ]}
                    onPress={() => updateMenuDraft(item.id, { isVeg: false })}
                  >
                    <Text
                      style={[
                        styles.foodTypeChipText,
                        !item.isVeg && styles.foodTypeChipTextActive,
                      ]}
                    >
                      NON-VEG
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            <TouchableOpacity style={styles.addMenuButton} onPress={addMenuDraft}>
              <Ionicons name="add-circle-outline" size={20} color={Colors.light.primary} />
              <Text style={styles.addMenuButtonText}>ADD ANOTHER FOOD ITEM</Text>
            </TouchableOpacity>

            <Modal visible={Boolean(categoryPickerItemId)} transparent animationType="slide">
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>SELECT CATEGORY</Text>
                  <FlatList
                    data={menuCategories}
                    keyExtractor={(category) => category._id}
                    ListEmptyComponent={
                      <Text style={styles.emptyPickerText}>
                        No categories found. Please seed categories from backend.
                      </Text>
                    }
                    renderItem={({ item: category }) => (
                      <TouchableOpacity
                        style={styles.modalItem}
                        onPress={() => {
                          if (categoryPickerItemId) {
                            updateMenuDraft(categoryPickerItemId, {
                              category: category._id,
                              subcategory: category.subcategories?.[0] || "",
                            });
                          }
                          setCategoryPickerItemId(null);
                        }}
                      >
                        <Text style={styles.modalItemText}>{category.name}</Text>
                      </TouchableOpacity>
                    )}
                  />
                  <TouchableOpacity
                    style={styles.modalClose}
                    onPress={() => setCategoryPickerItemId(null)}
                  >
                    <Text style={styles.modalCloseText}>CLOSE</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            <Modal visible={Boolean(subcategoryPickerItemId)} transparent animationType="slide">
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>SELECT SUBCATEGORY</Text>
                  <FlatList
                    data={
                      selectedMenuCategory(
                        menuDrafts.find((draft) => draft.id === subcategoryPickerItemId)?.category || "",
                      )?.subcategories || []
                    }
                    keyExtractor={(subcategory) => subcategory}
                    renderItem={({ item: subcategory }) => (
                      <TouchableOpacity
                        style={styles.modalItem}
                        onPress={() => {
                          if (subcategoryPickerItemId) {
                            updateMenuDraft(subcategoryPickerItemId, { subcategory });
                          }
                          setSubcategoryPickerItemId(null);
                        }}
                      >
                        <Text style={styles.modalItemText}>{subcategory}</Text>
                      </TouchableOpacity>
                    )}
                  />
                  <TouchableOpacity
                    style={styles.modalClose}
                    onPress={() => setSubcategoryPickerItemId(null)}
                  >
                    <Text style={styles.modalCloseText}>CLOSE</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={prevStep} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>SECURE ONBOARDING</Text>
        </View>

        <View style={styles.indicatorWrapper}>
          {STEPS.map((s, i) => (
            <View
              key={s}
              style={[styles.dot, i <= currentStep && styles.activeDot]}
            >
              <Text
                style={[styles.dotText, i <= currentStep && { color: "black" }]}
              >
                {i + 1}
              </Text>
            </View>
          ))}
        </View>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {renderContent()}
        </ScrollView>

        <View style={styles.footer}>
          {currentStep > 0 && (
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={prevStep}
              disabled={isLoading || uploadStatus.isUploading}
            >
              <Ionicons name="arrow-back" size={18} color="#FFF" />
              <Text style={styles.secondaryBtnText}>BACK TO EDIT DETAILS</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[
              styles.mainBtn,
              (isLoading || uploadStatus.isUploading) && { opacity: 0.6 },
            ]}
            onPress={nextStep}
            disabled={isLoading || uploadStatus.isUploading}
          >
            {isLoading || uploadStatus.isUploading ? (
              <ActivityIndicator color="black" />
            ) : (
              <Text style={styles.mainBtnText}>
                {currentStep === STEPS.length - 1
                  ? "FINALIZE PROTOCOL"
                  : "NEXT SEQUENCE"}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {uploadStatus.isUploading && (
          <View style={styles.uploadOverlay}>
            <View style={styles.uploadModal}>
              <ActivityIndicator size="large" color={Colors.light.primary} />
              <Text style={styles.uploadTitle}>{uploadStatus.message}</Text>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  header: { flexDirection: "row", alignItems: "center", padding: 25 },
  backBtn: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#222",
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: "900",
    marginLeft: 15,
    color: "#FFF",
    letterSpacing: 2,
  },
  indicatorWrapper: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 15,
    paddingVertical: 10,
  },
  dot: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: "#111",
    borderWidth: 1.5,
    borderColor: "#222",
    alignItems: "center",
    justifyContent: "center",
  },
  activeDot: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primary,
  },
  dotText: { fontSize: 10, fontWeight: "900", color: "#666" },
  stepContent: { padding: 30 },
  stepTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FFF",
    marginBottom: 10,
    letterSpacing: 1,
  },
  stepSub: { fontSize: 13, color: "#BBB", lineHeight: 22, marginBottom: 25 },
  inputGroup: { marginBottom: 20 },
  label: {
    fontSize: 11,
    fontWeight: "900",
    color: Colors.light.primary,
    marginBottom: 10,
    letterSpacing: 1.5,
  },
  input: {
    backgroundColor: "#0A0A0A",
    height: 55,
    borderRadius: 15,
    paddingHorizontal: 20,
    fontSize: 15,
    color: "#FFF",
    borderWidth: 1,
    borderColor: "#1A1A1A",
  },
  passwordInputRow: {
    backgroundColor: "#0A0A0A",
    height: 55,
    borderRadius: 15,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#1A1A1A",
  },
  passwordInput: {
    flex: 1,
    height: "100%",
    fontSize: 15,
    color: "#FFF",
  },
  row: { flexDirection: "row" },
  pickerTrigger: {
    backgroundColor: "#0A0A0A",
    height: 55,
    borderRadius: 15,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#1A1A1A",
  },
  pickerText: { color: "#FFF", fontSize: 14, fontWeight: "600" },
  uploadRow: { flexDirection: "row", gap: 18 },
  logoUpload: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 22,
    backgroundColor: "#0A0A0A",
    borderStyle: "dashed",
    borderWidth: 1.5,
    borderColor: "#222",
    alignItems: "center",
    justifyContent: "center",
  },
  bannerUpload: {
    flex: 1.8,
    aspectRatio: 1,
    borderRadius: 22,
    backgroundColor: "#0A0A0A",
    borderStyle: "dashed",
    borderWidth: 1.5,
    borderColor: "#222",
    alignItems: "center",
    justifyContent: "center",
  },
  uploadLabel: {
    marginTop: 10,
    fontSize: 9,
    fontWeight: "900",
    color: Colors.light.primary,
  },
  previewImage: { width: "100%", height: "100%", borderRadius: 20 },
  docGrid: { flexDirection: "row", gap: 15 },
  docItem: {
    flex: 1,
    height: 120,
    backgroundColor: "#0A0A0A",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#1A1A1A",
    alignItems: "center",
    justifyContent: "center",
  },
  docIcon: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  docLabel: { fontSize: 9, fontWeight: "900", color: "#666" },
  legalSectionTitle: {
    fontSize: 11,
    fontWeight: "900",
    color: Colors.light.primary,
    marginTop: 22,
    marginBottom: 12,
    letterSpacing: 1.4,
  },
  livePhotoBox: {
    width: "100%",
    height: 180,
    backgroundColor: "#0A0A0A",
    borderRadius: 25,
    borderStyle: "dashed",
    borderWidth: 1.5,
    borderColor: "#1A1A1A",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 25,
  },
  livePhotoText: {
    fontSize: 12,
    fontWeight: "900",
    color: Colors.light.primary,
    marginTop: 10,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 8,
  },
  menuDraftCard: {
    backgroundColor: "#0A0A0A",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#1A1A1A",
    padding: 16,
    marginBottom: 16,
  },
  menuDraftHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  menuDraftTitle: {
    color: Colors.light.primary,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.4,
  },
  menuDraftMeta: {
    color: "#888",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 5,
  },
  deleteMenuButton: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: "rgba(239,68,68,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  menuImagePicker: {
    height: 150,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#222",
    borderStyle: "dashed",
    backgroundColor: "#111",
    overflow: "hidden",
    marginBottom: 14,
  },
  menuImagePreview: {
    width: "100%",
    height: "100%",
    borderRadius: 18,
  },
  menuImagePlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  menuImageText: {
    color: Colors.light.primary,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
  },
  menuImageHint: {
    color: "#777",
    fontSize: 11,
    fontWeight: "700",
  },
  menuHero: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
  },
  menuCountBadge: {
    minWidth: 62,
    borderRadius: 18,
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#222",
    alignItems: "center",
    paddingVertical: 10,
  },
  menuCountNumber: {
    color: Colors.light.primary,
    fontSize: 22,
    fontWeight: "900",
  },
  menuCountLabel: {
    color: "#888",
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  menuPickerTrigger: {
    backgroundColor: "#0A0A0A",
    height: 55,
    borderRadius: 15,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#1A1A1A",
    gap: 10,
  },
  menuPickerText: {
    flex: 1,
    color: "#FFF",
    fontSize: 14,
    fontWeight: "700",
  },
  characterHint: {
    color: "#666",
    fontSize: 11,
    fontWeight: "700",
    textAlign: "right",
    marginTop: 6,
  },
  menuDescriptionInput: {
    minHeight: 82,
    paddingTop: 15,
    textAlignVertical: "top",
  },
  foodTypeRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  foodTypeChip: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#222",
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
  },
  foodTypeChipActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  foodTypeChipText: {
    color: "#777",
    fontSize: 12,
    fontWeight: "900",
  },
  foodTypeChipTextActive: {
    color: "#000",
  },
  addMenuButton: {
    minHeight: 54,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#222",
    borderStyle: "dashed",
    backgroundColor: "#0A0A0A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  addMenuButtonText: {
    color: Colors.light.primary,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
  },
  footer: { padding: 25, paddingBottom: 35 },
  secondaryBtn: {
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#222",
    backgroundColor: "#0A0A0A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 12,
  },
  secondaryBtnText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
  },
  mainBtn: {
    backgroundColor: Colors.light.primary,
    height: 60,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  mainBtnText: {
    color: "black",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.95)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  },
  uploadModal: {
    width: "80%",
    padding: 30,
    borderRadius: 30,
    backgroundColor: "#0A0A0A",
    alignItems: "center",
  },
  uploadTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#FFF",
    marginTop: 20,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    maxHeight: "70%",
    backgroundColor: "#0A0A0A",
    borderRadius: 30,
    padding: 25,
    borderWidth: 1,
    borderColor: "#222",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: Colors.light.primary,
    marginBottom: 20,
    textAlign: "center",
    letterSpacing: 2,
  },
  modalItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#111",
  },
  modalItemText: { color: "#FFF", fontSize: 16, fontWeight: "600" },
  emptyPickerText: {
    color: "#888",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    paddingVertical: 24,
  },
  modalClose: {
    marginTop: 20,
    padding: 15,
    alignItems: "center",
    backgroundColor: "#111",
    borderRadius: 15,
  },
  modalCloseText: { color: Colors.light.primary, fontWeight: "900" },
});
