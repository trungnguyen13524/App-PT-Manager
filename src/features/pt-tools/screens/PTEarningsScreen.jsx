import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Wallet, TrendingUp, History } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../../theme';
import NutriButton from '../../../components/shared/NutriButton';
import ptService from '../../../api/services/pt.service';

const PTEarningsScreen = () => {
  const navigation = useNavigation();
  const [earnings, setEarnings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      // const response = await ptService.getEarnings();
      // setEarnings(response.data);
      
      // Giả lập data
      setEarnings({
        totalRevenueVnd: 45200000,
        platformFeeVnd: 4520000,
        netEarningsVnd: 40680000,
        availableBalanceVnd: 28500000,
        pendingWithdrawalVnd: 5000000,
        withdrawnTotalVnd: 7180000,
        breakdown: [
          { period: '2026-04', gross: 12000000, fee: 1200000, net: 10800000, transactions: 8 },
          { period: '2026-03', gross: 9000000, fee: 900000, net: 8100000, transactions: 6 },
        ]
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async () => {
    Alert.prompt(
      'Yêu cầu rút tiền',
      `Số dư khả dụng: ${earnings?.availableBalanceVnd.toLocaleString('vi-VN')} đ\nNhập số tiền muốn rút (bội số 1,000đ):`,
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Rút tiền', 
          onPress: async (amount) => {
            const amountNum = parseInt(amount, 10);
            if (isNaN(amountNum) || amountNum < 200000 || amountNum > earnings.availableBalanceVnd) {
              Alert.alert('Lỗi', 'Số tiền không hợp lệ. Tối thiểu 200,000đ và không vượt quá số dư.');
              return;
            }
            try {
              // await ptService.requestWithdrawal({ amountVnd: amountNum, note: "Rút tiền app" });
              Alert.alert('Thành công', 'Đã gửi yêu cầu rút tiền. Vui lòng chờ admin duyệt.');
              fetchEarnings();
            } catch (err) {
              Alert.alert('Lỗi', 'Không thể gửi yêu cầu rút tiền lúc này.');
            }
          }
        }
      ],
      'plain-text',
      '',
      'numeric'
    );
  };

  if (isLoading || !earnings) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thu nhập của tôi</Text>
        <TouchableOpacity>
          <History size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Wallet size={24} color={COLORS.white} />
            <Text style={styles.balanceLabel}>Số dư khả dụng</Text>
          </View>
          <Text style={styles.balanceAmount}>
            {earnings.availableBalanceVnd.toLocaleString('vi-VN')} đ
          </Text>
          <NutriButton 
            title="Rút tiền ngay" 
            onPress={handleWithdraw}
            style={styles.withdrawButton}
            textStyle={styles.withdrawButtonText}
          />
        </View>

        {/* Overview Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Tổng doanh thu</Text>
            <Text style={[styles.statValue, { color: COLORS.text }]}>
              {earnings.totalRevenueVnd.toLocaleString('vi-VN')} đ
            </Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Đã rút thành công</Text>
            <Text style={[styles.statValue, { color: COLORS.success }]}>
              {earnings.withdrawnTotalVnd.toLocaleString('vi-VN')} đ
            </Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Đang chờ duyệt</Text>
            <Text style={[styles.statValue, { color: COLORS.warning }]}>
              {earnings.pendingWithdrawalVnd.toLocaleString('vi-VN')} đ
            </Text>
          </View>
        </View>

        {/* Monthly Breakdown */}
        <View style={styles.sectionHeader}>
          <TrendingUp size={20} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>Lịch sử theo tháng</Text>
        </View>

        {earnings.breakdown.map((item, index) => (
          <View key={index} style={styles.breakdownCard}>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownMonth}>Tháng {item.period.split('-')[1]}/{item.period.split('-')[0]}</Text>
              <Text style={styles.breakdownTransactions}>{item.transactions} giao dịch</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Tổng thu (Gross)</Text>
              <Text style={styles.breakdownValue}>{item.gross.toLocaleString('vi-VN')} đ</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Phí nền tảng (10%)</Text>
              <Text style={[styles.breakdownValue, { color: COLORS.danger }]}>-{item.fee.toLocaleString('vi-VN')} đ</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={[styles.breakdownLabel, { fontWeight: 'bold' }]}>Thực nhận (Net)</Text>
              <Text style={[styles.breakdownValue, { color: COLORS.success, fontWeight: 'bold' }]}>{item.net.toLocaleString('vi-VN')} đ</Text>
            </View>
          </View>
        ))}
        
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: 50,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.white,
  },
  headerTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },
  content: {
    padding: SPACING.lg,
  },
  balanceCard: {
    backgroundColor: COLORS.primary,
    borderRadius: SPACING.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceLabel: {
    color: COLORS.white,
    opacity: 0.9,
    fontSize: 16,
    marginLeft: 8,
  },
  balanceAmount: {
    color: COLORS.white,
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  withdrawButton: {
    backgroundColor: COLORS.white,
    width: '100%',
    height: 48,
  },
  withdrawButtonText: {
    color: COLORS.primary,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: SPACING.md,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
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
  breakdownCard: {
    backgroundColor: COLORS.white,
    borderRadius: SPACING.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  breakdownMonth: {
    fontWeight: 'bold',
    color: COLORS.text,
    fontSize: 16,
  },
  breakdownTransactions: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 8,
  },
  breakdownLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  breakdownValue: {
    color: COLORS.text,
    fontSize: 14,
  }
});

export default PTEarningsScreen;
