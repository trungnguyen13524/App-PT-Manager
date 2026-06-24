import React, { useState, useRef, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  TextInput,
  ActivityIndicator,
  StatusBar,
  Platform,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Check, Dumbbell, Flame, Target, TrendingDown, TrendingUp } from 'lucide-react-native';
import Svg, { Defs, LinearGradient, Stop, Rect, Circle } from 'react-native-svg';
import { useAuthStore } from '../../../store/authStore';
import { useUserStore } from '../../../store/userStore';
import { useDialogStore } from '../../../store/dialogStore';
import WaveBackground from '../../../components/common/WaveBackground';
import { COLORS, TYPOGRAPHY } from '../../../theme';

const { width } = Dimensions.get('window');

const GamifiedButton = memo(({ onPress, disabled, loading, isLastStep }) => (
  <View style={[styles.ctaButtonWrapper, disabled && { opacity: 0.5 }]}>
    <TouchableOpacity 
      style={styles.ctaButton} 
      onPress={onPress} 
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="btnGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#556B2F" stopOpacity="1" />
            <Stop offset="100%" stopColor="#00B3FF" stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#btnGrad)" />
      </Svg>
      {loading ? (
        <ActivityIndicator color="#0A0B10" size="small" />
      ) : (
        <Text style={styles.ctaText}>{isLastStep ? 'HOÀN TẤT' : 'TIẾP THEO >'}</Text>
      )}
    </TouchableOpacity>
  </View>
));

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
    { id: 'optionals', title: 'Thông tin bổ sung', subtitle: 'Tùy chọn: Để gợi ý thực đơn phù hợp nhất' },
    { id: 'results', title: 'Phân tích cơ thể', subtitle: 'Kết quả tính toán và gợi ý cho bạn' }
  ];

  const nextStep = () => {
    if (step === steps.length - 2) {
      handleSubmit();
    } else if (step === steps.length - 1) {
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
    
    // Chuẩn hoá ngày sinh về chuẩn ISO (YYYY-MM-DD) để tránh lỗi API
    const [y, m, d] = (formData.dateOfBirth || '').split('-');
    const formattedDate = `${y}-${(m || '01').padStart(2, '0')}-${(d || '01').padStart(2, '0')}`;
    
    const payload = {
      ...formData,
      dateOfBirth: formattedDate
    };

    const result = await submitUserOnboarding(payload);
    
    if (result.success) {
      setMetricsData(result.data);
      setStep(step + 1);
      Animated.spring(scrollX, {
        toValue: (step + 1) * width,
        useNativeDriver: true,
      }).start();
    } else {
      useDialogStore.getState().showDialog({
        title: "Lỗi",
        message: result.error || "Không thể lưu thông tin khảo sát.",
        type: 'error'
      });
    }
    setLoading(false);
  };

  const renderGenderStep = () => (
    <View style={styles.genderStepContainer}>
      <View style={styles.genderContainer}>
        {['MALE', 'FEMALE'].map((g) => {
          const isActive = formData.gender === g;
          const Icon = g === 'MALE' ? Dumbbell : Flame;
          return (
            <TouchableOpacity
              key={g}
              style={[styles.genderBanner, isActive && styles.genderBannerActive]}
              onPress={() => setFormData({ ...formData, gender: g })}
              activeOpacity={0.8}
            >
              {/* Subtle background glow for selected state */}
              <View style={[styles.genderBannerGlow, { opacity: isActive ? 0.15 : 0.03, backgroundColor: isActive ? COLORS.primary : COLORS.border }]} />
              
              <Text style={[styles.genderBannerLabel, isActive && styles.genderBannerLabelActive]}>
                {g === 'MALE' ? 'Nam giới' : 'Nữ giới'}
              </Text>

              {/* Large, dynamic, cropped graphic on the right */}
              <View style={styles.bannerGraphicContainer}>
                <Icon 
                  size={140} 
                  color={isActive ? COLORS.primary : COLORS.textLight} 
                  strokeWidth={1} 
                  style={[styles.croppedIcon, isActive && styles.croppedIconActive]} 
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderAgeStep = () => {
    const [year, month, day] = (formData.dateOfBirth || '1998-03-15').split('-');

    const updateDob = (type, value) => {
      let y = year, m = month, d = day;
      if (type === 'year') y = value;
      if (type === 'month') m = value;
      if (type === 'day') d = value;
      setFormData({ ...formData, dateOfBirth: `${y}-${m}-${d}` });
    };

    return (
      <View style={styles.stepContainer}>
        <Text style={styles.inputLabel}>Ngày sinh của bạn</Text>
        <View style={styles.dateInputContainer}>
          <View style={styles.dateInputWrapper}>
            <Text style={styles.dateLabel}>Ngày</Text>
            <TextInput
              style={styles.dateInput}
              keyboardType="numeric"
              placeholder="DD"
              placeholderTextColor="#6B7280"
              maxLength={2}
              value={day}
              onChangeText={(val) => updateDob('day', val)}
            />
          </View>
          <View style={styles.dateInputWrapper}>
            <Text style={styles.dateLabel}>Tháng</Text>
            <TextInput
              style={styles.dateInput}
              keyboardType="numeric"
              placeholder="MM"
              placeholderTextColor="#6B7280"
              maxLength={2}
              value={month}
              onChangeText={(val) => updateDob('month', val)}
            />
          </View>
          <View style={styles.dateInputWrapperYear}>
            <Text style={styles.dateLabel}>Năm</Text>
            <TextInput
              style={styles.dateInput}
              keyboardType="numeric"
              placeholder="YYYY"
              placeholderTextColor="#6B7280"
              maxLength={4}
              value={year}
              onChangeText={(val) => updateDob('year', val)}
            />
          </View>
        </View>
      </View>
    );
  };

  const renderMetricsStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.inputLabel}>Chiều cao (cm)</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholderTextColor="#6B7280"
        value={formData.heightCm.toString()}
        onChangeText={(val) => setFormData({ ...formData, heightCm: parseInt(val) || 0 })}
      />
      <Text style={[styles.inputLabel, { marginTop: 24 }]}>Cân nặng hiện tại (kg)</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholderTextColor="#6B7280"
        value={formData.weightKg.toString()}
        onChangeText={(val) => setFormData({ ...formData, weightKg: parseFloat(val) || 0 })}
      />
    </View>
  );

  const renderGoalStep = () => (
    <View style={styles.stepContainer}>
      {[
        { id: 'LOSE_WEIGHT', label: 'Giảm cân', icon: TrendingDown },
        { id: 'MAINTAIN', label: 'Giữ cân', icon: Target },
        { id: 'GAIN_WEIGHT', label: 'Tăng cân', icon: TrendingUp },
        { id: 'GAIN_MUSCLE', label: 'Tăng cơ bắp', icon: Dumbbell }
      ].map((g) => {
        const isActive = formData.goal === g.id;
        const Icon = g.icon;
        return (
          <TouchableOpacity
            key={g.id}
            style={[styles.goalCard, isActive && styles.goalCardActive]}
            onPress={() => setFormData({ ...formData, goal: g.id })}
            activeOpacity={0.8}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.goalIconContainer, isActive && styles.goalIconContainerActive]}>
                <Icon size={24} color={isActive ? COLORS.primary : COLORS.textLight} strokeWidth={isActive ? 2.5 : 2} />
              </View>
              <Text style={[styles.goalLabel, isActive && styles.goalLabelActive]}>
                {g.label}
              </Text>
            </View>
            {isActive && (
              <View style={styles.goalCheckCircle}>
                <Check color="#0A0B10" size={16} strokeWidth={3.5} />
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderActivityStep = () => (
    <View style={styles.stepContainer}>
      {[
        { id: 'SEDENTARY', label: 'Ít vận động', desc: 'Làm việc văn phòng, ít đi lại' },
        { id: 'LIGHT', label: 'Vận động nhẹ', desc: 'Tập thể dục 1-2 buổi/tuần' },
        { id: 'MODERATE', label: 'Vận động vừa phải', desc: 'Tập thể dục 3-5 buổi/tuần' },
        { id: 'ACTIVE', label: 'Vận động nhiều', desc: 'Tập luyện hàng ngày 6-7 buổi/tuần' },
        { id: 'VERY_ACTIVE', label: 'Vận động cực nhiều', desc: 'Vận động viên, làm việc nặng' }
      ].map((a) => (
        <TouchableOpacity
          key={a.id}
          style={[styles.optionCard, formData.activityLevel === a.id && styles.optionCardActive, { paddingVertical: 16 }]}
          onPress={() => setFormData({ ...formData, activityLevel: a.id })}
          activeOpacity={0.8}
        >
          <View style={{ flex: 1 }}>
            <Text style={[styles.optionLabel, formData.activityLevel === a.id && styles.optionLabelActive]}>
              {a.label}
            </Text>
            <Text style={styles.optionDesc}>{a.desc}</Text>
          </View>
          {formData.activityLevel === a.id && <Check color="#556B2F" size={24} />}
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderResultsStep = () => {
    if (!metricsData) return <View style={styles.stepContainer} />;
    
    const { tdee, dailyCalorieTarget } = metricsData;
    return (
      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
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
            <Text style={styles.resultValue}>{dailyCalorieTarget}</Text>
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>kcal</Text>
            </View>
            <Text style={styles.resultDesc}>Dựa vào mục tiêu bạn đã chọn, đây là lượng calo khuyên dùng mỗi ngày để đạt được kết quả tốt nhất.</Text>
          </View>
        </View>
      </ScrollView>
    );
  };

  const renderOptionalsStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.inputLabel}>Cân nặng mục tiêu (kg) - Không bắt buộc</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="Ví dụ: 55"
        placeholderTextColor="#6B7280"
        value={formData.targetWeightKg ? formData.targetWeightKg.toString() : ''}
        onChangeText={(val) => setFormData({ ...formData, targetWeightKg: parseFloat(val) || 0 })}
      />
      <Text style={[styles.inputLabel, { marginTop: 24 }]}>Dị ứng thức ăn (cách nhau bởi dấu phẩy)</Text>
      <TextInput
        style={styles.input}
        placeholder="Ví dụ: Hải sản, Đậu phộng"
        placeholderTextColor="#6B7280"
        value={formData.allergies.join(', ')}
        onChangeText={(val) => setFormData({ ...formData, allergies: val.split(',').map(s => s.trim()).filter(Boolean) })}
      />
      <Text style={[styles.inputLabel, { marginTop: 24 }]}>Hạn chế chế độ ăn (cách nhau bởi dấu phẩy)</Text>
      <TextInput
        style={styles.input}
        placeholder="Ví dụ: Ăn chay, Keto"
        placeholderTextColor="#6B7280"
        value={formData.dietaryRestrictions.join(', ')}
        onChangeText={(val) => setFormData({ ...formData, dietaryRestrictions: val.split(',').map(s => s.trim()).filter(Boolean) })}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <WaveBackground />

      <View style={styles.header}>
        <TouchableOpacity onPress={prevStep} disabled={step === 0} style={styles.backBtn}>
          <ChevronLeft color={step === 0 ? COLORS.textLight : COLORS.text} size={28} />
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
            <Defs>
              <LinearGradient id="xpGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <Stop offset="0%" stopColor="#556B2F" />
                <Stop offset="100%" stopColor="#00B3FF" />
              </LinearGradient>
            </Defs>
            <Rect width={`${((step + 1) / steps.length) * 100}%`} height="100%" fill="url(#xpGrad)" rx={4} />
          </Svg>
        </View>
        <Text style={styles.stepText}>{step + 1}/{steps.length}</Text>
      </View>

      <View style={styles.titleSection}>
        <Text style={styles.title}>{steps[step].title}</Text>
        <Text style={styles.subtitle}>{steps[step].subtitle}</Text>
      </View>

      <Animated.View style={[styles.slidesContainer, { transform: [{ translateX: Animated.multiply(scrollX, -1) }] }]}>
        <View style={styles.slide}>{renderGenderStep()}</View>
        <View style={styles.slide}>{renderAgeStep()}</View>
        <View style={styles.slide}>{renderMetricsStep()}</View>
        <View style={styles.slide}>{renderGoalStep()}</View>
        <View style={styles.slide}>{renderActivityStep()}</View>
        <View style={styles.slide}>{renderOptionalsStep()}</View>
        <View style={styles.slide}>{renderResultsStep()}</View>
      </Animated.View>

      <View style={styles.footer}>
        <GamifiedButton 
          onPress={nextStep} 
          disabled={loading} 
          loading={loading} 
          isLastStep={step === steps.length - 1} 
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 15 : 20,
    paddingBottom: 20,
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  progressContainer: {
    flex: 1,
    height: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 5,
    marginHorizontal: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  stepText: { fontSize: 15, fontWeight: '900', color: COLORS.primary, width: 36, textAlign: 'right' },
  titleSection: { paddingHorizontal: 24, marginTop: 10, marginBottom: 40 },
  title: { fontSize: 32, fontWeight: '900', color: COLORS.secondary, marginBottom: 12, letterSpacing: 0.5 },
  subtitle: { fontSize: 16, color: COLORS.textSecondary, lineHeight: 24 },
  slidesContainer: { flexDirection: 'row', width: width * 6, flex: 1 },
  slide: { width: width, paddingHorizontal: 24 },
  stepContainer: { width: '100%' },
  
  genderStepContainer: {
    flex: 1,
    paddingTop: 10,
  },
  genderContainer: {
    flexDirection: 'column',
  },
  genderBanner: {
    width: '100%',
    height: 130,
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    paddingHorizontal: 30,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 4,
  },
  genderBannerActive: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    transform: [{ scale: 1.02 }],
  },
  genderBannerGlow: {
    ...StyleSheet.absoluteFillObject,
  },
  genderBannerLabel: { 
    fontSize: 26, 
    fontWeight: '700', 
    color: COLORS.textSecondary,
    zIndex: 10,
    paddingLeft: 24,
  },
  genderBannerLabelActive: { 
    color: COLORS.secondary, 
    fontWeight: '900', 
    letterSpacing: 1 
  },
  bannerGraphicContainer: {
    position: 'absolute',
    right: -25,
    bottom: -20,
    justifyContent: 'center',
    opacity: 0.9,
    zIndex: 1,
  },
  croppedIcon: {
    transform: [{ rotate: '-15deg' }],
  },
  croppedIconActive: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },

  goalCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  goalCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(85, 107, 47, 0.08)',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
    transform: [{ scale: 1.02 }]
  },
  goalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)'
  },
  goalIconContainerActive: {
    backgroundColor: 'rgba(85, 107, 47, 0.15)',
    borderColor: COLORS.primary
  },
  goalLabel: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: COLORS.textSecondary 
  },
  goalLabelActive: { 
    color: COLORS.secondary,
    fontWeight: '900',
    letterSpacing: 0.5
  },
  goalCheckCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },

  optionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  optionCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(85, 107, 47, 0.08)',
    borderWidth: 1.5,
  },
  optionLabel: { fontSize: 18, fontWeight: '700', color: COLORS.textSecondary },
  optionLabelActive: { color: COLORS.secondary },
  optionDesc: { fontSize: 14, color: COLORS.textLight, marginTop: 6, lineHeight: 20 },
  
  inputLabel: { fontSize: 15, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 12 },
  input: {
    backgroundColor: COLORS.surface,
    height: 64,
    borderRadius: 16,
    paddingHorizontal: 20,
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    textAlign: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 1,
  },
  dateInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  dateInputWrapper: {
    flex: 1,
    marginRight: 12,
  },
  dateInputWrapperYear: {
    flex: 1.5,
  },
  dateLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
    fontWeight: '600',
    paddingLeft: 4,
  },
  dateInput: {
    backgroundColor: COLORS.surface,
    height: 64,
    borderRadius: 16,
    paddingHorizontal: 12,
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    textAlign: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 1,
  },
  
  resultCard: {
    backgroundColor: COLORS.surface,
    padding: 24,
    borderRadius: 24,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
  },
  resultLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  resultValue: {
    fontSize: 48,
    fontWeight: '900',
    color: COLORS.secondary,
    marginBottom: 8,
    textShadowColor: 'rgba(85, 107, 47, 0.2)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  resultDesc: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 22,
  },
  badgeContainer: {
    backgroundColor: 'rgba(85, 107, 47, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginBottom: 16,
  },
  badgeText: {
    color: COLORS.primary,
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 1,
  },

  footer: { padding: 24, paddingBottom: 40 },
  ctaButtonWrapper: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
    borderRadius: 16,
  },
  ctaButton: {
    height: 60,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0A0B10',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});

export default OnboardingSurveyScreen;

