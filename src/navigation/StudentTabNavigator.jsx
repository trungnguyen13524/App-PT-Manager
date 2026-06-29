import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { 
  View, 
  TouchableOpacity, 
  StyleSheet, 
  Platform, 
  Text, 
  Modal,
  Pressable,
  Animated
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  Home, 
  Compass, 
  Camera, 
  Users, 
  Settings, 
  X, 
  UtensilsCrossed,
  Dumbbell,
  Activity,
  Plus
} from 'lucide-react-native';
import { COLORS, SPACING } from '../theme';

import StudentDashboardScreen from '../features/nutrition/screens/StudentDashboardScreen';
import DiscoverScreen from '../features/content/screens/DiscoverScreen';
import PTConnectScreen from '../features/content/screens/PTConnectScreen';
import ProfileScreen from '../features/users/screens/ProfileScreen';

// Đã xóa PTConnectPlaceholder ở đây để sửa lỗi
// Placeholder screens
const PlaceholderScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
    <View />
  </View>
);

const Tab = createBottomTabNavigator();

// ===== FAB Menu Component =====
const FABMenu = ({ isOpen, onClose, onSelect }) => {
  if (!isOpen) return null;

  const options = [
    { key: 'menu', label: 'Thực đơn\nmón ăn', icon: UtensilsCrossed },
    { key: 'camera', label: 'Chụp ảnh', icon: Camera },
    { key: 'exercise', label: 'Thể dục', icon: Dumbbell },
    { key: 'metrics', label: 'Chỉ số\ncơ thể', icon: Activity },
  ];

  return (
    <Modal transparent visible={isOpen} animationType="fade">
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.fabMenuContainer}>
          <View style={styles.fabMenuRow}>
            {options.map((item) => {
              const IconComponent = item.icon;
              return (
                <TouchableOpacity 
                  key={item.key} 
                  style={styles.fabMenuItem}
                  onPress={() => onSelect(item.key)}
                  activeOpacity={0.7}
                >
                  <View style={styles.fabMenuIconBox}>
                    <IconComponent size={24} color="#2D3748" strokeWidth={2} />
                  </View>
                  <Text style={styles.fabMenuLabel}>{item.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Pressable>

      {/* Close FAB button */}
      <View style={styles.closeFabWrapper}>
        <TouchableOpacity style={styles.closeFabButton} onPress={onClose} activeOpacity={0.8}>
          <X size={26} color="#0A0B10" strokeWidth={3} />
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

// ===== Custom Tab Bar Button =====
const CustomTabBarButton = ({ onPress }) => (
  <TouchableOpacity
    style={styles.fabContainer}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View style={styles.fabButton}>
      <Plus size={28} color="#0A0B10" strokeWidth={3} />
    </View>
  </TouchableOpacity>
);


// ===== Main Navigator =====
const StudentTabNavigator = () => {
  const [fabOpen, setFabOpen] = useState(false);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const handleFabSelect = (key) => {
    setFabOpen(false);
    if (key === 'exercise') {
      navigation.navigate('WorkoutList');
    } else if (key === 'menu') {
      navigation.navigate('MealLog');
    } else if (key === 'camera') {
      navigation.navigate('FoodScan');
    } else if (key === 'metrics') {
      navigation.navigate('BodyMetrics');
    } else {
      console.log('Selected:', key);
    }
  };

  return (
    <>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: true,
          tabBarStyle: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: COLORS.surface,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            borderTopWidth: 1,
            borderTopColor: 'rgba(0, 0, 0, 0.05)',
            height: (Platform.OS === 'ios' ? 90 : 70) + (Platform.OS === 'android' ? insets.bottom : 0),
            paddingBottom: (Platform.OS === 'ios' ? 24 : 8) + (Platform.OS === 'android' ? insets.bottom : 0),
            paddingTop: 8,
            ...styles.shadow,
          },
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textLight,
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
          },
        }}
      >
        <Tab.Screen 
          name="Trang chủ" 
          component={StudentDashboardScreen} 
          options={{
            tabBarIcon: ({ color, focused }) => <Home size={22} color={color} strokeWidth={focused ? 2.5 : 2} fill={focused ? color : "transparent"} />,
          }}
        />
        <Tab.Screen 
          name="Khám Phá" 
          component={DiscoverScreen} 
          options={{
            tabBarIcon: ({ color, focused }) => <Compass size={22} color={color} strokeWidth={focused ? 2.5 : 2} fill={focused ? color : "transparent"} />,
          }}
        />
        <Tab.Screen 
          name="Menu" 
          component={PlaceholderScreen}
          options={{
            tabBarButton: () => <CustomTabBarButton onPress={() => setFabOpen(true)} />,
            tabBarLabel: () => null,
          }}
        />
        <Tab.Screen 
          name="Khóa học" 
          component={PTConnectScreen} 
          options={{
            tabBarIcon: ({ color, focused }) => <Users size={22} color={color} strokeWidth={focused ? 2.5 : 2} fill={focused ? color : "transparent"} />,
          }}
        />
        <Tab.Screen 
          name="Cài đặt" 
          component={ProfileScreen}
          options={{
            tabBarIcon: ({ color, focused }) => <Settings size={22} color={color} strokeWidth={focused ? 2.5 : 2} />,
          }}
        />
      </Tab.Navigator>

      {/* FAB Popup Menu */}
      <FABMenu 
        isOpen={fabOpen} 
        onClose={() => setFabOpen(false)} 
        onSelect={handleFabSelect} 
      />
    </>
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
  // ===== FAB Button =====
  fabContainer: {
    top: -28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#556B2F',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#556B2F',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  // ===== FAB Menu Popup =====
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  fabMenuContainer: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 130 : 110,
  },
  fabMenuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  fabMenuItem: {
    alignItems: 'center',
    flex: 1,
  },
  fabMenuIconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  fabMenuLabel: {
    fontSize: 11,
    color: COLORS.text,
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 14,
  },
  // ===== Close FAB =====
  closeFabWrapper: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 50 : 30,
    alignSelf: 'center',
  },
  closeFabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#556B2F',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#556B2F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
});

export default StudentTabNavigator;
