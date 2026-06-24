import React, { useState, useEffect, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  Animated,
  Easing
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { GraduationCap, Dumbbell } from 'lucide-react-native';
import { useAuthStore } from '../../../store/authStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import WaveBackground from '../../../components/common/WaveBackground';
import { COLORS } from '../../../theme';

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
      
      <View style={[styles.iconContainer, { borderColor: color, backgroundColor: `${color}15` }]}>
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

  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const translateYAnim = React.useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.exp),
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.exp),
      }),
    ]).start();
  }, []);

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
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <WaveBackground />
      
      <View style={styles.content}>
        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: translateYAnim }] }]}>
          <Text style={styles.title}>BẠN LÀ AI?</Text>
          <Text style={styles.subtitle}>Chọn vai trò để chúng tôi cá nhân hóa trải nghiệm cho bạn</Text>
        </Animated.View>

        <Animated.View style={[styles.cardsContainer, { opacity: fadeAnim, transform: [{ translateY: translateYAnim }] }]}>
          {/* Student Card */}
          <RoleCard
            title="Học viên"
            description="Theo dõi dinh dưỡng, luyện tập và nhận tư vấn từ chuyên gia"
            icon={GraduationCap}
            color={COLORS.primary}
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
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.secondary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
    fontWeight: '500',
  },
  cardsContainer: {
    width: '100%',
  },
  roleCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 28,
    padding: 28,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    overflow: 'hidden', // to contain the cardGlow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  roleTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.secondary,
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  roleDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
    paddingHorizontal: 10,
  },
});

export default RoleSelectionScreen;
