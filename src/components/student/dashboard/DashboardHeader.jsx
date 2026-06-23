import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Bell } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../../theme';

const DashboardHeader = ({ user, totalPoints }) => {
  const navigation = useNavigation();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng,';
    if (hour < 18) return 'Chào buổi chiều,';
    return 'Chào buổi tối,';
  };

  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerTop}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <View style={styles.profileInfo}>
            <View style={styles.avatarContainer}>
              <Image 
                source={{ uri: user?.avatarUrl || 'https://i.pravatar.cc/100' }} 
                style={styles.avatar} 
              />
            </View>
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[styles.userName, { flexShrink: 1 }]} numberOfLines={1}>
                  {user?.fullName || 'Người dùng Nutri'}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.walletBadge} 
            activeOpacity={0.8} 
            onPress={() => navigation.navigate('RewardsStore')}
          >
            <Text style={styles.walletIcon}>🪙</Text>
            <Text style={styles.walletText}>{totalPoints?.toLocaleString('en-US') || 0}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.notificationBtn, { marginLeft: 12 }]}>
            <Bell color="#00FF66" size={22} />
            <View style={styles.badge} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1E293B',
    padding: 2,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 102, 0.3)',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
  },
  greeting: {
    color: '#94A3B8',
    fontSize: 13,
    marginBottom: 4,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 184, 0, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 184, 0, 0.3)',
  },
  walletIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  walletText: {
    color: '#FFB800',
    fontWeight: 'bold',
    fontSize: 14,
  },
  notificationBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF4D00',
    borderWidth: 1,
    borderColor: '#0B0F19',
  },
});

export default DashboardHeader;
