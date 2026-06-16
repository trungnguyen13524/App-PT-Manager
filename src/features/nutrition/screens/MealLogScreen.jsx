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
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Plus, Clock, ChevronRight, Utensils, Moon, Sun, Trash2, X } from 'lucide-react-native';
import { useNutritionStore } from '../../../store/nutritionStore';
import { useMissionStore } from '../../../store/missionStore';
import { AbstractBackground } from '../../../components/common/AbstractBackground';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

const { width } = Dimensions.get('window');

const MealLogScreen = () => {
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

  useEffect(() => {
    loadData();
  }, []);

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
                <Text style={styles.statsCal}>{dailySummary.calories || 0} kcal</Text>
              </View>
              <View style={styles.macroProgressWrapper}>
                <View style={styles.macroMiniItem}>
                  <Text style={styles.macroMiniLabel}>Carbs</Text>
                  <Text style={styles.macroMiniValue}>{dailySummary.carbs || 0}g</Text>
                  <View style={[styles.macroMiniBarBase]}>
                     <View style={[styles.macroMiniBarFill, { backgroundColor: '#FF8A65', width: '60%' }]} />
                  </View>
                </View>
                <View style={styles.macroMiniItem}>
                  <Text style={styles.macroMiniLabel}>Protein</Text>
                  <Text style={styles.macroMiniValue}>{dailySummary.protein || 0}g</Text>
                  <View style={[styles.macroMiniBarBase]}>
                     <View style={[styles.macroMiniBarFill, { backgroundColor: '#00FF66', width: '40%' }]} />
                  </View>
                </View>
                <View style={styles.macroMiniItem}>
                  <Text style={styles.macroMiniLabel}>Fat</Text>
                  <Text style={styles.macroMiniValue}>{dailySummary.fat || 0}g</Text>
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
                onPress={() => navigation.navigate('FoodScan')}
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
                            {meal.loggedAt ? new Date(meal.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.foodName} numberOfLines={1}>{meal.foodName}</Text>
                      <Text style={styles.foodStats}>
                        {meal.calories} kcal • P:{meal.proteinG}g C:{meal.carbsG}g F:{meal.fatG}g
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
              <Text style={styles.menuMainTitle}>Thực đơn hôm nay</Text>
              <View style={styles.dateBadge}>
                <Text style={styles.dateBadgeText}>14 Th5</Text>
              </View>
            </View>

            {renderSuggestedSection('Bữa sáng', <Sun size={20} color="#FF9800" />, suggestedMenu.morning)}
            {renderSuggestedSection('Bữa trưa', <Utensils size={20} color="#00FF66" />, suggestedMenu.lunch)}
            {renderSuggestedSection('Bữa tối', <Moon size={20} color="#00B3FF" />, suggestedMenu.evening)}
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
