import { Platform } from 'react-native';

export const TYPOGRAPHY = {
  // Font Family (Sử dụng font mặc định hệ thống nhưng phân cấp rõ ràng)
  fontFamily: {
    regular: Platform.select({ ios: 'System', android: 'sans-serif' }),
    medium: Platform.select({ ios: 'System', android: 'sans-serif-medium' }),
    bold: Platform.select({ ios: 'System', android: 'sans-serif-condensed-light' }), // Hoặc bold mặc định
  },

  // Font Sizes
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    display: 40,
  },

  // Line Heights
  lineHeight: {
    sm: 18,
    md: 22,
    lg: 26,
    xl: 30,
  },

  // Predefined Styles
  h1: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 38,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 30,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 26,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 22,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
};
