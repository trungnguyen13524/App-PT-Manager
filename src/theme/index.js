import { COLORS } from './colors';
import { TYPOGRAPHY } from './typography';
import { SPACING } from './spacing';

export { COLORS, TYPOGRAPHY, SPACING };

// Một object theme tổng hợp để dùng hook hoặc context sau này nếu cần
export const theme = {
  colors: COLORS,
  typography: TYPOGRAPHY,
  spacing: SPACING,
};
