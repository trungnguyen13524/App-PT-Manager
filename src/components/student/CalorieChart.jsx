import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { COLORS } from '../../theme';

const { width } = Dimensions.get('window');
const SIZE = width * 0.38;
const STROKE_WIDTH = 14;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const CalorieChart = ({ current = 0, target = 2000 }) => {
  const percentage = Math.min((current / target) * 100, 100);
  const strokeDashoffset = CIRCUMFERENCE - (percentage / 100) * CIRCUMFERENCE;

  return (
    <View style={styles.container}>
      <Svg width={SIZE} height={SIZE}>
        <Defs>
          <LinearGradient id="energyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={current > target ? COLORS.error : COLORS.primary} stopOpacity="1" />
            <Stop offset="100%" stopColor={current > target ? '#FF0000' : COLORS.secondary} stopOpacity="1" />
          </LinearGradient>
        </Defs>
        {/* Background Circle */}
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke="rgba(0, 0, 0, 0.02)"
          strokeWidth={STROKE_WIDTH}
          fill="none"
        />
        {/* Progress Circle */}
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke="url(#energyGrad)"
          strokeWidth={STROKE_WIDTH}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
        />
      </Svg>
      
      <View style={styles.textContainer}>
        {current > target && (
          <Text style={{ color: '#FF4D4D', fontSize: 12, fontWeight: 'bold', marginBottom: 2 }}>
            ⚠️ Vượt mục tiêu
          </Text>
        )}
        <Text style={[styles.currentText, current > target && { color: COLORS.error }]}>{current.toLocaleString()}</Text>
        <Text style={styles.targetText}>/ {target.toLocaleString()} kcal</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  textContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#2D3748',
  },
  targetText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#9CA3AF',
    marginTop: 4,
  },
});

export default CalorieChart;
