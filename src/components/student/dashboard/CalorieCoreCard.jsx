import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Share2 } from 'lucide-react-native';
import CalorieChart from '../../student/CalorieChart';
import { COLORS } from '../../../theme';

const CalorieCoreCard = ({ todayCalories, todayMacros, streakDays, onShareClick }) => {
  const targetCalories = todayCalories?.target || 2000;
  const consumedCalories = todayCalories?.consumed || 0;

  const targetProtein = todayMacros?.protein?.target || 0;
  const consumedProtein = todayMacros?.protein?.consumed || 0;
  
  const targetCarbs = todayMacros?.carbs?.target || 0;
  const consumedCarbs = todayMacros?.carbs?.consumed || 0;
  
  const targetFat = todayMacros?.fat?.target || 0;
  const consumedFat = todayMacros?.fat?.consumed || 0;

  return (
    <View style={[styles.glassCard, styles.calorieCard]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Text style={styles.cardTitle}>CALO TRONG NGÀY</Text>
        <TouchableOpacity onPress={onShareClick} style={styles.shareBtn}>
          <Share2 color="#2D3748" size={16} />
          <Text style={styles.shareText}>Khoe ngay</Text>
        </TouchableOpacity>
      </View>
      
      {/* Streak Badge */}
      {streakDays > 0 && (
        <View style={styles.streakBadge}>
          <Text style={styles.streakText}>🔥 {streakDays} ngày liên tiếp</Text>
        </View>
      )}

      <View style={styles.chartWrapper}>
        <CalorieChart current={consumedCalories} target={targetCalories} />
      </View>
    
      <View style={styles.macrosRow}>
        <View style={styles.macroItem}>
          <Text style={styles.macroLabel}>Carbs</Text>
          <Text style={[styles.macroValue, consumedCarbs > targetCarbs && { color: '#FF4D4D' }]}>{consumedCarbs}/{targetCarbs}g</Text>
          <View style={styles.macroTrack}>
            <View style={[
              styles.macroBar, 
              { 
                backgroundColor: consumedCarbs > targetCarbs ? COLORS.error : COLORS.secondary, 
                width: `${Math.min((consumedCarbs / (targetCarbs || 1)) * 100, 100)}%`, 
                shadowColor: consumedCarbs > targetCarbs ? COLORS.error : COLORS.secondary 
              }
            ]} />
          </View>
        </View>
        <View style={styles.macroItem}>
          <Text style={styles.macroLabel}>Protein</Text>
          <Text style={[styles.macroValue, consumedProtein > targetProtein && { color: '#FF4D4D' }]}>{consumedProtein}/{targetProtein}g</Text>
          <View style={styles.macroTrack}>
            <View style={[
              styles.macroBar, 
              { 
                backgroundColor: consumedProtein > targetProtein ? COLORS.error : COLORS.primary, 
                width: `${Math.min((consumedProtein / (targetProtein || 1)) * 100, 100)}%`, 
                shadowColor: consumedProtein > targetProtein ? COLORS.error : COLORS.primary 
              }
            ]} />
          </View>
        </View>
        <View style={styles.macroItem}>
          <Text style={styles.macroLabel}>Fat</Text>
          <Text style={[styles.macroValue, consumedFat > targetFat && { color: '#FF4D4D' }]}>{consumedFat}/{targetFat}g</Text>
          <View style={styles.macroTrack}>
            <View style={[
              styles.macroBar, 
              { 
                backgroundColor: consumedFat > targetFat ? COLORS.error : COLORS.accent, 
                width: `${Math.min((consumedFat / (targetFat || 1)) * 100, 100)}%`, 
                shadowColor: consumedFat > targetFat ? COLORS.error : COLORS.accent 
              }
            ]} />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 24,
    padding: 20,
    marginHorizontal: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
  },
  calorieCard: {
    marginTop: 0,
    marginBottom: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  cardTitle: {
    color: '#2D3748',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  shareText: {
    color: '#2D3748',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  streakBadge: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 77, 0, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 0, 0.3)',
  },
  streakText: {
    color: '#FF4D00',
    fontSize: 12,
    fontWeight: 'bold',
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 180,
    marginVertical: 4,
  },
  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.04)',
  },
  macroItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  macroLabel: {
    color: '#4A5568',
    fontSize: 12,
    marginBottom: 4,
  },
  macroValue: {
    color: '#2D3748',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  macroTrack: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  macroBar: {
    height: '100%',
    borderRadius: 3,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 3,
  },
});

export default CalorieCoreCard;
