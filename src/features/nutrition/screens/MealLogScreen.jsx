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
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { ChevronLeft, Plus, Clock, ChevronRight, Utensils, Moon, Sun, Trash2, X } from 'lucide-react-native';
import { useNutritionStore } from '../../../store/nutritionStore';
import { useMissionStore } from '../../../store/missionStore';
import { AbstractBackground } from '../../../components/common/AbstractBackground';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import foodsData from '../../../assets/foods.json';
import { FOOD_IMAGES, toImageKey } from '../../../assets';
import ptService from '../../../api/services/pt.service';

const { width } = Dimensions.get('window');

const MealLogScreen = ({ route }) => {
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
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      const lowerQuery = searchQuery.toLowerCase();
      const results = foodsData.filter(item => 
        (item.Food_Name_VN && item.Food_Name_VN.toLowerCase().includes(lowerQuery)) ||
        (item.Description_VN && item.Description_VN.toLowerCase().includes(lowerQuery))
      ).slice(0, 15);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleSelectSearchedFood = (item) => {
    setIsSearchModalVisible(false);
    setSearchQuery('');
    const calories = Math.round(Number(item.Calories) || 0);
    const protein = Math.round(Number(item.Protein_g) || 0);
    const carbs = Math.round(Number(item.Carbs_g) || 0);
    const fat = Math.round(Number(item.Fat_g) || 0);
    const imageSource = FOOD_IMAGES[toImageKey(item.Description_VN)];

    const payloadItem = {
      id: item.Food_Name_VN,
      title: item.Description_VN || item.Food_Name_VN,
      calories,
      protein,
      carbs,
      fat,
      image: imageSource,
      description: item.Description_VN || '',
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
    if (!ptMealPlan || ptMealPlan.length === 0) return { morning: [], lunch: [], evening: [] };
    
    // Find assignment for the specific day (day 1 to 7)
    const dayAssignment = ptMealPlan.find(p => p.dayOfWeek === dayIndex || p.day === dayIndex);
    if (!dayAssignment) return { morning: [], lunch: [], evening: [] };

    // Parse the textual assignment and lookup foods
    const parseMeals = (mealString, mealType) => {
      if (!mealString) return [];
      const items = mealString.split(',').map(s => s.trim()).filter(Boolean);
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

    return {
      morning: parseMeals(dayAssignment.breakfast, 'BREAKFAST'),
      lunch: parseMeals(dayAssignment.lunch, 'LUNCH'),
      evening: parseMeals(dayAssignment.dinner, 'DINNER')
    };
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
              <View style={styles.statsHeader}>
                <Text style={styles.statsTitle}>Tổng quát hôm nay</Text>
                <Text style={styles.statsCal}>{dailySummary?.consumed?.calories || 0} kcal</Text>
              </View>
              <View style={styles.macroProgressWrapper}>
                <View style={styles.macroMiniItem}>
                  <Text style={styles.macroMiniLabel}>Carbs</Text>
                  <Text style={styles.macroMiniValue}>{dailySummary?.consumed?.carbsG || 0}g</Text>
                  <View style={[styles.macroMiniBarBase]}>
                     <View style={[styles.macroMiniBarFill, { backgroundColor: '#FF8A65', width: '60%' }]} />
                  </View>
                </View>
                <View style={styles.macroMiniItem}>
                  <Text style={styles.macroMiniLabel}>Protein</Text>
                  <Text style={styles.macroMiniValue}>{dailySummary?.consumed?.proteinG || 0}g</Text>
                  <View style={[styles.macroMiniBarBase]}>
                     <View style={[styles.macroMiniBarFill, { backgroundColor: '#00FF66', width: '40%' }]} />
                  </View>
                </View>
                <View style={styles.macroMiniItem}>
                  <Text style={styles.macroMiniLabel}>Fat</Text>
                  <Text style={styles.macroMiniValue}>{dailySummary?.consumed?.fatG || 0}g</Text>
                  <View style={[styles.macroMiniBarBase]}>
                     <View style={[styles.macroMiniBarFill, { backgroundColor: '#FFC107', width: '30%' }]} />
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Bữa ăn đã ghi</Text>
              <TouchableOpacity 
                style={styles.addSmallBtn}
                onPress={() => setIsSearchModalVisible(true)}
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
              meals.map((meal) => (
                <TouchableOpacity 
                  key={meal.id} 
                  activeOpacity={0.8}
                  onPress={() => openEditModal(meal)}
                >
                  <View style={styles.glassCardMeal}>
                    <Image source={{ uri: meal.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c' }} style={styles.mealImage} />
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
                      <Text style={styles.foodName} numberOfLines={1}>{meal.foodName}</Text>
                      <Text style={styles.foodStats}>
                        {meal.calories} kcal • P:{meal.proteinG ?? meal.macros?.proteinG ?? meal.macros?.protein ?? 0}g C:{meal.carbsG ?? meal.macros?.carbsG ?? meal.macros?.carbs ?? 0}g F:{meal.fatG ?? meal.macros?.fatG ?? meal.macros?.fat ?? 0}g
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => deleteFoodLog(meal.id)} style={styles.deleteBtn}>
                      <Trash2 size={20} color="#FF4444" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))
            )}

            {meals.length > 0 && (
              <View style={styles.lockBtnWrapper}>
                <TouchableOpacity 
                  style={[styles.lockBtn, meals.length < 3 && styles.lockBtnDisabled]}
                  onPress={handleLockDiary}
                  disabled={meals.length < 3}
                  activeOpacity={0.8}
                >
                  {meals.length >= 3 && (
                    <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
                      <Defs>
                        <LinearGradient id="btnGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <Stop offset="0%" stopColor="#00FF66" />
                          <Stop offset="100%" stopColor="#00B3FF" />
                        </LinearGradient>
                      </Defs>
                      <Rect width="100%" height="100%" fill="url(#btnGrad)" />
                    </Svg>
                  )}
                  <Text style={[styles.lockBtnText, meals.length < 3 && styles.lockBtnTextDisabled]}>🔒 CHỐT NHẬT KÝ NGÀY</Text>
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
                <Text style={styles.emptyText}>PT chưa giao giáo án dinh dưỡng cho ngày này.</Text>
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
                  const imageSource = FOOD_IMAGES[toImageKey(item.Description_VN)];
                  const cal = Math.round(Number(item.Calories) || 0);
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
                        <Text style={styles.menuTitle}>{item.Description_VN}</Text>
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
    shadowColor: '#00FF66',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
    borderRadius: 16,
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
  }
});

export default MealLogScreen;
