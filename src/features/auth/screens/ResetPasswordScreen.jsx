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
import { Lock, Key, ArrowLeft } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../../theme';
import NutriButton from '../../../components/shared/NutriButton';
import NutriInput from '../../../components/shared/NutriInput';
import authService from '../../../api/services/auth.service';

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
      Alert.alert('Thông báo', 'Vui lòng điền đầy đủ mã xác thực và mật khẩu mới.');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.resetPassword(token, newPassword);
      if (response.success) {
        Alert.alert(
          'Thành công', 
          'Mật khẩu của bạn đã được đặt lại thành công. Vui lòng đăng nhập bằng mật khẩu mới.',
          [
            { text: 'Đăng nhập', onPress: () => navigation.navigate('Login') }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Lỗi', error.message || 'Mã xác thực không hợp lệ hoặc đã hết hạn.');
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
          <Text style={styles.title}>Đặt lại mật khẩu</Text>
          <Text style={styles.subtitle}>
            Nhập mã xác thực (token) từ email và thiết lập mật khẩu mới an toàn hơn.
          </Text>

          <View style={styles.form}>
            <NutriInput
              label="Mã xác thực (Token)"
              placeholder="Nhập mã từ email"
              value={token}
              onChangeText={setToken}
              icon={<Key size={20} color={COLORS.textSecondary} />}
            />

            <NutriInput
              label="Mật khẩu mới"
              placeholder="Tối thiểu 8 ký tự"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              icon={<Lock size={20} color={COLORS.textSecondary} />}
            />

            <NutriInput
              label="Xác nhận mật khẩu mới"
              placeholder="Nhập lại mật khẩu"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              icon={<Lock size={20} color={COLORS.textSecondary} />}
            />

            <NutriButton
              title="Đặt lại mật khẩu"
              onPress={handleResetPassword}
              loading={isLoading}
              style={styles.submitButton}
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
});

export default ResetPasswordScreen;
