import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, TrendingUp, Flame, Droplets, Target, Award } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../../theme';
import NutriCard from '../../../components/shared/NutriCard';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const NutritionOverviewScreen = () => {
  const navigation = useNavigation();

  // Mock data for the week
  const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const caloriesData = [1850, 2100, 1950, 2300, 1750, 0, 0];
  const targetCalories = 2124;
  const currentDayIndex = 4; // T6

  // Mock Macros average
  const macros = {
    protein: { current: 125, target: 159, color: COLORS.primary },
    carbs: { current: 180, target: 212, color: '#FF8A65' },
    fat: { current: 55, target: 71, color: '#FFC107' }
  };

  const calculateProgress = (current, target) => {
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
        
        {/* Weekly Chart Card */}
        <NutriCard style={styles.chartCard}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardSubtitle}>Trung bình mỗi ngày</Text>
              <Text style={styles.cardTitle}>1,990 kcal</Text>
            </View>
            <View style={styles.trendBadge}>
              <TrendingUp size={16} color={COLORS.primary} />
              <Text style={styles.trendText}>+5%</Text>
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
                barColor = isOverTarget ? '#FF5252' : COLORS.primaryLight;
                if (isToday) barColor = COLORS.primary;
              }

              return (
                <View key={day} style={styles.barWrapper}>
                  {value > 0 && (
                    <Text style={[styles.barValue, isToday && { color: COLORS.primary, fontWeight: '700' }]}>
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
                  <Text style={{ fontWeight: '700', color: COLORS.text }}>{macros.protein.current}g </Text>
                  / {macros.protein.target}g
                </Text>
              </View>
              <View style={styles.progressBarBg}>
                <View 
                  style={[
                    styles.progressBarFill, 
                    { width: `${calculateProgress(macros.protein.current, macros.protein.target)}%`, backgroundColor: macros.protein.color }
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
                  <Text style={{ fontWeight: '700', color: COLORS.text }}>{macros.carbs.current}g </Text>
                  / {macros.carbs.target}g
                </Text>
              </View>
              <View style={styles.progressBarBg}>
                <View 
                  style={[
                    styles.progressBarFill, 
                    { width: `${calculateProgress(macros.carbs.current, macros.carbs.target)}%`, backgroundColor: macros.carbs.color }
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
                  <Text style={{ fontWeight: '700', color: COLORS.text }}>{macros.fat.current}g </Text>
                  / {macros.fat.target}g
                </Text>
              </View>
              <View style={styles.progressBarBg}>
                <View 
                  style={[
                    styles.progressBarFill, 
                    { width: `${calculateProgress(macros.fat.current, macros.fat.target)}%`, backgroundColor: macros.fat.color }
                  ]} 
                />
              </View>
            </View>
          </View>
        </NutriCard>

        {/* AI Insights Card */}
        <Text style={styles.sectionTitle}>Nhận xét từ AI</Text>
        <View style={styles.insightCard}>
          <View style={styles.insightIconWrapper}>
            <Award size={24} color="#FFF" />
          </View>
          <View style={styles.insightContent}>
            <Text style={styles.insightTitle}>Rất tốt! Bạn đang bám sát mục tiêu</Text>
            <Text style={styles.insightText}>
              Lượng Protein trung bình tuần này của bạn khá tốt. Tuy nhiên vào Thứ 5 bạn đã vượt mức Calo. Hãy cố gắng duy trì lượng rau xanh và uống đủ nước nhé!
            </Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
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
  },
  insightCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  insightIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    lineHeight: 22,
  },
  insightText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    lineHeight: 20,
  }
});

export default NutritionOverviewScreen;
