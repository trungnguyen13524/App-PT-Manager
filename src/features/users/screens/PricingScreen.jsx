import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Check, Crown, ShieldCheck } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TYPOGRAPHY } from '../../../theme';
import paymentService from '../../../api/services/payment.service';
import { useDialogStore } from '../../../store/dialogStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AbstractBackground, GlassCard } from '../../../components/common';

const { width } = Dimensions.get('window');

const PricingScreen = () => {
  const navigation = useNavigation();
  const [loadingPlan, setLoadingPlan] = useState(null);

  const plans = [
    {
      id: 'monthly_pro',
      title: 'HÀNG THÁNG',
      price: '149,000đ',
      period: '/tháng',
      features: ['Không quảng cáo', 'Phân tích AI nâng cao', 'Gợi ý thực đơn cá nhân hóa', 'Theo dõi 77+ chỉ số sức khỏe'],
      popular: false
    },
    {
      id: 'yearly_pro',
      title: 'HÀNG NĂM',
      price: '1,490,000đ',
      period: '/năm',
      features: ['Tất cả tính năng của gói Tháng', 'Tiết kiệm 40% chi phí', 'Hỗ trợ 1-1 từ chuyên gia', 'Huy hiệu VIP độc quyền'],
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
      useDialogStore.getState().showDialog({
        title: 'Lỗi',
        message: 'Không thể khởi tạo thanh toán. Vui lòng thử lại!',
        type: 'error'
      });
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AbstractBackground />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color="#FFFFFF" size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nâng cấp VIP</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* VIP Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.crownGlow}>
            <LinearGradient
              colors={['#FFD700', '#FFA500']}
              style={styles.crownCircle}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Crown size={36} color="#FFFFFF" fill="#FFFFFF" />
            </LinearGradient>
          </View>
          <Text style={styles.heroTitle}>MỞ KHÓA SỨC MẠNH AI</Text>
          <Text style={styles.heroSubtitle}>
            Đạt mục tiêu nhanh hơn gấp 3 lần với các tính năng phân tích độc quyền dành cho hội viên cao cấp.
          </Text>
        </View>

        {/* Subscription Plans */}
        {plans.map((plan) => (
          <GlassCard 
            key={plan.id} 
            style={[
              styles.planCard, 
              plan.popular ? styles.popularCard : {}
            ]}
          >
            {plan.popular ? (
              <LinearGradient
                colors={['#FF4D00', '#FFD700']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.popularBadge}
              >
                <Text style={styles.popularBadgeText}>TIẾT KIỆM NHẤT</Text>
              </LinearGradient>
            ) : null}
            
            <Text style={[styles.planTitle, plan.popular ? { color: '#FFD700' } : {}]}>
              {plan.title}
            </Text>
            
            <View style={styles.priceRow}>
              <Text style={styles.priceText}>{plan.price}</Text>
              <Text style={styles.periodText}>{plan.period}</Text>
            </View>

            <View style={styles.featuresList}>
              {plan.features.map((feat, i) => (
                <View key={i} style={styles.featureItem}>
                  <View style={[styles.checkCircle, plan.popular ? { backgroundColor: 'rgba(255, 215, 0, 0.2)' } : {}]}>
                    <Check size={14} color={plan.popular ? '#FFD700' : '#00FF66'} strokeWidth={3} />
                  </View>
                  <Text style={styles.featureText}>{feat}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity 
              style={[
                styles.subscribeBtn, 
                plan.popular ? styles.popularBtn : {}
              ]}
              onPress={() => handleSubscribe(plan.id)}
              disabled={loadingPlan !== null}
              activeOpacity={0.8}
            >
              {loadingPlan === plan.id ? (
                <ActivityIndicator color={plan.popular ? "#000" : "#fff"} />
              ) : (
                <Text style={[
                  styles.subscribeBtnText, 
                  plan.popular ? styles.popularBtnText : {}
                ]}>
                  Nâng cấp ngay
                </Text>
              )}
            </TouchableOpacity>
          </GlassCard>
        ))}

        <View style={styles.trustSection}>
          <ShieldCheck size={16} color="rgba(255,255,255,0.5)" />
          <Text style={styles.trustText}>Thanh toán bảo mật siêu tốc qua cổng PayOS</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: { 
    width: 40, height: 40, 
    borderRadius: 20, 
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center', alignItems: 'center'
  },
  headerTitle: { 
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 50 },
  
  // --- HERO SECTION ---
  heroSection: { alignItems: 'center', marginBottom: 30, marginTop: 10 },
  crownGlow: {
    padding: 10,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    marginBottom: 16,
  },
  crownCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFD700',
    shadowOpacity: 0.8,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 15,
    elevation: 10,
  },
  heroTitle: { 
    fontSize: 26, 
    fontWeight: '900', 
    color: '#FFFFFF', 
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  heroSubtitle: { 
    fontSize: 15, 
    color: 'rgba(255,255,255,0.7)', 
    textAlign: 'center', 
    lineHeight: 22, 
    paddingHorizontal: 10 
  },
  
  // --- PLAN CARDS ---
  planCard: {
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
  },
  popularCard: {
    borderColor: '#FFD700',
    backgroundColor: 'rgba(255, 215, 0, 0.05)',
    shadowColor: '#FFD700',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 15,
    elevation: 8,
  },
  popularBadge: {
    position: 'absolute',
    top: -14,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: '#FF4D00',
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  popularBadgeText: { 
    color: '#FFFFFF', 
    fontSize: 12, 
    fontWeight: '900',
    letterSpacing: 1,
  },
  planTitle: { 
    fontSize: 16, 
    fontWeight: '800', 
    color: '#94A3B8', 
    marginBottom: 12,
    letterSpacing: 1
  },
  priceRow: { 
    flexDirection: 'row', 
    alignItems: 'baseline', 
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    paddingBottom: 20
  },
  priceText: { 
    fontSize: 38, 
    fontWeight: '900', 
    color: '#FFFFFF',
    fontVariant: ['tabular-nums']
  },
  periodText: { 
    fontSize: 16, 
    color: 'rgba(255,255,255,0.5)', 
    marginLeft: 6,
    fontWeight: '600'
  },
  featuresList: { marginBottom: 30 },
  featureItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 16 
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 255, 102, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: { 
    fontSize: 15, 
    color: '#FFFFFF', 
    marginLeft: 12,
    fontWeight: '500'
  },
  
  // --- BUTTONS ---
  subscribeBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)'
  },
  subscribeBtnText: { 
    color: '#FFFFFF', 
    fontSize: 16, 
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  popularBtn: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 5,
  },
  popularBtnText: {
    color: '#000000',
  },
  
  // --- TRUST SECTION ---
  trustSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  trustText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    marginLeft: 8,
    fontWeight: '500'
  }
});

export default PricingScreen;
