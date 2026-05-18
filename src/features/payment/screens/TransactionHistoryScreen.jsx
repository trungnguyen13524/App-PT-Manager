import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, FileText, CheckCircle, Clock, XCircle } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../../theme';
import paymentService from '../../../api/services/payment.service';

const TransactionHistoryScreen = () => {
  const navigation = useNavigation();
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      // Giả lập lấy danh sách giao dịch
      // const response = await paymentService.getTransactions();
      // setTransactions(response.data);
      
      const mockData = [
        {
          id: 'txn_1',
          orderCode: '17155954000123',
          amountVnd: 1490000,
          description: 'NutriCoach PT Course',
          status: 'PAID',
          createdAt: '2026-05-13T14:45:32.000Z'
        },
        {
          id: 'txn_2',
          orderCode: '17155954000124',
          amountVnd: 399000,
          description: 'Gói PRO 1 Tháng',
          status: 'PENDING',
          createdAt: '2026-05-14T09:20:00.000Z'
        },
        {
          id: 'txn_3',
          orderCode: '17155954000125',
          amountVnd: 2990000,
          description: 'Gói PRO 1 Năm',
          status: 'FAILED',
          createdAt: '2026-04-10T10:15:00.000Z'
        }
      ];
      setTransactions(mockData);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStatusIcon = (status) => {
    switch(status) {
      case 'PAID': return <CheckCircle size={20} color={COLORS.success} />;
      case 'PENDING': return <Clock size={20} color={COLORS.warning} />;
      case 'FAILED': return <XCircle size={20} color={COLORS.danger} />;
      default: return <FileText size={20} color={COLORS.textSecondary} />;
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'PAID': return 'Thành công';
      case 'PENDING': return 'Đang xử lý';
      case 'FAILED': return 'Thất bại';
      default: return status;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'PAID': return COLORS.success;
      case 'PENDING': return COLORS.warning;
      case 'FAILED': return COLORS.danger;
      default: return COLORS.textSecondary;
    }
  };

  const renderItem = ({ item }) => {
    const date = new Date(item.createdAt);
    const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`;

    return (
      <TouchableOpacity style={styles.card} activeOpacity={0.7}>
        <View style={styles.cardHeader}>
          <View style={styles.iconContainer}>
            {renderStatusIcon(item.status)}
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.description} numberOfLines={1}>{item.description}</Text>
            <Text style={styles.date}>{formattedDate}</Text>
          </View>
          <View style={styles.amountContainer}>
            <Text style={styles.amount}>{item.amountVnd.toLocaleString('vi-VN')} đ</Text>
            <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
              {getStatusText(item.status)}
            </Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.cardFooter}>
          <Text style={styles.orderCode}>Mã đơn: #{item.orderCode}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
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
        <Text style={styles.headerTitle}>Lịch sử giao dịch</Text>
        <View style={{ width: 24 }} />
      </View>

      {transactions.length === 0 ? (
        <View style={styles.emptyState}>
          <FileText size={48} color={COLORS.textLight} />
          <Text style={styles.emptyText}>Chưa có giao dịch nào</Text>
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },
  listContainer: {
    padding: SPACING.lg,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: SPACING.md,
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SPACING.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  description: {
    ...TYPOGRAPHY.body1,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    ...TYPOGRAPHY.body1,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  status: {
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  orderCode: {
    fontSize: 12,
    color: COLORS.textLight,
  }
});

export default TransactionHistoryScreen;
