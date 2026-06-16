import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Gift, Ticket, Award, Gem } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useMissionStore } from '../../../store/missionStore';

const { width } = Dimensions.get('window');

const RewardsStoreScreen = () => {
  const navigation = useNavigation();
  const { totalPoints, spendPoints } = useMissionStore();

  const storeItems = [
    { id: '1', title: 'Voucher giảm giá PT 10%', cost: 1000, icon: <Ticket color="#FF4D00" size={32} />, color: 'rgba(255, 77, 0, 0.1)' },
    { id: '2', title: 'Huy hiệu Chiến Binh', cost: 500, icon: <Award color="#00B3FF" size={32} />, color: 'rgba(0, 179, 255, 0.1)' },
    { id: '3', title: 'Khung Avatar Độc quyền', cost: 800, icon: <Gem color="#FFD700" size={32} />, color: 'rgba(255, 215, 0, 0.1)' },
    { id: '4', title: 'Giáo án dãn cơ đặc biệt', cost: 300, icon: <Gift color="#00FF66" size={32} />, color: 'rgba(0, 255, 102, 0.1)' },
  ];

  const handleBuy = (item) => {
    Alert.alert(
      'Xác nhận đổi quà',
      `Bạn có chắc chắn muốn đổi ${item.title} với giá ${item.cost} XP?`,
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Đổi ngay', 
          onPress: () => {
            const success = spendPoints(item.cost);
            if (success) {
              Alert.alert('Thành công', 'Đổi quà thành công! Hãy kiểm tra túi đồ của bạn.');
            } else {
              Alert.alert('Thất bại', 'Bạn không đủ XP để đổi món quà này.');
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color="#FFF" size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cửa Hàng</Text>
        <View style={styles.walletBadge}>
          <Text style={styles.walletIcon}>🪙</Text>
          <Text style={styles.walletText}>{totalPoints.toLocaleString('en-US')}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>Tích điểm đổi quà</Text>
          <Text style={styles.bannerSubtitle}>Hoàn thành nhiệm vụ mỗi ngày để nhận thêm thật nhiều XP và đổi các phần thưởng giá trị!</Text>
        </View>

        <Text style={styles.sectionTitle}>Vật phẩm có thể đổi</Text>
        
        <View style={styles.grid}>
          {storeItems.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <View style={[styles.itemIconContainer, { backgroundColor: item.color }]}>
                {item.icon}
              </View>
              <Text style={styles.itemTitle}>{item.title}</Text>
              
              <TouchableOpacity 
                style={[styles.buyBtn, totalPoints < item.cost && styles.buyBtnDisabled]}
                activeOpacity={0.8}
                onPress={() => handleBuy(item)}
                disabled={totalPoints < item.cost}
              >
                <Text style={styles.buyBtnText}>{item.cost} XP</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFF',
  },
  walletBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 184, 0, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 184, 0, 0.4)',
  },
  walletIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  walletText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFB800',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  banner: {
    backgroundColor: 'rgba(255, 138, 0, 0.1)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 138, 0, 0.3)',
    marginBottom: 24,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FF8A00',
    marginBottom: 8,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  itemCard: {
    width: (width - 56) / 2, // 20 padding left + 20 padding right + 16 space between = 56
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  itemIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 16,
    height: 40, // fix height for alignment
  },
  buyBtn: {
    backgroundColor: '#FF8A00',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    width: '100%',
    alignItems: 'center',
  },
  buyBtnDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  buyBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFF',
  },
});

export default RewardsStoreScreen;
