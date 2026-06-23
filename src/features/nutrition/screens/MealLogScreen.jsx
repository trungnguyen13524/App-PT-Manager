import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Platform,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { ChevronLeft, Plus, Clock, ChevronRight, Utensils, Moon, Sun, Trash2, X, ScanLine, Search, Coffee } from 'lucide-react-native';
import { useNutritionStore } from '../../../store/nutritionStore';
import { useMissionStore } from '../../../store/missionStore';
import { AbstractBackground } from '../../../components/common/AbstractBackground';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import foodsData from '../../../assets/foods.json';
import { FOOD_IMAGES, toImageKey } from '../../../assets';
import ptService from '../../../api/services/pt.service';
import foodService from '../../../api/services/food.service';

const { width } = Dimensions.get('window');

const MealLogScreen = ({ route }) => {
  const findLocalImage = (name) => {
    if (!name) return null;
    const exactKey = toImageKey(name);
    if (FOOD_IMAGES[exactKey]) return FOOD_IMAGES[exactKey];
    
    const searchWords = exactKey.split('_').filter(Boolean);
    let bestMatch = null;
    let maxOverlap = 0;
    
    for (const key of Object.keys(FOOD_IMAGES)) {
      const keyWords = key.split('_');
      let overlapCount = 0;
      for (const word of searchWords) {
        if (keyWords.includes(word)) overlapCount++;
      }
      
      if (overlapCount >= 2 && overlapCount > maxOverlap) {
        maxOverlap = overlapCount;
        bestMatch = FOOD_IMAGES[key];
      }
    }
    return bestMatch;
  };

  const navigation = useNavigation();
  const {
    meals,
    suggestedMenu,
    dailySummary,
    isLoading,
    fetchDailyLogs,
    fetchActiveMealPlan,
    deleteFoodLog,
    updateFoodLog
  } = useNutritionStore();
  const { lockDailyDiaryAction } = useMissionStore();

  const [activeTab, setActiveTab] = useState('diary');
  const [refreshing, setRefreshing] = useState(false);

  // Edit Modal State
  const [editingMeal, setEditingMeal] = useState(null);
  const [editCalories, setEditCalories] = useState('');

  // PT Assignment State
  const [selectedDay, setSelectedDay] = useState(1); // 1 to 7
  const [ptMealPlan, setPtMealPlan] = useState([]);
  const [loadingPtPlan, setLoadingPtPlan] = useState(false);

  // Search Modal State
  const [isAddMenuVisible, setIsAddMenuVisible] = useState(false);
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    let timeoutId;
    if (searchQuery.length >= 2) {
      timeoutId = setTimeout(() => {
        const query = searchQuery.toLowerCase();
        const results = foodsData.filter(f => {
          const name = f.Description_VN || f.Food_Name_VN || '';
          return name.toLowerCase().includes(query);
        }).slice(0, 15);
        setSearchResults(results);
      }, 300); // Debounce 300ms
    } else {
      setSearchResults([]);
    }
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSelectSearchedFood = (item) => {
    setIsSearchModalVisible(false);
    setSearchQuery('');
    const calories = Math.round(Number(item.calories) || Number(item.Calories) || 0);
    const protein = Math.round(Number(item.protein) || Number(item.Protein_g) || 0);
    const carbs = Math.round(Number(item.carbs) || Number(item.Carbs_g) || 0);
    const fat = Math.round(Number(item.fat) || Number(item.Fat_g) || 0);
    
    // Attempt to map image if it's the old structure, or use item.imageUrl from backend
    const descVn = item.description || item.Description_VN || item.Food_Name_VN;
    const imageSource = item.imageUrl ? { uri: item.imageUrl } : FOOD_IMAGES[toImageKey(descVn)];

    const payloadItem = {
      id: item.id || item.Food_Name_VN,
      title: item.name || item.Description_VN || item.Food_Name_VN,
      calories,
      protein,
      carbs,
      fat,
      image: imageSource,
      description: descVn || '',
      rawItem: item
    };
    navigation.navigate('MealDetail', { meal: payloadItem });
  };

  useFocusEffect(
    React.useCallback(() => {
      loadData();
      fetchPtMealPlan();
    }, [])
  );

  const fetchPtMealPlan = async () => {
    setLoadingPtPlan(true);
    try {
      const res = await ptService.getAssignments('MEAL_PLAN');
      if (res.success && res.data) {
        setPtMealPlan(res.data);
      }
    } catch (err) {
      console.warn('Lỗi lấy giáo án dinh dưỡng:', err);
    } finally {
      setLoadingPtPlan(false);
    }
  };

  const getMealsForDay = (dayIndex) => {
    // 1. Try finding PT assigned meal plan first
    const dayAssignment = ptMealPlan?.find(p => p.dayOfWeek === dayIndex || p.day === dayIndex);
    
    // 2. If no PT plan, fallback to AI suggestedMenu
    // In v1, suggestedMenu is stateless and represents a generic daily plan returned by AI
    const hasSuggestedMenu = suggestedMenu && (suggestedMenu.morning?.length > 0 || suggestedMenu.lunch?.length > 0 || suggestedMenu.evening?.length > 0);
    
    if (!dayAssignment && !hasSuggestedMenu) {
      return { morning: [], lunch: [], evening: [] };
    }

    // Parse the textual assignment and lookup foods
    const parseMeals = (mealData, mealType) => {
      if (!mealData) return [];
      let items = [];
      if (Array.isArray(mealData)) {
        items = mealData;
      } else if (typeof mealData === 'string') {
        items = mealData.split(',').map(s => s.trim()).filter(Boolean);
      }
      return items.map(itemName => {
        // Exact match or contains
        const lowerName = itemName.toLowerCase();
        let matchedFood = foodsData.find(f =>
          (f.Description_VN && f.Description_VN.toLowerCase() === lowerName) ||
          (f.Food_Name_VN && f.Food_Name_VN.toLowerCase() === lowerName)
        );

        if (!matchedFood) {
          matchedFood = foodsData.find(f =>
            (f.Description_VN && f.Description_VN.toLowerCase().includes(lowerName)) ||
            (f.Food_Name_VN && f.Food_Name_VN.toLowerCase().includes(lowerName))
          );
        }

        if (matchedFood) {
          return {
            id: itemName,
            title: matchedFood.Description_VN || matchedFood.Food_Name_VN,
            calories: Math.round(Number(matchedFood.Calories) || 0),
            protein: Math.round(Number(matchedFood.Protein_g) || 0),
            carbs: Math.round(Number(matchedFood.Carbs_g) || 0),
            fat: Math.round(Number(matchedFood.Fat_g) || 0),
            image: FOOD_IMAGES[toImageKey(matchedFood.Description_VN)],
            description: matchedFood.Description_VN || '',
            rawItem: matchedFood,
            mealType: mealType
          };
        }

        // Fallback if not found
        return {
          id: itemName,
          title: itemName,
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          image: null,
          description: itemName,
          rawItem: null,
          mealType: mealType
        };
      });
    };

    if (dayAssignment) {
      return {
        morning: parseMeals(dayAssignment.breakfast, 'BREAKFAST'),
        lunch: parseMeals(dayAssignment.lunch, 'LUNCH'),
        evening: parseMeals(dayAssignment.dinner, 'DINNER')
      };
    } else {
      // Use AI plan
      return {
        morning: parseMeals(suggestedMenu.morning, 'BREAKFAST'),
        lunch: parseMeals(suggestedMenu.lunch, 'LUNCH'),
        evening: parseMeals(suggestedMenu.evening, 'DINNER')
      };
    }
  };

  const currentMeals = activeTab === 'menu' ? getMealsForDay(selectedDay) : null;

  useEffect(() => {
    if (route?.params?.mealType) {
      setActiveTab('menu');
    } else if (route?.params?.goToDiary) {
      setActiveTab('diary');
    }
  }, [route?.params]);

  const loadData = async () => {
    await Promise.all([
      fetchDailyLogs(),
      fetchActiveMealPlan()
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const renderSuggestedSection = (title, icon, items) => (
    <View style={styles.menuSection}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          {icon}
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
      </View>
      {items.map((item) => (
        <TouchableOpacity
          key={item.id}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('MealDetail', { meal: item })}
        >
          <View style={styles.glassCardMenu}>
            <Image source={{ uri: item.image }} style={styles.menuImage} />
            <View style={styles.menuInfo}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <View style={styles.menuStatsRow}>
                <Text style={styles.menuStatText}>{item.calories} kcal</Text>
                <Text style={styles.statDot}>•</Text>
                <Text style={styles.menuStatText}>P: {item.protein}g</Text>
                <Text style={styles.statDot}>•</Text>
                <Text style={styles.menuStatText}>C: {item.carbs}g</Text>
                <Text style={styles.statDot}>•</Text>
                <Text style={styles.menuStatText}>F: {item.fat}g</Text>
              </View>
            </View>
            <ChevronRight size={18} color="#9CA3AF" />
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const handleLockDiary = async () => {
    const todayStr = new Date().toISOString().split('T')[0];
    await lockDailyDiaryAction(todayStr);
  };

  const openEditModal = (meal) => {
    setEditingMeal(meal);
    setEditCalories(meal.calories ? meal.calories.toString() : '');
  };

  const handleSaveEdit = async () => {
    if (!editingMeal) return;
    const newCals = parseInt(editCalories);
    if (!isNaN(newCals)) {
      await updateFoodLog(editingMeal.id, { calories: newCals });
    }
    setEditingMeal(null);
    loadData();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <AbstractBackground />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color="#FFFFFF" size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dinh dưỡng</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabWrapper}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'diary' && styles.activeTab]}
          onPress={() => setActiveTab('diary')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'diary' && styles.activeTabText]}>Nhật ký</Text>
          {activeTab === 'diary' && <View style={styles.activeTabIndicator} />}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'menu' && styles.activeTab]}
          onPress={() => setActiveTab('menu')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'menu' && styles.activeTabText]}>Thực đơn</Text>
          {activeTab === 'menu' && <View style={styles.activeTabIndicator} />}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00FF66" colors={['#00FF66']} />
        }
      >
        {isLoading && !refreshing ? (
          <ActivityIndicator size="large" color="#00FF66" style={{ marginTop: 50 }} />
        ) : activeTab === 'diary' ? (
          <>
            {/* Daily Stats Summary */}
            <View style={styles.glassCard}>
              <View style={[styles.statsHeader, { flexDirection: 'column', alignItems: 'flex-start', marginBottom: 24 }]}>
                <Text style={styles.statsTitle}>Tổng quát hôm nay</Text>
                
                {(dailySummary?.consumed?.calories || 0) > (dailySummary?.target?.calories || 2000) ? (
                  <View style={{ backgroundColor: 'rgba(255, 77, 77, 0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginTop: 8, borderWidth: 1, borderColor: 'rgba(255, 77, 77, 0.3)' }}>
                    <Text style={{ color: '#FF4D4D', fontSize: 13, fontWeight: 'bold' }}>
                      ⚠️ Đã vượt quá mục tiêu Calo!
                    </Text>
                  </View>
                ) : (
                  <Text style={[styles.statsCal, { fontSize: 28, marginTop: 8 }]}>
                    {dailySummary?.consumed?.calories || 0} <Text style={{ fontSize: 16, color: '#9CA3AF', fontWeight: '600' }}>/ {dailySummary?.target?.calories || 2000} kcal</Text>
                  </Text>
                )}
              </View>
              <View style={styles.macroProgressWrapper}>
                <View style={styles.macroMiniItem}>
                  <Text style={styles.macroMiniLabel}>Carbs</Text>
                  <Text style={styles.macroMiniValue}>{dailySummary?.consumed?.carbs ?? dailySummary?.consumed?.carbsG ?? 0} / {dailySummary?.target?.carbsG || 200}g</Text>
                  <View style={[styles.macroMiniBarBase]}>
                    <View style={[
                      styles.macroMiniBarFill, 
                      { 
                        backgroundColor: (dailySummary?.consumed?.carbs ?? dailySummary?.consumed?.carbsG ?? 0) > (dailySummary?.target?.carbsG || 200) ? '#FF4444' : '#FF8A65', 
                        width: `${Math.min(100, ((dailySummary?.consumed?.carbs ?? dailySummary?.consumed?.carbsG ?? 0) / (dailySummary?.target?.carbsG || 200)) * 100)}%` 
                      }
                    ]} />
                  </View>
                </View>
                <View style={styles.macroMiniItem}>
                  <Text style={styles.macroMiniLabel}>Protein</Text>
                  <Text style={styles.macroMiniValue}>{dailySummary?.consumed?.protein ?? dailySummary?.consumed?.proteinG ?? 0} / {dailySummary?.target?.proteinG || 150}g</Text>
                  <View style={[styles.macroMiniBarBase]}>
                    <View style={[
                      styles.macroMiniBarFill, 
                      { 
                        backgroundColor: (dailySummary?.consumed?.protein ?? dailySummary?.consumed?.proteinG ?? 0) > (dailySummary?.target?.proteinG || 150) ? '#FF4444' : '#00FF66', 
                        width: `${Math.min(100, ((dailySummary?.consumed?.protein ?? dailySummary?.consumed?.proteinG ?? 0) / (dailySummary?.target?.proteinG || 150)) * 100)}%` 
                      }
                    ]} />
                  </View>
                </View>
                <View style={styles.macroMiniItem}>
                  <Text style={styles.macroMiniLabel}>Fat</Text>
                  <Text style={styles.macroMiniValue}>{dailySummary?.consumed?.fat ?? dailySummary?.consumed?.fatG ?? 0} / {dailySummary?.target?.fatG || 60}g</Text>
                  <View style={[styles.macroMiniBarBase]}>
                    <View style={[
                      styles.macroMiniBarFill, 
                      { 
                        backgroundColor: (dailySummary?.consumed?.fat ?? dailySummary?.consumed?.fatG ?? 0) > (dailySummary?.target?.fatG || 60) ? '#FF4444' : '#00B3FF', 
                        width: `${Math.min(100, ((dailySummary?.consumed?.fat ?? dailySummary?.consumed?.fatG ?? 0) / (dailySummary?.target?.fatG || 60)) * 100)}%` 
                      }
                    ]} />
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Bữa ăn đã ghi</Text>
              <TouchableOpacity
                style={styles.addSmallBtn}
                onPress={() => setIsAddMenuVisible(true)}
              >
                <Plus size={16} color="#0A0B10" strokeWidth={3} />
                <Text style={styles.addSmallText}>THÊM</Text>
              </TouchableOpacity>
            </View>

            {meals.length === 0 ? (
              <View style={styles.emptyState}>
                <Utensils size={48} color="rgba(255,255,255,0.2)" />
                <Text style={styles.emptyText}>Chưa có bữa ăn nào được ghi hôm nay</Text>
              </View>
            ) : (
              meals.map((meal) => {
                const nameToMap = meal.foodName || meal.customName || '';
                const localImage = findLocalImage(nameToMap);

                let imageContent;
                if (meal.imageUrl) {
                  imageContent = <Image source={{ uri: meal.imageUrl }} style={styles.mealImage} />;
                } else if (localImage) {
                  imageContent = <Image source={localImage} style={styles.mealImage} />;
                } else {
                  let IconComponent = Utensils;
                  let iconColor = '#00B3FF';
                  if (meal.mealType === 'BREAKFAST') {
                    IconComponent = Sun;
                    iconColor = '#FFD700';
                  } else if (meal.mealType === 'DINNER') {
                    IconComponent = Moon;
                    iconColor = '#9CA3AF';
                  } else if (meal.mealType === 'SNACK') {
                    IconComponent = Coffee;
                    iconColor = '#FF9F43';
                  }
                  
                  imageContent = (
                    <View style={[styles.mealImage, { backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' }]}>
                      <IconComponent size={28} color={iconColor} />
                    </View>
                  );
                }

                return (
                  <TouchableOpacity
                    key={meal.id}
                    activeOpacity={0.8}
                    onPress={() => openEditModal(meal)}
                  >
                    <View style={styles.glassCardMeal}>
                      {imageContent}
                      <View style={styles.mealInfo}>
                        <View style={styles.mealHeader}>
                          <Text style={styles.mealType}>{meal.mealType}</Text>
                          <View style={styles.timeTag}>
                            <Clock size={12} color="#9CA3AF" />
                            <Text style={styles.timeText}>
                              {(meal.consumedAt || meal.loggedAt) ? new Date(meal.consumedAt || meal.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.foodName} numberOfLines={1}>{nameToMap}</Text>
                      <Text style={styles.foodStats}>
                        {meal.calories} kcal • P:{meal.protein ?? meal.proteinG ?? meal.macros?.proteinG ?? meal.macros?.protein ?? 0}g C:{meal.carbs ?? meal.carbsG ?? meal.macros?.carbsG ?? meal.macros?.carbs ?? 0}g F:{meal.fat ?? meal.fatG ?? meal.macros?.fatG ?? meal.macros?.fat ?? 0}g
                      </Text>
                    </View>
                    <TouchableOpacity 
                      onPress={() => {
                        const mealId = meal.id || meal._id || meal.foodLogId;
                        const { useDialogStore } = require('../../../store/dialogStore');
                        useDialogStore.getState().showDialog({
                          title: 'Xóa bữa ăn',
                          message: 'Xóa bữa ăn sẽ làm thay đổi lượng Calo ghi nhận. Hành vi cố tình thêm rồi xóa liên tục có thể bị hệ thống xem là gian lận điểm thưởng. Bạn vẫn muốn xóa?',
                          type: 'warning',
                          confirmText: 'Xóa ngay',
                          cancelText: 'Hủy',
                          onConfirm: async () => {
                            await deleteFoodLog(mealId);
                            loadData();
                          }
                        });
                      }} 
                      style={styles.deleteBtn}
                    >
                      <Trash2 size={20} color="#FF4444" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
                );
              })
            )}

            {meals.length > 0 && (
              <View style={[styles.lockBtnWrapper, meals.length >= 3 && styles.lockBtnWrapperActive]}>
                <TouchableOpacity
                  style={[styles.lockBtn, meals.length < 3 && styles.lockBtnDisabled]}
                  onPress={handleLockDiary}
                  disabled={meals.length < 3}
                  activeOpacity={0.8}
                >
                  {meals.length >= 3 && (
                    <Svg width="100%" height="100%" style={[StyleSheet.absoluteFill, { borderRadius: 16 }]} preserveAspectRatio="none">
                      <Defs>
                        <LinearGradient id="btnGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <Stop offset="0%" stopColor="#00FF66" />
                          <Stop offset="100%" stopColor="#00B3FF" />
                        </LinearGradient>
                      </Defs>
                      <Rect width="100%" height="100%" fill="url(#btnGrad)" rx="16" ry="16" />
                    </Svg>
                  )}
                  <View style={{ flexDirection: 'row', alignItems: 'center', zIndex: 1 }}>
                    <Text style={[styles.lockBtnText, meals.length < 3 && styles.lockBtnTextDisabled]}>
                      {meals.length < 3 ? '🔒 ' : '✅ '}CHỐT NHẬT KÝ NGÀY
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </>
        ) : (
          <>
            <View style={styles.menuHeaderRow}>
              <Text style={styles.menuMainTitle}>Thực đơn cá nhân hóa</Text>
            </View>

            {/* Horizontal Day Selector */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }}>
              {[1, 2, 3, 4, 5, 6, 7].map(day => (
                <TouchableOpacity
                  key={day}
                  style={[styles.dayBadge, selectedDay === day && styles.dayBadgeActive]}
                  onPress={() => setSelectedDay(day)}
                >
                  <Text style={[styles.dayBadgeText, selectedDay === day && styles.dayBadgeTextActive]}>
                    Ngày {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {loadingPtPlan ? (
              <ActivityIndicator size="large" color="#00FF66" style={{ marginTop: 50 }} />
            ) : (!currentMeals.morning.length && !currentMeals.lunch.length && !currentMeals.evening.length) ? (
              <View style={styles.emptyState}>
                <Utensils size={48} color="rgba(255,255,255,0.2)" />
                <Text style={styles.emptyText}>Chưa có giáo án dinh dưỡng cho ngày này.</Text>
                <TouchableOpacity 
                  style={{ marginTop: 20, backgroundColor: '#00FF66', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 }}
                  onPress={async () => {
                    const { useNutritionStore } = require('../../../store/nutritionStore');
                    await useNutritionStore.getState().generateAIMealPlan();
                  }}
                >
                  <Text style={{ color: '#000', fontWeight: 'bold' }}>Tạo thực đơn bằng AI</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {currentMeals.morning.length > 0 && renderSuggestedSection('Bữa sáng', <Sun size={20} color="#FF9800" />, currentMeals.morning)}
                {currentMeals.lunch.length > 0 && renderSuggestedSection('Bữa trưa', <Utensils size={20} color="#00FF66" />, currentMeals.lunch)}
                {currentMeals.evening.length > 0 && renderSuggestedSection('Bữa tối', <Moon size={20} color="#00B3FF" />, currentMeals.evening)}
              </>
            )}
          </>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Sheet - Add Menu */}
      <Modal visible={isAddMenuVisible} animationType="slide" transparent={true} onRequestClose={() => setIsAddMenuVisible(false)}>
        <TouchableOpacity style={styles.bottomSheetOverlay} activeOpacity={1} onPress={() => setIsAddMenuVisible(false)}>
          <View style={styles.bottomSheetContainer}>
            <View style={styles.bottomSheetHandle} />
            <Text style={styles.bottomSheetTitle}>Thêm bữa ăn mới</Text>

            <TouchableOpacity 
              style={[styles.addOptionCard, { borderColor: '#00FF66', backgroundColor: 'rgba(0, 255, 102, 0.05)' }]}
              onPress={() => { setIsAddMenuVisible(false); navigation.navigate('FoodScan'); }}
            >
              <View style={[styles.addOptionIconWrapper, { backgroundColor: 'rgba(0, 255, 102, 0.2)' }]}>
                <ScanLine color="#00FF66" size={28} />
              </View>
              <View style={styles.addOptionTextWrapper}>
                <Text style={styles.addOptionTitle}>📸 Quét món ăn bằng AI</Text>
                <Text style={styles.addOptionDesc}>Chụp mâm cơm, AI sẽ tự động phân tích Calo</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.addOptionCard}
              onPress={() => { setIsAddMenuVisible(false); setIsSearchModalVisible(true); }}
            >
              <View style={styles.addOptionIconWrapper}>
                <Search color="#FFF" size={24} />
              </View>
              <View style={styles.addOptionTextWrapper}>
                <Text style={styles.addOptionTitle}>✍️ Tìm và nhập thủ công</Text>
                <Text style={styles.addOptionDesc}>Tìm kiếm từ thư viện hàng nghìn món ăn</Text>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Edit Meal Modal */}
      {editingMeal && (
        <View style={StyleSheet.absoluteFill}>
          <View style={styles.modalOverlay}>
            <View style={styles.editModalContainer}>
              <View style={styles.editModalHeader}>
                <Text style={styles.editModalTitle}>Sửa bữa ăn</Text>
                <TouchableOpacity onPress={() => setEditingMeal(null)}>
                  <X color="#FFFFFF" size={24} />
                </TouchableOpacity>
              </View>
              <Text style={styles.editModalLabel}>{editingMeal.foodName}</Text>

              <View style={styles.editInputWrapper}>
                <Text style={styles.editInputPrefix}>Calories:</Text>
                <TextInput
                  style={styles.editInput}
                  value={editCalories}
                  onChangeText={setEditCalories}
                  keyboardType="numeric"
                  placeholderTextColor="#6B7280"
                />
              </View>

              <TouchableOpacity style={styles.saveEditBtn} onPress={handleSaveEdit}>
                <Text style={styles.saveEditBtnText}>CẬP NHẬT</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.saveEditBtn, { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#FF4D4D', marginTop: 12 }]} 
                onPress={() => {
                  const { useDialogStore } = require('../../../store/dialogStore');
                  useDialogStore.getState().showDialog({
                    title: 'Xóa bữa ăn',
                    message: 'Xóa bữa ăn sẽ làm thay đổi lượng Calo ghi nhận. Hành vi cố tình thêm rồi xóa liên tục có thể bị hệ thống xem là gian lận điểm thưởng. Bạn vẫn muốn xóa?',
                    type: 'warning',
                    confirmText: 'Xóa ngay',
                    cancelText: 'Hủy',
                    onConfirm: async () => {
                      await deleteFoodLog(editingMeal.id || editingMeal.foodLogId);
                      setEditingMeal(null);
                      loadData();
                    }
                  });
                }}
              >
                <Text style={[styles.saveEditBtnText, { color: '#FF4D4D' }]}>XÓA BỮA ĂN</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Search Modal */}
      {isSearchModalVisible && (
        <View style={StyleSheet.absoluteFill}>
          <View style={styles.modalOverlay}>
            <View style={[styles.editModalContainer, { height: '80%' }]}>
              <View style={styles.editModalHeader}>
                <Text style={styles.editModalTitle}>Tìm món ăn</Text>
                <TouchableOpacity onPress={() => setIsSearchModalVisible(false)}>
                  <X color="#FFFFFF" size={24} />
                </TouchableOpacity>
              </View>

              <View style={styles.editInputWrapper}>
                <TextInput
                  style={styles.editInput}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Gõ tên món ăn (VD: Phở, Bánh mì...)"
                  placeholderTextColor="#6B7280"
                  autoFocus
                />
              </View>

              <ScrollView style={{ flex: 1, marginTop: 10 }} showsVerticalScrollIndicator={false}>
                {searchResults.map((item, index) => {
                  const descVn = item.description || item.Description_VN || item.Food_Name_VN;
                  const imageSource = item.imageUrl ? { uri: item.imageUrl } : FOOD_IMAGES[toImageKey(descVn)];
                  const cal = Math.round(Number(item.calories) || Number(item.Calories) || 0);
                  return (
                    <TouchableOpacity
                      key={index}
                      style={styles.glassCardMenu}
                      onPress={() => handleSelectSearchedFood(item)}
                    >
                      {imageSource ? (
                        <Image source={imageSource} style={styles.menuImage} />
                      ) : (
                        <View style={[styles.menuImage, { backgroundColor: '#333' }]} />
                      )}
                      <View style={styles.menuInfo}>
                        <Text style={styles.menuTitle}>{item.name || descVn}</Text>
                        <Text style={styles.menuStatText}>{cal} kcal</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
                {searchQuery.length >= 2 && searchResults.length === 0 && (
                  <Text style={{ color: '#9CA3AF', textAlign: 'center', marginTop: 20 }}>
                    Không tìm thấy món ăn phù hợp
                  </Text>
                )}
              </ScrollView>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
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
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  tabWrapper: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    position: 'relative',
    borderRadius: 16,
  },
  activeTab: {
    backgroundColor: 'rgba(0, 255, 102, 0.1)',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  activeTabText: {
    color: '#00FF66',
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: -4,
    width: '40%',
    height: 3,
    backgroundColor: '#00FF66',
    borderRadius: 2,
    shadowColor: '#00FF66',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 4,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  // Glass Cards
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  glassCardMeal: {
    flexDirection: 'row',
    backgroundColor: 'rgba(20, 24, 35, 0.65)',
    borderRadius: 20,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  glassCardMenu: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 15,
    color: '#9CA3AF',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statsCal: {
    fontSize: 24,
    fontWeight: '900',
    color: '#00FF66',
    textShadowColor: 'rgba(0, 255, 102, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  macroProgressWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroMiniItem: {
    flex: 1,
    marginRight: 10,
  },
  macroMiniLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 6,
    fontWeight: '600',
  },
  macroMiniValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  macroMiniBarBase: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  macroMiniBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginLeft: 10,
  },
  addSmallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00FF66',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: '#00FF66',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 4,
  },
  addSmallText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0A0B10',
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  mealImage: {
    width: 70,
    height: 70,
    borderRadius: 16,
  },
  mealInfo: {
    flex: 1,
    marginLeft: 16,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  mealType: {
    fontSize: 12,
    fontWeight: '800',
    color: '#00B3FF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 4,
    fontWeight: '600',
  },
  foodName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  foodStats: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  // Menu Tab Styles
  menuHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  menuMainTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  dateBadge: {
    backgroundColor: 'rgba(0, 255, 102, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 102, 0.3)',
  },
  dateBadgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#00FF66',
  },
  menuSection: {
    marginBottom: 24,
  },
  menuImage: {
    width: 60,
    height: 60,
    borderRadius: 14,
  },
  menuInfo: {
    flex: 1,
    marginLeft: 16,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  menuStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuStatText: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  statDot: {
    marginHorizontal: 8,
    color: 'rgba(255,255,255,0.2)',
  },
  dayBadge: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  dayBadgeActive: {
    backgroundColor: 'rgba(0, 255, 102, 0.15)',
    borderColor: 'rgba(0, 255, 102, 0.5)',
  },
  dayBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  dayBadgeTextActive: {
    color: '#00FF66',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 15,
    color: '#9CA3AF',
    marginTop: 16,
    fontWeight: '500',
  },
  deleteBtn: {
    padding: 10,
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    borderRadius: 12,
  },
  lockBtnWrapper: {
    marginTop: 16,
    marginBottom: 20,
    borderRadius: 16,
  },
  lockBtnWrapperActive: {
    shadowColor: '#00FF66',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  lockBtn: {
    height: 60,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  lockBtnDisabled: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  lockBtnText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0A0B10',
    letterSpacing: 1,
  },
  lockBtnTextDisabled: {
    color: 'rgba(255,255,255,0.3)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 11, 16, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  editModalContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  editModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  editModalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  editModalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00FF66',
    marginBottom: 20,
  },
  editInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 60,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  editInputPrefix: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '600',
    marginRight: 10,
  },
  editInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  saveEditBtn: {
    backgroundColor: '#00FF66',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00FF66',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 4,
  },
  saveEditBtnText: {
    color: '#0A0B10',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  bottomSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 11, 16, 0.7)',
    justifyContent: 'flex-end',
  },
  bottomSheetContainer: {
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  bottomSheetTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 24,
    textAlign: 'center',
  },
  addOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  addOptionIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  addOptionTextWrapper: {
    flex: 1,
  },
  addOptionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  addOptionDesc: {
    fontSize: 13,
    color: '#9CA3AF',
    lineHeight: 18,
  }
});

export default MealLogScreen;
