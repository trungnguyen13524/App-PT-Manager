import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { GraduationCap, Dumbbell } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../../theme';
import { useAuthStore } from '../../../store/authStore';

const { width } = Dimensions.get('window');

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
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      <View style={styles.content}>
        <Text style={styles.title}>Bạn là ai?</Text>
        <Text style={styles.subtitle}>Chọn vai trò để chúng tôi cá nhân hóa trải nghiệm cho bạn</Text>

        <View style={styles.cardsContainer}>
          {/* Student Card */}
          <TouchableOpacity 
            style={styles.roleCard}
            onPress={() => handleSelectRole('USER')}
            activeOpacity={0.8}
          >
            <View style={[styles.iconContainer, { backgroundColor: COLORS.primaryLight }]}>
              <GraduationCap size={40} color={COLORS.primary} />
            </View>
            <Text style={styles.roleTitle}>Học viên</Text>
            <Text style={styles.roleDesc}>Theo dõi dinh dưỡng, luyện tập và nhận tư vấn từ chuyên gia</Text>
          </TouchableOpacity>

          {/* PT Card */}
          <TouchableOpacity 
            style={styles.roleCard}
            onPress={() => handleSelectRole('PT')}
            activeOpacity={0.8}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#FFF3E0' }]}>
              <Dumbbell size={40} color={COLORS.accent} />
            </View>
            <Text style={styles.roleTitle}>Huấn luyện viên</Text>
            <Text style={styles.roleDesc}>Quản lý học viên, tạo khóa học và theo dõi thu nhập</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: 'center',
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: COLORS.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 40,
    lineHeight: 22,
  },
  cardsContainer: {
    width: '100%',
  },
  roleCard: {
    backgroundColor: COLORS.background,
    borderRadius: SPACING.borderRadius.xl,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.divider,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  roleTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  roleDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default RoleSelectionScreen;
