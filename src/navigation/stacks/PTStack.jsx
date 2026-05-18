import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PTDashboardScreen from '../../features/pt-tools/screens/PTDashboardScreen';
import ProfileScreen from '../../features/users/screens/ProfileScreen';
import PTStudentDetailScreen from '../../features/pt-tools/screens/PTStudentDetailScreen';
import PricingScreen from '../../features/users/screens/PricingScreen';
import CheckoutScreen from '../../features/users/screens/CheckoutScreen';
import CourseManagementScreen from '../../features/pt-tools/screens/CourseManagementScreen';
import PTEarningsScreen from '../../features/pt-tools/screens/PTEarningsScreen';

const Stack = createNativeStackNavigator();

export const PTStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PTDashboard" component={PTDashboardScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="StudentDetail" component={PTStudentDetailScreen} />
      <Stack.Screen name="Pricing" component={PricingScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="CourseManagement" component={CourseManagementScreen} />
      <Stack.Screen name="PTEarnings" component={PTEarningsScreen} />
    </Stack.Navigator>
  );
};
