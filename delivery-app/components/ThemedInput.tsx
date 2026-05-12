import React from 'react';
import { 
  StyleSheet, 
  View, 
  TextInput, 
  Text, 
  TextInputProps, 
  StyleProp, 
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import { Colors, Spacing, Radius } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

interface ThemedInputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  rightIconAccessibilityLabel?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

export function ThemedInput({ 
  label, 
  error, 
  icon, 
  rightIcon,
  onRightIconPress,
  rightIconAccessibilityLabel,
  containerStyle, 
  style,
  ...props 
}: ThemedInputProps) {
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[
        styles.inputContainer,
        isFocused && styles.inputFocused,
        error && styles.inputError,
      ]}>
        {icon && (
          <Ionicons 
            name={icon} 
            size={20} 
            color={isFocused ? Colors.light.primary : Colors.light.textDim} 
            style={styles.icon}
          />
        )}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={Colors.light.textMuted}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {rightIcon && (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={rightIconAccessibilityLabel}
            onPress={onRightIconPress}
            style={styles.rightIconButton}
          >
            <Ionicons
              name={rightIcon}
              size={20}
              color={isFocused ? Colors.light.primary : Colors.light.textDim}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
    width: '100%',
  },
  label: {
    color: Colors.light.textDim,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    height: 56,
  },
  inputFocused: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.surfaceSecondary,
  },
  inputError: {
    borderColor: Colors.light.error,
  },
  icon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    color: Colors.light.text,
    fontSize: 16,
    height: '100%',
  },
  rightIconButton: {
    height: '100%',
    paddingLeft: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: Colors.light.error,
    fontSize: 12,
    marginTop: Spacing.xs,
    marginLeft: Spacing.xs,
  },
});
