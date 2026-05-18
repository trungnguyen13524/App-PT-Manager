import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Animated,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../../theme';
import { usersService } from '../../../api/services';
import { useAuthStore } from '../../../store/authStore';
import { useUserStore } from '../../../store/userStore';

const { width } = Dimensions.get('window');

const OnboardingSurveyScreen = () => {
  const navigation = useNavigation();
  const completeOnboarding = useAuthStore(state => state.completeOnboarding);
  const submitUserOnboarding = useUserStore(state => state.submitOnboarding);
  
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [metricsData, setMetricsData] = useState(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  // Form Data
  const [formData, setFormData] = useState({
    gender: 'MALE',
    dateOfBirth: '1998-03-15',
    heightCm: 170,
    weightKg: 65,
    activityLevel: 'MODERATE',
    goal: 'LOSE_WEIGHT',
    targetWeightKg: 60,
    dietaryRestrictions: [],
    allergies: []
  });

  const steps = [
    { id: 'gender', title: 'Giới tính của bạn?', subtitle: 'Để chúng tôi tính toán BMR chính xác hơn' },
    { id: 'age', title: 'Ngày sinh của bạn?', subtitle: 'Tuổi tác ảnh hưởng đến quá trình trao đổi chất' },
    { id: 'metrics', title: 'Chỉ số cơ thể', subtitle: 'Chiều cao và cân nặng hiện tại' },
    { id: 'goal', title: 'Mục tiêu của bạn?', subtitle: 'Bạn muốn đạt được điều gì?' },
    { id: 'activity', title: 'Mức độ vận động?', subtitle: 'Tần suất tập luyện hàng tuần của bạn' },
    { id: 'results', title: 'Phân tích cơ thể', subtitle: 'Kết quả tính toán và gợi ý cho bạn' }
  ];

  const nextStep = () => {
    if (step === steps.length - 2) {
      // Đang ở bước cuối cùng nhập liệu (Activity) -> Chuyển sang tính toán & Results
      handleSubmit();
    } else if (step === steps.length - 1) {
      // Đang ở bước Results -> Hoàn tất
      completeOnboarding(metricsData);
    } else {
      setStep(step + 1);
      Animated.spring(scrollX, {
        toValue: (step + 1) * width,
        useNativeDriver: true,
      }).start();
    }
  };

  const prevStep = () => {
    if (step > 0) {
      setStep(step - 1);
      Animated.spring(scrollX, {
        toValue: (step - 1) * width,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    // Gửi raw data lên API thông qua userStore
    const result = await submitUserOnboarding(formData);
    
    if (result.success) {
      // Nhận kết quả BMR/TDEE từ Backend trả về
      setMetricsData(result.data);
      // Chuyển sang step Kết quả
      setStep(step + 1);
      Animated.spring(scrollX, {
        toValue: (step + 1) * width,
        useNativeDriver: true,
      }).start();
    } else {
      Alert.alert("Lỗi", result.error || "Không thể lưu thông tin khảo sát.");
    }
    
    setLoading(false);
  };

  const renderGenderStep = () => (
    <View style={styles.stepContainer}>
      {['MALE', 'FEMALE'].map((g) => (
        <TouchableOpacity
          key={g}
          style={[styles.optionCard, formData.gender === g && styles.optionCardActive]}
          onPress={() => setFormData({ ...formData, gender: g })}
        >
          <Text style={[styles.optionLabel, formData.gender === g && styles.optionLabelActive]}>
            {g === 'MALE' ? 'Nam giới' : 'Nữ giới'}
          </Text>
          {formData.gender === g && <Check color={COLORS.primary} size={20} />}
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderMetricsStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.inputLabel}>Chiều cao (cm)</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={formData.heightCm.toString()}
        onChangeText={(val) => setFormData({ ...formData, heightCm: parseInt(val) || 0 })}
      />
      <Text style={[styles.inputLabel, { marginTop: 20 }]}>Cân nặng hiện tại (kg)</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={formData.weightKg.toString()}
        onChangeText={(val) => setFormData({ ...formData, weightKg: parseFloat(val) || 0 })}
      />
    </View>
  );

  const renderGoalStep = () => (
    <View style={styles.stepContainer}>
      {[
        { id: 'LOSE_WEIGHT', label: 'Giảm cân' },
        { id: 'MAINTAIN', label: 'Giữ cân' },
        { id: 'GAIN_WEIGHT', label: 'Tăng cân' },
        { id: 'GAIN_MUSCLE', label: 'Tăng cơ bắp' }
      ].map((g) => (
        <TouchableOpacity
          key={g.id}
          style={[styles.optionCard, formData.goal === g.id && styles.optionCardActive]}
          onPress={() => setFormData({ ...formData, goal: g.id })}
        >
          <Text style={[styles.optionLabel, formData.goal === g.id && styles.optionLabelActive]}>
            {g.label}
          </Text>
          {formData.goal === g.id && <Check color={COLORS.primary} size={20} />}
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderActivityStep = () => (
    <View style={styles.stepContainer}>
      {[
        { id: 'SEDENTARY', label: 'Ít vận động', desc: 'Làm việc văn phòng, ít đi lại' },
        { id: 'MODERATE', label: 'Vận động vừa', desc: 'Tập thể dục 3-5 buổi/tuần' },
        { id: 'ACTIVE', label: 'Vận động nhiều', desc: 'Tập luyện hàng ngày' },
        { id: 'VERY_ACTIVE', label: 'Vận động cực độ', desc: 'Vận động viên, làm việc nặng' }
      ].map((a) => (
        <TouchableOpacity
          key={a.id}
          style={[styles.optionCard, formData.activityLevel === a.id && styles.optionCardActive, { height: 70 }]}
          onPress={() => setFormData({ ...formData, activityLevel: a.id })}
        >
          <View>
            <Text style={[styles.optionLabel, formData.activityLevel === a.id && styles.optionLabelActive]}>
              {a.label}
            </Text>
            <Text style={styles.optionDesc}>{a.desc}</Text>
          </View>
          {formData.activityLevel === a.id && <Check color={COLORS.primary} size={20} />}
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderResultsStep = () => {
    if (!metricsData) return <View style={styles.stepContainer} />;
    
    const { tdee, dailyCalorieTarget } = metricsData;
    return (
      <View style={styles.stepContainer}>
        <View style={styles.resultCard}>
          <Text style={styles.resultLabel}>Năng lượng tiêu hao (TDEE)</Text>
          <Text style={styles.resultValue}>{tdee}</Text>
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>kcal/ngày</Text>
          </View>
          <Text style={styles.resultDesc}>Bạn cần duy trì lượng calo này để giữ nguyên mức cân nặng hiện tại.</Text>
        </View>

        <View style={styles.resultCard}>
          <Text style={styles.resultLabel}>Mục tiêu Calories hằng ngày</Text>
          <Text style={styles.resultValue}>{dailyCalorieTarget} <Text style={{fontSize: 18}}>kcal</Text></Text>
          <Text style={styles.resultDesc}>Dựa vào mục tiêu bạn đã chọn, đây là lượng calo khuyên dùng mỗi ngày để đạt được kết quả tốt nhất.</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={prevStep} disabled={step === 0}>
          <ChevronLeft color={step === 0 ? COLORS.divider : COLORS.text} size={28} />
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${((step + 1) / steps.length) * 100}%` }]} />
        </View>
        <Text style={styles.stepText}>{step + 1}/{steps.length}</Text>
      </View>

      <View style={styles.titleSection}>
        <Text style={styles.title}>{steps[step].title}</Text>
        <Text style={styles.subtitle}>{steps[step].subtitle}</Text>
      </View>

      <Animated.View style={[styles.slidesContainer, { transform: [{ translateX: Animated.multiply(scrollX, -1) }] }]}>
        <View style={styles.slide}>{renderGenderStep()}</View>
        <View style={styles.slide}>
          <View style={styles.stepContainer}>
             <Text style={styles.inputLabel}>Nhập ngày sinh (YYYY-MM-DD)</Text>
             <TextInput
               style={styles.input}
               value={formData.dateOfBirth}
               onChangeText={(val) => setFormData({ ...formData, dateOfBirth: val })}
             />
          </View>
        </View>
        <View style={styles.slide}>{renderMetricsStep()}</View>
        <View style={styles.slide}>{renderGoalStep()}</View>
        <View style={styles.slide}>{renderActivityStep()}</View>
        <View style={styles.slide}>{renderResultsStep()}</View>
      </Animated.View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.nextBtn} onPress={nextStep} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.nextBtnText}>{step === steps.length - 1 ? 'Hoàn tất' : 'Tiếp theo'}</Text>
              <ChevronRight color="#fff" size={20} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    justifyContent: 'space-between'
  },
  progressContainer: {
    flex: 1,
    height: 6,
    backgroundColor: COLORS.background,
    borderRadius: 3,
    marginHorizontal: 15
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3
  },
  stepText: { fontSize: 14, fontWeight: '700', color: COLORS.textSecondary },
  titleSection: { paddingHorizontal: 20, marginTop: 30, marginBottom: 40 },
  title: { ...TYPOGRAPHY.h1, color: COLORS.text, marginBottom: 8 },
  subtitle: { fontSize: 16, color: COLORS.textSecondary },
  slidesContainer: { flexDirection: 'row', width: width * 6 },
  slide: { width: width, paddingHorizontal: 20 },
  stepContainer: { width: '100%' },
  optionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 20,
    borderRadius: 20,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: 'transparent'
  },
  optionCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight
  },
  optionLabel: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  optionLabelActive: { color: COLORS.primary },
  optionDesc: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
  inputLabel: { fontSize: 14, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 10 },
  input: {
    backgroundColor: COLORS.background,
    height: 60,
    borderRadius: 15,
    paddingHorizontal: 20,
    fontSize: 18,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.divider
  },
  footer: { padding: 20 },
  nextBtn: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  nextBtnText: { color: '#fff', fontSize: 18, fontWeight: '700', marginRight: 8 },
  resultCard: {
    backgroundColor: COLORS.primaryLight,
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)'
  },
  resultLabel: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 10,
    fontWeight: '600'
  },
  resultValue: {
    fontSize: 40,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 10
  },
  resultDesc: {
    fontSize: 15,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 10
  },
  badgeContainer: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12
  },
  badgeText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14
  }
});

export default OnboardingSurveyScreen;
