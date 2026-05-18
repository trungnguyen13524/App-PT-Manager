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
import { useNavigation, useRoute } from '@react-navigation/native';
import { MailCheck, Key, ArrowLeft } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../../theme';
import NutriButton from '../../../components/shared/NutriButton';
import NutriInput from '../../../components/shared/NutriInput';
import authService from '../../../api/services/auth.service';
import { useAuthStore } from '../../../store/authStore';

const VerifyEmailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Có thể truyền token từ email deeplink qua params
  const initialToken = route.params?.token || '';

  const [token, setToken] = useState(initialToken);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  
  const { user, setUserRole } = useAuthStore(); // Mượn hàm tạm để cập nhật state hoặc reload profile

  const handleVerify = async () => {
    if (!token) {
      Alert.alert('Thông báo', 'Vui lòng nhập mã xác thực.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.verifyEmail(token);
      if (response.success) {
        Alert.alert(
          'Thành công', 
          'Email của bạn đã được xác thực thành công!',
          [
            { text: 'Tiếp tục', onPress: () => navigation.navigate('RoleSelection') }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Lỗi', error.message || 'Mã xác thực không hợp lệ hoặc đã hết hạn.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      const response = await authService.resendVerification();
      if (response.success) {
        Alert.alert('Thành công', 'Đã gửi lại mã xác thực, vui lòng kiểm tra email của bạn.');
      }
    } catch (error) {
      Alert.alert('Lỗi', error.message || 'Có lỗi xảy ra, vui lòng thử lại sau.');
    } finally {
      setIsResending(false);
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
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <MailCheck size={48} color={COLORS.primary} />
            </View>
          </View>
          
          <Text style={styles.title}>Xác thực Email</Text>
          <Text style={styles.subtitle}>
            Vui lòng nhập mã xác thực (token) gồm các ký tự đã được gửi đến email của bạn để bảo vệ tài khoản.
          </Text>

          <View style={styles.form}>
            <NutriInput
              label="Mã xác thực"
              placeholder="Nhập mã xác thực"
              value={token}
              onChangeText={setToken}
              icon={<Key size={20} color={COLORS.textSecondary} />}
            />

            <NutriButton
              title="Xác thực ngay"
              onPress={handleVerify}
              loading={isLoading}
              style={styles.submitButton}
            />
            
            <NutriButton
              title="Gửi lại mã"
              variant="outline"
              onPress={handleResend}
              loading={isResending}
              style={styles.resendButton}
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
    paddingTop: 10,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginTop: 8,
    marginBottom: 32,
    lineHeight: 22,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  submitButton: {
    marginTop: 16,
  },
  resendButton: {
    marginTop: 16,
  },
});

export default VerifyEmailScreen;
