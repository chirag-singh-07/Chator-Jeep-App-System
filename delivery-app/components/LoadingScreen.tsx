// Delivery App Loading Screen Component
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Logo } from './Logo';
import { Colors } from '../constants/Colors';

export const LoadingScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Logo size="xl" />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>Chatori Jeeb</Text>
          <Text style={styles.subtitle}>Delivery Partner</Text>
        </View>

        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={Colors.light.secondary} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.secondary,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.secondary,
    opacity: 0.8,
  },
  loaderContainer: {
    marginTop: 20,
  },
});