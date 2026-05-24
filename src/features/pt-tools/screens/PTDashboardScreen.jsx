import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
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
import { COLORS, TYPOGRAPHY, SPACING } from '../../../theme';
import NutriCard from '../../../components/shared/NutriCard';
import { usePTStore } from '../../../store/ptStore';
import { useAuthStore } from '../../../store/authStore';

const { width } = Dimensions.get('window');

const PTDashboardScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { students, earnings, isLoading, fetchStudents, fetchEarnings } = usePTStore();

  useEffect(() => {
    fetchStudents();
    fetchEarnings();
  }, []);

  const StatCard = ({ title, value, icon, color, onPress }) => (
    <TouchableOpacity style={[styles.statCard, { backgroundColor: '#fff', borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 }]} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        {icon}
      </View>
      <View style={styles.statInfo}>
        <Text style={styles.statLabel}>{title}</Text>
        <Text style={styles.statValue}>{value}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
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
              source={{ uri: user?.avatar || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48' }} 
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
            icon={<Users size={20} color="#2ECC71" />} 
            color="#2ECC71"
          />
          <StatCard 
            title="Doanh thu" 
            value={`${(earnings.balance || 0).toLocaleString()}đ`} 
            icon={<DollarSign size={20} color="#F1C40F" />} 
            color="#F1C40F"
            onPress={() => navigation.navigate('PTEarnings')}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Lối tắt quản lý</Text>
        </View>
        
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('CourseManagement')}>
            <View style={[styles.actionIcon, { backgroundColor: '#3498DB20' }]}>
              <Plus size={24} color="#3498DB" />
            </View>
            <Text style={styles.actionLabel}>Tạo khóa học</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem}>
            <View style={[styles.actionIcon, { backgroundColor: '#9B59B620' }]}>
              <Search size={24} color="#9B59B6" />
            </View>
            <Text style={styles.actionLabel}>Tìm học viên</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem}>
            <View style={[styles.actionIcon, { backgroundColor: '#E67E2220' }]}>
              <BookOpen size={24} color="#E67E22" />
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
          <NutriCard style={styles.emptyCard}>
            <Text style={styles.emptyText}>Chưa có học viên nào đăng ký</Text>
          </NutriCard>
        ) : (
          students.slice(0, 3).map((student) => (
            <TouchableOpacity 
              key={student.id} 
              onPress={() => navigation.navigate('StudentDashboard', { isPTView: true, studentData: student })}
            >
              <NutriCard style={styles.studentCard}>
                <Image source={{ uri: student.avatar }} style={styles.studentAvatar} />
                <View style={styles.studentInfo}>
                  <Text style={styles.studentName}>{student.fullName}</Text>
                  <Text style={styles.studentGoal}>{student.goal || 'Tăng cơ giảm mỡ'}</Text>
                </View>
                <ChevronRight size={20} color={COLORS.textLight} />
              </NutriCard>
            </TouchableOpacity>
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
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
  statValue: { fontSize: 16, fontWeight: '800', color: COLORS.text },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: { ...TYPOGRAPHY.h3, color: COLORS.text },
  seeAll: { fontSize: 14, color: COLORS.primary, fontWeight: '600' },
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
  emptyCard: { padding: 30, alignItems: 'center', backgroundColor: COLORS.background },
  emptyText: { color: COLORS.textLight, fontSize: 14 }
});

export default PTDashboardScreen;
