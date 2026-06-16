import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from '../../features/users/screens/ProfileScreen';
import PTStudentDetailScreen from '../../features/pt-tools/screens/PTStudentDetailScreen';
import PricingScreen from '../../features/users/screens/PricingScreen';
import CheckoutScreen from '../../features/users/screens/CheckoutScreen';
import PTEarningsScreen from '../../features/pt-tools/screens/PTEarningsScreen';
import PTTabNavigator from '../PTTabNavigator';
import StudentDashboardScreen from '../../features/nutrition/screens/StudentDashboardScreen';
import PTVerificationScreen from '../../features/pt-tools/screens/PTVerificationScreen';
import EditProfileScreen from '../../features/users/screens/EditProfileScreen';
import NotificationSettingsScreen from '../../features/users/screens/NotificationSettingsScreen';

const Stack = createNativeStackNavigator();

export const PTStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PTMain" component={PTTabNavigator} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
      <Stack.Screen name="PTVerification" component={PTVerificationScreen} />
      <Stack.Screen name="StudentDetail" component={PTStudentDetailScreen} />
      <Stack.Screen name="StudentDashboard" component={StudentDashboardScreen} />
      <Stack.Screen name="Pricing" component={PricingScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="PTEarnings" component={PTEarningsScreen} />
    </Stack.Navigator>
  );
};
