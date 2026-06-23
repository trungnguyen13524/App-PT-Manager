import React, { useState, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Mail, Lock, User, ArrowLeft, UserPlus, Eye, EyeOff } from 'lucide-react-native';
import { useAuthStore } from '../../../store/authStore';
import { useDialogStore } from '../../../store/dialogStore';
import Svg, { Defs, LinearGradient, Stop, Rect, Circle } from 'react-native-svg';

// -------------------------------------------------------------
// REUSABLE LOCAL COMPONENTS (Consistent with LoginScreen)
// -------------------------------------------------------------

const AbstractBackground = memo(() => (
  <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
    <Svg width="100%" height="100%">
      <Defs>
        <LinearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#0F172A" />
          <Stop offset="100%" stopColor="#1E293B" />
        </LinearGradient>
        <LinearGradient id="circleGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#00FF66" stopOpacity="0.15" />
          <Stop offset="100%" stopColor="#00B3FF" stopOpacity="0.05" />
        </LinearGradient>
        <LinearGradient id="circleGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FF4D00" stopOpacity="0.12" />
          <Stop offset="100%" stopColor="#FF0080" stopOpacity="0.05" />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#bgGrad)" />
      
      {/* 3D-like glowing abstract floating circles */}
      <Circle cx="15%" cy="15%" r="140" fill="url(#circleGrad1)" />
      <Circle cx="90%" cy="75%" r="180" fill="url(#circleGrad2)" />
      <Circle cx="80%" cy="25%" r="90" fill="url(#circleGrad2)" />
      <Circle cx="20%" cy="85%" r="120" fill="url(#circleGrad1)" />
    </Svg>
  </View>
));

const GlowingInput = memo(({ icon: Icon, placeholder, value, onChangeText, secureTextEntry, keyboardType, autoCapitalize }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = Boolean(secureTextEntry);

  return (
    <View style={styles.inputContainer}>
      <View 
        style={[
          StyleSheet.absoluteFillObject, 
          styles.inputOverlay, 
          isFocused && styles.inputOverlayFocused
        ]} 
        pointerEvents="none" 
      />
      <View style={styles.inputIcon}>
        <Icon size={20} color={isFocused ? '#00FF66' : '#CBD5E1'} />
      </View>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#CBD5E1"
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
            <EyeOff size={20} color={isFocused ? '#00FF66' : '#CBD5E1'} />
          ) : (
            <Eye size={20} color={isFocused ? '#00FF66' : '#CBD5E1'} />
          )}
        </TouchableOpacity>
      )}
    </View>
  );
});

const GamifiedButton = memo(({ title, onPress, loading, variant = 'primary' }) => {
  const isOutline = variant === 'outline';
  
  return (
    <View style={styles.ctaButtonWrapper}>
      <TouchableOpacity 
        style={[styles.ctaButton, isOutline && styles.ctaButtonOutline]} 
        onPress={onPress} 
        disabled={loading}
        activeOpacity={0.8}
      >
        {!isOutline && (
          <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
            <Defs>
              <LinearGradient id="btnGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <Stop offset="0%" stopColor="#00FF66" stopOpacity="1" />
                <Stop offset="100%" stopColor="#00B3FF" stopOpacity="1" />
              </LinearGradient>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#btnGrad)" />
          </Svg>
        )}
        {loading ? (
          <ActivityIndicator color={isOutline ? "#00FF66" : "#0A0B10"} size="small" />
        ) : (
          <Text style={[styles.ctaText, isOutline && { color: '#00FF66' }]}>{title}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
});

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

  const handleRegister = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      useDialogStore.getState().showDialog({
        title: 'Thông báo',
        message: 'Vui lòng điền đầy đủ thông tin',
        type: 'warning'
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

    const result = await register({ email, password, fullName, acceptTerms: true });
    if (result.success) {
      useDialogStore.getState().showDialog({
        title: 'Thành công',
        message: 'Tài khoản của bạn đã được tạo!',
        type: 'success'
      });
    }
  };

  React.useEffect(() => {
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
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <AbstractBackground />
      
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <View style={styles.backButtonBg} />
        <ArrowLeft size={24} color="#FFFFFF" />
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
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <UserPlus color="#00FF66" size={40} />
            </View>
            <Text style={styles.brandName}>TẠO TÀI KHOẢN</Text>
            <Text style={styles.brandSlogan}>BẮT ĐẦU HÀNH TRÌNH SỐNG KHỎE</Text>
          </View>

          <View style={styles.glassContainer}>
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
          </View>
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 255, 102, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 102, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#00FF66',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  brandName: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  brandSlogan: {
    fontSize: 13,
    color: '#00FF66',
    marginTop: 6,
    fontWeight: '700',
    letterSpacing: 3,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  glassContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 32,
    padding: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.6,
    shadowRadius: 40,
    elevation: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#CBD5E1',
    marginBottom: 32,
    lineHeight: 22,
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
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  inputOverlayFocused: {
    borderColor: '#00FF66',
    backgroundColor: 'rgba(0, 255, 102, 0.08)',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  eyeIcon: {
    padding: 8,
  },
  ctaButtonWrapper: {
    shadowColor: '#00FF66',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
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
  ctaButtonOutline: {
    backgroundColor: 'rgba(0, 255, 102, 0.05)',
    borderWidth: 1,
    borderColor: '#00FF66',
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0A0B10',
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
    color: '#CBD5E1',
    fontSize: 14,
    fontWeight: '500',
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '800',
    color: '#00FF66',
    letterSpacing: 0.5,
  },
  terms: {
    textAlign: 'center',
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 32,
    lineHeight: 18,
  },
  termsBold: {
    color: '#00FF66',
    fontWeight: '600',
  }
});

export default RegisterScreen;
