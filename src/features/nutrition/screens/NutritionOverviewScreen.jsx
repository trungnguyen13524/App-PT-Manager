import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, TrendingUp, TrendingDown, Flame, Droplets, Target, Award } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../../theme';
import NutriCard from '../../../components/shared/NutriCard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNutritionStore } from '../../../store/nutritionStore';

const { width } = Dimensions.get('window');

const NutritionOverviewScreen = () => {
  const navigation = useNavigation();

  const { weeklySummary, fetchWeeklySummary } = useNutritionStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchWeeklySummary();
      setLoading(false);
    };
    loadData();
  }, []);

  const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  
  // Xử lý dữ liệu từ API
  const caloriesData = weeklySummary ? weeklySummary.map(day => day?.consumed?.calories || 0) : Array(7).fill(0);
  const targetCalories = weeklySummary ? Math.max(...weeklySummary.map(day => day?.target?.calories || 0)) : 2000;
  
  const currentDayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

  // Tính trung bình
  const validDays = weeklySummary ? weeklySummary.filter(day => day?.consumed?.calories > 0) : [];
  const validDaysCount = validDays.length || 1;
  const avgCalories = validDays.reduce((sum, day) => sum + (day.consumed?.calories || 0), 0) / validDaysCount;
  
  const macros = {
    protein: { 
      current: Math.round(validDays.reduce((sum, day) => sum + (day.consumed?.proteinG || 0), 0) / validDaysCount),
      target: Math.round(validDays.reduce((sum, day) => sum + (day.target?.proteinG || 0), 0) / validDaysCount) || 150,
      color: COLORS.primary 
    },
    carbs: { 
      current: Math.round(validDays.reduce((sum, day) => sum + (day.consumed?.carbsG || 0), 0) / validDaysCount),
      target: Math.round(validDays.reduce((sum, day) => sum + (day.target?.carbsG || 0), 0) / validDaysCount) || 200,
      color: '#FF8A65' 
    },
    fat: { 
      current: Math.round(validDays.reduce((sum, day) => sum + (day.consumed?.fatG || 0), 0) / validDaysCount),
      target: Math.round(validDays.reduce((sum, day) => sum + (day.target?.fatG || 0), 0) / validDaysCount) || 60,
      color: '#FFC107' 
    }
  };

  const calculateProgress = (current, target) => {
    if (!target) return 0;
    return Math.min((current / target) * 100, 100);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={COLORS.text} size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tổng quan tuần</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <View style={{ marginTop: 100, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={{ marginTop: 16, color: COLORS.textSecondary }}>Đang tải dữ liệu tuần...</Text>
          </View>
        ) : (
          <>
        {/* Weekly Chart Card */}
        <NutriCard style={styles.chartCard}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardSubtitle}>Trung bình mỗi ngày</Text>
              <Text style={styles.cardTitle}>{Math.round(avgCalories).toLocaleString()} kcal</Text>
            </View>
            <View style={[styles.trendBadge, avgCalories > targetCalories && { backgroundColor: '#FF525230' }]}>
              {avgCalories > targetCalories ? (
                <TrendingDown size={16} color="#FF5252" />
              ) : (
                <TrendingUp size={16} color={COLORS.primary} />
              )}
              <Text style={[styles.trendText, avgCalories > targetCalories && { color: '#FF5252' }]}>
                {targetCalories > 0 ? Math.round((Math.abs(avgCalories - targetCalories) / targetCalories) * 100) : 0}%
              </Text>
            </View>
          </View>

          <View style={styles.barChartContainer}>
            {weekDays.map((day, idx) => {
              const value = caloriesData[idx];
              const maxVal = Math.max(...caloriesData, targetCalories);
              const heightPercent = (value / maxVal) * 100 || 5; // minimum 5% to show empty bar
              const isToday = idx === currentDayIndex;
              const isOverTarget = value > targetCalories;
              
              let barColor = '#E9ECEF';
              if (value > 0) {
                barColor = isOverTarget ? '#FF4D4D' : COLORS.primaryLight;
                if (isToday && !isOverTarget) barColor = COLORS.primary;
                else if (isToday && isOverTarget) barColor = '#FF0000';
              }

              return (
                <View key={day} style={styles.barWrapper}>
                  {value > 0 && (
                    <Text style={[styles.barValue, isToday && { fontWeight: '700' }, isOverTarget ? { color: '#FF4D4D' } : (isToday ? { color: COLORS.primary } : {})]}>
                      {value}
                    </Text>
                  )}
                  <View style={styles.barBackground}>
                    <View 
                      style={[
                        styles.barFill, 
                        { height: `${heightPercent}%`, backgroundColor: barColor }
                      ]} 
                    />
                  </View>
                  <Text style={[styles.barLabel, isToday && { color: COLORS.primary, fontWeight: '700' }]}>
                    {day}
                  </Text>
                </View>
              );
            })}
          </View>
          
          <View style={styles.targetLineWrapper}>
            <View style={styles.targetLine} />
            <Text style={styles.targetLineText}>Mục tiêu: {targetCalories}</Text>
          </View>
        </NutriCard>

        {/* Macros Breakdown */}
        <Text style={styles.sectionTitle}>Phân bổ đa lượng (Trung bình)</Text>
        <NutriCard style={styles.macrosCard}>
          {/* Protein */}
          <View style={styles.macroRow}>
            <View style={[styles.macroIconBox, { backgroundColor: COLORS.primaryLight + '30' }]}>
              <Flame size={20} color={COLORS.primary} />
            </View>
            <View style={styles.macroInfo}>
              <View style={styles.macroHeader}>
                <Text style={styles.macroName}>Protein</Text>
                <Text style={styles.macroValues}>
                  <Text style={[{ fontWeight: '700', color: COLORS.text }, macros.protein.current > macros.protein.target && { color: '#FF4D4D' }]}>{macros.protein.current}g </Text>
                  / {macros.protein.target}g
                </Text>
              </View>
              <View style={styles.progressBarBg}>
                <View 
                  style={[
                    styles.progressBarFill, 
                    { width: `${calculateProgress(macros.protein.current, macros.protein.target)}%`, backgroundColor: macros.protein.current > macros.protein.target ? '#FF4D4D' : macros.protein.color }
                  ]} 
                />
              </View>
            </View>
          </View>

          {/* Carbs */}
          <View style={styles.macroRow}>
            <View style={[styles.macroIconBox, { backgroundColor: '#FF8A6530' }]}>
              <Target size={20} color="#FF8A65" />
            </View>
            <View style={styles.macroInfo}>
              <View style={styles.macroHeader}>
                <Text style={styles.macroName}>Carbohydrates</Text>
                <Text style={styles.macroValues}>
                  <Text style={[{ fontWeight: '700', color: COLORS.text }, macros.carbs.current > macros.carbs.target && { color: '#FF4D4D' }]}>{macros.carbs.current}g </Text>
                  / {macros.carbs.target}g
                </Text>
              </View>
              <View style={styles.progressBarBg}>
                <View 
                  style={[
                    styles.progressBarFill, 
                    { width: `${calculateProgress(macros.carbs.current, macros.carbs.target)}%`, backgroundColor: macros.carbs.current > macros.carbs.target ? '#FF4D4D' : macros.carbs.color }
                  ]} 
                />
              </View>
            </View>
          </View>

          {/* Fat */}
          <View style={styles.macroRow}>
            <View style={[styles.macroIconBox, { backgroundColor: '#FFC10730' }]}>
              <Droplets size={20} color="#FFC107" />
            </View>
            <View style={styles.macroInfo}>
              <View style={styles.macroHeader}>
                <Text style={styles.macroName}>Fat</Text>
                <Text style={styles.macroValues}>
                  <Text style={[{ fontWeight: '700', color: COLORS.text }, macros.fat.current > macros.fat.target && { color: '#FF4D4D' }]}>{macros.fat.current}g </Text>
                  / {macros.fat.target}g
                </Text>
              </View>
              <View style={styles.progressBarBg}>
                <View 
                  style={[
                    styles.progressBarFill, 
                    { width: `${calculateProgress(macros.fat.current, macros.fat.target)}%`, backgroundColor: macros.fat.current > macros.fat.target ? '#FF4D4D' : macros.fat.color }
                  ]} 
                />
              </View>
            </View>
          </View>
        </NutriCard>



        <View style={{ height: 40 }} />
        </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  chartCard: {
    padding: 24,
    marginBottom: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 30,
  },
  cardSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight + '30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  trendText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 4,
  },
  barChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 180,
    paddingTop: 20,
  },
  barWrapper: {
    alignItems: 'center',
    width: 36,
  },
  barValue: {
    fontSize: 10,
    color: COLORS.textLight,
    marginBottom: 6,
    fontWeight: '600',
  },
  barBackground: {
    width: 14,
    height: 120,
    backgroundColor: '#F8F9FA',
    borderRadius: 7,
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    borderRadius: 7,
  },
  barLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 12,
  },
  targetLineWrapper: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 95, // Adjust this based on targetCalories relative to max
    zIndex: 10,
  },
  targetLine: {
    width: '100%',
    height: 1,
    backgroundColor: COLORS.primary,
    borderStyle: 'dashed',
    opacity: 0.5,
  },
  targetLineText: {
    position: 'absolute',
    right: 0,
    top: -16,
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '600',
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: 16,
    marginLeft: 4,
  },
  macrosCard: {
    padding: 20,
    marginBottom: 24,
  },
  macroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  macroIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  macroInfo: {
    flex: 1,
  },
  macroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  macroName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  macroValues: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  }
});

export default NutritionOverviewScreen;
