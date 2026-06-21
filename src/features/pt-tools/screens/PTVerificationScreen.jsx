import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, StatusBar, Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { ChevronLeft, Shield, Clock as ClockIcon, CheckCircle, Zap, AlertCircle, Upload, X, Plus } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../../theme';
import NutriButton from '../../../components/shared/NutriButton';
import NutriCard from '../../../components/shared/NutriCard';
import { useAuthStore } from '../../../store/authStore';
import { usePTStore } from '../../../store/ptStore';
import { useDialogStore } from '../../../store/dialogStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { uploadToCloudinary } from '../../../utils/cloudinary';

const SPECIALTIES_OPTIONS = [
  { id: 'WEIGHT_LOSS', label: 'Giảm cân' },
  { id: 'MUSCLE_GAIN', label: 'Tăng cơ' },
  { id: 'YOGA', label: 'Yoga' },
  { id: 'REHABILITATION', label: 'Phục hồi chấn thương' },
  { id: 'HIIT', label: 'Cardio HIIT' },
  { id: 'PILATES', label: 'Pilates' },
];

const removeDiacritics = (str) => {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toUpperCase();
};

const PTVerificationScreen = () => {
  const navigation = useNavigation();
  const { user, completeOnboarding } = useAuthStore();
  const { verificationStatus, verificationData, fetchVerificationStatus, submitVerification, isLoading } = usePTStore();
  
  const [step, setStep] = useState(1);
  const [isEditingRejected, setIsEditingRejected] = useState(false);
  const [uploadingState, setUploadingState] = useState({});

  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    dateOfBirth: user?.dateOfBirth || '',
    citizenIdNumber: '',
    citizenIdFrontKey: '',
    citizenIdBackKey: '',
    certificates: [{ id: Date.now().toString(), name: '', issuedBy: '', issuedAt: '', fileKey: '' }],
    specialties: [],
    yearsOfExperience: '',
    bio: '',
    bankAccount: {
      bankCode: '',
      accountNumber: '',
      accountHolder: ''
    }
  });

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      const checkStatus = async () => {
        const status = await fetchVerificationStatus();
        const upperStatus = typeof status === 'string' ? status.toUpperCase() : status;
        if (upperStatus === 'APPROVED') {
          await completeOnboarding();
        }
      };
      checkStatus();
    });
    return unsubscribe;
  }, [navigation, fetchVerificationStatus]);

  useEffect(() => {
    // If the user wants to edit a rejected application and we have data
    if (isEditingRejected && verificationData?.formData) {
      setFormData(prev => ({ ...prev, ...verificationData.formData }));
    } else if (user) {
      setFormData(prev => ({ 
        ...prev, 
        fullName: prev.fullName || user.fullName || prev.fullName,
        dateOfBirth: prev.dateOfBirth || user.dateOfBirth || prev.dateOfBirth
      }));
    }
  }, [isEditingRejected, verificationData, user]);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateBank = (field, value) => {
    let finalVal = value;
    if (field === 'accountHolder') {
      finalVal = removeDiacritics(value);
    }
    setFormData(prev => ({
      ...prev,
      bankAccount: { ...prev.bankAccount, [field]: finalVal }
    }));
  };

  const toggleSpecialty = (id) => {
    setFormData(prev => {
      const has = prev.specialties.includes(id);
      if (has) {
        return { ...prev, specialties: prev.specialties.filter(s => s !== id) };
      }
      if (prev.specialties.length >= 5) return prev; // max 5
      return { ...prev, specialties: [...prev.specialties, id] };
    });
  };

  const addCertificate = () => {
    if (formData.certificates.length >= 10) return;
    setFormData(prev => ({
      ...prev,
      certificates: [...prev.certificates, { id: Date.now().toString(), name: '', issuedBy: '', issuedAt: '', fileKey: '' }]
    }));
  };

  const removeCertificate = (id) => {
    if (formData.certificates.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      certificates: prev.certificates.filter(c => c.id !== id)
    }));
  };

  const updateCertificate = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      certificates: prev.certificates.map(c => c.id === id ? { ...c, [field]: value } : c)
    }));
  };

  const handleDateChange = (field, text) => {
    let cleaned = text.replace(/\D/g, '');
    let formatted = cleaned;
    if (cleaned.length > 2) {
      formatted = cleaned.substring(0, 2) + '/' + cleaned.substring(2);
    }
    if (cleaned.length > 4) {
      formatted = formatted.substring(0, 5) + '/' + cleaned.substring(4, 8);
    }
    updateField(field, formatted);
  };

  const handleCertDateChange = (id, text) => {
    let cleaned = text.replace(/\D/g, '');
    let formatted = cleaned;
    if (cleaned.length > 2) {
      formatted = cleaned.substring(0, 2) + '/' + cleaned.substring(2);
    }
    if (cleaned.length > 4) {
      formatted = formatted.substring(0, 5) + '/' + cleaned.substring(4, 8);
    }
    updateCertificate(id, 'issuedAt', formatted);
  };

  const pickImage = async (field, certId = null) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        
        // Show loading state
        const loadingKey = certId ? `cert_${certId}` : field;
        setUploadingState(prev => ({ ...prev, [loadingKey]: true }));
        
        try {
          const secureUrl = await uploadToCloudinary(uri, user?.id || 'unknown');
          
          if (certId) {
            updateCertificate(certId, field, secureUrl);
          } else {
            updateField(field, secureUrl);
          }
        } catch (error) {
          useDialogStore.getState().showDialog({
            title: 'Lỗi tải ảnh',
            message: 'Không thể tải ảnh lên, vui lòng thử lại sau.',
            type: 'error'
          });
        } finally {
          setUploadingState(prev => ({ ...prev, [loadingKey]: false }));
        }
      }
    } catch (error) {
      console.log('Image picker error:', error);
    }
  };

  const validateStep = (currentStep) => {
    if (currentStep === 1) {
      if (!formData.fullName) return 'Vui lòng nhập họ tên.';
      if (!formData.dateOfBirth || formData.dateOfBirth.length < 10) return 'Vui lòng nhập ngày sinh hợp lệ (DD/MM/YYYY).';
      // Simple age validation
      const parts = formData.dateOfBirth.split('/');
      const year = parseInt(parts[2]);
      const currentYear = new Date().getFullYear();
      if (!year || currentYear - year < 18 || currentYear - year > 80) return 'Tuổi phải từ 18 đến 80.';
      if (formData.bio.length < 50 || formData.bio.length > 2000) return 'Bio phải từ 50 đến 2000 ký tự.';
      
      const phoneRegex = /0\d{9}/;
      if (!phoneRegex.test(formData.bio.replace(/[\s\.\-]/g, ''))) {
        return 'Vui lòng cung cấp số điện thoại liên hệ trong phần Giới thiệu bản thân.';
      }
      
      if (formData.specialties.length === 0) return 'Vui lòng chọn ít nhất 1 chuyên môn.';
    }
    if (currentStep === 2) {
      if (formData.citizenIdNumber.length < 9 || formData.citizenIdNumber.length > 12) return 'CCCD phải từ 9-12 chữ số.';
    }
    if (currentStep === 3) {
      for (let c of formData.certificates) {
        if (!c.name || !c.issuedBy) return 'Vui lòng điền đủ tên và đơn vị cấp của chứng chỉ.';
      }
    }
    if (currentStep === 4) {
      if (!formData.bankAccount.bankCode || !formData.bankAccount.accountNumber || !formData.bankAccount.accountHolder) {
        return 'Vui lòng nhập đủ thông tin ngân hàng.';
      }
    }
    return null;
  };

  const handleNext = () => {
    const error = validateStep(step);
    if (error) {
      useDialogStore.getState().showDialog({ title: 'Thiếu thông tin', message: error, type: 'warning' });
      return;
    }
    if (step < 4) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    const formatToBackendDate = (dateStr) => {
      if (!dateStr || !dateStr.includes('/')) return dateStr;
      const [dd, mm, yyyy] = dateStr.split('/');
      return `${yyyy}-${mm}-${dd}`;
    };

    const payload = { 
      ...formData, 
      dateOfBirth: formatToBackendDate(formData.dateOfBirth),
      yearsOfExperience: parseInt(formData.yearsOfExperience) || 0,
      certificates: formData.certificates.map(c => ({
        ...c,
        issuedAt: formatToBackendDate(c.issuedAt)
      }))
    };
    const res = await submitVerification(payload);
    if (res.success) {
      useDialogStore.getState().showDialog({
        title: 'Gửi xác minh thành công!',
        message: 'Hồ sơ của bạn đang được Admin xem xét.',
        type: 'success',
        buttons: [{ text: 'Đồng ý' }]
      });
    } else {
      useDialogStore.getState().showDialog({
        title: 'Lỗi', message: res.error || 'Không thể gửi hồ sơ', type: 'error'
      });
    }
  };

  const handleBypass = async () => await completeOnboarding();

  const upperStatus = typeof verificationStatus === 'string' ? verificationStatus.toUpperCase() : verificationStatus;

  const hasShownDialog = useRef(false);

  useEffect(() => {
    if (upperStatus === 'APPROVED' && !hasShownDialog.current) {
      hasShownDialog.current = true;
      useDialogStore.getState().showDialog({
        title: 'Chúc mừng!',
        message: 'Hồ sơ Huấn luyện viên của bạn đã được duyệt thành công. Chào mừng bạn đến với NutriCoach!',
        type: 'success',
        buttons: [{ 
          text: 'Vào trang quản lý', 
          onPress: async () => {
            await useAuthStore.getState().syncProfileAndToken();
            await completeOnboarding();
          } 
        }]
      });
    }
  }, [upperStatus, completeOnboarding]);

  // --- REJECTED STATE ---
  if (upperStatus === 'REJECTED' && !isEditingRejected) {
    const reason = verificationData?.rejectReason || 'Không xác định';
    const canResubmit = verificationData?.requireResubmit !== false;
    return (
      <SafeAreaView style={styles.centerContainer}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <AlertCircle size={80} color="#FF3B30" style={{ marginBottom: 20 }} />
        <Text style={styles.pendingTitle}>Hồ sơ bị từ chối</Text>
        <Text style={styles.pendingDesc}>Lý do: {reason}</Text>
        {canResubmit ? (
          <NutriButton title="Chỉnh sửa hồ sơ" onPress={() => setIsEditingRejected(true)} style={{ width: '80%', marginTop: 30 }} />
        ) : (
          <Text style={[styles.pendingDesc, { marginTop: 20, fontWeight: 'bold' }]}>Vui lòng liên hệ hỗ trợ viên.</Text>
        )}
        <NutriButton title="Quay lại" variant="outline" onPress={() => navigation.goBack()} style={{ width: '80%', marginTop: 15 }} />
      </SafeAreaView>
    );
  }

  // --- PENDING STATE ---
  if (upperStatus === 'PENDING_REVIEW' || upperStatus === 'PENDING') {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <ClockIcon size={80} color={COLORS.primary} style={{ marginBottom: 20 }} />
        <Text style={styles.pendingTitle}>Đang chờ duyệt hồ sơ</Text>
        <Text style={styles.pendingDesc}>
          Admin đang xem xét hồ sơ PT của bạn. Quá trình này thường mất từ 24-48 giờ. 
          Vui lòng quay lại sau nhé!
        </Text>
        <NutriButton title="Vào giao diện chờ" onPress={handleBypass} style={{ width: '80%', marginTop: 30 }} />
      </SafeAreaView>
    );
  }

  // --- FORM STATE ---
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => {
            if (step > 1) {
              setStep(step - 1);
            } else {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                handleBypass();
              }
            }
          }} 
          style={styles.backBtn}
        >
          <ChevronLeft color={COLORS.text} size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hồ Sơ HLV</Text>
        <TouchableOpacity onPress={handleBypass} style={styles.bypassBtn}>
          <Text style={styles.bypassText}>Bỏ qua</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.progressBarContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(step / 4) * 100}%` }]} />
        </View>
        <Text style={styles.stepText}>Bước {step}/4</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.sectionTitle}>Thông tin cá nhân & Chuyên môn</Text>
            
            <Text style={styles.label}>Họ và tên</Text>
            <TextInput style={styles.input} value={formData.fullName} onChangeText={(t) => updateField('fullName', t)} placeholder="Ví dụ: Nguyễn Văn A" placeholderTextColor={COLORS.textLight} />

            <Text style={styles.label}>Ngày sinh (DD/MM/YYYY)</Text>
            <TextInput style={styles.input} value={formData.dateOfBirth} onChangeText={(t) => handleDateChange('dateOfBirth', t)} placeholder="DD/MM/YYYY" keyboardType="numeric" maxLength={10} placeholderTextColor={COLORS.textLight} />

            <Text style={styles.label}>Số năm kinh nghiệm</Text>
            <TextInput style={styles.input} value={formData.yearsOfExperience} onChangeText={(t) => updateField('yearsOfExperience', t)} placeholder="Ví dụ: 5" keyboardType="numeric" placeholderTextColor={COLORS.textLight} />

            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
              <Text style={styles.label}>Giới thiệu bản thân (Bio)</Text>
              <Text style={{fontSize: 12, color: formData.bio.length < 50 || formData.bio.length > 2000 ? '#FF3B30' : COLORS.textLight}}>{formData.bio.length}/2000</Text>
            </View>
            <TextInput
              style={[styles.input, { height: 120, textAlignVertical: 'top' }]}
              placeholder="VD: Chào các bạn, mình là Minh. Mình có kinh nghiệm 5 năm trong việc giảm mỡ tăng cơ. Liên hệ mình qua SĐT 0987654321..."
              placeholderTextColor={COLORS.textLight}
              value={formData.bio}
              onChangeText={(text) => updateField('bio', text)}
              multiline
            />
            <Text style={{fontSize: 12, color: formData.bio.length < 50 || formData.bio.length > 2000 ? '#FF3B30' : COLORS.textLight, marginBottom: 10}}>Tối thiểu 50 ký tự. Bắt buộc phải có số điện thoại liên lạc.</Text>

            <Text style={styles.label}>Nhãn chuyên môn (Tối đa 5)</Text>
            <View style={styles.chipsContainer}>
              {SPECIALTIES_OPTIONS.map(opt => {
                const isSelected = formData.specialties.includes(opt.id);
                return (
                  <TouchableOpacity key={opt.id} style={[styles.chip, isSelected && styles.chipSelected]} onPress={() => toggleSpecialty(opt.id)}>
                    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{opt.label}</Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.sectionTitle}>Xác minh CCCD/CMND</Text>
            
            <Text style={styles.label}>Số CCCD (9-12 số)</Text>
            <TextInput style={styles.input} value={formData.citizenIdNumber} onChangeText={(t) => updateField('citizenIdNumber', t)} placeholder="Nhập 12 số CCCD" keyboardType="numeric" placeholderTextColor={COLORS.textLight} />

            <Text style={styles.label}>Ảnh mặt trước</Text>
            <TouchableOpacity style={styles.uploadBox} onPress={() => pickImage('citizenIdFrontKey')} disabled={uploadingState['citizenIdFrontKey']}>
              {uploadingState['citizenIdFrontKey'] ? (
                <ActivityIndicator color={COLORS.primary} />
              ) : formData.citizenIdFrontKey ? (
                <Image source={{ uri: formData.citizenIdFrontKey }} style={styles.uploadedImage} />
              ) : (
                <>
                  <Upload size={24} color={COLORS.textLight} />
                  <Text style={styles.uploadText}>Nhấn để tải ảnh mặt trước</Text>
                </>
              )}
            </TouchableOpacity>

            <Text style={styles.label}>Ảnh mặt sau</Text>
            <TouchableOpacity style={styles.uploadBox} onPress={() => pickImage('citizenIdBackKey')} disabled={uploadingState['citizenIdBackKey']}>
              {uploadingState['citizenIdBackKey'] ? (
                <ActivityIndicator color={COLORS.primary} />
              ) : formData.citizenIdBackKey ? (
                <Image source={{ uri: formData.citizenIdBackKey }} style={styles.uploadedImage} />
              ) : (
                <>
                  <Upload size={24} color={COLORS.textLight} />
                  <Text style={styles.uploadText}>Nhấn để tải ảnh mặt sau</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {step === 3 && (
          <View style={styles.stepContainer}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
              <Text style={styles.sectionTitle}>Bằng cấp & Chứng chỉ</Text>
              <Text style={{color: COLORS.textLight}}>{formData.certificates.length}/10</Text>
            </View>
            
            {formData.certificates.map((cert, index) => (
              <View key={cert.id} style={styles.certCard}>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12}}>
                  <Text style={{color: COLORS.text, fontWeight: 'bold'}}>Chứng chỉ {index + 1}</Text>
                  {formData.certificates.length > 1 && (
                    <TouchableOpacity onPress={() => removeCertificate(cert.id)}>
                      <X color="#FF3B30" size={20} />
                    </TouchableOpacity>
                  )}
                </View>

                <TextInput style={styles.input} value={cert.name} onChangeText={(t) => updateCertificate(cert.id, 'name', t)} placeholder="Tên chứng chỉ (VD: NASM CPT)" placeholderTextColor={COLORS.textLight} />
                <TextInput style={styles.input} value={cert.issuedBy} onChangeText={(t) => updateCertificate(cert.id, 'issuedBy', t)} placeholder="Đơn vị cấp" placeholderTextColor={COLORS.textLight} />
                <TextInput style={styles.input} value={cert.issuedAt} onChangeText={(t) => handleCertDateChange(cert.id, t)} placeholder="Ngày cấp (DD/MM/YYYY)" keyboardType="numeric" maxLength={10} placeholderTextColor={COLORS.textLight} />
                
                <TouchableOpacity style={[styles.uploadBox, { height: 80, marginTop: 0 }]} onPress={() => pickImage('fileKey', cert.id)} disabled={uploadingState[`cert_${cert.id}`]}>
                  {uploadingState[`cert_${cert.id}`] ? (
                    <ActivityIndicator color={COLORS.primary} />
                  ) : cert.fileKey ? (
                    <Image source={{ uri: cert.fileKey }} style={styles.uploadedImage} />
                  ) : (
                    <Text style={styles.uploadText}>Đính kèm ảnh/PDF chứng chỉ</Text>
                  )}
                </TouchableOpacity>
              </View>
            ))}

            {formData.certificates.length < 10 && (
              <TouchableOpacity style={styles.addBtn} onPress={addCertificate}>
                <Plus color={COLORS.primary} size={20} style={{marginRight: 8}} />
                <Text style={{color: COLORS.primary, fontWeight: 'bold'}}>Thêm chứng chỉ khác</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {step === 4 && (
          <View style={styles.stepContainer}>
            <Text style={styles.sectionTitle}>Tài khoản ngân hàng</Text>
            <Text style={styles.pendingDesc}>Thông tin này sẽ được dùng để nhận tiền thanh toán từ học viên.</Text>
            
            <Text style={styles.label}>Mã Ngân hàng (Ví dụ: VCB, TCB, MB...)</Text>
            <TextInput style={styles.input} value={formData.bankAccount.bankCode} onChangeText={(t) => updateBank('bankCode', t)} placeholder="Nhập mã ngân hàng" placeholderTextColor={COLORS.textLight} />

            <Text style={styles.label}>Số tài khoản</Text>
            <TextInput style={styles.input} value={formData.bankAccount.accountNumber} onChangeText={(t) => updateBank('accountNumber', t)} placeholder="Nhập số tài khoản" keyboardType="numeric" placeholderTextColor={COLORS.textLight} />

            <Text style={styles.label}>Tên chủ tài khoản</Text>
            <TextInput style={styles.input} value={formData.bankAccount.accountHolder} onChangeText={(t) => updateBank('accountHolder', t)} placeholder="TỰ ĐỘNG VIẾT HOA KHÔNG DẤU" placeholderTextColor={COLORS.textLight} />
          </View>
        )}

        <NutriButton
          title={step < 4 ? "Tiếp tục" : (isLoading ? "Đang gửi..." : "Gửi yêu cầu xét duyệt")}
          onPress={handleNext}
          style={styles.submitBtn}
          disabled={isLoading}
        />
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centerContainer: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center', padding: 24 },
  pendingTitle: { ...TYPOGRAPHY.h2, color: COLORS.text, marginBottom: 12 },
  pendingDesc: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 24, marginBottom: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 15, backgroundColor: COLORS.surface },
  backBtn: { padding: 4 },
  headerTitle: { ...TYPOGRAPHY.h3, color: COLORS.text },
  bypassBtn: { padding: 4 },
  bypassText: { fontSize: 14, color: COLORS.textLight },
  progressBarContainer: { paddingHorizontal: 20, paddingVertical: 15, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderColor: COLORS.border, flexDirection: 'row', alignItems: 'center' },
  progressBar: { flex: 1, height: 6, backgroundColor: COLORS.border, borderRadius: 3, marginRight: 15, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: COLORS.primary },
  stepText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 14 },
  scrollContent: { padding: 20 },
  stepContainer: { flex: 1 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginBottom: 20 },
  label: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 8, marginTop: 12 },
  input: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: COLORS.text, fontSize: 15, marginBottom: 4 },
  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface, marginRight: 8, marginBottom: 8 },
  chipSelected: { backgroundColor: 'rgba(0, 255, 102, 0.1)', borderColor: COLORS.primary },
  chipText: { color: COLORS.textLight, fontSize: 14 },
  chipTextSelected: { color: COLORS.primary, fontWeight: 'bold' },
  uploadBox: { height: 120, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderStyle: 'dashed', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 8, marginBottom: 12, overflow: 'hidden' },
  uploadText: { color: COLORS.textLight, marginTop: 8, fontSize: 14 },
  uploadedImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  certCard: { backgroundColor: COLORS.surface, padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: COLORS.primary, borderStyle: 'dashed', marginBottom: 20 },
  submitBtn: { marginTop: 30, marginBottom: 40 }
});

export default PTVerificationScreen;
