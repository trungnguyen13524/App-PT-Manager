import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar
} from 'react-native';
import { 
  User, 
  BookOpen, 
  CreditCard, 
  Clock, 
  Bell, 
  HelpCircle, 
  ShieldCheck, 
  LogOut, 
  ChevronRight,
  ArrowLeft
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../../theme';
import { useAuthStore } from '../../../store/authStore';
import NutriCard from '../../../components/shared/NutriCard';

const PTProfileScreen = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuthStore();
  
  const displayUser = user || {};

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

  const MenuOption = ({ icon: Icon, title, onPress, iconBgColor, iconColor }) => (
    <TouchableOpacity style={styles.menuOption} onPress={onPress}>
      <View style={styles.menuOptionLeft}>
        <View style={[styles.iconBox, { backgroundColor: iconBgColor }]}>
          <Icon size={20} color={iconColor} />
        </View>
        <Text style={styles.menuOptionTitle}>{title}</Text>
      </View>
      <ChevronRight size={20} color={COLORS.textLight} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* Header Curve */}
        <View style={styles.headerContainer}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <ArrowLeft color="#fff" size={24} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Cài đặt PT</Text>
            <View style={{ width: 24 }} />
          </View>
          
          <View style={styles.profileInfo}>
            <View style={styles.avatarContainer}>
              <Image 
                source={{ uri: displayUser?.avatarUrl || 'https://i.pravatar.cc/150' }} 
                style={styles.avatar} 
              />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{displayUser?.fullName || 'Huấn luyện viên Minh'}</Text>
              <Text style={styles.userSub}>{displayUser?.tier ? `PT Chuyên nghiệp • ${displayUser.tier}` : 'PT Chuyên nghiệp • NutriCoach Gold'}</Text>
            </View>
          </View>
        </View>

        {/* Menu Groups */}
        <View style={styles.menuContainer}>
          <NutriCard style={styles.menuCard}>
            <MenuOption 
              icon={User} 
              title="Thông tin cá nhân" 
              iconBgColor="#E8F5E9"
              iconColor="#4CAF50"
              onPress={() => {}} 
            />
            <View style={styles.divider} />
            <MenuOption 
              icon={CreditCard} 
              title="Cài đặt thanh toán" 
              iconBgColor="#E8F5E9"
              iconColor="#4CAF50"
              onPress={() => {}} 
            />
            <View style={styles.divider} />
            <MenuOption 
              icon={Clock} 
              title="Lịch sử rút tiền" 
              iconBgColor="#E8F5E9"
              iconColor="#4CAF50"
              onPress={() => navigation.navigate('PTEarnings')} 
            />
          </NutriCard>

          <NutriCard style={styles.menuCard}>
            <MenuOption 
              icon={Bell} 
              title="Thông báo" 
              iconBgColor="#F5F6F8"
              iconColor="#4A5568"
              onPress={() => {}} 
            />
            <View style={styles.divider} />
            <MenuOption 
              icon={HelpCircle} 
              title="Hỗ trợ & FAQ" 
              iconBgColor="#F5F6F8"
              iconColor="#4A5568"
              onPress={() => {}} 
            />
            <View style={styles.divider} />
            <MenuOption 
              icon={ShieldCheck} 
              title="Chính sách bảo mật" 
              iconBgColor="#F5F6F8"
              iconColor="#4A5568"
              onPress={() => {}} 
            />
          </NutriCard>

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <LogOut size={20} color="#E53935" />
            <Text style={styles.logoutText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  // Header
  headerContainer: {
    backgroundColor: '#4CAF50',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 30,
    elevation: 5,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    ...TYPOGRAPHY.h2,
    color: '#fff',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
    padding: 2,
    marginRight: 16,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  userSub: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  
  // Menu
  menuContainer: { 
    paddingHorizontal: 20,
    marginTop: -20, // To overlap the header slightly if desired, or set to 20 for gap
  },
  menuCard: { 
    padding: 8, 
    marginBottom: 16,
    borderRadius: 24,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  menuOptionLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { 
    width: 40, 
    height: 40, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 16 
  },
  menuOptionTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 16,
  },
  
  // Logout
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF5F5',
    padding: 16,
    borderRadius: 20,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#FFE0E0'
  },
  logoutText: { color: '#E53935', fontSize: 16, fontWeight: '700', marginLeft: 8 },
});

export default PTProfileScreen;
