import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const MealLoggingSection = ({ mealsBreakdown }) => {
  const navigation = useNavigation();

  // Define the meals according to the exact backend enum and labels
  const meals = [
    { type: 'BREAKFAST', label: 'Bữa sáng' },
    { type: 'LUNCH', label: 'Bữa trưa' },
    { type: 'DINNER', label: 'Bữa tối' },
    { type: 'SNACK', label: 'Bữa phụ' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Bữa ăn hôm nay</Text>
      </View>
      
      {meals.map((meal) => {
        const calories = mealsBreakdown?.[meal.type] || 0;
        
        return (
          <TouchableOpacity 
            key={meal.type} 
            style={[styles.glassCard, styles.mealRow]}
            onPress={() => navigation.navigate('MealLog', { mealType: meal.type })}
          >
            <View style={styles.mealInfo}>
              <Text style={styles.mealName}>{meal.label}</Text>
              <Text style={styles.mealCalories}>{calories > 0 ? `${calories} kcal` : 'Chưa ghi nhận'}</Text>
            </View>
            <ChevronRight size={20} color="#00FF66" />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    marginBottom: 120, // Add bottom padding for scrollview
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
  mealRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderRadius: 16,
    paddingVertical: 16,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  mealCalories: {
    color: '#94A3B8',
    fontSize: 13,
  },
});

export default MealLoggingSection;
