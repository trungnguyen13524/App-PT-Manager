import React, { useState, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { GraduationCap, Dumbbell } from 'lucide-react-native';
import Svg, { Defs, LinearGradient, Stop, Rect, Circle } from 'react-native-svg';
import { useAuthStore } from '../../../store/authStore';
import { SafeAreaView } from 'react-native-safe-area-context';

const AbstractBackground = memo(() => (
  <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
    <Svg width="100%" height="100%">
      <Defs>
        <LinearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#0F172A" />
          <Stop offset="100%" stopColor="#1E293B" />
        </LinearGradient>
        <LinearGradient id="circleGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#00FF66" stopOpacity="0.15" />
          <Stop offset="100%" stopColor="#00B3FF" stopOpacity="0.05" />
        </LinearGradient>
        <LinearGradient id="circleGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FF4D00" stopOpacity="0.15" />
          <Stop offset="100%" stopColor="#FF0080" stopOpacity="0.05" />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#bgGrad)" />
      
      {/* 3D-like glowing abstract floating circles */}
      <Circle cx="15%" cy="15%" r="140" fill="url(#circleGrad1)" />
      <Circle cx="90%" cy="80%" r="180" fill="url(#circleGrad2)" />
      <Circle cx="85%" cy="25%" r="90" fill="url(#circleGrad2)" />
      <Circle cx="20%" cy="85%" r="120" fill="url(#circleGrad1)" />
    </Svg>
  </View>
));

const RoleCard = ({ title, description, icon: Icon, color, onPress }) => {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      activeOpacity={0.9}
      style={[
        styles.roleCard,
        isPressed && { borderColor: color, transform: [{ scale: 0.98 }] },
        Platform.OS === 'ios' && isPressed && {
          shadowColor: color,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.6,
          shadowRadius: 15,
        }
      ]}
    >
      {/* Subtle inner glow/tint */}
      <View style={[styles.cardGlow, { backgroundColor: color, opacity: isPressed ? 0.08 : 0.03 }]} />
      
      <View style={[styles.iconContainer, { borderColor: color, backgroundColor: `${color}25` }]}>
        <Icon size={42} color={color} strokeWidth={2.5} />
      </View>
      <Text style={styles.roleTitle}>{title}</Text>
      <Text style={styles.roleDesc}>{description}</Text>
    </TouchableOpacity>
  );
};

const RoleSelectionScreen = () => {
  const navigation = useNavigation();
  const { setUserRole } = useAuthStore();

  const handleSelectRole = (role) => {
    setUserRole(role);

    if (role === 'USER') {
      navigation.navigate('Onboarding');
    } else if (role === 'PT') {
      navigation.navigate('PTVerification');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <AbstractBackground />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Bạn là ai?</Text>
          <Text style={styles.subtitle}>Chọn vai trò để chúng tôi cá nhân hóa trải nghiệm cho bạn</Text>
        </View>

        <View style={styles.cardsContainer}>
          {/* Student Card */}
          <RoleCard
            title="Học viên"
            description="Theo dõi dinh dưỡng, luyện tập và nhận tư vấn từ chuyên gia"
            icon={GraduationCap}
            color="#00FF66"
            onPress={() => handleSelectRole('USER')}
          />

          {/* PT Card */}
          <RoleCard
            title="Huấn luyện viên"
            description="Quản lý học viên, tạo khóa học và theo dõi thu nhập"
            icon={Dumbbell}
            color="#FF4D00"
            onPress={() => handleSelectRole('PT')}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // Fallback background
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: '#CBD5E1',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
    fontWeight: '500',
  },
  cardsContainer: {
    width: '100%',
  },
  roleCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 24,
    padding: 28,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    overflow: 'hidden', // to contain the cardGlow
  },
  cardGlow: {
    ...StyleSheet.absoluteFillObject,
  },
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    // Emulate 3D pop
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  roleTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  roleDesc: {
    fontSize: 14,
    color: '#CBD5E1',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
    paddingHorizontal: 10,
  },
});

export default RoleSelectionScreen;

