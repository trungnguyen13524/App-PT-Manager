import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert
} from 'react-native';
import { 
  User, 
  Settings, 
  LogOut, 
  ChevronRight, 
  Shield, 
  CreditCard, 
  Info,
  Scale,
  Target
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../../theme';
import { useAuthStore } from '../../../store/authStore';
import { useUserStore } from '../../../store/userStore';
import NutriCard from '../../../components/shared/NutriCard';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuthStore();
  const { profile, metrics: storeMetrics, fetchProfile } = useUserStore();
  
  React.useEffect(() => {
    fetchProfile();
  }, []);

  const metrics = storeMetrics || user?.metrics || {};
  const displayUser = profile || user;

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất không?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Đăng xuất', 
          style: 'destructive',
          onPress: async () => {
            await logout();
          }
        },
      ]
    );
  };

  const MenuOption = ({ icon: Icon, title, subtitle, onPress, color = COLORS.text }) => (
    <TouchableOpacity style={styles.menuOption} onPress={onPress}>
      <View style={styles.menuOptionLeft}>
        <View style={[styles.iconBox, { backgroundColor: COLORS.background }]}>
          <Icon size={22} color={color} />
        </View>
        <View>
          <Text style={[styles.menuOptionTitle, { color }]}>{title}</Text>
          {subtitle && <Text style={styles.menuOptionSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <ChevronRight size={20} color={COLORS.textLight} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Image 
              source={{ uri: displayUser?.avatarUrl || 'https://i.pravatar.cc/150' }} 
              style={styles.avatar} 
            />
            <TouchableOpacity style={styles.editAvatarBtn}>
              <Settings size={16} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.name}>{displayUser?.fullName || 'Người dùng Nutri'}</Text>
          <Text style={styles.email}>{displayUser?.email}</Text>
          
          <View style={styles.badgeContainer}>
            <View style={styles.tierBadge}>
              <Shield size={12} color={COLORS.primary} />
              <Text style={styles.tierText}>{displayUser?.tier || 'FREE'}</Text>
            </View>
          </View>
        </View>

        {/* Stats Row (Only for Students) */}
        {displayUser?.role === 'USER' && (
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Cân nặng</Text>
              <Text style={styles.statValue}>{metrics.weightKg || '--'} <Text style={styles.unit}>kg</Text></Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Chiều cao</Text>
              <Text style={styles.statValue}>{metrics.heightCm || '--'} <Text style={styles.unit}>cm</Text></Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Mục tiêu</Text>
              <Text style={styles.statValue}>{metrics.dailyCalorieTarget || '--'} <Text style={styles.unit}>kcal</Text></Text>
            </View>
          </View>
        )}

        {/* Menu Groups */}
        <View style={styles.menuContainer}>
          <Text style={styles.menuGroupTitle}>Tài khoản</Text>
          <NutriCard style={styles.menuCard}>
            <MenuOption 
              icon={User} 
              title="Thông tin cá nhân" 
              subtitle="Tên, Email, Ảnh đại diện"
              onPress={() => {}} 
            />
            <MenuOption 
              icon={CreditCard} 
              title="Gói hội viên" 
              subtitle={displayUser?.tier === 'PRO' ? 'Bạn đang dùng bản PRO' : 'Nâng cấp lên PRO'}
              onPress={() => navigation.navigate('Pricing')} 
            />
          </NutriCard>

          <Text style={styles.menuGroupTitle}>Ứng dụng</Text>
          <NutriCard style={styles.menuCard}>
            <MenuOption 
              icon={Settings} 
              title="Cài đặt thông báo" 
              onPress={() => {}} 
            />
            <MenuOption 
              icon={Info} 
              title="Trung tâm hỗ trợ" 
              onPress={() => {}} 
            />
          </NutriCard>

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <LogOut size={20} color={COLORS.error} />
            <Text style={styles.logoutText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>Phiên bản 1.0.0</Text>
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { alignItems: 'center', paddingVertical: 30, backgroundColor: COLORS.white },
  avatarContainer: { position: 'relative', marginBottom: 16 },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: COLORS.primaryLight },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff'
  },
  name: { ...TYPOGRAPHY.h2, color: COLORS.text },
  email: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  badgeContainer: { marginTop: 12 },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20
  },
  tierText: { fontSize: 12, fontWeight: '700', color: COLORS.primary, marginLeft: 6 },
  
  statsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingVertical: 20,
    marginTop: 10
  },
  statBox: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, height: '60%', backgroundColor: COLORS.divider, alignSelf: 'center' },
  statLabel: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  unit: { fontSize: 12, fontWeight: '400', color: COLORS.textLight },

  menuContainer: { padding: 20 },
  menuGroupTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textLight, marginBottom: 12, marginTop: 10, marginLeft: 4 },
  menuCard: { padding: 8, marginBottom: 10 },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  menuOptionLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  menuOptionTitle: { fontSize: 16, fontWeight: '600' },
  menuOptionSubtitle: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0F0',
    padding: 16,
    borderRadius: 16,
    marginTop: 20,
  },
  logoutText: { color: COLORS.error, fontSize: 16, fontWeight: '700', marginLeft: 8 },
  version: { textAlign: 'center', color: COLORS.textLight, fontSize: 12, marginTop: 20 }
});

export default ProfileScreen;
