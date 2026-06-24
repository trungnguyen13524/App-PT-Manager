import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../../theme';

const MealLoggingSection = ({ mealsBreakdown }) => {
  const navigation = useNavigation();

  // Define the meals according to the exact backend enum and labels
  const meals = [
    { type: 'BREAKFAST', label: 'Bữa sáng', icon: '🍳' },
    { type: 'LUNCH', label: 'Bữa trưa', icon: '🍱' },
    { type: 'DINNER', label: 'Bữa tối', icon: '🥗' },
    { type: 'SNACK', label: 'Bữa phụ', icon: '🍎' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Bữa ăn hôm nay</Text>
      </View>
      <View style={styles.gridContainer}>
        {meals.map((meal) => {
          const calories = mealsBreakdown?.[meal.type] || 0;
          
          return (
            <TouchableOpacity 
              key={meal.type} 
              style={[styles.glassCard, styles.mealCard]}
              onPress={() => navigation.navigate('MealLog', { mealType: meal.type })}
            >
              <View style={styles.mealIconWrapper}>
                <Text style={styles.mealIcon}>{meal.icon}</Text>
              </View>
              <View style={styles.mealInfo}>
                <Text style={styles.mealName}>{meal.label}</Text>
                <Text style={styles.mealCalories}>{calories > 0 ? `${calories} kcal` : 'Chưa ghi nhận'}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    color: COLORS.secondary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  mealCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
  },
  mealIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(76, 122, 87, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  mealIcon: {
    fontSize: 22,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    color: COLORS.secondary,
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  mealCalories: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
});

export default MealLoggingSection;
