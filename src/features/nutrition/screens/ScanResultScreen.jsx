import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeft, Check, Edit3, Plus, Minus, FileText, AlertCircle } from 'lucide-react-native';
import { useNutritionStore } from '../../../store/nutritionStore';
import scanService from '../../../api/services/scan.service';
import { useDialogStore } from '../../../store/dialogStore';
import { AbstractBackground } from '../../../components/common/AbstractBackground';

const { width } = Dimensions.get('window');

const ScanResultScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { addFoodLog, isLoading: isSaving } = useNutritionStore();

  const { scannedData } = route.params || {};

  const [isConfirmedIdentity, setIsConfirmedIdentity] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [notes, setNotes] = useState('');

  const getDefaultMeal = () => {
    const hour = new Date().getHours();
    if (hour < 11) return 'BREAKFAST';
    if (hour < 15) return 'LUNCH';
    if (hour < 21) return 'DINNER';
    return 'SNACK';
  };
  const [selectedMeal, setSelectedMeal] = useState(getDefaultMeal());

  const extractNum = (val) => {
    if (val === undefined || val === null) return 0;
    const num = Number(String(val).replace(/[^0-9.]/g, ''));
    return isNaN(num) ? 0 : num;
  };

  const [foodData, setFoodData] = useState({
    name: scannedData?.name || 'Không rõ',
    calories: extractNum(scannedData?.calories),
    protein: extractNum(scannedData?.protein),
    carbs: extractNum(scannedData?.carbs),
    fat: extractNum(scannedData?.fat),
    confidence: scannedData?.confidence || 0,
    amount: 1,
    image: scannedData?.image || 'https://via.placeholder.com/400',
    ingredients: scannedData?.ingredients || [],
    portion: scannedData?.portion || ''
  });

  const handleFinalSave = async () => {
    try {
      const payload = {
        customName: foodData.name,
        calories: Math.round(foodData.calories * foodData.amount),
        macros: {
          proteinG: Math.round(foodData.protein * foodData.amount),
          carbsG: Math.round(foodData.carbs * foodData.amount),
          fatG: Math.round(foodData.fat * foodData.amount)
        },
        portion: foodData.amount || 1,
        mealType: selectedMeal,
        consumedAt: new Date().toISOString()
      };
      
      const result = await addFoodLog(payload);
      
      if (result.success) {
        // Trigger AI_SCAN mission
        const { useMissionStore } = require('../../../store/missionStore');
        const todayStr = new Date().toISOString().split('T')[0];
        useMissionStore.getState().triggerMissionAction('AI_SCAN', undefined, todayStr);

        useDialogStore.getState().showDialog({
          title: 'Thành công',
          message: 'Đã lưu vào nhật ký dinh dưỡng!',
          type: 'success'
        });
        navigation.navigate('MainTab', { screen: 'Trang chủ' });
      } else {
        useDialogStore.getState().showDialog({
          title: 'Lỗi',
          message: result.error || 'Không thể lưu món ăn',
          type: 'error'
        });
      }
    } catch (err) {
      useDialogStore.getState().showDialog({
        title: 'Lỗi',
        message: err.message || 'Không thể xác nhận lưu món ăn',
        type: 'error'
      });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
        <AbstractBackground />

        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronLeft color="#2D3748" size={28} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Xác nhận món ăn</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Image source={{ uri: foodData.image }} style={styles.foodImage} />

          {!isConfirmedIdentity ? (
            <View style={styles.glassCard}>
              <View style={styles.aiLabelRow}>
                <AlertCircle size={20} color="#556B2F" />
                <Text style={styles.aiLabelText}>AI nhận diện đây là:</Text>
              </View>

              <View style={styles.foodNameInputContainer}>
                <TextInput
                  style={styles.foodNameInput}
                  value={foodData.name}
                  onChangeText={(text) => setFoodData({ ...foodData, name: text })}
                  placeholder="Tên món ăn..."
                  placeholderTextColor="#6B7280"
                />
                <Edit3 size={20} color="#9CA3AF" style={{ marginLeft: 8 }} />
              </View>

              <Text style={styles.confidenceText}>Độ tin cậy: {foodData.confidence}%</Text>

              <View style={styles.identityActionRow}>
                <TouchableOpacity
                  style={styles.wrongBtn}
                  onPress={() => navigation.goBack()}
                  activeOpacity={0.8}
                >
                  <Text style={styles.wrongBtnText}>QUÉT LẠI</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.rightBtn}
                  onPress={() => setIsConfirmedIdentity(true)}
                  activeOpacity={0.8}
                >
                  <Check color="#0A0B10" size={20} strokeWidth={3} />
                  <Text style={styles.rightBtnText}>ĐÚNG RỒI</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <View style={styles.glassCardResult}>
                <View style={styles.confirmedHeader}>
                  <View style={{ flex: 1, paddingRight: 12 }}>
                    <Text style={styles.confirmedFoodName}>{foodData.name}</Text>
                    {foodData.portion ? (
                      <Text style={styles.portionText}>Gợi ý: {foodData.portion}</Text>
                    ) : null}
                  </View>
                  <TouchableOpacity onPress={() => setIsConfirmedIdentity(false)}>
                    <Text style={styles.reEditLink}>Thay đổi</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.statsContainer}>
                  <View style={styles.statItem}>
                    <TextInput
                      style={[styles.statValInput, { color: '#556B2F' }]}
                      value={String(Math.round(foodData.calories * foodData.amount))}
                      onChangeText={(val) => setFoodData({ ...foodData, calories: extractNum(val) / (foodData.amount || 1) })}
                      keyboardType="numeric"
                      selectTextOnFocus
                    />
                    <Text style={styles.statLabel}>Calories</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.statItem}>
                    <TextInput
                      style={[styles.statValInput, { color: '#D97706' }]}
                      value={String(Math.round(foodData.protein * foodData.amount))}
                      onChangeText={(val) => setFoodData({ ...foodData, protein: extractNum(val) / (foodData.amount || 1) })}
                      keyboardType="numeric"
                      selectTextOnFocus
                    />
                    <Text style={styles.statLabel}>Protein (g)</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.statItem}>
                    <TextInput
                      style={[styles.statValInput, { color: '#2563EB' }]}
                      value={String(Math.round(foodData.carbs * foodData.amount))}
                      onChangeText={(val) => setFoodData({ ...foodData, carbs: extractNum(val) / (foodData.amount || 1) })}
                      keyboardType="numeric"
                      selectTextOnFocus
                    />
                    <Text style={styles.statLabel}>Carbs (g)</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.statItem}>
                    <TextInput
                      style={[styles.statValInput, { color: '#DC2626' }]}
                      value={String(Math.round(foodData.fat * foodData.amount))}
                      onChangeText={(val) => setFoodData({ ...foodData, fat: extractNum(val) / (foodData.amount || 1) })}
                      keyboardType="numeric"
                      selectTextOnFocus
                    />
                    <Text style={styles.statLabel}>Fat (g)</Text>
                  </View>
                </View>
              </View>

              {foodData.ingredients && foodData.ingredients.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Nguyên liệu (AI dự đoán)</Text>
                  <View style={styles.ingredientsBox}>
                    <Text style={styles.ingredientsText}>
                      {foodData.ingredients.map(ing => ing.charAt(0).toUpperCase() + ing.slice(1)).join(', ')}
                    </Text>
                  </View>
                </View>
              )}

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Loại bữa ăn</Text>
                <View style={styles.mealTypeRow}>
                  {[
                    { key: 'BREAKFAST', label: 'Bữa sáng' },
                    { key: 'LUNCH', label: 'Bữa trưa' },
                    { key: 'DINNER', label: 'Bữa tối' },
                    { key: 'SNACK', label: 'Bữa phụ' }
                  ].map(meal => (
                    <TouchableOpacity
                      key={meal.key}
                      style={[
                        styles.mealPill,
                        selectedMeal === meal.key && styles.mealPillActive
                      ]}
                      onPress={() => setSelectedMeal(meal.key)}
                      activeOpacity={0.8}
                    >
                      <Text style={[
                        styles.mealPillText,
                        selectedMeal === meal.key && styles.mealPillTextActive
                      ]}>
                        {meal.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <View style={styles.sectionTitleRow}>
                  <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Lượng ăn thực tế</Text>
                </View>

                {/* AI Portion Hint */}
                {foodData.portion ? (
                  <View style={styles.portionHintBox}>
                    <Text style={{ fontSize: 16, marginRight: 8 }}>💡</Text>
                    <Text style={styles.portionHintText}>
                      Theo AI, 1 phần = <Text style={{fontWeight: '800', color: '#556B2F'}}>{foodData.portion}</Text>
                    </Text>
                  </View>
                ) : null}

                {/* Quick Pick Emojis */}
                <View style={styles.quickPicksRow}>
                  {[
                    { val: 0.5, label: 'Nửa phần', icon: '🤏' },
                    { val: 1.0, label: 'Vừa chuẩn', icon: '🍽️' },
                    { val: 1.5, label: 'Hơi nhiều', icon: '🤤' },
                    { val: 2.0, label: 'Ngập mặt', icon: '🤰' }
                  ].map(item => {
                    const isActive = Math.abs(foodData.amount - item.val) < 0.01;
                    return (
                      <TouchableOpacity
                        key={item.val}
                        style={[styles.quickPickBtn, isActive && styles.quickPickActive]}
                        onPress={() => setFoodData({ ...foodData, amount: item.val })}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.quickPickIcon}>{item.icon}</Text>
                        <Text style={[styles.quickPickText, isActive && styles.quickPickTextActive]}>
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Fine Tuning */}
                <View style={styles.amountSelectorContainer}>
                  <Text style={styles.fineTuneLabel}>Tinh chỉnh số lượng:</Text>
                  <View style={styles.amountSelector}>
                    <TouchableOpacity
                      style={styles.amountBtn}
                      onPress={() => setFoodData({ ...foodData, amount: Math.max(0.1, foodData.amount - 0.1) })}
                      activeOpacity={0.8}
                    >
                      <Minus size={20} color="#2D3748" />
                    </TouchableOpacity>
                    <View style={styles.amountDisplay}>
                      <Text style={styles.amountText}>{foodData.amount.toFixed(1)}</Text>
                      <Text style={styles.amountUnit}>Khẩu phần</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.amountBtn}
                      onPress={() => setFoodData({ ...foodData, amount: foodData.amount + 0.1 })}
                      activeOpacity={0.8}
                    >
                      <Plus size={20} color="#2D3748" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </>
          )}
        </ScrollView>

        {isConfirmedIdentity ? (
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.confirmBtn, isSaving && { opacity: 0.7 }]}
              onPress={handleFinalSave}
              disabled={isSaving}
              activeOpacity={0.8}
            >
              {isSaving ? (
                <ActivityIndicator color="#0A0B10" />
              ) : (
                <>
                  <Check color="#0A0B10" size={24} style={{ marginRight: 8 }} strokeWidth={3} />
                  <Text style={styles.confirmBtnText}>LƯU VÀO NHẬT KÝ</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : null}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2D3748' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: { padding: 10, marginLeft: -6 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#2D3748', letterSpacing: 0.5 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 40 },
  foodImage: { width: '100%', height: 250, borderRadius: 30, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(0, 0, 0, 0.05)' },

  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  aiLabelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  aiLabelText: { fontSize: 14, color: '#9CA3AF', fontWeight: '600', marginLeft: 8 },
  foodNameInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    paddingBottom: 4,
    marginBottom: 8,
    width: '90%',
  },
  foodNameInput: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2D3748',
    textAlign: 'center',
    padding: 0,
    maxWidth: '85%',
  },
  confidenceText: { fontSize: 13, color: '#556B2F', marginBottom: 24, fontWeight: '700' },
  identityActionRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-between' },
  wrongBtn: {
    flex: 1,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  wrongBtnText: { color: '#2D3748', fontWeight: '800', letterSpacing: 0.5 },
  rightBtn: {
    flex: 1.5,
    height: 52,
    backgroundColor: '#556B2F',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    shadowColor: '#556B2F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },
  rightBtnText: { color: '#0A0B10', fontWeight: '900', marginLeft: 8, letterSpacing: 0.5 },

  glassCardResult: {
    backgroundColor: 'rgba(85, 107, 47, 0.1)',
    padding: 20,
    borderRadius: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(85, 107, 47, 0.2)',
  },
  confirmedHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  confirmedFoodName: { fontSize: 20, fontWeight: '800', color: '#2D3748' },
  portionText: { fontSize: 13, color: '#718096', marginTop: 4, fontStyle: 'italic' },
  reEditLink: { fontSize: 13, color: '#556B2F', fontWeight: '700', textDecorationLine: 'underline', marginTop: 4 },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 16,
    borderRadius: 16
  },
  statItem: { alignItems: 'center', flex: 1 },
  statValInput: {
    fontSize: 18,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
    padding: 0,
    margin: 0,
    minWidth: 40,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  statLabel: { fontSize: 11, color: '#718096', marginTop: 4, fontWeight: '600' },
  divider: { width: 1, height: 30, backgroundColor: '#E2E8F0' },

  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#2D3748', marginBottom: 16 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  portionHintBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(85, 107, 47, 0.08)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(85, 107, 47, 0.15)',
  },
  portionHintText: { fontSize: 13, color: '#4A5568', flex: 1, lineHeight: 20 },
  quickPicksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  quickPickBtn: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.02)',
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  quickPickActive: {
    backgroundColor: 'rgba(85, 107, 47, 0.1)',
    borderColor: '#556B2F',
    shadowColor: '#556B2F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickPickIcon: { fontSize: 24, marginBottom: 4 },
  quickPickText: { fontSize: 11, fontWeight: '600', color: '#718096', textAlign: 'center' },
  quickPickTextActive: { color: '#556B2F', fontWeight: '800' },

  mealTypeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  mealPill: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)'
  },
  mealPillActive: {
    backgroundColor: 'rgba(0, 255, 102, 0.15)',
    borderColor: '#556B2F'
  },
  mealPillText: { fontSize: 14, color: '#9CA3AF', fontWeight: '600' },
  mealPillTextActive: { color: '#556B2F', fontWeight: '800' },

  amountSelectorContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  fineTuneLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 8,
    fontWeight: '600',
  },
  amountSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7FAFC',
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  amountBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  amountDisplay: { flexDirection: 'row', alignItems: 'baseline', marginHorizontal: 20 },
  amountText: { fontSize: 30, fontWeight: '900', color: '#556B2F', fontVariant: ['tabular-nums'] },
  amountUnit: { fontSize: 13, color: '#9CA3AF', marginLeft: 4, fontWeight: '700' },

  ingredientsBox: {
    backgroundColor: '#F7FAFC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  ingredientsText: {
    fontSize: 15,
    color: '#4A5568',
    lineHeight: 22,
  },

  notesInput: {
    backgroundColor: '#F7FAFC',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: '#2D3748',
    height: 120,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },

  footer: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 24,
    paddingTop: 16,
    backgroundColor: 'transparent'
  },
  confirmBtn: {
    backgroundColor: '#556B2F',
    height: 60,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#556B2F',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  confirmBtnText: { fontSize: 16, fontWeight: '900', color: '#0A0B10', letterSpacing: 1 },
});

export default ScanResultScreen;
