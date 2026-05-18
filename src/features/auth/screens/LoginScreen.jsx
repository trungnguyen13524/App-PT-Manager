import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Alert,
  Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Mail, Lock, Leaf } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../../theme';
import NutriButton from '../../../components/shared/NutriButton';
import NutriInput from '../../../components/shared/NutriInput';
import { useAuthStore } from '../../../store/authStore';

const { height } = Dimensions.get('window');

const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error, clearError } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }
    
    await login(email, password);
  };

  // Hiển thị lỗi từ store nếu có
  React.useEffect(() => {
    if (error) {
      Alert.alert('Lỗi đăng nhập', error, [{ text: 'OK', onPress: clearError }]);
    }
  }, [error]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* Upper Section: Brand/Logo */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.iconCircle}>
            <Leaf color={COLORS.primary} size={40} fill={COLORS.primary} />
          </View>
          <Text style={styles.brandName}>NutriCoach</Text>
          <Text style={styles.brandSlogan}>Sức khỏe từ chuyên gia</Text>
        </View>
      </View>

      {/* Lower Section: Login Form */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.formContainer}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Chào mừng trở lại!</Text>
          <Text style={styles.subtitle}>Đăng nhập để tiếp tục hành trình của bạn</Text>

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

            <NutriInput
              label="Mật khẩu"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              icon={<Lock size={20} color={COLORS.textSecondary} />}
            />

            <NutriButton
              title="Quên mật khẩu?"
              variant="text"
              style={styles.forgotPassword}
              textStyle={styles.forgotPasswordText}
              onPress={() => navigation.navigate('ForgotPassword')}
            />

            <NutriButton
              title="Đăng nhập"
              onPress={handleLogin}
              loading={isLoading}
              style={styles.loginButton}
            />
          </View>

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.orText}>Hoặc</Text>
            <View style={styles.divider} />
          </View>

          <NutriButton
            title="Tiếp tục với Google"
            variant="outline"
            onPress={() => {}}
            style={styles.socialButton}
            icon={<Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png' }} style={styles.googleIcon} />}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Chưa có tài khoản? </Text>
            <NutriButton
              title="Đăng ký ngay"
              variant="text"
              onPress={() => navigation.navigate('Register')}
              textStyle={styles.registerLink}
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
    backgroundColor: COLORS.primary,
  },
  header: {
    height: height * 0.35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    // Shadow cho Logo
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  brandName: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 1,
  },
  brandSlogan: {
    fontSize: 14,
    color: COLORS.primaryLight,
    marginTop: 4,
    fontWeight: '500',
  },
  formContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  scrollContent: {
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: 20,
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -8,
    marginBottom: 16,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  loginButton: {
    marginTop: 8,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.divider,
  },
  orText: {
    marginHorizontal: 16,
    color: COLORS.textLight,
    fontSize: 14,
  },
  socialButton: {
    borderColor: COLORS.divider,
  },
  googleIcon: {
    width: 20,
    height: 20,
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
  registerLink: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
  }
});

export default LoginScreen;
