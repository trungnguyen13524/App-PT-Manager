import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

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
            <ActivityIndicator size="small" color="#00FF66" />
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
                    barHeight = Math.min(80, Math.max(8, ratio * 80));
                  }
                }

                return (
                  <View key={day} style={styles.barContainer}>
                    <View style={[
                      styles.bar, 
                      { 
                        height: barHeight, 
                        backgroundColor: isToday ? '#00FF66' : 'rgba(255,255,255,0.1)' 
                      },
                      isToday && styles.glowShadow
                    ]} />
                    <Text style={[styles.barLabel, isToday && { color: '#00FF66', fontWeight: '900' }]}>{day}</Text>
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
                  <ChevronRight size={14} color="#00FF66" />
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
    marginBottom: 32,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  glassCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  weeklyCard: {
    padding: 20,
  },
  loaderContainer: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    color: '#94A3B8',
    marginTop: 8,
    fontSize: 14,
  },
  barChartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 100,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    paddingBottom: 16,
    marginBottom: 16,
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
  glowShadow: {
    shadowColor: '#00FF66',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 4,
  },
  barLabel: {
    color: '#94A3B8',
    fontSize: 12,
  },
  weeklySummary: {
    flexDirection: 'column',
  },
  summaryTitle: {
    color: '#94A3B8',
    fontSize: 13,
    marginBottom: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryValue: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  summaryLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryLinkText: {
    color: '#00FF66',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
});

export default WeeklyNutritionTracker;
