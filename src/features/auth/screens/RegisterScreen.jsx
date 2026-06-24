import React, { useState, useEffect, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Easing
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Mail, Lock, User, ArrowLeft, Eye, EyeOff } from 'lucide-react-native';
import { useAuthStore } from '../../../store/authStore';
import { useDialogStore } from '../../../store/dialogStore';
import { COLORS } from '../../../theme';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import WaveBackground from '../../../components/common/WaveBackground';

const { height } = Dimensions.get('window');

// -------------------------------------------------------------
// REUSABLE LOCAL COMPONENTS (Consistent with LoginScreen)
// -------------------------------------------------------------

const PremiumLogo = memo(() => (
  <View style={styles.logoWrapper}>
    <Image 
      source={require('../../../../src/logo/logo_clean.png')} 
      style={styles.logoImage} 
      resizeMode="contain"
    />
  </View>
));

const GlowingInput = memo(({ icon: Icon, placeholder, value, onChangeText, secureTextEntry, keyboardType, autoCapitalize }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = Boolean(secureTextEntry);

  return (
    <View style={styles.inputContainer}>
      {/* Absolute overlay for background and border - prevents Android native view reconstruction on style change */}
      <View 
        style={[
          StyleSheet.absoluteFillObject, 
          styles.inputOverlay, 
          isFocused && styles.inputOverlayFocused
        ]} 
        pointerEvents="none" 
      />
      <View style={styles.inputIcon}>
        <Icon size={20} color={isFocused ? COLORS.secondary : COLORS.textSecondary} />
      </View>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textLight}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={isPassword && !showPassword}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      {isPassword && (
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
          {showPassword ? (
            <EyeOff size={20} color={isFocused ? COLORS.secondary : COLORS.textSecondary} />
          ) : (
            <Eye size={20} color={isFocused ? COLORS.secondary : COLORS.textSecondary} />
          )}
        </TouchableOpacity>
      )}
    </View>
  );
});

const GamifiedButton = memo(({ title, onPress, loading }) => (
  <View style={styles.ctaButtonWrapper}>
    <TouchableOpacity 
      style={styles.ctaButton} 
      onPress={onPress} 
      disabled={loading}
      activeOpacity={0.8}
    >
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="btnGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={COLORS.primary} stopOpacity="1" />
            <Stop offset="100%" stopColor={COLORS.primaryDark} stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#btnGrad)" />
      </Svg>
      {loading ? (
        <ActivityIndicator color={COLORS.white} size="small" />
      ) : (
        <Text style={styles.ctaText}>{title}</Text>
      )}
    </TouchableOpacity>
  </View>
));

// -------------------------------------------------------------
// MAIN COMPONENT
// -------------------------------------------------------------

const RegisterScreen = () => {
  const navigation = useNavigation();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { register, isLoading, error, clearError } = useAuthStore();

  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const translateYAnim = React.useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.exp),
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.exp),
      }),
    ]).start();
  }, []);

  const handleRegister = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      useDialogStore.getState().showDialog({
        title: 'Thông báo',
        message: 'Vui lòng điền đầy đủ thông tin',
        type: 'warning'
      });
      return;
    }

    if (!email.toLowerCase().endsWith('@gmail.com')) {
      useDialogStore.getState().showDialog({
        title: 'Lỗi email',
        message: 'Hệ thống chỉ hỗ trợ đăng ký bằng tài khoản @gmail.com. Vui lòng kiểm tra lại.',
        type: 'error'
      });
      return;
    }

    if (password !== confirmPassword) {
      useDialogStore.getState().showDialog({
        title: 'Lỗi',
        message: 'Mật khẩu xác nhận không khớp',
        type: 'error'
      });
      return;
    }

    useDialogStore.getState().showDialog({
      title: 'Xác nhận đăng ký',
      message: (
        <Text style={{ textAlign: 'center' }}>
          Vui lòng kiểm tra lại thông tin:{'\n\n'}
          Họ và tên: <Text style={{ fontWeight: 'bold', color: COLORS.primaryDark }}>{fullName}</Text>{'\n'}
          Email: <Text style={{ fontWeight: 'bold', color: COLORS.primaryDark }}>{email}</Text>{'\n\n'}
          Bạn có chắc chắn muốn đăng ký với thông tin này?
        </Text>
      ),
      type: 'info',
      buttons: [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: async () => {
            const result = await register({ email, password, fullName, acceptTerms: true });
            if (result.success) {
              useDialogStore.getState().showDialog({
                title: 'Thành công',
                message: 'Tài khoản của bạn đã được tạo!',
                type: 'success'
              });
            }
          }
        }
      ]
    });
  };

  useEffect(() => {
    if (error) {
      useDialogStore.getState().showDialog({
        title: 'Lỗi đăng ký',
        message: error,
        type: 'error',
        buttons: [{ text: 'OK', onPress: clearError }]
      });
    }
  }, [error]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <WaveBackground />
      
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <View style={styles.backButtonBg} />
        <ArrowLeft size={24} color={COLORS.secondary} />
      </TouchableOpacity>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
        >
          {/* Header Section (Animated) */}
          <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: translateYAnim }] }]}>
            <PremiumLogo />
            <Text style={styles.brandName}>TẠO TÀI KHOẢN</Text>
            <Text style={styles.brandSlogan}>BẮT ĐẦU HÀNH TRÌNH SỐNG KHỎE</Text>
          </Animated.View>

          {/* Form Container (Animated) */}
          <Animated.View style={[styles.glassContainer, { opacity: fadeAnim, transform: [{ translateY: translateYAnim }] }]}>
            <Text style={styles.title}>ĐĂNG KÝ THÀNH VIÊN</Text>
            <Text style={styles.subtitle}>
              Cùng NutriCoach xây dựng thói quen tốt mỗi ngày
            </Text>

            <View style={styles.form}>
              <GlowingInput
                icon={User}
                placeholder="Họ và tên"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />

              <GlowingInput
                icon={Mail}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <GlowingInput
                icon={Lock}
                placeholder="Mật khẩu (Tối thiểu 6 ký tự)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              <GlowingInput
                icon={Lock}
                placeholder="Nhập lại mật khẩu"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />

              <View style={{ marginTop: 8 }}>
                <GamifiedButton
                  title="ĐĂNG KÝ"
                  onPress={handleRegister}
                  loading={isLoading}
                />
              </View>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Bạn đã có tài khoản? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}>ĐĂNG NHẬP</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.terms}>
              Bằng cách đăng ký, bạn đồng ý với{' '}
              <Text style={styles.termsBold}>Điều khoản dịch vụ</Text> và{' '}
              <Text style={styles.termsBold}>Chính sách bảo mật</Text> của chúng tôi.
            </Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
    flexGrow: 1,
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  backButtonBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.white,
    borderRadius: 22,
    opacity: 0.8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoWrapper: {
    width: 80,
    height: 80,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  logoImage: {
    width: 50,
    height: 50,
  },
  brandName: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.secondary,
    letterSpacing: 1,
  },
  brandSlogan: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '700',
    marginTop: 6,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  glassContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 32,
    padding: 28,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.secondary,
    marginBottom: 8,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 32,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  inputOverlay: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputOverlayFocused: {
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.white,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    color: '#2D3748',
    fontSize: 16,
    fontWeight: '500',
  },
  eyeIcon: {
    padding: 8,
  },
  ctaButtonWrapper: {
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
    borderRadius: 16,
    marginBottom: 8,
  },
  ctaButton: {
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
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
    fontWeight: '500',
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  terms: {
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 32,
    lineHeight: 18,
  },
  termsBold: {
    color: COLORS.primary,
    fontWeight: '700',
  }
});

export default RegisterScreen;
