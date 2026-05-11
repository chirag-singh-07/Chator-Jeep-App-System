import React, { useState } from "react";
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

import * as ImagePicker from "expo-image-picker";
import { Image } from "react-native";
import { INDIA_DATA } from "@/constants/CityData";

const { width, height } = Dimensions.get("window");

const STEPS = ["Account", "Kitchen", "Brand", "Location", "Legal"];

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
  const [city, setCity] = useState("");
  const [pinCode, setPinCode] = useState("");

  const [showStateModal, setShowStateModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);

  // Step 5: Legal
  const [aadhar, setAadhar] = useState<any>(null);
  const [pan, setPan] = useState<any>(null);
  const [livePhoto, setLivePhoto] = useState<any>(null);

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

  const pickDoc = async (type: "aadhar" | "pan") => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      if (type === "aadhar") setAadhar(result.assets[0]);
      else setPan(result.assets[0]);
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
      if (password.length < 6) {
        Alert.alert(
          "VALIDATION ERROR",
          "Password must be at least 6 characters long.",
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
      if (!/^\d{10}$/.test(phone)) {
        Alert.alert(
          "VALIDATION ERROR",
          "Please enter a valid 10-digit phone number.",
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
      if (!street || !fullAddress || !state || !city || !pinCode) {
        Alert.alert(
          "VALIDATION ERROR",
          "Please fill all required address fields.",
        );
        return;
      }
      if (pinCode.length !== 6) {
        Alert.alert("VALIDATION ERROR", "PIN code must be exactly 6 digits.");
        return;
      }
    } else if (currentStep === 4) {
      if (!aadhar || !pan || !livePhoto) {
        Alert.alert(
          "VALIDATION ERROR",
          "All legal documents and live photo are required.",
        );
        return;
      }
    }

    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      try {
        setUploadStatus({ message: "CREATING ACCOUNT...", isUploading: true });
        const finalAddress = `${street}, ${landmark ? landmark + ", " : ""}${fullAddress}, ${city}, ${state} - ${pinCode}`;

        await register({
          email,
          password,
          ownerName: kitchenName,
          restaurantName: kitchenName,
          phone,
          cuisines: [foodType],
          address: {
            line1: finalAddress,
            city: city,
            state: state,
            pinCode: pinCode,
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
          await uploadLegalDocs(aadhar, pan, livePhoto, []);
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
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
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
                onChangeText={setKitchenName}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>PHONE NUMBER</Text>
              <TextInput
                style={styles.input}
                placeholder="+91 00000 00000"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
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
        const availableCities =
          INDIA_DATA.find((d) => d.state === state)?.cities || [];
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
                onChangeText={setStreet}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>LANDMARK (OPTIONAL)</Text>
              <TextInput
                style={styles.input}
                placeholder="Near City Mall"
                placeholderTextColor="#444"
                value={landmark}
                onChangeText={setLandmark}
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
                onChangeText={setFullAddress}
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

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>CITY</Text>
                <TouchableOpacity
                  style={[styles.pickerTrigger, !state && { opacity: 0.5 }]}
                  onPress={() => (state ? setShowCityModal(true) : null)}
                >
                  <Text style={[styles.pickerText, !city && { color: "#666" }]}>
                    {city || "Select City"}
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
              <TextInput
                style={styles.input}
                placeholder="400001"
                placeholderTextColor="#444"
                value={pinCode}
                onChangeText={setPinCode}
                keyboardType="numeric"
                maxLength={6}
              />
            </View>

            {/* State Modal */}
            <Modal visible={showStateModal} transparent animationType="slide">
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>SELECT STATE</Text>
                  <FlatList
                    data={INDIA_DATA}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.modalItem}
                        onPress={() => {
                          setState(item.state);
                          setCity(""); // Reset city when state changes
                          setShowStateModal(false);
                        }}
                      >
                        <Text style={styles.modalItemText}>{item.state}</Text>
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

            {/* City Modal */}
            <Modal visible={showCityModal} transparent animationType="slide">
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>SELECT CITY</Text>
                  <FlatList
                    data={availableCities}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.modalItem}
                        onPress={() => {
                          setCity(item);
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
  footer: { padding: 25, paddingBottom: 35 },
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
  modalClose: {
    marginTop: 20,
    padding: 15,
    alignItems: "center",
    backgroundColor: "#111",
    borderRadius: 15,
  },
  modalCloseText: { color: Colors.light.primary, fontWeight: "900" },
});
