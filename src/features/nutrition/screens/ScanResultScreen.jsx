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
  
  const [foodData, setFoodData] = useState({
    name: scannedData?.name || 'Không rõ',
    calories: scannedData?.calories || 0,
    protein: scannedData?.protein || 0,
    carbs: scannedData?.carbs || 0,
    fat: scannedData?.fat || 0,
    confidence: scannedData?.confidence || 0,
    amount: 1,
    image: scannedData?.image || 'https://via.placeholder.com/400'
  });

  const handleFinalSave = async () => {
    try {
      if (scannedData?.scanId) {
        await scanService.confirmScan(scannedData.scanId, {
          mealType: selectedMeal,
          amount: foodData.amount,
          foodName: foodData.name,
          notes: notes
        });
        
        // Trigger AI_SCAN mission
        const { useMissionStore } = require('../../../store/missionStore');
        const todayStr = new Date().toISOString().split('T')[0];
        useMissionStore.getState().triggerMissionAction('AI_SCAN', undefined, todayStr);

        useDialogStore.getState().showDialog({
          title: 'Thành công',
          message: 'Đã lưu vào nhật ký dinh dưỡng qua AI Scan!',
          type: 'success'
        });
        navigation.navigate('MainTab', { screen: 'Trang chủ' });
      } else {
        const fallbackPayload = {
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
        const result = await addFoodLog(fallbackPayload);
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
      }
    } catch (err) {
      useDialogStore.getState().showDialog({
        title: 'Lỗi',
        message: err.message || 'Không thể xác nhận quét AI',
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
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <AbstractBackground />
        
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronLeft color="#FFFFFF" size={28} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Xác nhận món ăn</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Image source={{ uri: foodData.image }} style={styles.foodImage} />
          
          {!isConfirmedIdentity ? (
            <View style={styles.glassCard}>
              <View style={styles.aiLabelRow}>
                <AlertCircle size={20} color="#00FF66" />
                <Text style={styles.aiLabelText}>AI nhận diện đây là:</Text>
              </View>
              
              <View style={styles.foodNameInputContainer}>
                <TextInput
                  style={styles.foodNameInput}
                  value={foodData.name}
                  onChangeText={(text) => setFoodData({...foodData, name: text})}
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
                  <Text style={styles.confirmedFoodName}>{foodData.name}</Text>
                  <TouchableOpacity onPress={() => setIsConfirmedIdentity(false)}>
                    <Text style={styles.reEditLink}>Thay đổi</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.statsContainer}>
                  <View style={styles.statItem}>
                    <Text style={[styles.statVal, { color: '#00FF66' }]}>{Math.round(foodData.calories * foodData.amount)}</Text>
                    <Text style={styles.statLabel}>Calories</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statVal}>{Math.round(foodData.protein * foodData.amount)}g</Text>
                    <Text style={styles.statLabel}>Protein</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statVal}>{Math.round(foodData.carbs * foodData.amount)}g</Text>
                    <Text style={styles.statLabel}>Carbs</Text>
                  </View>
                </View>
              </View>

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
                <Text style={styles.sectionTitle}>Lượng ăn thực tế</Text>
                <View style={styles.amountSelector}>
                  <TouchableOpacity 
                    style={styles.amountBtn}
                    onPress={() => setFoodData({...foodData, amount: Math.max(0.1, foodData.amount - 0.1)})}
                    activeOpacity={0.8}
                  >
                    <Minus size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                  <View style={styles.amountDisplay}>
                    <Text style={styles.amountText}>{foodData.amount.toFixed(1)}</Text>
                    <Text style={styles.amountUnit}>Khẩu phần</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.amountBtn}
                    onPress={() => setFoodData({...foodData, amount: foodData.amount + 0.1})}
                    activeOpacity={0.8}
                  >
                    <Plus size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.section}>
                <View style={styles.sectionTitleRow}>
                  <FileText size={18} color="#00FF66" />
                  <Text style={[styles.sectionTitle, { marginLeft: 8, marginBottom: 0 }]}>Ghi chú thêm</Text>
                </View>
                <TextInput
                  style={styles.notesInput}
                  placeholder="Thêm ghi chú về bữa ăn này..."
                  placeholderTextColor="#6B7280"
                  multiline
                  value={notes}
                  onChangeText={setNotes}
                />
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
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: { padding: 10, marginLeft: -6 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.5 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 40 },
  foodImage: { width: '100%', height: 250, borderRadius: 30, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  
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
    color: '#FFFFFF',
    textAlign: 'center',
    padding: 0,
    maxWidth: '85%',
  },
  confidenceText: { fontSize: 13, color: '#00FF66', marginBottom: 24, fontWeight: '700' },
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
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  wrongBtnText: { color: '#FFFFFF', fontWeight: '800', letterSpacing: 0.5 },
  rightBtn: { 
    flex: 1.5, 
    height: 52, 
    backgroundColor: '#00FF66', 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderRadius: 16,
    shadowColor: '#00FF66',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },
  rightBtnText: { color: '#0A0B10', fontWeight: '900', marginLeft: 8, letterSpacing: 0.5 },
  
  glassCardResult: { 
    backgroundColor: 'rgba(0, 255, 102, 0.1)', 
    padding: 20, 
    borderRadius: 24, 
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 102, 0.2)',
  },
  confirmedHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  confirmedFoodName: { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
  reEditLink: { fontSize: 13, color: '#00FF66', fontWeight: '700', textDecorationLine: 'underline' },
  statsContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
    padding: 16, 
    borderRadius: 16 
  },
  statItem: { alignItems: 'center', flex: 1 },
  statVal: { fontSize: 18, fontWeight: '900', color: '#1E293B', fontVariant: ['tabular-nums'] },
  statLabel: { fontSize: 12, color: '#64748B', marginTop: 2, fontWeight: '600' },
  divider: { width: 1, height: 30, backgroundColor: '#E2E8F0' },
  
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF', marginBottom: 16 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  
  mealTypeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  mealPill: { 
    paddingVertical: 12, 
    paddingHorizontal: 18, 
    borderRadius: 20, 
    backgroundColor: 'rgba(255, 255, 255, 0.05)', 
    borderWidth: 1, 
    borderColor: 'rgba(255, 255, 255, 0.1)' 
  },
  mealPillActive: { 
    backgroundColor: 'rgba(0, 255, 102, 0.15)', 
    borderColor: '#00FF66' 
  },
  mealPillText: { fontSize: 14, color: '#9CA3AF', fontWeight: '600' },
  mealPillTextActive: { color: '#00FF66', fontWeight: '800' },
  
  amountSelector: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: 'rgba(20, 24, 35, 0.65)', 
    padding: 12, 
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  amountBtn: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    backgroundColor: 'rgba(255, 255, 255, 0.1)', 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  amountDisplay: { flexDirection: 'row', alignItems: 'baseline', marginHorizontal: 24 },
  amountText: { fontSize: 36, fontWeight: '900', color: '#00FF66', fontVariant: ['tabular-nums'] },
  amountUnit: { fontSize: 15, color: '#9CA3AF', marginLeft: 6, fontWeight: '700' },
  
  notesInput: { 
    backgroundColor: 'rgba(20, 24, 35, 0.65)', 
    borderRadius: 16, 
    padding: 16, 
    fontSize: 16, 
    color: '#FFFFFF', 
    height: 120, 
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  
  footer: { 
    paddingHorizontal: 20, 
    paddingBottom: Platform.OS === 'ios' ? 30 : 24, 
    paddingTop: 16, 
    backgroundColor: 'transparent'
  },
  confirmBtn: { 
    backgroundColor: '#00FF66', 
    height: 60, 
    borderRadius: 16, 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: '#00FF66',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  confirmBtnText: { fontSize: 16, fontWeight: '900', color: '#0A0B10', letterSpacing: 1 },
});

export default ScanResultScreen;
