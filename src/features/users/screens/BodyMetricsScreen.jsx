import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Scale, ArrowUp, Check } from 'lucide-react-native';
import { useUserStore } from '../../../store/userStore';
import { useDialogStore } from '../../../store/dialogStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AbstractBackground } from '../../../components/common/AbstractBackground';

const BodyMetricsScreen = () => {
  const navigation = useNavigation();
  const { user, metrics: storeMetrics, updateProfile, isLoading } = useUserStore();
  
  const currentMetrics = storeMetrics || user?.metrics || {
    heightCm: 170,
    weightKg: 65,
    goal: 'LOSE_WEIGHT',
    activityLevel: 'MODERATE'
  };

  const [formData, setFormData] = useState({
    heightCm: (currentMetrics.heightCm || 170).toString(),
    weightKg: (currentMetrics.weightKg || 65).toString(),
    goal: currentMetrics.goal || 'LOSE_WEIGHT',
    activityLevel: currentMetrics.activityLevel || 'MODERATE'
  });

  const goals = [
    { id: 'LOSE_WEIGHT', label: 'Giảm cân' },
    { id: 'MAINTAIN', label: 'Giữ cân' },
    { id: 'GAIN_WEIGHT', label: 'Tăng cân' },
    { id: 'GAIN_MUSCLE', label: 'Tăng cơ bắp' }
  ];

  const handleSave = async () => {
    if (!formData.heightCm || !formData.weightKg) {
      useDialogStore.getState().showDialog({
        title: 'Lỗi',
        message: 'Vui lòng nhập chiều cao và cân nặng hợp lệ.',
        type: 'error'
      });
      return;
    }

    const payload = {
      metrics: {
        heightCm: parseFloat(formData.heightCm),
        weightKg: parseFloat(formData.weightKg),
        goal: formData.goal,
        activityLevel: formData.activityLevel
      }
    };
    
    const res = await updateProfile(payload);
    if (res.success) {
      useDialogStore.getState().showDialog({
        title: "Thành công", 
        message: "Đã cập nhật chỉ số cơ thể của bạn!",
        type: 'success',
        buttons: [{ text: "OK", onPress: () => navigation.goBack() }]
      });
    } else {
      useDialogStore.getState().showDialog({
        title: "Lỗi",
        message: res.error || "Không thể cập nhật chỉ số cơ thể.",
        type: 'error'
      });
    }
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
    if (bmi === '--') return { text: '', color: '#FFFFFF' };
    const val = parseFloat(bmi);
    if (val < 18.5) return { text: 'Thiếu cân', color: '#FFB74D' };
    if (val < 24.9) return { text: 'Bình thường', color: '#00FF66' };
    if (val < 29.9) return { text: 'Thừa cân', color: '#FF8A65' };
    return { text: 'Béo phì', color: '#E53935' };
  };

  const bmiVal = calculateBMI();
  const bmiStatus = getBMIStatus(bmiVal);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <AbstractBackground />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color="#FFFFFF" size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chỉ số cơ thể</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveBtn} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator size="small" color="#00FF66" />
          ) : (
            <Text style={styles.saveText}>LƯU</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        {/* BMI Card */}
        <View style={styles.glassCard}>
          <View style={styles.bmiHeader}>
            <Text style={styles.bmiTitle}>Chỉ số BMI của bạn</Text>
            <View style={[styles.bmiBadge, { backgroundColor: bmiStatus.color + '20', borderColor: bmiStatus.color + '50' }]}>
              <Text style={[styles.bmiBadgeText, { color: bmiStatus.color }]}>{bmiStatus.text}</Text>
            </View>
          </View>
          <View style={styles.bmiValueContainer}>
            <Text style={[styles.bmiValue, { color: bmiStatus.color }]}>{bmiVal}</Text>
            <Text style={styles.bmiUnit}> kg/m²</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>

        <View style={styles.glassCardInput}>
          <View style={styles.inputWrapper}>
            <View style={styles.inputIconBox}>
              <ArrowUp size={20} color="#00FF66" />
            </View>
            <View style={styles.inputContent}>
              <Text style={styles.inputLabel}>Chiều cao</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={formData.heightCm}
                  onChangeText={(val) => setFormData({...formData, heightCm: val})}
                  placeholderTextColor="#6B7280"
                />
                <Text style={styles.inputUnit}>cm</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.glassCardInput}>
          <View style={styles.inputWrapper}>
            <View style={styles.inputIconBox}>
              <Scale size={20} color="#00FF66" />
            </View>
            <View style={styles.inputContent}>
              <Text style={styles.inputLabel}>Cân nặng hiện tại</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={formData.weightKg}
                  onChangeText={(val) => setFormData({...formData, weightKg: val})}
                  placeholderTextColor="#6B7280"
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
              activeOpacity={0.8}
            >
              <Text style={[
                styles.goalText, 
                formData.goal === g.id && styles.goalTextActive
              ]}>
                {g.label}
              </Text>
              {formData.goal === g.id && <Check color="#00FF66" size={20} strokeWidth={3} />}
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backBtn: { padding: 8, marginLeft: -8 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  saveBtn: { padding: 8, marginRight: -8 },
  saveText: { fontSize: 16, fontWeight: '900', color: '#00FF66', letterSpacing: 1 },
  
  content: { paddingHorizontal: 20, paddingTop: 10 },
  
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 24,
    padding: 24,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  bmiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  bmiTitle: { fontSize: 16, fontWeight: '600', color: '#9CA3AF' },
  bmiBadge: { 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 12,
    borderWidth: 1,
  },
  bmiBadgeText: { fontSize: 13, fontWeight: '800' },
  bmiValueContainer: { flexDirection: 'row', alignItems: 'baseline' },
  bmiValue: { 
    fontSize: 56, 
    fontWeight: '900',
    textShadowColor: 'rgba(0, 255, 102, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  bmiUnit: { fontSize: 18, color: '#9CA3AF', fontWeight: '700' },

  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF', marginBottom: 16, marginLeft: 4 },
  
  glassCardInput: {
    backgroundColor: 'rgba(20, 24, 35, 0.65)',
    borderRadius: 20,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputIconBox: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 255, 102, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 102, 0.2)',
  },
  inputContent: { flex: 1 },
  inputLabel: { fontSize: 14, color: '#9CA3AF', marginBottom: 4, fontWeight: '600' },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  input: {
    flex: 1,
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    paddingVertical: 0,
  },
  inputUnit: { fontSize: 16, fontWeight: '700', color: '#9CA3AF', marginLeft: 8 },

  goalsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  goalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderRadius: 16,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  goalOptionActive: { 
    backgroundColor: 'rgba(0, 255, 102, 0.1)',
    borderColor: 'rgba(0, 255, 102, 0.3)',
  },
  goalText: { fontSize: 16, fontWeight: '600', color: '#9CA3AF' },
  goalTextActive: { color: '#00FF66', fontWeight: '800' },
});

export default BodyMetricsScreen;
