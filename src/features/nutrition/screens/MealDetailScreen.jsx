import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image, StatusBar, Modal, ActivityIndicator
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeft, Flame, X } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FOOD_IMAGES, toImageKey } from '../../../assets';
import nutritionService from '../../../api/services/nutrition.service';
import dashboardService from '../../../api/services/dashboard.service';
import { useDialogStore } from '../../../store/dialogStore';
import { useNutritionStore } from '../../../store/nutritionStore';

const MealDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Hỗ trợ cả 2 định dạng: payload mới từ MealLogScreen (route.params.meal) 
  // và payload cũ (route.params.item)
  const mealPayload = route.params?.meal || {};
  const legacyItem = route.params?.item || {};
  const rawData = mealPayload.rawItem || legacyItem || {};

  const foodName = mealPayload.title || rawData.Description_VN || 'Món ăn tùy chỉnh';
  const calories = mealPayload.calories || Math.round(Number(rawData.Calories)) || 0;
  const imageSource = mealPayload.image || FOOD_IMAGES[toImageKey(rawData.Description_VN || foodName)];
  const protein = mealPayload.protein || Number(rawData.Protein_g || rawData.Protein) || 0;
  const carbs = mealPayload.carbs || Number(rawData.Carbs_g || rawData.Carbohydrate) || 0;
  const fat = mealPayload.fat || Number(rawData.Fat_g || rawData.TotalFat) || 0;

  const [isLogging, setIsLogging] = useState(false);
  const [showMealTypeModal, setShowMealTypeModal] = useState(false);

  const handleLogFood = async (mealType) => {
    setIsLogging(true);
    try {
      const payload = {
        mealType: mealType,
        consumedAt: new Date().toISOString(),
        customName: foodName,
        calories: calories,
        macros: {
          proteinG: protein,
          carbsG: carbs,
          fatG: fat
        },
        portion: 1
      };

      const res = await useNutritionStore.getState().addFoodLog(payload);
      if (!res.success) throw new Error(res.error || 'Failed to log food');
      
      // Đồng bộ hóa Dashboard (gọi API lấy lại vòng tròn calo)
      try {
        await dashboardService.getUserDashboard();
      } catch (e) {
        // ignore error if dashboard is not loaded yet
      }

      setShowMealTypeModal(false);
      useDialogStore.getState().showDialog({
        title: 'Thành công',
        message: 'Đã ghi nhận bữa ăn thành công!',
        type: 'success',
      });
      navigation.navigate('MealLog', { goToDiary: true });
    } catch (err) {
      console.warn('Lỗi ghi nhận bữa ăn:', err);
      useDialogStore.getState().showDialog({
        title: 'Lỗi',
        message: 'Không thể ghi nhận bữa ăn lúc này.',
        type: 'error',
      });
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Huge Image Cover */}
      <View style={styles.coverContainer}>
        {imageSource ? (
          <Image source={imageSource} style={styles.coverImage} resizeMode="cover" />
        ) : (
          <View style={[styles.coverImage, { backgroundColor: '#334155' }]} />
        )}
        
        {/* Floating Back Button */}
        <SafeAreaView style={styles.safeArea}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ChevronLeft color="#F8FAFC" size={28} />
          </TouchableOpacity>
        </SafeAreaView>
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        <Text style={styles.foodName}>{foodName}</Text>
        
        <View style={styles.caloriesRow}>
          <Flame color="#00FF66" size={32} />
          <Text style={styles.caloriesText}>{calories}</Text>
          <Text style={styles.caloriesUnit}>kcal</Text>
        </View>

        <Text style={styles.descText}>
          Bữa ăn tối giản, nhanh gọn, lượng Calo tiêu chuẩn được ước tính bởi NutriCoach.
        </Text>
      </View>

      {/* Bottom Action */}
      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={styles.logBtn}
          activeOpacity={0.8}
          onPress={() => setShowMealTypeModal(true)}
        >
          <Text style={styles.logBtnText}>Ghi nhận bữa ăn</Text>
        </TouchableOpacity>
      </View>

      {/* Meal Type Modal */}
      <Modal visible={showMealTypeModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn loại bữa ăn</Text>
              <TouchableOpacity onPress={() => setShowMealTypeModal(false)}>
                <X color="#94A3B8" size={24} />
              </TouchableOpacity>
            </View>

            {isLogging ? (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#00FF66" />
                <Text style={{ marginTop: 12, color: '#94A3B8' }}>Đang lưu...</Text>
              </View>
            ) : (
              <View style={styles.mealTypeGrid}>
                {[
                  { id: 'BREAKFAST', label: 'Bữa Sáng' },
                  { id: 'LUNCH', label: 'Bữa Trưa' },
                  { id: 'DINNER', label: 'Bữa Tối' },
                  { id: 'SNACK', label: 'Bữa Phụ' }
                ].map(type => (
                  <TouchableOpacity 
                    key={type.id} 
                    style={styles.mealTypeBtn}
                    onPress={() => handleLogFood(type.id)}
                  >
                    <Text style={styles.mealTypeBtnText}>{type.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  coverContainer: {
    width: '100%',
    height: '55%',
    position: 'relative',
    backgroundColor: '#1E293B'
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  safeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(15,23,42,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  contentContainer: {
    padding: 24,
    flex: 1,
  },
  foodName: {
    fontSize: 28,
    fontWeight: '900',
    color: '#F8FAFC',
    marginBottom: 16,
  },
  caloriesRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  caloriesText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#F8FAFC',
    lineHeight: 52,
    marginLeft: 8,
  },
  caloriesUnit: {
    fontSize: 20,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 6,
    marginLeft: 8,
  },
  descText: {
    fontSize: 15,
    color: '#94A3B8',
    lineHeight: 24,
  },
  bottomBar: {
    padding: 24,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  logBtn: {
    backgroundColor: '#00FF66',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logBtnText: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  mealTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  mealTypeBtn: {
    width: '48%',
    backgroundColor: '#334155',
    borderWidth: 1,
    borderColor: '#475569',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  mealTypeBtnText: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
  }
});

export default MealDetailScreen;
