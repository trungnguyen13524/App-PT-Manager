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
import { Mail, Lock, User, ArrowLeft } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../../theme';
import NutriButton from '../../../components/shared/NutriButton';
import NutriInput from '../../../components/shared/NutriInput';
import { useAuthStore } from '../../../store/authStore';

const RegisterScreen = () => {
  const navigation = useNavigation();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { register, isLoading, error, clearError } = useAuthStore();

  const handleRegister = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert('Thông báo', 'Vui lòng điền đầy đủ thông tin');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return;
    }

    const result = await register({ email, password, fullName, acceptTerms: true });
    if (result.success) {
      Alert.alert('Thành công', 'Tài khoản của bạn đã được tạo!');
    }
  };

  React.useEffect(() => {
    if (error) {
      Alert.alert('Lỗi đăng ký', error, [{ text: 'OK', onPress: clearError }]);
    }
  }, [error]);

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
          <Text style={styles.title}>Tạo tài khoản</Text>
          <Text style={styles.subtitle}>Bắt đầu hành trình sống khỏe cùng NutriCoach</Text>

          <View style={styles.form}>
            <NutriInput
              label="Họ và tên"
              placeholder="Nguyễn Văn A"
              value={fullName}
              onChangeText={setFullName}
              icon={<User size={20} color={COLORS.textSecondary} />}
            />

            <NutriInput
              label="Email"
              placeholder="example@gmail.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              icon={<Mail size={20} color={COLORS.textSecondary} />}
            />

            <NutriInput
              label="Mật khẩu"
              placeholder="Tối thiểu 6 ký tự"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              icon={<Lock size={20} color={COLORS.textSecondary} />}
            />

            <NutriInput
              label="Xác nhận mật khẩu"
              placeholder="Nhập lại mật khẩu"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              icon={<Lock size={20} color={COLORS.textSecondary} />}
            />

            <NutriButton
              title="Đăng ký"
              onPress={handleRegister}
              loading={isLoading}
              style={styles.registerButton}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Bạn đã có tài khoản? </Text>
            <NutriButton
              title="Đăng nhập"
              variant="text"
              onPress={() => navigation.navigate('Login')}
              textStyle={styles.loginLink}
            />
          </View>

          <Text style={styles.terms}>
            Bằng cách đăng ký, bạn đồng ý với <Text style={styles.termsBold}>Điều khoản dịch vụ</Text> và <Text style={styles.termsBold}>Chính sách bảo mật</Text> của chúng tôi.
          </Text>
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
  },
  form: {
    width: '100%',
  },
  registerButton: {
    marginTop: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
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
  terms: {
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 40,
    lineHeight: 18,
    paddingBottom: 20,
  },
  termsBold: {
    color: COLORS.textSecondary,
    fontWeight: '600',
  }
});

export default RegisterScreen;
