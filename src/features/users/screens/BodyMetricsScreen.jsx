import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Save, Scale, ArrowUp, Activity, Check } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY } from '../../../theme';
import { useUserStore } from '../../../store/userStore';

const BodyMetricsScreen = () => {
  const navigation = useNavigation();
  const { user, metrics: storeMetrics } = useUserStore();
  
  const currentMetrics = storeMetrics || user?.metrics || {
    heightCm: 170,
    weightKg: 65,
    goal: 'LOSE_WEIGHT',
    activityLevel: 'MODERATE'
  };

  const [formData, setFormData] = useState({
    heightCm: currentMetrics.heightCm.toString(),
    weightKg: currentMetrics.weightKg.toString(),
    goal: currentMetrics.goal,
    activityLevel: currentMetrics.activityLevel
  });

  const goals = [
    { id: 'LOSE_WEIGHT', label: 'Giảm cân' },
    { id: 'MAINTAIN', label: 'Giữ cân' },
    { id: 'GAIN_WEIGHT', label: 'Tăng cân' },
    { id: 'GAIN_MUSCLE', label: 'Tăng cơ bắp' }
  ];

  const handleSave = () => {
    // In a real scenario, we would call an API like userStore.updateMetrics(formData)
    Alert.alert(
      "Thành công", 
      "Đã cập nhật chỉ số cơ thể của bạn!",
      [{ text: "OK", onPress: () => navigation.goBack() }]
    );
  };

  const calculateBMI = () => {
    const h = parseFloat(formData.heightCm) / 100;
    const w = parseFloat(formData.weightKg);
    if (h > 0 && w > 0) {
      return (w / (h * h)).toFixed(1);
    }
    return '--';
  };

  const getBMIStatus = (bmi) => {
    if (bmi === '--') return { text: '', color: COLORS.text };
    const val = parseFloat(bmi);
    if (val < 18.5) return { text: 'Thiếu cân', color: '#FFB74D' };
    if (val < 24.9) return { text: 'Bình thường', color: COLORS.primary };
    if (val < 29.9) return { text: 'Thừa cân', color: '#FF8A65' };
    return { text: 'Béo phì', color: '#E53935' };
  };

  const bmiVal = calculateBMI();
  const bmiStatus = getBMIStatus(bmiVal);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={COLORS.text} size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chỉ số cơ thể</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
          <Text style={styles.saveText}>Lưu</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        {/* BMI Card */}
        <View style={styles.bmiCard}>
          <View style={styles.bmiHeader}>
            <Text style={styles.bmiTitle}>Chỉ số BMI của bạn</Text>
            <View style={[styles.bmiBadge, { backgroundColor: bmiStatus.color + '20' }]}>
              <Text style={[styles.bmiBadgeText, { color: bmiStatus.color }]}>{bmiStatus.text}</Text>
            </View>
          </View>
          <View style={styles.bmiValueContainer}>
            <Text style={[styles.bmiValue, { color: bmiStatus.color }]}>{bmiVal}</Text>
            <Text style={styles.bmiUnit}> kg/m²</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>

        <View style={styles.inputGroup}>
          <View style={styles.inputWrapper}>
            <View style={styles.inputIconBox}>
              <ArrowUp size={20} color={COLORS.primary} />
            </View>
            <View style={styles.inputContent}>
              <Text style={styles.inputLabel}>Chiều cao</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={formData.heightCm}
                  onChangeText={(val) => setFormData({...formData, heightCm: val})}
                />
                <Text style={styles.inputUnit}>cm</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.inputWrapper}>
            <View style={styles.inputIconBox}>
              <Scale size={20} color={COLORS.primary} />
            </View>
            <View style={styles.inputContent}>
              <Text style={styles.inputLabel}>Cân nặng hiện tại</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={formData.weightKg}
                  onChangeText={(val) => setFormData({...formData, weightKg: val})}
                />
                <Text style={styles.inputUnit}>kg</Text>
              </View>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Mục tiêu của bạn</Text>
        <View style={styles.goalsContainer}>
          {goals.map((g) => (
            <TouchableOpacity
              key={g.id}
              style={[
                styles.goalOption, 
                formData.goal === g.id && styles.goalOptionActive
              ]}
              onPress={() => setFormData({...formData, goal: g.id})}
            >
              <Text style={[
                styles.goalText, 
                formData.goal === g.id && styles.goalTextActive
              ]}>
                {g.label}
              </Text>
              {formData.goal === g.id && <Check color={COLORS.primary} size={18} />}
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backBtn: { padding: 8, marginLeft: -8 },
  headerTitle: { ...TYPOGRAPHY.h2, color: COLORS.text },
  saveBtn: { padding: 8, marginRight: -8 },
  saveText: { fontSize: 16, fontWeight: '700', color: COLORS.primary },
  
  content: { paddingHorizontal: 20, paddingTop: 10 },
  
  bmiCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
  },
  bmiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  bmiTitle: { fontSize: 16, fontWeight: '600', color: COLORS.textSecondary },
  bmiBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  bmiBadgeText: { fontSize: 12, fontWeight: '700' },
  bmiValueContainer: { flexDirection: 'row', alignItems: 'baseline' },
  bmiValue: { fontSize: 48, fontWeight: '800' },
  bmiUnit: { fontSize: 16, color: COLORS.textLight, fontWeight: '600' },

  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 16, marginLeft: 4 },
  
  inputGroup: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 16,
    padding: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: COLORS.primaryLight + '40',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  inputContent: { flex: 1 },
  inputLabel: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 4 },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  input: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    paddingVertical: 0,
  },
  inputUnit: { fontSize: 16, fontWeight: '600', color: COLORS.textLight, marginLeft: 8 },

  goalsContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 8,
  },
  goalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 4,
  },
  goalOptionActive: { backgroundColor: COLORS.primaryLight + '30' },
  goalText: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  goalTextActive: { color: COLORS.primary },
});

export default BodyMetricsScreen;
