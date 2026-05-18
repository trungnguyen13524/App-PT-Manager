import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  ActivityIndicator, 
  StyleSheet, 
  View 
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

/**
 * CustomButton: Nút bấm chuẩn hóa toàn hệ thống.
 * 
 * @param {string} title - Text hiển thị trên nút.
 * @param {function} onPress - Hàm gọi khi nhấn.
 * @param {'primary'|'secondary'|'outline'|'text'} variant - Kiểu dáng nút.
 * @param {boolean} isLoading - Trạng thái loading (hiện spinner, khóa nhấn).
 * @param {boolean} disabled - Khóa nút thủ công.
 * @param {object} style - Ghi đè style cho View bọc ngoài.
 * @param {object} textStyle - Ghi đè style cho Text.
 * @param {React.ReactNode} icon - Icon component (trái hoặc phải).
 */
export const CustomButton = ({
  title,
  onPress,
  variant = 'primary',
  isLoading = false,
  disabled = false,
  style,
  textStyle,
  icon = null,
  ...props
}) => {
  // Xác định màu sắc dựa vào variant
  const getBackgroundColor = () => {
    if (disabled) return colors.text.disabled;
    switch (variant) {
      case 'primary': return colors.primary;
      case 'secondary': return colors.secondary;
      case 'outline': 
      case 'text':
        return colors.transparent;
      default: return colors.primary;
    }
  };

  const getBorderColor = () => {
    if (disabled) return colors.text.disabled;
    if (variant === 'outline') return colors.primary;
    return colors.transparent;
  };

  const getTextColor = () => {
    if (disabled) return colors.text.inverse;
    switch (variant) {
      case 'outline':
      case 'text':
        return colors.primary;
      default:
        return colors.text.inverse;
    }
  };

  // Khóa nút nếu đang loading hoặc bị disable
  const isButtonDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={isButtonDisabled}
      onPress={onPress}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === 'outline' ? 1.5 : 0,
        },
        style,
      ]}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={getTextColor()} />
      ) : (
        <View style={styles.contentContainer}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text 
            style={[
              styles.title, 
              { color: getTextColor() }, 
              textStyle
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semiBold,
  },
  iconContainer: {
    marginRight: 8,
  }
});
