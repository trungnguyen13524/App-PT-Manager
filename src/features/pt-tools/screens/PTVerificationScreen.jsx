import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { 
  ChevronLeft,
  Shield,
  Clock as ClockIcon,
  CheckCircle,
  Zap
} from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../../theme';
import NutriButton from '../../../components/shared/NutriButton';
import NutriCard from '../../../components/shared/NutriCard';
import { useAuthStore } from '../../../store/authStore';
import { usePTStore } from '../../../store/ptStore';
import { useDialogStore } from '../../../store/dialogStore';
import { SafeAreaView } from 'react-native-safe-area-context';

const PTVerificationScreen = () => {
  const navigation = useNavigation();
  const { completeOnboarding } = useAuthStore();
  const { verificationStatus, fetchVerificationStatus, submitVerification, isLoading } = usePTStore();
  
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    citizenIdNumber: '',
    citizenIdFrontKey: '',
    citizenIdBackKey: '',
    certificates: [],
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

  const handleAutoFill = () => {
    setFormData({
      fullName: 'Nguyễn Văn HLV',
      dateOfBirth: '1995-05-20',
      citizenIdNumber: '079123456789',
      citizenIdFrontKey: 'mock_front_key.jpg',
      citizenIdBackKey: 'mock_back_key.jpg',
      certificates: [
        {
          name: 'NASM Certified Personal Trainer',
          issuedBy: 'NASM',
          issuedAt: '2022-01-10',
          fileKey: 'mock_cert_nasm.jpg'
        }
      ],
      specialties: ['WEIGHT_LOSS', 'MUSCLE_GAIN'],
      yearsOfExperience: '5',
      bio: 'Tôi có hơn 5 năm kinh nghiệm giúp học viên đạt được mục tiêu thay đổi vóc dáng nhanh chóng và an toàn.',
      bankAccount: {
        bankCode: 'VCB',
        accountNumber: '0123456789',
        accountHolder: 'NGUYEN VAN HLV'
      }
    });
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateBank = (field, value) => {
    setFormData(prev => ({
      ...prev,
      bankAccount: {
        ...prev.bankAccount,
        [field]: value
      }
    }));
  };

  const handleSubmit = async () => {
    if (!formData.fullName || !formData.citizenIdNumber) {
      useDialogStore.getState().showDialog({
        title: 'Thiếu thông tin',
        message: 'Vui lòng điền tối thiểu Họ tên và CCCD.',
        type: 'warning'
      });
      return;
    }
    
    // Prepare payload (convert years to number)
    const payload = {
      ...formData,
      yearsOfExperience: parseInt(formData.yearsOfExperience) || 0
    };

    const res = await submitVerification(payload);
    if (res.success) {
      await completeOnboarding();
      useDialogStore.getState().showDialog({
        title: 'Gửi xác minh thành công!',
        message: 'Hồ sơ của bạn đang được Admin xem xét.',
        type: 'success',
        buttons: [{ text: 'Đồng ý' }]
      });
    } else {
      useDialogStore.getState().showDialog({
        title: 'Lỗi',
        message: res.error || 'Không thể gửi hồ sơ',
        type: 'error'
      });
    }
  };

  const handleBypass = async () => {
    await completeOnboarding();
  };

  const upperStatus = typeof verificationStatus === 'string' ? verificationStatus.toUpperCase() : verificationStatus;

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
        <NutriButton 
          title="Vào giao diện chờ" 
          onPress={handleBypass} 
          style={{ width: '80%', marginTop: 30 }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={COLORS.text} size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hồ Sơ HLV</Text>
        <TouchableOpacity onPress={handleBypass} style={styles.bypassBtn}>
          <Text style={styles.bypassText}>Bỏ qua</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <NutriCard style={styles.infoBanner}>
          <View style={styles.bannerRow}>
            <Shield size={24} color={COLORS.primary} />
            <View style={styles.bannerTextContainer}>
              <Text style={styles.bannerTitle}>Xác minh danh tính</Text>
              <Text style={styles.bannerDesc}>
                Hoàn thiện hồ sơ để có thể quản lý học viên và thu nhập.
              </Text>
            </View>
          </View>
        </NutriCard>

        <TouchableOpacity style={styles.autoFillBtn} onPress={handleAutoFill}>
          <Zap size={16} color="#FFF" style={{ marginRight: 6 }} />
          <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Auto-fill Dữ liệu mẫu (Test)</Text>
        </TouchableOpacity>

        {/* Thông tin cơ bản */}
        <Text style={styles.sectionTitle}>1. Thông tin cơ bản</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Họ và tên</Text>
          <TextInput
            style={styles.input}
            value={formData.fullName}
            onChangeText={(t) => updateField('fullName', t)}
            placeholder="Ví dụ: Nguyễn Văn A"
            placeholderTextColor={COLORS.textLight}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Ngày sinh (YYYY-MM-DD)</Text>
          <TextInput
            style={styles.input}
            value={formData.dateOfBirth}
            onChangeText={(t) => updateField('dateOfBirth', t)}
            placeholder="1995-05-20"
            placeholderTextColor={COLORS.textLight}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Số CCCD</Text>
          <TextInput
            style={styles.input}
            value={formData.citizenIdNumber}
            onChangeText={(t) => updateField('citizenIdNumber', t)}
            placeholder="Nhập 12 số CCCD"
            placeholderTextColor={COLORS.textLight}
            keyboardType="numeric"
          />
        </View>

        {/* Chuyên môn */}
        <Text style={styles.sectionTitle}>2. Chuyên môn & Kinh nghiệm</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Số năm kinh nghiệm</Text>
          <TextInput
            style={styles.input}
            value={formData.yearsOfExperience}
            onChangeText={(t) => updateField('yearsOfExperience', t)}
            placeholder="Ví dụ: 5"
            placeholderTextColor={COLORS.textLight}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Giới thiệu ngắn (Bio)</Text>
          <TextInput
            style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
            value={formData.bio}
            onChangeText={(t) => updateField('bio', t)}
            placeholder="Mô tả về phong cách huấn luyện của bạn..."
            placeholderTextColor={COLORS.textLight}
            multiline
          />
        </View>

        {/* Thanh toán */}
        <Text style={styles.sectionTitle}>3. Tài khoản nhận tiền</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mã ngân hàng (Bank Code)</Text>
          <TextInput
            style={styles.input}
            value={formData.bankAccount.bankCode}
            onChangeText={(t) => updateBank('bankCode', t)}
            placeholder="Ví dụ: VCB, TCB..."
            placeholderTextColor={COLORS.textLight}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Số tài khoản</Text>
          <TextInput
            style={styles.input}
            value={formData.bankAccount.accountNumber}
            onChangeText={(t) => updateBank('accountNumber', t)}
            placeholder="Nhập số tài khoản"
            placeholderTextColor={COLORS.textLight}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tên chủ tài khoản</Text>
          <TextInput
            style={styles.input}
            value={formData.bankAccount.accountHolder}
            onChangeText={(t) => updateBank('accountHolder', t)}
            placeholder="Viết hoa không dấu"
            placeholderTextColor={COLORS.textLight}
          />
        </View>

        <NutriButton
          title={isLoading ? "Đang gửi..." : "Gửi yêu cầu xét duyệt"}
          onPress={handleSubmit}
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
  centerContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  pendingTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    marginBottom: 12,
  },
  pendingDesc: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: COLORS.surface,
  },
  backBtn: { padding: 4 },
  headerTitle: { ...TYPOGRAPHY.h3, color: COLORS.text },
  bypassBtn: { padding: 4 },
  bypassText: { fontSize: 14, color: COLORS.textLight },
  scrollContent: { padding: 20 },
  infoBanner: {
    padding: 16,
    marginBottom: 24,
    backgroundColor: 'rgba(0, 255, 102, 0.1)',
    borderColor: 'rgba(0, 255, 102, 0.3)',
    borderWidth: 1,
  },
  bannerRow: { flexDirection: 'row', alignItems: 'center' },
  bannerTextContainer: { flex: 1, marginLeft: 16 },
  bannerTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  bannerDesc: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 20 },
  autoFillBtn: {
    flexDirection: 'row',
    backgroundColor: '#3498DB',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 10,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: COLORS.text,
    fontSize: 15,
  },
  submitBtn: {
    marginTop: 20,
    marginBottom: 40,
  }
});

export default PTVerificationScreen;
