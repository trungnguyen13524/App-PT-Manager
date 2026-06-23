import React, { useEffect } from 'react';
import { View, ActivityIndicator, StatusBar } from 'react-native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { useAuthStore } from './src/store/authStore';
import { COLORS } from './src/theme';
import CustomDialog from './src/components/common/CustomDialog';
import GlobalRewardToast from './src/components/shared/GlobalRewardToast';

export default function App() {
  const { initialize, isInitialized } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  if (!isInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <AppNavigator />
      <CustomDialog />
      <GlobalRewardToast />
    </>
  );
}
