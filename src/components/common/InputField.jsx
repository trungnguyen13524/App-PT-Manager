import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  StyleSheet, 
  TouchableOpacity 
} from 'react-native';
import { Feather } from '@expo/vector-icons'; // Expo đã tích hợp sẵn thư viện icon này
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

/**
 * InputField: Ô nhập liệu chuẩn hóa.
 * Hỗ trợ label, tự đổi màu viền khi focus, thông báo lỗi, và chế độ password.
 * 
 * @param {string} label - Tiêu đề ô nhập (VD: 'Email', 'Mật khẩu').
 * @param {string} error - Chuỗi báo lỗi. Nếu có, viền sẽ đổi màu đỏ.
 * @param {boolean} isPassword - Nếu là true, sẽ ẩn ký tự và hiện icon con mắt.
 * @param {object} style - Ghi đè style cho container bên ngoài.
 */
export const InputField = ({
  label,
  error,
  isPassword = false,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // Xác định màu viền: Lỗi (Đỏ) -> Đang focus (Xanh lá) -> Bình thường (Xám)
  const getBorderColor = () => {
    if (error) return colors.status.error;
    if (isFocused) return colors.primary;
    return colors.border;
  };

  return (
    <View style={[styles.container, style]}>
      {/* Label */}
      {label && (
        <Text style={[styles.label, error && styles.labelError]}>
          {label}
        </Text>
      )}

      {/* Input Box */}
      <View 
        style={[
          styles.inputContainer, 
          { borderColor: getBorderColor() },
          isFocused && styles.inputFocusedShadow
        ]}
      >
        <TextInput
          style={styles.input}
          placeholderTextColor={colors.text.disabled}
          secureTextEntry={isPassword && !isPasswordVisible}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          // Đảm bảo không bị giật UI khi nhập liệu liên tục
          autoCapitalize={isPassword ? 'none' : 'sentences'} 
          autoCorrect={!isPassword}
          {...props}
        />

        {/* Nút ẩn/hiện mật khẩu */}
        {isPassword && (
          <TouchableOpacity
            style={styles.eyeIcon}
            activeOpacity={0.7}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          >
            <Feather 
              name={isPasswordVisible ? "eye-off" : "eye"} 
              size={20} 
              color={colors.text.secondary} 
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Error Message */}
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    width: '100%',
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    marginBottom: 6,
  },
  labelError: {
    color: colors.status.error,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 8,
    backgroundColor: colors.background.paper,
    height: 52, // Chiều cao chuẩn cho vùng chạm dễ dàng trên mobile
  },
  inputFocusedShadow: {
    // Tạo hiệu ứng phát sáng nhẹ viền xanh khi Focus
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2, 
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 16,
    fontSize: typography.sizes.md,
    color: colors.text.primary,
  },
  eyeIcon: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginTop: 4,
    fontSize: typography.sizes.xs,
    color: colors.status.error,
    fontWeight: typography.weights.regular,
  }
});
