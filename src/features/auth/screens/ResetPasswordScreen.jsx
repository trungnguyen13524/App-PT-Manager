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
import { useNavigation, useRoute } from '@react-navigation/native';
import { Lock, Key, ArrowLeft, KeyRound, Eye, EyeOff } from 'lucide-react-native';
import authService from '../../../api/services/auth.service';
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
          <Stop offset="0%" stopColor="#2D3748" />
          <Stop offset="100%" stopColor="#EADDCA" />
        </LinearGradient>
        <LinearGradient id="circleGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#556B2F" stopOpacity="0.15" />
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
        <Icon size={20} color={isFocused ? '#556B2F' : '#CBD5E1'} />
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
            <EyeOff size={20} color={isFocused ? '#556B2F' : '#CBD5E1'} />
          ) : (
            <Eye size={20} color={isFocused ? '#556B2F' : '#CBD5E1'} />
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
                <Stop offset="0%" stopColor="#556B2F" stopOpacity="1" />
                <Stop offset="100%" stopColor="#00B3FF" stopOpacity="1" />
              </LinearGradient>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#btnGrad)" />
          </Svg>
        )}
        {loading ? (
          <ActivityIndicator color={isOutline ? "#556B2F" : "#0A0B10"} size="small" />
        ) : (
          <Text style={[styles.ctaText, isOutline && { color: '#556B2F' }]}>{title}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
});

// -------------------------------------------------------------
// MAIN COMPONENT
// -------------------------------------------------------------

const ResetPasswordScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Có thể truyền token từ email deeplink qua params
  const initialToken = route.params?.token || '';

  const [token, setToken] = useState(initialToken);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!token || !newPassword || !confirmPassword) {
      useDialogStore.getState().showDialog({
        title: 'Thông báo',
        message: 'Vui lòng điền đầy đủ mã xác thực và mật khẩu mới.',
        type: 'warning'
      });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      useDialogStore.getState().showDialog({
        title: 'Lỗi',
        message: 'Mật khẩu xác nhận không khớp.',
        type: 'error'
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.resetPassword(token, newPassword);
      if (response.success) {
        useDialogStore.getState().showDialog({
          title: 'Thành công', 
          message: 'Mật khẩu của bạn đã được đặt lại thành công. Vui lòng đăng nhập bằng mật khẩu mới.',
          type: 'success',
          buttons: [
            { text: 'Đăng nhập', onPress: () => navigation.navigate('Login') }
          ]
        });
      }
    } catch (error) {
      useDialogStore.getState().showDialog({
        title: 'Lỗi',
        message: error.message || 'Mã xác thực không hợp lệ hoặc đã hết hạn.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <AbstractBackground />

      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <View style={styles.backButtonBg} />
        <ArrowLeft size={24} color="#2D3748" />
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
              <KeyRound color="#556B2F" size={40} />
            </View>
            <Text style={styles.brandName}>THIẾT LẬP</Text>
            <Text style={styles.brandSlogan}>MẬT KHẨU MỚI</Text>
          </View>

          <View style={styles.glassContainer}>
            <Text style={styles.title}>ĐẶT LẠI MẬT KHẨU</Text>
            <Text style={styles.subtitle}>
              Nhập mã xác thực (token) từ email và thiết lập mật khẩu mới an toàn hơn.
            </Text>

            <View style={styles.form}>
              <GlowingInput
                icon={Key}
                placeholder="Nhập mã từ email"
                value={token}
                onChangeText={setToken}
                autoCapitalize="none"
              />

              <GlowingInput
                icon={Lock}
                placeholder="Mật khẩu mới (Tối thiểu 8 ký tự)"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />

              <GlowingInput
                icon={Lock}
                placeholder="Nhập lại mật khẩu mới"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />

              <View style={{ marginTop: 16 }}>
                <GamifiedButton
                  title="ĐẶT LẠI MẬT KHẨU"
                  onPress={handleResetPassword}
                  loading={isLoading}
                />
              </View>
            </View>
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
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
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
    borderColor: 'rgba(85, 107, 47, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#556B2F',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  brandName: {
    fontSize: 32,
    fontWeight: '900',
    color: '#2D3748',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  brandSlogan: {
    fontSize: 13,
    color: '#556B2F',
    marginTop: 6,
    fontWeight: '700',
    letterSpacing: 3,
    textTransform: 'uppercase',
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
    color: '#2D3748',
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
    borderColor: '#556B2F',
    backgroundColor: 'rgba(0, 255, 102, 0.08)',
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
    shadowColor: '#556B2F',
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
    borderColor: '#556B2F',
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0A0B10',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  }
});

export default ResetPasswordScreen;
