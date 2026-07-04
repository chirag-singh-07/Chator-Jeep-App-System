// Blue & White Theme for Delivery App - Matches Chatori Jeeb Logo

export const Colors = {
  light: {
    // Brand
    primary: '#1B4FD8',        // Royal Blue (from logo background)
    primaryDark: '#1338A8',    // Deeper blue for gradients
    primaryLight: '#3B6FEF',   // Lighter blue for accents
    secondary: '#FFFFFF',      // White

    // Backgrounds
    background: '#F4F7FF',     // Soft blue-tinted white
    surface: '#FFFFFF',        // Pure white card
    surfaceSecondary: '#EBF1FF', // Light blue tint for inputs

    // Text
    text: '#0D1B4B',           // Deep navy text
    textMuted: '#6B7DB3',      // Muted blue-gray
    textDim: '#9BAECE',        // Dimmed for placeholders

    // Borders
    border: '#D4DFFF',         // Soft blue border
    borderFocus: '#1B4FD8',    // Blue border on focus

    // Status
    success: '#22C55E',
    error: '#EF4444',
    warning: '#F59E0B',

    // Utility
    white: '#FFFFFF',
    black: '#0D1B4B',
    overlay: 'rgba(27, 79, 216, 0.08)',
  },
  dark: {
    primary: '#1B4FD8',
    primaryDark: '#1338A8',
    primaryLight: '#3B6FEF',
    secondary: '#FFFFFF',
    background: '#F4F7FF',
    surface: '#FFFFFF',
    surfaceSecondary: '#EBF1FF',
    text: '#0D1B4B',
    textMuted: '#6B7DB3',
    textDim: '#9BAECE',
    border: '#D4DFFF',
    borderFocus: '#1B4FD8',
    success: '#22C55E',
    error: '#EF4444',
    warning: '#F59E0B',
    white: '#FFFFFF',
    black: '#0D1B4B',
    overlay: 'rgba(27, 79, 216, 0.08)',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const Shadows = {
  soft: {
    shadowColor: '#1B4FD8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  medium: {
    shadowColor: '#1B4FD8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  blue: {
    shadowColor: '#1B4FD8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 10,
  },
  card: {
    shadowColor: '#1B4FD8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
};
