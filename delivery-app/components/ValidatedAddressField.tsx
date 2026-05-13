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
import { Colors, Radius, Spacing } from "@/constants/Colors";

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
            placeholderTextColor={Colors.light.textMuted}
            selectionColor={Colors.light.primary}
            {...props}
          />
          {showValid && (
            <Ionicons name="checkmark-circle" size={20} color={Colors.light.success} />
          )}
        </View>
        {!!error && <Text style={styles.error}>{error}</Text>}
      </View>
    );
  },
);

ValidatedAddressField.displayName = "ValidatedAddressField";

const styles = StyleSheet.create({
  container: { marginBottom: Spacing.md },
  label: {
    color: Colors.light.textDim,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  inputShell: {
    minHeight: 58,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.surface,
    paddingHorizontal: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
  },
  inputError: { borderColor: Colors.light.error },
  inputValid: { borderColor: Colors.light.success },
  input: { flex: 1, color: Colors.light.text, fontSize: 16, height: "100%" },
  error: {
    color: Colors.light.error,
    fontSize: 12,
    fontWeight: "700",
    marginTop: Spacing.xs,
    marginLeft: Spacing.xs,
  },
});
