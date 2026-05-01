import { Pressable, StyleProp, StyleSheet, Text, ViewStyle, TextStyle, ActivityIndicator } from "react-native";
import { Colors, Spacing, Radius, Shadows } from "@/constants/Colors";

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline";
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  icon?: React.ReactNode;
}

export function PrimaryButton({
  label,
  onPress,
  variant = "primary",
  disabled,
  loading,
  style,
  textStyle,
  icon,
}: PrimaryButtonProps) {
  return (
    <Pressable
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && !disabled && !loading && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? Colors.light.black : Colors.light.primary} />
      ) : (
        <>
          {icon}
          <Text 
            style={[
              styles.textBase,
              variant === "primary" ? styles.primaryText : styles.secondaryText,
              textStyle
            ]}
          >
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 56,
    borderRadius: Radius.lg,
    flexDirection: 'row',
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.lg,
    ...Shadows.soft,
  },
  primary: {
    backgroundColor: Colors.light.primary,
  },
  secondary: {
    backgroundColor: Colors.light.surfaceSecondary,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.light.primary,
  },
  disabled: {
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  textBase: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  primaryText: {
    color: Colors.light.black,
  },
  secondaryText: {
    color: Colors.light.text,
  },
  outlineText: {
    color: Colors.light.primary,
  }
});
