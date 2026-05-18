import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Mail, ArrowLeft } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../../theme';
import NutriButton from '../../../components/shared/NutriButton';
import NutriInput from '../../../components/shared/NutriInput';
import authService from '../../../api/services/auth.service';

const ForgotPasswordScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Thông báo', 'Vui lòng nhập địa chỉ email của bạn.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.forgotPassword(email);
      if (response.success) {
        setIsSuccess(true);
        Alert.alert('Thành công', response.data?.message || 'Link đặt lại mật khẩu đã được gửi, vui lòng kiểm tra email của bạn.');
      }
    } catch (error) {
      Alert.alert('Lỗi', error.message || 'Có lỗi xảy ra, vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" />
      
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <ArrowLeft size={24} color={COLORS.text} />
      </TouchableOpacity>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Quên mật khẩu?</Text>
          <Text style={styles.subtitle}>
            Đừng lo lắng! Vui lòng nhập địa chỉ email liên kết với tài khoản của bạn.
          </Text>

          <View style={styles.form}>
            <NutriInput
              label="Email"
              placeholder="example@gmail.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              icon={<Mail size={20} color={COLORS.textSecondary} />}
            />

            <NutriButton
              title="Gửi link khôi phục"
              onPress={handleResetPassword}
              loading={isLoading}
              style={styles.submitButton}
            />
          </View>

          {isSuccess && (
            <View style={styles.successMessage}>
              <Text style={styles.successText}>
                Đã gửi thành công! Vui lòng làm theo hướng dẫn trong email để đặt lại mật khẩu. Bạn cũng có thể dùng mã token để tự đổi.
              </Text>
              <NutriButton
                title="Nhập mã xác thực"
                variant="outline"
                onPress={() => navigation.navigate('ResetPassword')}
                style={styles.resetButton}
              />
            </View>
          )}

          <View style={styles.footer}>
            <Text style={styles.footerText}>Nhớ mật khẩu của bạn? </Text>
            <NutriButton
              title="Đăng nhập"
              variant="text"
              onPress={() => navigation.navigate('Login')}
              textStyle={styles.loginLink}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  backButton: {
    marginTop: 50,
    marginLeft: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 20,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginTop: 8,
    marginBottom: 32,
    lineHeight: 22,
  },
  form: {
    width: '100%',
  },
  submitButton: {
    marginTop: 16,
  },
  successMessage: {
    marginTop: 24,
    padding: 16,
    backgroundColor: COLORS.successLight,
    borderRadius: SPACING.sm,
  },
  successText: {
    color: COLORS.success,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  resetButton: {
    marginTop: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
});

export default ForgotPasswordScreen;
