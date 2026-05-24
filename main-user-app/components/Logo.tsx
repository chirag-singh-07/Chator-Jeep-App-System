// Main User App Logo Component
import { Image, View, StyleSheet } from 'react-native';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'white';
}

const sizeMap = {
  sm: { width: 32, height: 32 },
  md: { width: 40, height: 40 },
  lg: { width: 64, height: 64 },
  xl: { width: 80, height: 80 },
};

export const Logo = ({ size = 'md', variant = 'default' }: LogoProps) => {
  const logoSize = sizeMap[size];
  const logoSource = require('../assets/images/icon.png');

  return (
    <View style={[styles.container, logoSize]}>
      <Image
        source={logoSource}
        style={[logoSize, { resizeMode: 'contain' }]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
