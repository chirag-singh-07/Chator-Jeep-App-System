import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Alert, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/store/useAuthStore";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      await login(email, password);
      const user = useAuthStore.getState().user;

      if (user?.status === "REQUESTED" || user?.status === "PENDING") {
        router.replace("/(auth)/pending");
      } else if (user?.status === "REJECTED") {
        router.replace("/(auth)/rejected");
      } else {
        router.replace("/(tabs)");
      }
    } catch (error: any) {
      Alert.alert("Login Failed", error);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.brandIcon}>
              <Ionicons name="flash" size={40} color={Colors.light.primary} />
            </View>
            <Text style={styles.title}>CHATOR JEEP</Text>
            <Text style={styles.subtitle}>KITCHEN PARTNER PORTAL</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>OFFICIAL EMAIL</Text>
              <View style={styles.inputRow}>
                <Ionicons name="mail" size={20} color="#666" />
                <TextInput
                  style={styles.input}
                  placeholder="name@chatorjeep.com"
                  placeholderTextColor="#333"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>SECURITY ACCESS KEY</Text>
              <View style={styles.inputRow}>
                <Ionicons name="lock-closed" size={20} color="#666" />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#333"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.loginButton, (isLoading || !email || !password) && { opacity: 0.6 }]}
              onPress={handleLogin}
              disabled={isLoading || !email || !password}
            >
              {isLoading ? (
                <ActivityIndicator color="black" />
              ) : (
                <>
                  <Text style={styles.loginButtonText}>AUTHENTICATE</Text>
                  <Ionicons name="shield-checkmark" size={20} color="black" />
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.forgotBtn}
              onPress={() => Alert.alert("Coming Soon", "Please contact support for password recovery.")}
            >
              <Text style={styles.forgotText}>Request Access Support?</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerLabel}>WANT TO JOIN THE FLEET?</Text>
            <TouchableOpacity 
               style={styles.registerBtn}
               onPress={() => router.push("/(auth)/register")}
            >
              <Text style={styles.registerBtnText}>REGISTER NEW KITCHEN</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: 'center',
  },
  header: {
    alignItems: "center",
    marginBottom: 60,
  },
  brandIcon: {
    width: 80,
    height: 80,
    borderRadius: 25,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#222",
    marginBottom: 25,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: "#FFF",
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.light.primary,
    fontWeight: "800",
    letterSpacing: 2,
    marginTop: 8,
  },
  formContainer: {
    gap: 25,
  },
  inputWrapper: {
    gap: 12,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: "900",
    color: "#444",
    letterSpacing: 2,
    marginLeft: 4,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0A0A0A",
    height: 65,
    borderRadius: 20,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "#1A1A1A",
    gap: 15,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#FFF",
    fontWeight: "600",
  },
  loginButton: {
    backgroundColor: Colors.light.primary,
    height: 65,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginTop: 15,
    shadowColor: Colors.light.primary,
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
  },
  loginButtonText: {
    color: "black",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 2,
  },
  forgotBtn: {
    alignSelf: 'center',
    padding: 10,
  },
  forgotText: {
    color: "#444",
    fontSize: 12,
    fontWeight: "bold",
  },
  footer: {
    marginTop: 50,
    alignItems: "center",
    gap: 15,
  },
  footerLabel: {
    fontSize: 10,
    color: "#333",
    fontWeight: "800",
    letterSpacing: 1,
  },
  registerBtn: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#222",
    backgroundColor: "#0A0A0A",
  },
  registerBtnText: {
    color: "#CCC",
    fontSize: 13,
    fontWeight: "bold",
    letterSpacing: 1,
  },
});
