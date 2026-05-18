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
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeft, Check, Edit3, Plus, Minus, FileText, AlertCircle } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../../theme';
import { useNutritionStore } from '../../../store/nutritionStore';

const { width } = Dimensions.get('window');

const ScanResultScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { addFoodLog, isLoading: isSaving } = useNutritionStore();
  
  // Lấy dữ liệu từ màn hình Camera gửi sang
  const { scannedData } = route.params || {};

  const [isConfirmedIdentity, setIsConfirmedIdentity] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [notes, setNotes] = useState('');
  
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
    const mealTypeMap = {
      'Bữa sáng': 'BREAKFAST',
      'Bữa trưa': 'LUNCH',
      'Bữa tối': 'DINNER',
      'Bữa phụ': 'SNACK'
    };

    const payload = {
      foodName: foodData.name,
      calories: Math.round(foodData.calories * foodData.amount),
      proteinG: Math.round(foodData.protein * foodData.amount),
      carbsG: Math.round(foodData.carbs * foodData.amount),
      fatG: Math.round(foodData.fat * foodData.amount),
      mealType: 'BREAKFAST', // Mặc định, có thể thêm UI chọn buổi sau
      imageUrl: foodData.image,
      consumedAt: new Date().toISOString()
    };

    const result = await addFoodLog(payload);
    if (result.success) {
      Alert.alert('Thành công', 'Đã lưu vào nhật ký dinh dưỡng!');
      navigation.navigate('MainTab', { screen: 'Trang chủ' });
    } else {
      Alert.alert('Lỗi', result.error || 'Không thể lưu món ăn');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronLeft color={COLORS.text} size={28} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Xác nhận món ăn</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Image source={{ uri: foodData.image }} style={styles.foodImage} />
          
          {!isConfirmedIdentity ? (
            <View style={styles.confirmIdentityCard}>
              <View style={styles.aiLabelRow}>
                <AlertCircle size={20} color={COLORS.primary} />
                <Text style={styles.aiLabelText}>AI nhận diện đây là:</Text>
              </View>
              
              {isEditingName ? (
                <TextInput
                  style={styles.nameInputLarge}
                  value={foodData.name}
                  onChangeText={(text) => setFoodData({...foodData, name: text})}
                  autoFocus
                />
              ) : (
                <Text style={styles.foodNameLarge}>{foodData.name}</Text>
              )}

              <Text style={styles.confidenceText}>Độ tin cậy: {foodData.confidence}%</Text>

              <View style={styles.identityActionRow}>
                <TouchableOpacity 
                  style={styles.wrongBtn} 
                  onPress={() => setIsEditingName(!isEditingName)}
                >
                  <Text style={styles.wrongBtnText}>
                    {isEditingName ? 'Xong' : 'Sửa lại'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.rightBtn}
                  onPress={() => setIsConfirmedIdentity(true)}
                >
                  <Check color="#fff" size={20} />
                  <Text style={styles.rightBtnText}>Đúng rồi</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <View style={styles.resultCard}>
                <View style={styles.confirmedHeader}>
                  <Text style={styles.confirmedFoodName}>{foodData.name}</Text>
                  <TouchableOpacity onPress={() => setIsConfirmedIdentity(false)}>
                    <Text style={styles.reEditLink}>Thay đổi</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.statsContainer}>
                  <View style={styles.statItem}>
                    <Text style={styles.statVal}>{Math.round(foodData.calories * foodData.amount)}</Text>
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
                <Text style={styles.sectionTitle}>Lượng ăn thực tế</Text>
                <View style={styles.amountSelector}>
                  <TouchableOpacity 
                    style={styles.amountBtn}
                    onPress={() => setFoodData({...foodData, amount: Math.max(0.1, foodData.amount - 0.1)})}
                  >
                    <Minus size={20} color={COLORS.text} />
                  </TouchableOpacity>
                  <View style={styles.amountDisplay}>
                    <Text style={styles.amountText}>{foodData.amount.toFixed(1)}</Text>
                    <Text style={styles.amountUnit}>Khẩu phần</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.amountBtn}
                    onPress={() => setFoodData({...foodData, amount: foodData.amount + 0.1})}
                  >
                    <Plus size={20} color={COLORS.text} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.section}>
                <View style={styles.sectionTitleRow}>
                  <FileText size={18} color={COLORS.text} />
                  <Text style={[styles.sectionTitle, { marginLeft: 8, marginBottom: 0 }]}>Ghi chú thêm</Text>
                </View>
                <TextInput
                  style={styles.notesInput}
                  placeholder="Thêm ghi chú..."
                  placeholderTextColor={COLORS.textLight}
                  multiline
                  value={notes}
                  onChangeText={setNotes}
                />
              </View>
            </>
          )}
        </ScrollView>

        {isConfirmedIdentity && (
          <View style={styles.footer}>
            <TouchableOpacity 
              style={[styles.confirmBtn, isSaving && { opacity: 0.7 }]} 
              onPress={handleFinalSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Check color="#fff" size={24} style={{ marginRight: 8 }} />
                  <Text style={styles.confirmBtnText}>Lưu vào nhật ký</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: { padding: 10, marginLeft: -6 },
  headerTitle: { ...TYPOGRAPHY.h3, color: COLORS.text },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 40 },
  foodImage: { width: '100%', height: 250, borderRadius: 30, marginBottom: 24 },
  confirmIdentityCard: { backgroundColor: COLORS.background, padding: 24, borderRadius: 24, alignItems: 'center' },
  aiLabelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  aiLabelText: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '600', marginLeft: 8 },
  foodNameLarge: { fontSize: 32, fontWeight: '800', color: COLORS.text, marginBottom: 8, textAlign: 'center' },
  confidenceText: { fontSize: 12, color: COLORS.primary, marginBottom: 24, fontWeight: '600' },
  nameInputLarge: { fontSize: 28, fontWeight: '800', color: COLORS.primary, marginBottom: 24, textAlign: 'center', borderBottomWidth: 2, borderBottomColor: COLORS.primary, width: '100%' },
  identityActionRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-between' },
  wrongBtn: { flex: 1, height: 50, justifyContent: 'center', alignItems: 'center', marginRight: 10, borderRadius: 15, borderWidth: 1, borderColor: COLORS.divider },
  wrongBtnText: { color: COLORS.textSecondary, fontWeight: '700' },
  rightBtn: { flex: 1.5, height: 50, backgroundColor: COLORS.primary, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderRadius: 15 },
  rightBtnText: { color: '#fff', fontWeight: '700', marginLeft: 8 },
  resultCard: { backgroundColor: COLORS.primaryLight, padding: 20, borderRadius: 24, marginBottom: 24 },
  confirmedHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  confirmedFoodName: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  reEditLink: { fontSize: 12, color: COLORS.primary, fontWeight: '700', textDecorationLine: 'underline' },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 16 },
  statItem: { alignItems: 'center', flex: 1 },
  statVal: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  statLabel: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  divider: { width: 1, height: 30, backgroundColor: COLORS.divider },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 16 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  amountSelector: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background, padding: 12, borderRadius: 20 },
  amountBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', elevation: 2 },
  amountDisplay: { flexDirection: 'row', alignItems: 'baseline', marginHorizontal: 24 },
  amountText: { fontSize: 32, fontWeight: '800', color: COLORS.primary },
  amountUnit: { fontSize: 14, color: COLORS.textSecondary, marginLeft: 6, fontWeight: '600' },
  notesInput: { backgroundColor: COLORS.background, borderRadius: 16, padding: 16, fontSize: 15, color: COLORS.text, height: 100, textAlignVertical: 'top' },
  footer: { paddingHorizontal: 20, paddingBottom: Platform.OS === 'ios' ? 30 : 20, paddingTop: 10, borderTopWidth: 1, borderTopColor: COLORS.divider, backgroundColor: '#fff' },
  confirmBtn: { backgroundColor: COLORS.primary, height: 56, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  confirmBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});

export default ScanResultScreen;
