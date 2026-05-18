import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Users, CheckSquare, DollarSign, LayoutDashboard, LogOut } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../../theme';
import { useAuthStore } from '../../../store/authStore';
import adminService from '../../../api/services/admin.service';

const AdminDashboardScreen = () => {
  const { logout, user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // const response = await adminService.getDashboardStats();
      // setStats(response.data);
      
      // Giả lập data
      setStats({
        totalUsers: 24580,
        activePtCount: 142,
        pendingPtVerifications: 8,
        pendingWithdrawals: { count: 12, totalVnd: 65000000 },
        revenue30d: { grossVnd: 825000000, platformFeeVnd: 82500000 },
        newSignups7d: 1240,
        pendingContentReviews: 5
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  if (isLoading || !stats) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <LayoutDashboard size={28} color={COLORS.primary} />
          <View style={styles.headerTitles}>
            <Text style={styles.greeting}>Admin Panel</Text>
            <Text style={styles.name}>Xin chào, {user?.fullName || 'Quản trị viên'}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <LogOut size={24} color={COLORS.danger} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        
        {/* Doanh thu */}
        <View style={styles.revenueCard}>
          <View style={styles.revenueHeader}>
            <DollarSign size={24} color={COLORS.white} />
            <Text style={styles.revenueTitle}>Doanh thu nền tảng (30 ngày)</Text>
          </View>
          <Text style={styles.revenueAmount}>
            {stats.revenue30d.platformFeeVnd.toLocaleString('vi-VN')} đ
          </Text>
          <Text style={styles.grossRevenue}>
            Tổng GD: {stats.revenue30d.grossVnd.toLocaleString('vi-VN')} đ
          </Text>
        </View>

        {/* Tổng quan người dùng */}
        <View style={styles.sectionHeader}>
          <Users size={20} color={COLORS.text} />
          <Text style={styles.sectionTitle}>Cộng đồng</Text>
        </View>
        
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats.totalUsers.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Tổng Học viên</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats.activePtCount}</Text>
            <Text style={styles.statLabel}>Huấn luyện viên</Text>
          </View>
        </View>

        {/* Việc cần duyệt (Pending Tasks) */}
        <View style={styles.sectionHeader}>
          <CheckSquare size={20} color={COLORS.text} />
          <Text style={styles.sectionTitle}>Cần xử lý</Text>
        </View>

        <TouchableOpacity style={styles.taskCard}>
          <View style={styles.taskInfo}>
            <Text style={styles.taskTitle}>Duyệt hồ sơ PT</Text>
            <Text style={styles.taskDesc}>{stats.pendingPtVerifications} hồ sơ đang chờ</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{stats.pendingPtVerifications}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.taskCard}>
          <View style={styles.taskInfo}>
            <Text style={styles.taskTitle}>Duyệt rút tiền (PT)</Text>
            <Text style={styles.taskDesc}>
              {stats.pendingWithdrawals.count} yêu cầu ({stats.pendingWithdrawals.totalVnd.toLocaleString('vi-VN')} đ)
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: COLORS.warning }]}>
            <Text style={[styles.badgeText, { color: COLORS.white }]}>{stats.pendingWithdrawals.count}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.taskCard}>
          <View style={styles.taskInfo}>
            <Text style={styles.taskTitle}>Duyệt khóa học / Nội dung</Text>
            <Text style={styles.taskDesc}>{stats.pendingContentReviews} mục chờ duyệt</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{stats.pendingContentReviews}</Text>
          </View>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: 50,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.white,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitles: {
    marginLeft: 12,
  },
  greeting: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  name: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
  },
  logoutButton: {
    padding: 8,
  },
  content: {
    padding: SPACING.lg,
  },
  revenueCard: {
    backgroundColor: COLORS.primary,
    borderRadius: SPACING.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  revenueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  revenueTitle: {
    color: COLORS.white,
    opacity: 0.9,
    fontSize: 16,
    marginLeft: 8,
  },
  revenueAmount: {
    color: COLORS.white,
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  grossRevenue: {
    color: COLORS.white,
    opacity: 0.8,
    fontSize: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
    marginLeft: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    ...TYPOGRAPHY.h2,
    color: COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: SPACING.md,
    marginBottom: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    ...TYPOGRAPHY.body1,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  taskDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  badge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  }
});

export default AdminDashboardScreen;
