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
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Plus, Clock, Info, ChevronRight, Utensils, Moon, Sun, Trash2 } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../../theme';
import { useNutritionStore } from '../../../store/nutritionStore';
import NutriCard from '../../../components/shared/NutriCard';

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
    deleteFoodLog 
  } = useNutritionStore();
  
  const [activeTab, setActiveTab] = useState('diary');
  const [refreshing, setRefreshing] = useState(false);

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
          <NutriCard style={styles.menuCard}>
            <Image source={{ uri: item.image }} style={styles.menuImage} />
            <View style={styles.menuInfo}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <View style={styles.menuStatsRow}>
                <Text style={styles.menuStatText}>{item.calories} kcal</Text>
                <Text style={styles.statDot}>•</Text>
                <Text style={styles.menuStatText}>P: {item.protein}g</Text>
              </View>
            </View>
            <ChevronRight size={18} color={COLORS.textLight} />
          </NutriCard>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={COLORS.text} size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dinh dưỡng</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabWrapper}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'diary' && styles.activeTab]}
          onPress={() => setActiveTab('diary')}
        >
          <Text style={[styles.tabText, activeTab === 'diary' && styles.activeTabText]}>Nhật ký</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'menu' && styles.activeTab]}
          onPress={() => setActiveTab('menu')}
        >
          <Text style={[styles.tabText, activeTab === 'menu' && styles.activeTabText]}>Thực đơn</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {isLoading && !refreshing ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
        ) : activeTab === 'diary' ? (
          <>
            {/* Daily Stats Summary */}
            <NutriCard style={styles.statsCard}>
              <View style={styles.statsHeader}>
                <Text style={styles.statsTitle}>Tổng quát hôm nay</Text>
                <Text style={styles.statsCal}>{dailySummary.calories || 0} kcal</Text>
              </View>
              <View style={styles.macroProgressWrapper}>
                <View style={styles.macroMiniItem}>
                  <Text style={styles.macroMiniLabel}>Carbs</Text>
                  <Text style={styles.macroMiniValue}>{dailySummary.carbs || 0}g</Text>
                  <View style={[styles.macroMiniBar, { backgroundColor: '#FF8A65', width: '60%' }]} />
                </View>
                <View style={styles.macroMiniItem}>
                  <Text style={styles.macroMiniLabel}>Protein</Text>
                  <Text style={styles.macroMiniValue}>{dailySummary.protein || 0}g</Text>
                  <View style={[styles.macroMiniBar, { backgroundColor: COLORS.primary, width: '40%' }]} />
                </View>
                <View style={styles.macroMiniItem}>
                  <Text style={styles.macroMiniLabel}>Fat</Text>
                  <Text style={styles.macroMiniValue}>{dailySummary.fat || 0}g</Text>
                  <View style={[styles.macroMiniBar, { backgroundColor: '#FFC107', width: '30%' }]} />
                </View>
              </View>
            </NutriCard>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Bữa ăn đã ghi</Text>
              <TouchableOpacity 
                style={styles.addSmallBtn}
                onPress={() => navigation.navigate('FoodScan')}
              >
                <Plus size={18} color={COLORS.primary} />
                <Text style={styles.addSmallText}>Thêm</Text>
              </TouchableOpacity>
            </View>

            {meals.length === 0 ? (
              <View style={styles.emptyState}>
                <Utensils size={40} color={COLORS.textLight} />
                <Text style={styles.emptyText}>Chưa có bữa ăn nào được ghi hôm nay</Text>
              </View>
            ) : (
              meals.map((meal) => (
                <NutriCard key={meal.id} style={styles.mealCard}>
                  <Image source={{ uri: meal.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c' }} style={styles.mealImage} />
                  <View style={styles.mealInfo}>
                    <View style={styles.mealHeader}>
                      <Text style={styles.mealType}>{meal.mealType}</Text>
                      <View style={styles.timeTag}>
                        <Clock size={12} color={COLORS.textLight} />
                        <Text style={styles.timeText}>
                          {meal.loggedAt ? new Date(meal.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.foodName}>{meal.foodName}</Text>
                    <Text style={styles.foodStats}>
                      {meal.calories} kcal • P: {meal.proteinG}g • C: {meal.carbsG}g • F: {meal.fatG}g
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => deleteFoodLog(meal.id)} style={styles.deleteBtn}>
                    <Trash2 size={18} color={COLORS.error} />
                  </TouchableOpacity>
                </NutriCard>
              ))
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
            {renderSuggestedSection('Bữa trưa', <Utensils size={20} color={COLORS.primary} />, suggestedMenu.lunch)}
            {renderSuggestedSection('Bữa tối', <Moon size={20} color="#5C6BC0" />, suggestedMenu.evening)}
          </>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
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
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },
  tabWrapper: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: COLORS.divider,
  },
  activeTab: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  activeTabText: {
    color: COLORS.primary,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  // Diary Styles
  statsCard: {
    padding: 20,
    backgroundColor: COLORS.primaryLight,
    marginBottom: 24,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  statsCal: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
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
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  macroMiniValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },
  macroMiniBar: {
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.divider,
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
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: 10,
  },
  addSmallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  addSmallText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    marginLeft: 4,
  },
  mealCard: {
    flexDirection: 'row',
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  mealImage: {
    width: 70,
    height: 70,
    borderRadius: SPACING.borderRadius.lg,
  },
  mealInfo: {
    flex: 1,
    marginLeft: 16,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  mealType: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 11,
    color: COLORS.textLight,
    marginLeft: 4,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  foodStats: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  // Menu Tab Styles
  menuHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  menuMainTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },
  dateBadge: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  dateBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  menuSection: {
    marginBottom: 24,
  },
  menuCard: {
    flexDirection: 'row',
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  menuImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  menuInfo: {
    flex: 1,
    marginLeft: 16,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  menuStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuStatText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  statDot: {
    marginHorizontal: 6,
    color: COLORS.divider,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 12,
  },
  deleteBtn: {
    padding: 8,
  }
});

export default MealLogScreen;
