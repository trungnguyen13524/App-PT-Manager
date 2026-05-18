import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { 
  ChevronRight, 
  ChevronLeft, 
  User, 
  Activity, 
  Target, 
  CheckCircle2 
} from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../../theme';
import NutriButton from '../../../components/shared/NutriButton';
import NutriInput from '../../../components/shared/NutriInput';
import NutriCard from '../../../components/shared/NutriCard';
import { useUserStore } from '../../../store/userStore';
import { useAuthStore } from '../../../store/authStore';

const { width } = Dimensions.get('window');

const OnboardingScreen = () => {
  const navigation = useNavigation();
  const [step, setStep] = useState(1);
  const { profile, updateProfile, calculateStats } = useUserStore();
  const { completeOnboarding } = useAuthStore();

  const handleNext = () => {
    if (step < 3) {
      if (step === 1) {
        // Validation step 1
        if (!profile.age || !profile.height || !profile.weight) {
          Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ chỉ số cơ thể');
          return;
        }
        calculateStats();
      }
      setStep(step + 1);
    } else {
      // Hoàn thành onboarding → AppNavigator tự động chuyển sang StudentStack
      completeOnboarding();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigation.goBack();
    }
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      {[1, 2, 3].map((item) => (
        <View 
          key={item} 
          style={[
            styles.progressDot, 
            step >= item ? styles.progressDotActive : styles.progressDotInactive
          ]} 
        />
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Chỉ số cơ thể</Text>
      <Text style={styles.stepSubtitle}>Giúp chúng tôi hiểu rõ hơn về cơ thể bạn</Text>

      <View style={styles.genderContainer}>
        <TouchableOpacity 
          style={[styles.genderCard, profile.gender === 'male' && styles.genderCardActive]}
          onPress={() => updateProfile({ gender: 'male' })}
        >
          <Text style={[styles.genderText, profile.gender === 'male' && styles.genderTextActive]}>Nam</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.genderCard, profile.gender === 'female' && styles.genderCardActive]}
          onPress={() => updateProfile({ gender: 'female' })}
        >
          <Text style={[styles.genderText, profile.gender === 'female' && styles.genderTextActive]}>Nữ</Text>
        </TouchableOpacity>
      </View>

      <NutriInput
        label="Tuổi"
        placeholder="25"
        keyboardType="numeric"
        value={profile.age.toString()}
        onChangeText={(val) => updateProfile({ age: parseInt(val) || 0 })}
      />
      <NutriInput
        label="Chiều cao (cm)"
        placeholder="170"
        keyboardType="numeric"
        value={profile.height.toString()}
        onChangeText={(val) => updateProfile({ height: parseInt(val) || 0 })}
      />
      <NutriInput
        label="Cân nặng (kg)"
        placeholder="65"
        keyboardType="numeric"
        value={profile.weight.toString()}
        onChangeText={(val) => updateProfile({ weight: parseInt(val) || 0 })}
      />
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Mục tiêu & Vận động</Text>
      <Text style={styles.stepSubtitle}>Cơ sở để tính toán lượng calo cần thiết</Text>

      <Text style={styles.label}>Mức độ hoạt động</Text>
      {[
        { label: 'Ít vận động (Văn phòng)', value: 1.2 },
        { label: 'Vận động nhẹ (1-2 buổi/tuần)', value: 1.375 },
        { label: 'Vận động vừa (3-5 buổi/tuần)', value: 1.55 },
        { label: 'Vận động mạnh (6-7 buổi/tuần)', value: 1.725 },
      ].map((item) => (
        <TouchableOpacity 
          key={item.value}
          style={[styles.optionCard, profile.activityLevel === item.value && styles.optionCardActive]}
          onPress={() => updateProfile({ activityLevel: item.value })}
        >
          <Text style={[styles.optionText, profile.activityLevel === item.value && styles.optionTextActive]}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}

      <Text style={[styles.label, { marginTop: 20 }]}>Mục tiêu của bạn</Text>
      <View style={styles.goalRow}>
        {[
          { label: 'Giảm cân', value: 'lose' },
          { label: 'Duy trì', value: 'maintain' },
          { label: 'Tăng cân', value: 'gain' },
        ].map((item) => (
          <TouchableOpacity 
            key={item.value}
            style={[styles.goalItem, profile.goal === item.value && styles.goalItemActive]}
            onPress={() => updateProfile({ goal: item.value })}
          >
            <Text style={[styles.goalText, profile.goal === item.value && styles.goalTextActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Kết quả phân tích</Text>
      <Text style={styles.stepSubtitle}>Dựa trên thông tin bạn cung cấp</Text>

      <NutriCard style={styles.resultCard}>
        <View style={styles.resultRow}>
          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>BMI của bạn</Text>
            <Text style={styles.resultValue}>{profile.bmi}</Text>
            <Text style={styles.resultStatus}>
              {profile.bmi < 18.5 ? 'Gầy' : profile.bmi < 25 ? 'Bình thường' : 'Thừa cân'}
            </Text>
          </View>
          <View style={styles.dividerVertical} />
          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>TDEE (Calo/Ngày)</Text>
            <Text style={styles.resultValue}>{profile.tdee}</Text>
            <Text style={styles.resultStatus}>Năng lượng tiêu thụ</Text>
          </View>
        </View>
      </NutriCard>

      <NutriCard style={[styles.resultCard, { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary, borderWidth: 1 }]}>
        <Text style={[styles.resultLabel, { color: COLORS.primaryDark, textAlign: 'center' }]}>Mục tiêu Calo mỗi ngày</Text>
        <Text style={[styles.resultValue, { color: COLORS.primary, fontSize: 32, textAlign: 'center', marginTop: 8 }]}>
          {profile.targetCalories} kcal
        </Text>
        <Text style={[styles.resultStatus, { textAlign: 'center' }]}>
          Hãy tuân thủ để đạt mục tiêu {profile.goal === 'lose' ? 'giảm cân' : profile.goal === 'gain' ? 'tăng cân' : 'duy trì'}!
        </Text>
      </NutriCard>

      <View style={styles.successIconContainer}>
        <CheckCircle2 size={64} color={COLORS.primary} />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <ChevronLeft color={COLORS.text} size={28} />
        </TouchableOpacity>
        {renderProgressBar()}
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </ScrollView>

      <View style={styles.footer}>
        <NutriButton
          title={step === 3 ? "Bắt đầu ngay" : "Tiếp theo"}
          onPress={handleNext}
          icon={step < 3 ? <ChevronRight color={COLORS.white} size={20} /> : null}
          style={styles.nextBtn}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backBtn: {
    padding: 4,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressDot: {
    width: 20,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 4,
  },
  progressDotActive: {
    backgroundColor: COLORS.primary,
    width: 32,
  },
  progressDotInactive: {
    backgroundColor: COLORS.divider,
  },
  scrollContent: {
    paddingHorizontal: 30,
    paddingTop: 20,
  },
  stepContainer: {
    width: '100%',
  },
  stepTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
  },
  stepSubtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginTop: 8,
    marginBottom: 32,
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  genderCard: {
    flex: 0.48,
    height: 52,
    borderRadius: SPACING.borderRadius.lg,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  genderCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  genderText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  genderTextActive: {
    color: COLORS.primary,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  optionCard: {
    padding: 16,
    borderRadius: SPACING.borderRadius.lg,
    backgroundColor: COLORS.background,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  optionCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  optionText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  optionTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  goalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  goalItem: {
    flex: 0.31,
    paddingVertical: 12,
    borderRadius: SPACING.borderRadius.md,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  goalItemActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  goalText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  goalTextActive: {
    color: COLORS.white,
  },
  resultCard: {
    marginBottom: 20,
    padding: 24,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  resultItem: {
    flex: 1,
    alignItems: 'center',
  },
  dividerVertical: {
    width: 1,
    backgroundColor: COLORS.divider,
    marginHorizontal: 10,
  },
  resultLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  resultValue: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
  },
  resultStatus: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  successIconContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  footer: {
    padding: 20,
  },
  nextBtn: {
    height: 56,
  }
});

export default OnboardingScreen;
