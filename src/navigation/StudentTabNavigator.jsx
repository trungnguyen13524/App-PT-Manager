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
                    <IconComponent size={24} color={COLORS.text} />
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
          <X size={26} color="#fff" />
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
      <Plus size={28} color="#fff" strokeWidth={2.5} />
    </View>
  </TouchableOpacity>
);


// ===== Main Navigator =====
const StudentTabNavigator = () => {
  const [fabOpen, setFabOpen] = useState(false);
  const navigation = useNavigation();

  const handleFabSelect = (key) => {
    setFabOpen(false);
    if (key === 'exercise') {
      navigation.navigate('ExerciseLibrary');
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
            backgroundColor: '#ffffff',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            height: Platform.OS === 'ios' ? 90 : 70,
            paddingBottom: Platform.OS === 'ios' ? 24 : 8,
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
            tabBarIcon: ({ color }) => <Home size={22} color={color} />,
          }}
        />
        <Tab.Screen 
          name="Khám Phá" 
          component={DiscoverScreen} 
          options={{
            tabBarIcon: ({ color, size }) => <Compass color={color} size={size} />,
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
          name="PT Connect" 
          component={PTConnectScreen} 
          options={{
            tabBarIcon: ({ color }) => <Users size={22} color={color} />,
          }}
        />
        <Tab.Screen 
          name="Cài đặt" 
          component={ProfileScreen}
          options={{
            tabBarIcon: ({ color }) => <Settings size={22} color={color} />,
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
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
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
    backgroundColor: COLORS.white,
    borderRadius: SPACING.borderRadius.xl,
    paddingVertical: 20,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
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
  },
  fabMenuLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
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
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default StudentTabNavigator;
