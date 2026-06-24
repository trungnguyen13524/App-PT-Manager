import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { 
  Users, 
  BookOpen, 
  DollarSign, 
  ChevronRight, 
  Plus, 
  Search,
  Bell,
  Settings
} from 'lucide-react-native';
import Svg, { Defs, LinearGradient, Stop, Rect, Circle as SvgCircle } from 'react-native-svg';
import { COLORS, TYPOGRAPHY, SPACING } from '../../../theme';
import NutriCard from '../../../components/shared/NutriCard';
import { usePTStore } from '../../../store/ptStore';
import { useAuthStore } from '../../../store/authStore';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const AbstractBackground = React.memo(() => (
  <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
    <Svg width="100%" height="100%">
      <Defs>
        <LinearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={COLORS.background} />
          <Stop offset="100%" stopColor={COLORS.background} />
        </LinearGradient>
        <LinearGradient id="circleGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={COLORS.primary} stopOpacity="0.015" />
          <Stop offset="100%" stopColor={COLORS.secondary} stopOpacity="0.015" />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#bgGrad)" />
      <SvgCircle cx="15%" cy="10%" r="140" fill="url(#circleGrad1)" />
      <SvgCircle cx="90%" cy="40%" r="180" fill="url(#circleGrad1)" />
    </Svg>
  </View>
));

const PTDashboardScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { students, earnings, isLoading, verificationStatus, fetchVerificationStatus, fetchStudents, fetchEarnings } = usePTStore();

  useEffect(() => {
    fetchVerificationStatus().then(async (status) => {
      if (status === 'APPROVED') {
        // Force refresh token to ensure role is updated in JWT
        await useAuthStore.getState().syncProfileAndToken();
        fetchStudents();
        fetchEarnings();
      }
    });
  }, []);

  if (verificationStatus === 'PENDING_REVIEW' || verificationStatus === 'PENDING') {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ color: '#fff', marginTop: 20, fontSize: 16 }}>Đang chờ Admin duyệt hồ sơ PT...</Text>
      </SafeAreaView>
    );
  }

  if (verificationStatus === null) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  if (verificationStatus === 'NONE') {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
        <Text style={{ color: '#fff', marginBottom: 20, fontSize: 16 }}>Bạn chưa đăng ký làm Huấn luyện viên</Text>
        <TouchableOpacity 
          style={{ backgroundColor: COLORS.primary, padding: 12, borderRadius: 8 }} 
          onPress={() => navigation.navigate('PTVerification')}
        >
          <Text style={{ color: '#EADDCA', fontWeight: 'bold' }}>Đăng ký ngay</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const StatCard = ({ title, value, icon, color, onPress }) => (
    <TouchableOpacity style={[styles.glassCard, styles.statCard, { borderColor: color + '40' }]} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        {icon}
      </View>
      <View style={styles.statInfo}>
        <Text style={styles.statLabel}>{title}</Text>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <AbstractBackground />
      
      {/* Custom Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Chào Coach,</Text>
          <Text style={styles.name}>{user?.fullName || 'Huấn luyện viên'}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerBtn}>
            <Bell size={24} color={COLORS.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.navigate('Profile')}>
            <Image 
              source={{ uri: user?.avatarUrl || user?.avatar || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48' }} 
              style={styles.avatar} 
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Earnings & Stats Overview */}
        <View style={styles.statsRow}>
          <StatCard 
            title="Học viên" 
            value={students.length} 
            icon={<Users size={20} color={COLORS.primaryDark} />} 
            color={COLORS.primaryDark}
          />
          <StatCard 
            title="Doanh thu" 
            value={`${(earnings.balance || 0).toLocaleString()}đ`} 
            icon={<DollarSign size={20} color={COLORS.secondary} />} 
            color={COLORS.secondary}
            onPress={() => navigation.navigate('PTEarnings')}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Lối tắt quản lý</Text>
        </View>
        
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('CourseMeta')}>
            <View style={[styles.actionIcon, { backgroundColor: 'rgba(0,0,0,0.03)' }]}>
              <Plus size={24} color={COLORS.primaryDark} />
            </View>
            <Text style={styles.actionLabel}>Tạo khóa học</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem}>
            <View style={[styles.actionIcon, { backgroundColor: 'rgba(0,0,0,0.03)' }]}>
              <Search size={24} color={COLORS.secondary} />
            </View>
            <Text style={styles.actionLabel}>Tìm học viên</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem}>
            <View style={[styles.actionIcon, { backgroundColor: 'rgba(0,0,0,0.03)' }]}>
              <BookOpen size={24} color={COLORS.text} />
            </View>
            <Text style={styles.actionLabel}>Thư viện BT</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Students */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Học viên mới nhất</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>Tất cả</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <ActivityIndicator color={COLORS.primary} style={{ marginTop: 20 }} />
        ) : students.length === 0 ? (
          <View style={[styles.glassCard, styles.emptyCard]}>
            <Text style={styles.emptyText}>Chưa có học viên nào đăng ký</Text>
          </View>
        ) : (
          students.slice(0, 3).map((student) => (
            <TouchableOpacity 
              key={student.id} 
              onPress={() => navigation.navigate('StudentDashboard', { isPTView: true, studentData: student })}
            >
              <View style={[styles.glassCard, styles.studentCard]}>
                <Image source={{ uri: student.avatar || 'https://i.pravatar.cc/150' }} style={styles.studentAvatar} />
                <View style={styles.studentInfo}>
                  <Text style={styles.studentName}>{student.fullName}</Text>
                  <Text style={styles.studentGoal}>{(typeof student.goal === 'object' && student.goal !== null) ? student.goal.name : (student.goal || 'Tăng cơ giảm mỡ')}</Text>
                </View>
                <ChevronRight size={20} color={COLORS.textLight} />
              </View>
            </TouchableOpacity>
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  glassCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
  },
  greeting: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '500' },
  name: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  headerBtn: { marginLeft: 15 },
  avatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: COLORS.primaryLight },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  statCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statInfo: { flex: 1 },
  statLabel: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 2 },
  statValue: { fontSize: 16, fontWeight: '800', color: COLORS.text, fontVariant: ['tabular-nums'] },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: { ...TYPOGRAPHY.h3, color: '#2D3748' },
  seeAll: { fontSize: 14, color: '#3498DB', fontWeight: '600' },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  actionItem: { alignItems: 'center', width: '30%' },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  actionLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 12,
  },
  studentAvatar: { width: 50, height: 50, borderRadius: 25, marginRight: 15 },
  studentInfo: { flex: 1 },
  studentName: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  studentGoal: { fontSize: 12, color: COLORS.textSecondary },
  emptyCard: { padding: 30, alignItems: 'center', marginHorizontal: 20 },
  emptyText: { color: COLORS.textSecondary, fontSize: 14 }
});

export default PTDashboardScreen;
