import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, User, Phone, Save } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY } from '../../../theme';
import { useUserStore } from '../../../store/userStore';
import { useDialogStore } from '../../../store/dialogStore';
import { AbstractBackground } from '../../../components/common';
import NutriButton from '../../../components/shared/NutriButton';

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const { profile, updateProfile, isLoading } = useUserStore();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || '',
        phone: profile.phone || '',
      });
    }
  }, [profile]);

  const handleSave = async () => {
    if (!formData.fullName.trim()) {
      useDialogStore.getState().showDialog({
        title: 'Thiếu thông tin',
        message: 'Họ và tên không được để trống.',
        type: 'warning'
      });
      return;
    }

    const res = await updateProfile({
      fullName: formData.fullName.trim(),
      phone: formData.phone.trim(),
    });

    if (res.success) {
      useDialogStore.getState().showDialog({
        title: 'Thành công',
        message: 'Đã cập nhật thông tin cá nhân.',
        type: 'success',
        buttons: [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      });
    } else {
      useDialogStore.getState().showDialog({
        title: 'Lỗi cập nhật',
        message: res.error || 'Đã có lỗi xảy ra.',
        type: 'error'
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <AbstractBackground />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color="#FFF" size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông tin cá nhân</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <View style={styles.formCard}>
            <Text style={styles.cardTitle}>Thông tin cơ bản</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Họ và tên</Text>
              <View style={styles.inputContainer}>
                <User color={COLORS.primary} size={20} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.fullName}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, fullName: text }))}
                  placeholder="Nhập họ và tên"
                  placeholderTextColor={COLORS.textLight}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Số điện thoại</Text>
              <View style={styles.inputContainer}>
                <Phone color={COLORS.primary} size={20} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.phone}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
                  placeholder="Nhập số điện thoại"
                  placeholderTextColor={COLORS.textLight}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={[styles.inputContainer, styles.disabledInput]}>
                <TextInput
                  style={[styles.input, { color: COLORS.textSecondary }]}
                  value={profile?.email}
                  editable={false}
                />
              </View>
              <Text style={styles.hintText}>Email không thể thay đổi</Text>
            </View>

          </View>

          <NutriButton
            title={isLoading ? "Đang lưu..." : "Lưu thay đổi"}
            onPress={handleSave}
            disabled={isLoading}
            style={styles.saveBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    ...TYPOGRAPHY.h3,
    color: '#FFF',
  },
  scrollContent: {
    padding: 20,
  },
  formCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 16,
    height: 56,
  },
  disabledInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    color: '#FFF',
    fontSize: 16,
  },
  hintText: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 6,
    fontStyle: 'italic',
  },
  saveBtn: {
    marginTop: 32,
  }
});

export default EditProfileScreen;
