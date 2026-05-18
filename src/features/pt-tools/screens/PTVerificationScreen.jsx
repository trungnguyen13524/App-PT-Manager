import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { 
  Camera, 
  FileCheck, 
  Upload, 
  ChevronLeft,
  Shield,
  CheckCircle,
  Clock as ClockIcon
} from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../../theme';
import NutriButton from '../../../components/shared/NutriButton';
import NutriCard from '../../../components/shared/NutriCard';
import { useAuthStore } from '../../../store/authStore';
import { usePTStore } from '../../../store/ptStore';

const PTVerificationScreen = () => {
  const navigation = useNavigation();
  const { completeOnboarding } = useAuthStore();
  const { verificationStatus, fetchVerificationStatus, submitVerification, isLoading } = usePTStore();
  
  const [idCardFront, setIdCardFront] = useState(null);
  const [idCardBack, setIdCardBack] = useState(null);
  const [certificates, setCertificates] = useState([]);

  useEffect(() => {
    fetchVerificationStatus();
  }, []);

  const handlePickImage = (type) => {
    // Tạm thời giả lập chọn ảnh (Vì chưa cài expo-image-picker)
    const mockUri = 'https://via.placeholder.com/400';
    if (type === 'id_front') setIdCardFront(mockUri);
    else if (type === 'id_back') setIdCardBack(mockUri);
    else if (type === 'cert') setCertificates([...certificates, mockUri]);
  };

  const handleSubmit = async () => {
    if (!idCardFront || !idCardBack) {
      Alert.alert('Thông báo', 'Vui lòng tải lên cả mặt trước và mặt sau CCCD');
      return;
    }
    
    const payload = {
      idCardFrontUrl: idCardFront,
      idCardBackUrl: idCardBack,
      certificates: certificates
    };

    const res = await submitVerification(payload);
    if (res.success) {
      Alert.alert(
        'Gửi xác minh thành công!',
        'Hồ sơ của bạn đang được Admin xem xét.',
        [{ text: 'Đồng ý', onPress: () => navigation.goBack() }]
      );
    } else {
      Alert.alert('Lỗi', res.error || 'Không thể gửi hồ sơ');
    }
  };

  // Giao diện khi đang chờ duyệt
  if (verificationStatus === 'PENDING') {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ClockIcon size={80} color={COLORS.primary} style={{ marginBottom: 20 }} />
        <Text style={styles.pendingTitle}>Đang chờ duyệt hồ sơ</Text>
        <Text style={styles.pendingDesc}>
          Admin đang xem xét hồ sơ PT của bạn. Quá trình này thường mất từ 24-48 giờ. 
          Vui lòng quay lại sau nhé!
        </Text>
        <NutriButton 
          title="Quay lại" 
          onPress={() => navigation.goBack()} 
          style={{ width: '80%', marginTop: 30 }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={COLORS.text} size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Xác minh PT</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Info Banner */}
        <NutriCard style={styles.infoBanner}>
          <View style={styles.bannerRow}>
            <Shield size={24} color={COLORS.primary} />
            <View style={styles.bannerTextContainer}>
              <Text style={styles.bannerTitle}>Xác minh danh tính</Text>
              <Text style={styles.bannerDesc}>
                Để đảm bảo an toàn cho học viên, chúng tôi cần xác minh thông tin của bạn trước khi kích hoạt tài khoản PT.
              </Text>
            </View>
          </View>
        </NutriCard>

        {/* CCCD Section */}
        <Text style={styles.sectionTitle}>1. Căn cước công dân (CCCD)</Text>
        
        <View style={styles.uploadRow}>
          <TouchableOpacity 
            style={styles.uploadCard} 
            onPress={() => handlePickImage('id_front')}
          >
            {idCardFront ? (
              <View style={styles.uploadedContainer}>
                <Image source={{ uri: idCardFront }} style={styles.uploadedImage} />
                <View style={styles.checkBadge}>
                  <CheckCircle size={20} color={COLORS.white} />
                </View>
              </View>
            ) : (
              <>
                <Camera size={28} color={COLORS.textLight} />
                <Text style={styles.uploadLabel}>Mặt trước</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.uploadCard}
            onPress={() => handlePickImage('id_back')}
          >
            {idCardBack ? (
              <View style={styles.uploadedContainer}>
                <Image source={{ uri: idCardBack }} style={styles.uploadedImage} />
                <View style={styles.checkBadge}>
                  <CheckCircle size={20} color={COLORS.white} />
                </View>
              </View>
            ) : (
              <>
                <Camera size={28} color={COLORS.textLight} />
                <Text style={styles.uploadLabel}>Mặt sau</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Certificates Section */}
        <Text style={styles.sectionTitle}>2. Bằng cấp / Chứng chỉ chuyên môn</Text>
        <Text style={styles.sectionSubtitle}>
          Tải lên bằng cấp hoặc chứng chỉ liên quan đến thể hình, dinh dưỡng
        </Text>

        <View style={styles.certGrid}>
          {certificates.map((cert, index) => (
            <View key={index} style={styles.certCard}>
              <Image source={{ uri: cert }} style={styles.certImage} />
              <View style={styles.checkBadge}>
                <CheckCircle size={16} color={COLORS.white} />
              </View>
            </View>
          ))}

          <TouchableOpacity 
            style={styles.addCertCard}
            onPress={() => handlePickImage('cert')}
          >
            <Upload size={24} color={COLORS.primary} />
            <Text style={styles.addCertText}>Thêm</Text>
          </TouchableOpacity>
        </View>

        {/* Submit */}
        <NutriButton
          title="Gửi hồ sơ xác minh"
          onPress={handleSubmit}
          style={styles.submitBtn}
          loading={isLoading}
          icon={!isLoading && <FileCheck size={20} color={COLORS.white} />}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: COLORS.white,
  },
  pendingTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  pendingDesc: {
    ...TYPOGRAPHY.body1,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  infoBanner: {
    backgroundColor: COLORS.primaryLight,
    marginBottom: 24,
    padding: 16,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bannerTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
  },
  bannerDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
    marginTop: 8,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 16,
    lineHeight: 18,
  },
  uploadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  uploadCard: {
    width: '48%',
    height: 120,
    backgroundColor: COLORS.background,
    borderRadius: SPACING.borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.divider,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  uploadLabel: {
    fontSize: 13,
    color: COLORS.textLight,
    marginTop: 8,
    fontWeight: '500',
  },
  uploadedContainer: {
    width: '100%',
    height: '100%',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.success,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  certGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  certCard: {
    width: 100,
    height: 100,
    borderRadius: SPACING.borderRadius.lg,
    marginRight: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  certImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  addCertCard: {
    width: 100,
    height: 100,
    borderRadius: SPACING.borderRadius.lg,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
  },
  addCertText: {
    fontSize: 12,
    color: COLORS.primary,
    marginTop: 4,
    fontWeight: '600',
  },
  submitBtn: {
    marginTop: 16,
    height: 56,
  }
});

export default PTVerificationScreen;
