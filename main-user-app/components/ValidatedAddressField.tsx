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

type Props = TextInputProps & {
  label: string;
  error?: string;
  valid?: boolean;
  touched?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  dark?: boolean;
};

export const ValidatedAddressField = React.forwardRef<TextInput, Props>(
  (
    { label, error, valid, touched, containerStyle, style, dark = false, ...props },
    ref,
  ) => {
    const showValid = touched && valid && !error;
    const borderColor = error ? "#EF4444" : showValid ? "#22C55E" : dark ? "#242424" : "#E5E7EB";

    return (
      <View style={[styles.container, containerStyle]}>
        <Text style={[styles.label, dark && styles.darkLabel]}>{label}</Text>
        <View style={[styles.inputShell, dark && styles.darkInputShell, { borderColor }]}>
          <TextInput
            ref={ref}
            style={[styles.input, dark && styles.darkInput, style]}
            placeholderTextColor={dark ? "#666" : "#9CA3AF"}
            selectionColor="#FACC15"
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
  container: { marginBottom: 14 },
  label: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  darkLabel: { color: "#FACC15" },
  inputShell: {
    minHeight: 58,
    borderRadius: 16,
    borderWidth: 1.5,
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  darkInputShell: { backgroundColor: "#0A0A0A" },
  input: { flex: 1, color: "#111827", fontSize: 16, fontWeight: "700" },
  darkInput: { color: "#FFF" },
  error: {
    color: "#EF4444",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 6,
  },
});
