import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, 
  ActivityIndicator, Modal, TextInput, Platform, Clipboard,
  TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Gift, Ticket, Copy, CheckCircle, Package, MapPin, Phone, AlertCircle, X } from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useMissionStore } from '../../../store/missionStore';
import { useDialogStore } from '../../../store/dialogStore';
import questsService from '../../../api/services/quests.service';
import { AbstractBackground } from '../../../components/common';

const { width } = Dimensions.get('window');

const RewardsStoreScreen = ({ isNested = false }) => {
  const navigation = useNavigation();
  const { totalPoints, fetchDailyMissions } = useMissionStore();

  // Tabs
  const [activeTab, setActiveTab] = useState('store'); // 'store' | 'history'
  
  // Store State
  const [rewards, setRewards] = useState([]);
  const [loadingRewards, setLoadingRewards] = useState(false);
  const [filterType, setFilterType] = useState('all'); // 'all' | 'small' | 'large'
  
  // History State
  const [redemptions, setRedemptions] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Redemption Form State
  const [selectedReward, setSelectedReward] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);

  // Success State
  const [isSuccessVisible, setIsSuccessVisible] = useState(false);
  const [redemptionResult, setRedemptionResult] = useState(null);

  // Focus effect for Store Data
  useFocusEffect(
    useCallback(() => {
      fetchRewards();
      // Ensure points are up to date
      const todayStr = new Date().toISOString().split('T')[0];
      fetchDailyMissions(todayStr);
    }, [])
  );

  // Effect for History Data
  useEffect(() => {
    if (activeTab === 'history') {
      fetchRedemptions();
    }
  }, [activeTab]);

  const fetchRewards = async () => {
    setLoadingRewards(true);
    try {
      const res = await questsService.getRewards();
      // Expecting array of rewards. Sorting by pointsRequired ascending.
      const data = (res.data?.rewards || res.data || []).sort((a, b) => a.pointsRequired - b.pointsRequired);
      setRewards(data);
    } catch (err) {
      console.warn('Lỗi lấy phần thưởng:', err);
    } finally {
      setLoadingRewards(false);
    }
  };

  const fetchRedemptions = async () => {
    setLoadingHistory(true);
    try {
      const res = await questsService.getRedemptions();
      setRedemptions(res.data?.redemptions || res.data || []);
    } catch (err) {
      console.warn('Lỗi lấy lịch sử đổi quà:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Form Validation
  const isValidPhone = /^(0|\+84)\d{9}$/.test(phone.trim());
  const isValidAddress = address.trim().length >= 5;
  const isFormValid = isValidPhone && isValidAddress;

  const handleOpenRedeem = (reward) => {
    setSelectedReward(reward);
    setPhone('');
    setAddress('');
    setIsFormVisible(true);
  };

  const handleRedeem = async () => {
    if (!isFormValid || !selectedReward) return;
    
    setIsRedeeming(true);
    try {
      const payload = {
        rewardId: selectedReward.id,
        phone: phone.trim(),
        deliveryAddress: address.trim()
      };
      
      const res = await questsService.redeemReward(payload);
      
      setIsFormVisible(false);
      setRedemptionResult(res.data?.redemption || res.data);
      setIsSuccessVisible(true);
      
      // Force refresh points
      const todayStr = new Date().toISOString().split('T')[0];
      await fetchDailyMissions(todayStr);
      
      // Refresh histories if needed
      fetchRedemptions();
    } catch (err) {
      setIsFormVisible(false);
      const code = err.response?.data?.code;
      const message = err.response?.data?.message || 'Có lỗi xảy ra.';
      
      if (code === 'INSUFFICIENT_POINTS') {
        useDialogStore.getState().showDialog({
          title: 'Điểm không đủ',
          message: 'Bạn không đủ XP để đổi món quà này. Hãy làm thêm nhiệm vụ nhé!',
          type: 'warning'
        });
      } else if (code === 'VALIDATION_ERROR') {
        useDialogStore.getState().showDialog({
          title: 'Thông tin không hợp lệ',
          message: 'Số điện thoại hoặc địa chỉ không đúng định dạng.',
          type: 'error'
        });
      } else if (code === 'REWARD_NOT_FOUND') {
        useDialogStore.getState().showDialog({
          title: 'Quà không tồn tại',
          message: 'Món quà này không còn khả dụng.',
          type: 'error'
        });
      } else {
        useDialogStore.getState().showDialog({
          title: 'Lỗi',
          message,
          type: 'error'
        });
      }
    } finally {
      setIsRedeeming(false);
    }
  };

  const copyToClipboard = (text) => {
    Clipboard.setString(text);
    useDialogStore.getState().showDialog({
      title: 'Đã sao chép',
      message: 'Mã Voucher đã được lưu vào bộ nhớ tạm!',
      type: 'success'
    });
  };

  // Renderers
  const renderStore = () => {
    let filtered = rewards;
    if (filterType === 'small') filtered = rewards.filter(r => r.tier === 'SMALL');
    if (filterType === 'large') filtered = rewards.filter(r => r.tier === 'LARGE');

    return (
      <View style={{ flex: 1 }}>
        <View style={styles.filterRow}>
          {['all', 'small', 'large'].map(f => {
            const label = f === 'all' ? 'Tất cả' : f === 'small' ? 'Quà nhỏ (≤ 500đ)' : 'Quà hiện vật (> 500đ)';
            const isActive = filterType === f;
            return (
              <TouchableOpacity 
                key={f}
                style={[styles.filterPill, isActive && styles.filterPillActive]}
                onPress={() => setFilterType(f)}
              >
                <Text style={[styles.filterPillText, isActive && styles.filterPillTextActive]}>{label}</Text>
              </TouchableOpacity>
            )
          })}
        </View>

        {loadingRewards ? (
          <ActivityIndicator size="large" color="#556B2F" style={{ marginTop: 50 }} />
        ) : filtered.length === 0 ? (
          <Text style={styles.emptyText}>Chưa có quà tặng nào.</Text>
        ) : (
          <View style={styles.grid}>
            {filtered.map(item => {
              const canAfford = totalPoints >= item.pointsRequired;
              return (
                <View key={item.id} style={styles.itemCard}>
                  <View style={[styles.itemIconContainer, { backgroundColor: item.tier === 'SMALL' ? 'rgba(85, 107, 47, 0.1)' : 'rgba(255, 138, 0, 0.1)' }]}>
                    {item.tier === 'SMALL' ? <Ticket color="#556B2F" size={32} /> : <Gift color="#FF8A00" size={32} />}
                  </View>
                  <Text style={styles.itemTitle} numberOfLines={2}>{item.name}</Text>
                  
                  <TouchableOpacity 
                    style={[styles.buyBtn, !canAfford && styles.buyBtnDisabled]}
                    activeOpacity={0.8}
                    onPress={() => handleOpenRedeem(item)}
                    disabled={!canAfford}
                  >
                    <Text style={[styles.buyBtnText, !canAfford && { color: 'rgba(255,255,255,0.5)' }]}>
                      {item.pointsRequired} XP
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  const renderHistory = () => {
    if (loadingHistory) return <ActivityIndicator size="large" color="#556B2F" style={{ marginTop: 50 }} />;
    if (redemptions.length === 0) return <Text style={styles.emptyText}>Bạn chưa đổi món quà nào.</Text>;

    return (
      <View style={{ flex: 1, paddingBottom: 20 }}>
        {redemptions.map(r => {
          const dateStr = new Date(r.redeemedAt).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' });
          // Nếu có voucherCode thì coi như đã nhận thành công (dù backend có trả PENDING đi chăng nữa)
          const isFulfilled = r.status === 'FULFILLED' || !!r.voucherCode;
          
          let statusColor = '#FFD700'; // PENDING
          let statusText = 'Đang chờ duyệt';
          if (isFulfilled) {
            statusColor = '#556B2F';
            statusText = 'Thành công';
          } else if (r.status === 'REJECTED') {
            statusColor = '#FF4D4D';
            statusText = 'Bị từ chối';
          }

          return (
            <View key={r.id} style={styles.historyCard}>
              <View style={styles.historyHeader}>
                <Text style={styles.historyTitle}>{r.rewardName || 'Quà tặng'}</Text>
                <Text style={styles.historyCost}>-{r.pointsCost} XP</Text>
              </View>
              <Text style={styles.historyDate}>{dateStr}</Text>
              
              <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20`, borderColor: `${statusColor}50` }]}>
                <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
              </View>

              {isFulfilled && r.voucherCode && (
                <View style={styles.voucherCodeContainer}>
                  <Text style={styles.voucherLabel}>Mã Voucher:</Text>
                  <View style={styles.voucherRow}>
                    <Text style={styles.voucherCodeText}>{r.voucherCode}</Text>
                    <TouchableOpacity onPress={() => copyToClipboard(r.voucherCode)} style={styles.copyBtn}>
                      <Copy size={16} color="#556B2F" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {r.status === 'REJECTED' && r.adminNote && (
                <View style={styles.rejectContainer}>
                  <AlertCircle size={14} color="#FF4D4D" style={{ marginRight: 6 }} />
                  <Text style={styles.rejectNote}>{r.adminNote}</Text>
                </View>
              )}
            </View>
          );
        })}
      </View>
    );
  };

  const content = (
    <>
      {/* Header - Only show if not nested */}
      {!isNested && (
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronLeft color="#2D3748" size={28} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Đổi Quà</Text>
          <View style={styles.walletBadge}>
            <Text style={styles.walletIcon}>🪙</Text>
            <Text style={styles.walletText}>{totalPoints.toLocaleString('en-US')}</Text>
          </View>
        </View>
      )}

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'store' && styles.activeTab]}
          onPress={() => setActiveTab('store')}
        >
          <Text style={[styles.tabText, activeTab === 'store' && styles.activeTabText]}>Cửa hàng quà</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'history' && styles.activeTab]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>Lịch sử đổi</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {activeTab === 'store' ? renderStore() : renderHistory()}
      </ScrollView>

      {/* REDEEM FORM MODAL */}
      <Modal visible={isFormVisible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            style={styles.modalOverlay}
          >
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeaderClose}>
                  <Text style={styles.modalTitle}>Xác nhận thông tin</Text>
                  <TouchableOpacity onPress={() => setIsFormVisible(false)}><X color="#2D3748" size={24} /></TouchableOpacity>
                </View>
                
                <View style={styles.rewardSummary}>
                  <Text style={styles.rewardSummaryTitle}>{selectedReward?.name}</Text>
                  <Text style={styles.rewardSummaryCost}>Cần {selectedReward?.pointsRequired} XP</Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Số điện thoại (*)</Text>
                  <View style={styles.inputWrapper}>
                    <Phone size={20} color="#4A5568" />
                    <TextInput
                      style={styles.input}
                      placeholder="0901234567"
                      placeholderTextColor="#718096"
                      keyboardType="phone-pad"
                      value={phone}
                      onChangeText={setPhone}
                    />
                  </View>
                  {phone.length > 0 && !isValidPhone && <Text style={styles.errorText}>Số điện thoại không hợp lệ</Text>}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Địa chỉ giao hàng (*)</Text>
                  <View style={[styles.inputWrapper, { height: 80, alignItems: 'flex-start', paddingTop: 12 }]}>
                    <MapPin size={20} color="#4A5568" />
                    <TextInput
                      style={[styles.input, { height: '100%', textAlignVertical: 'top' }]}
                      placeholder="Số nhà, đường, phường, quận..."
                      placeholderTextColor="#718096"
                      multiline
                      value={address}
                      onChangeText={setAddress}
                    />
                  </View>
                  {address.length > 0 && !isValidAddress && <Text style={styles.errorText}>Vui lòng nhập đầy đủ địa chỉ</Text>}
                </View>

                <TouchableOpacity 
                  style={[styles.submitBtn, (!isFormValid || isRedeeming) && styles.submitBtnDisabled]}
                  onPress={() => {
                    Keyboard.dismiss();
                    handleRedeem();
                  }}
                  disabled={!isFormValid || isRedeeming}
                >
                  {isRedeeming ? (
                    <ActivityIndicator color="#F5F5DC" />
                  ) : (
                    <Text style={styles.submitBtnText}>Xác nhận đổi ngay</Text>
                  )}
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>

      {/* SUCCESS MODAL */}
      <Modal visible={isSuccessVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { alignItems: 'center', padding: 32 }]}>
            <CheckCircle color="#556B2F" size={64} style={{ marginBottom: 16 }} />
            <Text style={styles.successTitle}>Đổi quà thành công!</Text>
            
            {redemptionResult?.voucherCode ? (
              <>
                <Text style={styles.successDesc}>Mã Voucher của bạn là:</Text>
                <View style={styles.bigVoucherBox}>
                  <Text style={styles.bigVoucherText}>{redemptionResult.voucherCode}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.copyMainBtn}
                  onPress={() => copyToClipboard(redemptionResult.voucherCode)}
                >
                  <Copy size={20} color="#F5F5DC" />
                  <Text style={styles.copyMainBtnText}>Sao chép mã</Text>
                </TouchableOpacity>
              </>
            ) : (
              <Text style={styles.successDescCenter}>
                Quà tặng lớn của bạn đang chờ Admin duyệt và giao hàng tận nơi. Vui lòng theo dõi trạng thái tại tab Lịch sử.
              </Text>
            )}

            <TouchableOpacity 
              style={styles.closeSuccessBtn}
              onPress={() => setIsSuccessVisible(false)}
            >
              <Text style={styles.closeSuccessBtnText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );

  if (isNested) {
    return <View style={{ flex: 1 }}>{content}</View>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <AbstractBackground />
      {content}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#1A202C' },
  walletBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 184, 0, 0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255, 184, 0, 0.3)' },
  walletIcon: { fontSize: 16, marginRight: 4 },
  walletText: { fontSize: 15, fontWeight: '900', color: '#DD9900' },
  tabContainer: {
    flexDirection: 'row', marginHorizontal: 20, marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.85)', borderRadius: 12, padding: 4,
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#2D4A33', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  activeTab: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  tabText: { color: '#4A5568', fontWeight: '800' },
  activeTabText: { color: '#3A4D20', fontWeight: '900' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  filterRow: { flexDirection: 'row', marginBottom: 20, flexWrap: 'wrap', gap: 10 },
  filterPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(0, 0, 0, 0.04)', borderWidth: 1, borderColor: 'transparent' },
  filterPillActive: { backgroundColor: 'rgba(85, 107, 47, 0.1)', borderColor: '#556B2F' },
  filterPillText: { color: '#2D3748', fontSize: 13, fontWeight: '700' },
  filterPillTextActive: { color: '#3A4D20', fontWeight: '900' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  itemCard: {
    width: (width - 56) / 2, backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 24, padding: 16, marginBottom: 16, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#2D4A33', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.08, shadowRadius: 20, elevation: 3
  },
  itemIconContainer: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  itemTitle: { fontSize: 14, fontWeight: '800', color: '#1A202C', textAlign: 'center', marginBottom: 16, minHeight: 40 },
  buyBtn: { backgroundColor: '#556B2F', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20, width: '100%', alignItems: 'center' },
  buyBtnDisabled: { backgroundColor: 'rgba(85, 107, 47, 0.3)' },
  buyBtnText: { fontSize: 14, fontWeight: '900', color: '#FFFFFF' },
  emptyText: { color: '#4A5568', textAlign: 'center', marginTop: 40, fontSize: 16, fontWeight: '600' },
  
  historyCard: { backgroundColor: 'rgba(255, 255, 255, 0.85)', borderRadius: 24, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.4)', shadowColor: '#2D4A33', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.08, shadowRadius: 20, elevation: 3 },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  historyTitle: { color: '#1A202C', fontSize: 16, fontWeight: '900', flex: 1 },
  historyCost: { color: '#DD9900', fontSize: 15, fontWeight: '900' },
  historyDate: { color: '#4A5568', fontSize: 13, marginBottom: 12, fontWeight: '600' },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
  statusText: { fontSize: 12, fontWeight: 'bold' },
  voucherCodeContainer: { marginTop: 12, backgroundColor: 'rgba(0,0,0,0.2)', padding: 12, borderRadius: 8 },
  voucherLabel: { color: '#4A5568', fontSize: 12, marginBottom: 4 },
  voucherRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  voucherCodeText: { color: '#556B2F', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
  copyBtn: { padding: 4 },
  rejectContainer: { flexDirection: 'row', marginTop: 12, padding: 8, backgroundColor: 'rgba(255, 77, 77, 0.1)', borderRadius: 8 },
  rejectNote: { color: '#FF4D4D', fontSize: 12, flex: 1 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', backgroundColor: '#EADDCA', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: 'rgba(0, 0, 0, 0.05)' },
  modalHeaderClose: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#2D3748' },
  rewardSummary: { backgroundColor: 'rgba(0, 0, 0, 0.02)', padding: 16, borderRadius: 12, marginBottom: 20 },
  rewardSummaryTitle: { color: '#2D3748', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  rewardSummaryCost: { color: '#FFB800', fontSize: 14, fontWeight: '800' },
  inputGroup: { marginBottom: 16 },
  inputLabel: { color: '#4A5568', fontSize: 14, marginBottom: 8, fontWeight: '600' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5DC', borderRadius: 12, paddingHorizontal: 16, height: 50, borderWidth: 1, borderColor: 'rgba(0, 0, 0, 0.05)' },
  input: { flex: 1, color: '#2D3748', fontSize: 16, marginLeft: 12 },
  errorText: { color: '#FF4D4D', fontSize: 12, marginTop: 4 },
  submitBtn: { backgroundColor: '#556B2F', height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  submitBtnDisabled: { backgroundColor: 'rgba(255,255,255,0.2)' },
  submitBtnText: { color: '#F5F5DC', fontSize: 16, fontWeight: 'bold' },

  successTitle: { fontSize: 24, fontWeight: 'bold', color: '#2D3748', marginBottom: 8 },
  successDesc: { color: '#4A5568', fontSize: 14, marginBottom: 16 },
  successDescCenter: { color: '#4A5568', fontSize: 14, textAlign: 'center', marginBottom: 24, lineHeight: 22 },
  bigVoucherBox: { backgroundColor: '#F5F5DC', paddingHorizontal: 24, paddingVertical: 16, borderRadius: 16, borderWidth: 2, borderColor: '#556B2F', marginBottom: 20 },
  bigVoucherText: { color: '#556B2F', fontSize: 24, fontWeight: '900', letterSpacing: 2 },
  copyMainBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#556B2F', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, marginBottom: 20 },
  copyMainBtnText: { color: '#F5F5DC', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  closeSuccessBtn: { width: '100%', paddingVertical: 16, borderRadius: 16, backgroundColor: 'rgba(0, 0, 0, 0.05)', alignItems: 'center' },
  closeSuccessBtnText: { color: '#2D3748', fontSize: 16, fontWeight: 'bold' }
});

export default RewardsStoreScreen;
