import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import StudentTabNavigator from '../StudentTabNavigator';
import ExerciseLibraryScreen from '../../features/workout/screens/ExerciseLibraryScreen';
import MealLogScreen from '../../features/nutrition/screens/MealLogScreen';
import FoodScanScreen from '../../features/nutrition/screens/FoodScanScreen';
import MealDetailScreen from '../../features/nutrition/screens/MealDetailScreen';
import ScanResultScreen from '../../features/nutrition/screens/ScanResultScreen';
import WorkoutListScreen from '../../features/workout/screens/WorkoutListScreen';
import WorkoutDetailScreen from '../../features/workout/screens/WorkoutDetailScreen';
import ExerciseVideoScreen from '../../features/workout/screens/ExerciseVideoScreen';
import ActiveWorkoutScreen from '../../features/workout/screens/ActiveWorkoutScreen';
import PricingScreen from '../../features/users/screens/PricingScreen';
import CheckoutScreen from '../../features/users/screens/CheckoutScreen';
import TransactionHistoryScreen from '../../features/payment/screens/TransactionHistoryScreen';

const Stack = createNativeStackNavigator();

export const StudentStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTab" component={StudentTabNavigator} />
      <Stack.Screen name="ExerciseLibrary" component={ExerciseLibraryScreen} />
      <Stack.Screen name="MealLog" component={MealLogScreen} />
      <Stack.Screen name="FoodScan" component={FoodScanScreen} />
      <Stack.Screen name="MealDetail" component={MealDetailScreen} />
      <Stack.Screen name="ScanResult" component={ScanResultScreen} />
      <Stack.Screen name="WorkoutList" component={WorkoutListScreen} />
      <Stack.Screen name="WorkoutDetail" component={WorkoutDetailScreen} />
      <Stack.Screen name="ExerciseVideo" component={ExerciseVideoScreen} />
      <Stack.Screen name="ActiveWorkout" component={ActiveWorkoutScreen} />
      <Stack.Screen name="Pricing" component={PricingScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} />
    </Stack.Navigator>
  );
};
