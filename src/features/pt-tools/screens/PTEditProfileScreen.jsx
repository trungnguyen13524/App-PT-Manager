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
  StatusBar,
  Image,
  ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, User, Phone, Save, Camera } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY } from '../../../theme';
import { useUserStore } from '../../../store/userStore';
import { usePTStore } from '../../../store/ptStore';
import { useDialogStore } from '../../../store/dialogStore';
import { AbstractBackground } from '../../../components/common';
import NutriButton from '../../../components/shared/NutriButton';

const PTEditProfileScreen = () => {
  const navigation = useNavigation();
  const { profile: userProfile, updateProfile: updateUserProfile, fetchProfile: fetchUserProfile, isLoading: isUserLoading } = useUserStore();
  const { profile: ptProfile, updateProfile: updatePtProfile, fetchProfile: fetchPtProfile, isLoading: isPtLoading } = usePTStore();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    bio: '',
  });

  useEffect(() => {
    fetchPtProfile();
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (userProfile || ptProfile) {
      let extractedPhone = userProfile?.phone || '';
      if (!extractedPhone && ptProfile?.bio) {
        const phoneRegex = /0[0-9]{9}/;
        const match = ptProfile.bio.match(phoneRegex);
        if (match) {
          extractedPhone = match[0];
        }
      }
      setFormData({
        fullName: userProfile?.fullName || '',
        phone: extractedPhone,
        bio: ptProfile?.bio || ptProfile?.description || '',
      });
    }
  }, [userProfile, ptProfile]);

  const handleBioChange = (text) => {
    setFormData(prev => {
      let extractedPhone = prev.phone;
      if (!extractedPhone || extractedPhone.trim() === '') {
        const phoneRegex = /0[0-9]{9}/;
        const match = text.match(phoneRegex);
        if (match) {
          extractedPhone = match[0];
        }
      }
      return { ...prev, bio: text, phone: extractedPhone };
    });
  };

  const handleSave = async () => {
    if (!formData.fullName.trim()) {
      useDialogStore.getState().showDialog({
        title: 'Thiếu thông tin',
        message: 'Họ và tên không được để trống.',
        type: 'warning'
      });
      return;
    }

    let formattedPhone = formData.phone.trim();
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '+84' + formattedPhone.slice(1);
    } else if (!formattedPhone.startsWith('+84') && formattedPhone.length > 0) {
      formattedPhone = '+84' + formattedPhone;
    }

    // Update base user profile
    const userRes = await updateUserProfile({
      fullName: formData.fullName.trim(),
      phone: formattedPhone,
    });

    // Update PT profile
    const ptRes = await updatePtProfile({
      bio: formData.bio.trim()
    });

    if (userRes.success && ptRes.success) {
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
        message: userRes.error || ptRes.error || 'Đã có lỗi xảy ra.',
        type: 'error'
      });
    }
  };

  const { updateAvatar } = useUserStore();
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const handlePickAvatar = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setIsUploadingAvatar(true);
        const asset = result.assets[0];
        const uri = asset.uri;
        const extension = uri.split('.').pop() || 'jpg';
        const mimeType = `image/${extension}`;
        const fileName = `avatar.${extension}`;

        const res = await updateAvatar(uri, mimeType, fileName);
        if (res.success) {
          useDialogStore.getState().showDialog({
            title: 'Thành công',
            message: 'Đã cập nhật ảnh đại diện mới',
            type: 'success'
          });
        } else {
          useDialogStore.getState().showDialog({
            title: 'Lỗi',
            message: res.error || 'Lỗi khi upload ảnh',
            type: 'error'
          });
        }
      }
    } catch (error) {
      console.warn(error);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const isLoading = isUserLoading || isPtLoading;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <AbstractBackground />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color="#2D3748" size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông tin cá nhân</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Avatar Section */}
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <TouchableOpacity onPress={handlePickAvatar} disabled={isUploadingAvatar || isLoading} style={{ position: 'relative' }}>
              <Image 
                source={{ uri: userProfile?.avatarUrl || 'https://i.pravatar.cc/150' }}
                style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(0, 0, 0, 0.05)' }}
              />
              <View style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: COLORS.primary, width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: COLORS.background }}>
                <Camera color="#000" size={16} />
              </View>
              {isUploadingAvatar && (
                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 50, alignItems: 'center', justifyContent: 'center' }}>
                  <ActivityIndicator size="small" color="#2D3748" />
                </View>
              )}
            </TouchableOpacity>
            <Text style={{ color: COLORS.textSecondary, fontSize: 12, marginTop: 12 }}>Nhấn để thay đổi ảnh đại diện</Text>
          </View>

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
                  value={userProfile?.email}
                  editable={false}
                />
              </View>
              <Text style={styles.hintText}>Email không thể thay đổi</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Giới thiệu bản thân (Bio)</Text>
              <View style={[styles.inputContainer, styles.textAreaContainer]}>
                <TextInput
                  style={styles.textArea}
                  value={formData.bio}
                  onChangeText={handleBioChange}
                  placeholder="Viết một đoạn ngắn giới thiệu về bạn..."
                  placeholderTextColor={COLORS.textLight}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
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
    color: '#2D3748',
  },
  scrollContent: {
    padding: 20,
  },
  formCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3748',
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
    borderColor: 'rgba(0, 0, 0, 0.02)',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    color: '#2D3748',
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
  },
  textAreaContainer: {
    height: 120,
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  textArea: {
    flex: 1,
    height: '100%',
    width: '100%',
    color: '#2D3748',
    fontSize: 16,
  },
});

export default PTEditProfileScreen;
