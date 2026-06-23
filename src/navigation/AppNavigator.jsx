import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuthStore } from '../store/authStore';

// Import các Stacks
import { AuthStack } from './stacks/AuthStack.jsx';
import { OnboardingStack } from './stacks/OnboardingStack.jsx';
import { StudentStack } from './stacks/StudentStack.jsx';
import { PTStack } from './stacks/PTStack.jsx';

export const AppNavigator = () => {
  // Lấy state trực tiếp từ Zustand
  const { isAuthenticated, user, isOnboardingComplete } = useAuthStore();

  /**
   * BẢO MẬT FRONTEND: 
   * Route Guard - Kiểm soát luồng theo Role và Trạng thái Đăng nhập.
   * 
   * Luồng:
   * 1. Chưa đăng nhập → AuthStack (Login/Register)
   * 2. Đã đăng nhập, chưa onboarding → OnboardingStack (Chọn Role → Onboarding/PT Verify)
   * 3. Đã đăng nhập, đã onboarding → Stack theo Role (Student/PT)
   */
  const renderRootStack = () => {
    // 1. Chưa đăng nhập -> Chỉ được thấy màn hình Đăng nhập/Đăng ký
    if (!isAuthenticated || !user) {
      return <AuthStack />;
    }

    // 2. Đã đăng nhập nhưng chưa hoàn thành onboarding -> Chọn Role + thu thập thông tin
    if (!isOnboardingComplete) {
      return <OnboardingStack />;
    }

    // 3. Đã đăng nhập VÀ đã onboarding -> Vào Stack theo Role
    const userRole = user.role ? user.role.toUpperCase() : 'USER'; // Fallback to USER if missing

    if (userRole === 'USER') {
      return <StudentStack />;
    }

    if (userRole === 'PT') {
      return <PTStack />;
    }

    // Fallback an toàn nếu role không xác định (nhưng đã xác thực)
    return <StudentStack />;
  };

  return (
    <NavigationContainer>
      {renderRootStack()}
    </NavigationContainer>
  );
};
