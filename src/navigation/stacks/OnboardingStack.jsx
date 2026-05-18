import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import RoleSelectionScreen from '../../features/auth/screens/RoleSelectionScreen';
import OnboardingSurveyScreen from '../../features/onboarding/screens/OnboardingSurveyScreen';
import PTVerificationScreen from '../../features/pt-tools/screens/PTVerificationScreen';

const Stack = createNativeStackNavigator();

export const OnboardingStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingSurveyScreen} />
      <Stack.Screen name="PTVerification" component={PTVerificationScreen} />
    </Stack.Navigator>
  );
};
