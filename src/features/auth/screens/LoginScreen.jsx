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
import { Mail, Lock, Leaf, Eye, EyeOff, CheckCircle } from 'lucide-react-native';
import { useAuthStore } from '../../../store/authStore';
import { useDialogStore } from '../../../store/dialogStore';
import { COLORS } from '../../../theme';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import WaveBackground from '../../../components/common/WaveBackground';

const { height } = Dimensions.get('window');

// -------------------------------------------------------------
// REUSABLE LOCAL COMPONENTS FOR THE REDESIGN
// (Defined OUTSIDE the main render function to prevent re-renders and focus loss)
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

const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error, clearError } = useAuthStore();
  
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

  const handleLogin = async () => {
    if (!email || !password) {
      useDialogStore.getState().showDialog({
        title: 'Thông báo',
        message: 'Vui lòng nhập đầy đủ email và mật khẩu',
        type: 'warning'
      });
      return;
    }
    
    await login(email, password);
  };

  // Hiển thị lỗi từ store nếu có
  useEffect(() => {
    if (error) {
      useDialogStore.getState().showDialog({
        title: 'Lỗi đăng nhập',
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
            <Text style={styles.brandName}>N U T R I C O A C H</Text>
            <Text style={styles.brandSlogan}>LEVEL UP YOUR FITNESS</Text>
          </Animated.View>

          {/* Form Container (Animated) */}
          <Animated.View style={[styles.glassContainer, { opacity: fadeAnim, transform: [{ translateY: translateYAnim }] }]}>
            <Text style={styles.title}>CHÀO MỪNG TRỞ LẠI</Text>
            <Text style={styles.subtitle}>Đăng nhập để tiếp tục hành trình của bạn</Text>

            <View style={styles.form}>
              <GlowingInput
                key="email-input"
                icon={Mail}
                placeholder="Email của bạn"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <GlowingInput
                key="password-input"
                icon={Lock}
                placeholder="Mật khẩu"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              <TouchableOpacity 
                style={styles.forgotPassword}
                onPress={() => navigation.navigate('ForgotPassword')}
              >
                <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
              </TouchableOpacity>

              <GamifiedButton
                title="ĐĂNG NHẬP"
                onPress={handleLogin}
                loading={isLoading}
              />
            </View>

            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.orText}>HOẶC</Text>
              <View style={styles.divider} />
            </View>

            <View style={styles.socialRow}>
              <TouchableOpacity style={styles.socialCircle} activeOpacity={0.8}>
                <Image 
                  source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png' }} 
                  style={styles.socialIcon} 
                />
              </TouchableOpacity>

            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Chưa có tài khoản? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.registerLink}>ĐĂNG KÝ NGAY</Text>
              </TouchableOpacity>
            </View>
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
    paddingTop: 60,
    paddingBottom: 40,
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 0,
    width: 220,
    height: 220,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  brandName: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.primaryDark,
    letterSpacing: 4,
    textShadowColor: 'rgba(0,0,0,0.05)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  brandSlogan: {
    fontSize: 13,
    color: COLORS.secondary,
    marginTop: 6,
    fontWeight: '700',
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 28,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: COLORS.accent,
    fontWeight: '700',
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
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 28,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  orText: {
    marginHorizontal: 16,
    color: COLORS.textLight,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  socialCircle: {
    width: 56,
    height: 56,
    backgroundColor: COLORS.white,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialIcon: {
    width: 26,
    height: 26,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  registerLink: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.5,
  }
});

export default LoginScreen;
