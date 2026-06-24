import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../../theme';

const WeeklyNutritionTracker = ({ weeklyData, loading, todayConsumed, todayTarget }) => {
  const navigation = useNavigation();

  // weeklyData is expected to be an array of 7 items (Mon to Sun)
  // Each item should have { consumedCalories, targetCalories }
  const daysOfWeek = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const currentDay = new Date().getDay();
  // Map JS getDay() (0=Sun, 1=Mon) to our array (0=Mon, 6=Sun)
  const mappedTodayIdx = currentDay === 0 ? 6 : currentDay - 1;

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Dinh dưỡng tuần này</Text>
      </View>
      <View style={[styles.glassCard, styles.weeklyCard]}>
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.loaderText}>Đang tải dữ liệu tuần...</Text>
          </View>
        ) : (
          <>
            <View style={styles.barChartRow}>
              {daysOfWeek.map((day, idx) => {
                const isToday = idx === mappedTodayIdx;
                let barHeight = 8;
                
                if (weeklyData && weeklyData[idx]) {
                  const dayData = weeklyData[idx];
                  if (dayData.targetCalories > 0) {
                    const ratio = dayData.consumedCalories / dayData.targetCalories;
                    barHeight = Math.min(50, Math.max(8, ratio * 50));
                  }
                }

                return (
                  <View key={day} style={styles.barContainer}>
                    <View style={[
                      styles.bar, 
                      { 
                        height: barHeight, 
                        backgroundColor: isToday ? COLORS.primary : 'rgba(0, 0, 0, 0.05)' 
                      },
                      isToday && {
                        shadowColor: COLORS.primaryDark,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.15,
                        shadowRadius: 10,
                        elevation: 5,
                      }
                    ]} />
                    <Text style={[styles.barLabel, isToday && { color: COLORS.primary, fontWeight: '900' }]}>{day}</Text>
                  </View>
                );
              })}
            </View>
            <View style={styles.weeklySummary}>
              <Text style={styles.summaryTitle}>Tổng calo hôm nay</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryValue}>{todayConsumed}/{todayTarget} calo</Text>
                <TouchableOpacity style={styles.summaryLink} onPress={() => navigation.navigate('NutritionOverview')}>
                  <Text style={styles.summaryLinkText}>Xem tổng quan</Text>
                  <ChevronRight size={14} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#2D3748',
    fontSize: 20,
    fontWeight: 'bold',
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
  },
  weeklyCard: {
    padding: 16,
  },
  loaderContainer: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    color: '#4A5568',
    marginTop: 8,
    fontSize: 14,
  },
  barChartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 70,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.02)',
    paddingBottom: 12,
    marginBottom: 12,
  },
  barContainer: {
    alignItems: 'center',
    width: 30,
  },
  bar: {
    width: 8,
    borderRadius: 4,
    marginBottom: 8,
  },

  barLabel: {
    color: '#4A5568',
    fontSize: 12,
  },
  weeklySummary: {
    flexDirection: 'column',
  },
  summaryTitle: {
    color: '#4A5568',
    fontSize: 13,
    marginBottom: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryValue: {
    color: '#2D3748',
    fontSize: 16,
    fontWeight: 'bold',
  },
  summaryLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryLinkText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
});

export default WeeklyNutritionTracker;
