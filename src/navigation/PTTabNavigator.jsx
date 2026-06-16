import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Platform } from 'react-native';
import { Home, BookOpen, Users, User as UserIcon } from 'lucide-react-native';
import { COLORS } from '../theme';

import PTDashboardScreen from '../features/pt-tools/screens/PTDashboardScreen';
import CourseManagementScreen from '../features/pt-tools/screens/CourseManagementScreen';
import PTStudentListScreen from '../features/pt-tools/screens/PTStudentListScreen';
import PTProfileScreen from '../features/pt-tools/screens/PTProfileScreen';

const Tab = createBottomTabNavigator();

const PTTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#1E293B',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          borderTopWidth: 1,
          borderTopColor: 'rgba(255,255,255,0.1)',
          height: Platform.OS === 'ios' ? 90 : 70,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 8,
          ...styles.shadow,
        },
        tabBarActiveTintColor: '#3498DB',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.4)',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen 
        name="Trang chủ" 
        component={PTDashboardScreen} 
        options={{
          tabBarIcon: ({ color, focused }) => <Home size={22} color={color} strokeWidth={focused ? 2.5 : 2} fill={focused ? color : "transparent"} />,
        }}
      />
      <Tab.Screen 
        name="Khóa học" 
        component={CourseManagementScreen} 
        options={{
          tabBarIcon: ({ color, focused }) => <BookOpen size={22} color={color} strokeWidth={focused ? 2.5 : 2} fill={focused ? color : "transparent"} />,
        }}
      />
      <Tab.Screen 
        name="Học viên" 
        component={PTStudentListScreen}
        options={{
          tabBarIcon: ({ color, focused }) => <Users size={22} color={color} strokeWidth={focused ? 2.5 : 2} fill={focused ? color : "transparent"} />,
        }}
      />
      <Tab.Screen 
        name="Cá nhân" 
        component={PTProfileScreen}
        options={{
          tabBarIcon: ({ color, focused }) => <UserIcon size={22} color={color} strokeWidth={focused ? 2.5 : 2} fill={focused ? color : "transparent"} />,
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 8,
  },
});

export default PTTabNavigator;
