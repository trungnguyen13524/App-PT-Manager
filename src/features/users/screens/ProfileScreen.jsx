import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
import { useDialogStore } from '../../../store/dialogStore';
import { AbstractBackground, GlassCard } from '../../../components/common';
import ProUpgradeBanner from '../../../components/student/dashboard/ProUpgradeBanner';

import * as ImagePicker from 'expo-image-picker';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuthStore();
  const { profile, metrics: storeMetrics, fetchProfile, updateAvatar, isLoading } = useUserStore();
  
  React.useEffect(() => {
    fetchProfile();
  }, []);

  const metrics = storeMetrics || user?.metrics || {};
  const displayUser = profile || user;

  const handleLogout = () => {
    useDialogStore.getState().showDialog({
      title: 'Đăng xuất',
      message: 'Bạn có chắc chắn muốn đăng xuất không?',
      type: 'warning',
      buttons: [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Đăng xuất', 
          style: 'destructive',
          onPress: async () => {
            await logout();
          }
        },
      ]
    });
  };

  const handleEditAvatar = async () => {
    if (isLoading) return;
    
    // Yêu cầu quyền truy cập thư viện
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      useDialogStore.getState().showDialog({
        title: 'Yêu cầu quyền',
        message: 'Bạn cần cấp quyền truy cập ảnh để đổi Avatar.',
        type: 'warning'
      });
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!pickerResult.canceled && pickerResult.assets?.length > 0) {
      const asset = pickerResult.assets[0];
      const uri = asset.uri;
      
      const uriParts = uri.split('.');
      const fileType = uriParts[uriParts.length - 1].toLowerCase();
      const mimeType = (fileType === 'jpg' || fileType === 'jpeg') ? 'image/jpeg' 
                     : (fileType === 'png') ? 'image/png' 
                     : 'image/webp';
      const fileName = `avatar_${Date.now()}.${fileType}`;
      
      const res = await updateAvatar(uri, mimeType, fileName);
      if (res.success) {
        useDialogStore.getState().showDialog({
          title: 'Thành công',
          message: 'Đã cập nhật ảnh đại diện thành công!',
          type: 'success'
        });
      } else {
        useDialogStore.getState().showDialog({
          title: 'Lỗi upload',
          message: res.error || 'Cập nhật thất bại.',
          type: 'error'
        });
      }
    }
  };

  const MenuOption = ({ icon: Icon, title, subtitle, onPress, color = '#2D3748' }) => (
    <TouchableOpacity style={styles.menuOption} onPress={onPress}>
      <View style={styles.menuOptionLeft}>
        <View style={styles.iconBox}>
          <Icon size={20} color={COLORS.primary} />
        </View>
        <View>
          <Text style={[styles.menuOptionTitle, { color }]}>{title}</Text>
          {subtitle ? <Text style={styles.menuOptionSubtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      <ChevronRight size={20} color={COLORS.textLight} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <AbstractBackground />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Image 
              source={{ uri: displayUser?.avatarUrl || 'https://i.pravatar.cc/150' }} 
              style={styles.avatar} 
            />
            <TouchableOpacity style={styles.editAvatarBtn} onPress={handleEditAvatar} disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <Settings size={14} color="#000" />
              )}
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

        {displayUser?.role === 'USER' ? (
          <View style={{ marginTop: 10 }}>
            <ProUpgradeBanner tier={displayUser?.tier} />
          </View>
        ) : null}

        {/* Stats Row (Only for Students) */}
        {displayUser?.role === 'USER' ? (
          <GlassCard style={styles.statsCard}>
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
          </GlassCard>
        ) : null}

        {/* Menu Groups */}
        <View style={styles.menuContainer}>
          <Text style={styles.menuGroupTitle}>Tài khoản</Text>
          <GlassCard style={styles.menuCard}>
            <MenuOption 
              icon={User} 
              title="Thông tin cá nhân" 
              subtitle="Tên, Số điện thoại"
              onPress={() => navigation.navigate('EditProfile')} 
            />
            <MenuOption 
              icon={CreditCard} 
              title="Gói hội viên" 
              subtitle={displayUser?.tier === 'PRO' ? 'Bạn đang dùng bản PRO' : 'Nâng cấp lên PRO'}
              onPress={() => navigation.navigate('Pricing')} 
            />
          </GlassCard>

          <Text style={styles.menuGroupTitle}>Ứng dụng</Text>
          <GlassCard style={styles.menuCard}>
            <MenuOption 
              icon={Settings} 
              title="Cài đặt thông báo" 
              onPress={() => navigation.navigate('NotificationSettings')} 
            />
            <MenuOption 
              icon={Info} 
              title="Trung tâm hỗ trợ" 
              onPress={() => {}} 
            />
          </GlassCard>

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
            <LogOut size={20} color="#EF4444" />
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
  container: { 
    flex: 1, 
    backgroundColor: '#FAFAFA' // Light fallback
  },
  scrollContent: {
    paddingTop: Platform.OS === 'android' ? 40 : 20, // Add proper safe area padding for Android/clipped avatars
  },
  header: { 
    alignItems: 'center', 
    paddingVertical: 20,
  },
  avatarContainer: { 
    position: 'relative', 
    marginBottom: 16 
  },
  avatar: { 
    width: 110, 
    height: 110, 
    borderRadius: 55, 
    borderWidth: 3, 
    borderColor: COLORS.primary 
  },
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
    borderColor: '#2D3748',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5
  },
  name: { 
    ...TYPOGRAPHY.h2, 
    color: '#1A202C',
    fontWeight: '900'
  },
  email: { 
    fontSize: 14, 
    color: '#4A5568', 
    marginTop: 4,
    fontWeight: '600'
  },
  badgeContainer: { 
    marginTop: 12 
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(85, 107, 47, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },
  tierText: { 
    fontSize: 12, 
    fontWeight: '700', 
    color: COLORS.primary, 
    marginLeft: 6,
    textTransform: 'uppercase'
  },
  
  statsCard: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
    paddingVertical: 20,
  },
  statBox: { 
    flex: 1, 
    alignItems: 'center' 
  },
  statDivider: { 
    width: 1, 
    height: '70%', 
    backgroundColor: 'rgba(0, 0, 0, 0.05)', 
    alignSelf: 'center' 
  },
  statLabel: { 
    fontSize: 12, 
    color: '#718096', 
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '700'
  },
  statValue: { 
    fontSize: 22, 
    fontWeight: '900', 
    color: '#2D4A33', 
    fontVariant: ['tabular-nums'] 
  },
  unit: { 
    fontSize: 12, 
    fontWeight: '700', 
    color: COLORS.primary 
  },

  menuContainer: { 
    paddingHorizontal: 20,
    paddingTop: 10
  },
  menuGroupTitle: { 
    fontSize: 14, 
    fontWeight: '900', 
    color: '#1A202C', 
    marginBottom: 12, 
    marginTop: 16, 
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  menuCard: { 
    padding: 8, 
    marginBottom: 10 
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  menuOptionLeft: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  iconBox: { 
    width: 44, 
    height: 44, 
    borderRadius: 14, 
    backgroundColor: 'rgba(85, 107, 47, 0.1)', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(85, 107, 47, 0.2)'
  },
  menuOptionTitle: { 
    fontSize: 16, 
    fontWeight: '800',
    color: '#1A202C'
  },
  menuOptionSubtitle: { 
    fontSize: 13, 
    color: '#718096', 
    marginTop: 4,
    fontWeight: '600'
  },
  
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginTop: 30,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 3
  },
  logoutText: { 
    color: '#EF4444', 
    fontSize: 16, 
    fontWeight: '900', 
    marginLeft: 10 
  },
  version: { 
    textAlign: 'center', 
    color: '#718096', 
    fontSize: 12, 
    marginTop: 30 
  }
});

export default ProfileScreen;
