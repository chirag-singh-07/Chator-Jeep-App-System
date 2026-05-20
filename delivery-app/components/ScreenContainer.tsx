import React, { PropsWithChildren } from "react";
import { StyleProp, StyleSheet, View, StatusBar, Platform, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";

interface ScreenContainerProps extends PropsWithChildren {
  withSafeArea?: boolean;
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
}

export function ScreenContainer({ 
  children, 
  withSafeArea = false,
  backgroundColor = Colors.light.background,
  style,
}: ScreenContainerProps) {
  const Container = withSafeArea ? SafeAreaView : View;

  return (
    <View style={[styles.outer, { backgroundColor }]}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor={Colors.light.background}
        translucent={Platform.OS === 'android'}
      />
      <Container style={[styles.container, style]}>
        {children}
      </Container>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
});
