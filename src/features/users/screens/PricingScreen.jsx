import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Check, Crown, Zap, ShieldCheck } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../../theme';
import NutriButton from '../../../components/shared/NutriButton';
import NutriCard from '../../../components/shared/NutriCard';
import paymentService from '../../../api/services/payment.service';

const { width } = Dimensions.get('window');

const PricingScreen = () => {
  const navigation = useNavigation();
  const [loadingPlan, setLoadingPlan] = useState(null);

  const plans = [
    {
      id: 'monthly_pro',
      title: 'Hàng tháng',
      price: '199,000đ',
      period: '/tháng',
      features: ['Quét thực phẩm AI không giới hạn', 'Thực đơn cá nhân hóa từ PT', 'Theo dõi 77+ chỉ số sức khỏe', 'Không quảng cáo'],
      popular: false
    },
    {
      id: 'yearly_pro',
      title: 'Hàng năm',
      price: '1,490,000đ',
      period: '/năm',
      features: ['Tất cả tính năng PRO', 'Tiết kiệm 40% so với tháng', 'Hỗ trợ 1-1 từ chuyên gia', 'Quà tặng Premium'],
      popular: true
    }
  ];

  const handleSubscribe = async (planId) => {
    setLoadingPlan(planId);
    try {
      const payload = {
        productType: 'SUBSCRIPTION',
        productId: planId,
        returnUrl: 'app-pt-manager://payment/success',
        cancelUrl: 'app-pt-manager://payment/cancel'
      };
      const response = await paymentService.createCheckoutSession(payload);
      if (response.data && response.data.checkoutUrl) {
        navigation.navigate('Checkout', { url: response.data.checkoutUrl });
      } else {
        throw new Error('Không lấy được link thanh toán');
      }
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể khởi tạo thanh toán. Vui lòng thử lại!');
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={COLORS.text} size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nâng cấp PRO</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <View style={styles.crownCircle}>
            <Crown size={40} color={COLORS.white} fill={COLORS.white} />
          </View>
          <Text style={styles.heroTitle}>Khai phá sức mạnh AI</Text>
          <Text style={styles.heroSubtitle}>Đạt mục tiêu nhanh hơn với các tính năng độc quyền dành cho thành viên PRO.</Text>
        </View>

        {plans.map((plan) => (
          <NutriCard key={plan.id} style={[styles.planCard, plan.popular && styles.popularCard]}>
            {plan.popular && (
              <View style={styles.popularBadge}>
                <Text style={styles.popularBadgeText}>TIẾT KIỆM NHẤT</Text>
              </View>
            )}
            <Text style={styles.planTitle}>{plan.title}</Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceText}>{plan.price}</Text>
              <Text style={styles.periodText}>{plan.period}</Text>
            </View>

            <View style={styles.featuresList}>
              {plan.features.map((feat, i) => (
                <View key={i} style={styles.featureItem}>
                  <Check size={18} color={COLORS.primary} />
                  <Text style={styles.featureText}>{feat}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity 
              style={[styles.subscribeBtn, plan.popular && styles.popularBtn]}
              onPress={() => handleSubscribe(plan.id)}
              disabled={loadingPlan !== null}
            >
              {loadingPlan === plan.id ? (
                <ActivityIndicator color={plan.popular ? COLORS.primary : "#fff"} />
              ) : (
                <Text style={[styles.subscribeBtnText, plan.popular && styles.popularBtnText]}>
                  Chọn gói này
                </Text>
              )}
            </TouchableOpacity>
          </NutriCard>
        ))}

        <View style={styles.trustSection}>
          <ShieldCheck size={20} color={COLORS.textSecondary} />
          <Text style={styles.trustText}>Thanh toán bảo mật qua cổng PayOS</Text>
        </View>
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
    paddingVertical: 12,
  },
  backBtn: { padding: 4 },
  headerTitle: { ...TYPOGRAPHY.h3, color: COLORS.text },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  heroSection: { alignItems: 'center', marginBottom: 30 },
  crownCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1C40F',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 8,
    shadowColor: '#F1C40F',
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  heroTitle: { fontSize: 24, fontWeight: '800', color: COLORS.text, marginBottom: 10 },
  heroSubtitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20, paddingHorizontal: 20 },
  planCard: {
    padding: 24,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: COLORS.divider,
  },
  popularCard: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight + '10',
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    right: 20,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  popularBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  planTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 8 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 20 },
  priceText: { fontSize: 32, fontWeight: '800', color: COLORS.text },
  periodText: { fontSize: 14, color: COLORS.textLight, marginLeft: 4 },
  featuresList: { marginBottom: 24 },
  featureItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  featureText: { fontSize: 14, color: COLORS.text, marginLeft: 12 },
  subscribeBtn: {
    backgroundColor: COLORS.text,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subscribeBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  popularBtn: {
    backgroundColor: COLORS.primary,
  },
  popularBtnText: {
    color: '#fff',
  },
  trustSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  trustText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 8,
  }
});

export default PricingScreen;
