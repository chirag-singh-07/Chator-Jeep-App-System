import React from "react";
import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";

type Props = TextInputProps & {
  label: string;
  error?: string;
  valid?: boolean;
  touched?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
};

export const ValidatedAddressField = React.forwardRef<TextInput, Props>(
  ({ label, error, valid, touched, containerStyle, style, ...props }, ref) => {
    const showValid = touched && valid && !error;

    return (
      <View style={[styles.container, containerStyle]}>
        <Text style={styles.label}>{label}</Text>
        <View
          style={[
            styles.inputShell,
            error && styles.inputError,
            showValid && styles.inputValid,
          ]}
        >
          <TextInput
            ref={ref}
            style={[styles.input, style]}
            placeholderTextColor="#666"
            selectionColor={Colors.light.primary}
            {...props}
          />
          {showValid && (
            <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
          )}
        </View>
        {!!error && <Text style={styles.error}>{error}</Text>}
      </View>
    );
  },
);

ValidatedAddressField.displayName = "ValidatedAddressField";

const styles = StyleSheet.create({
  container: { marginBottom: 18 },
  label: {
    fontSize: 11,
    fontWeight: "900",
    color: Colors.light.primary,
    marginBottom: 10,
    letterSpacing: 1.5,
  },
  inputShell: {
    minHeight: 58,
    borderRadius: 16,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0A0A0A",
    borderWidth: 1.5,
    borderColor: "#1A1A1A",
  },
  inputError: { borderColor: "#EF4444" },
  inputValid: { borderColor: "#22C55E" },
  input: { flex: 1, color: "#FFF", fontSize: 15, fontWeight: "700" },
  error: {
    color: "#EF4444",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 8,
  },
});
