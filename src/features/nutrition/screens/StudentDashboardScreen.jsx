import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity, 
  Image,
  Dimensions,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Bell, ChevronRight, Zap, ChevronLeft } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../../theme';
import { useUserStore } from '../../../store/userStore';
import { useNutritionStore } from '../../../store/nutritionStore';
import { useAuthStore } from '../../../store/authStore';
import CalorieChart from '../../../components/student/CalorieChart';
import NutriCard from '../../../components/shared/NutriCard';

const { width } = Dimensions.get('window');

import { dashboardService } from '../../../api/services';

const StudentDashboardScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { isPTView, studentData } = route.params || {};
  
  const { user } = useAuthStore();
  const { profile, metrics: storeMetrics, fetchProfile } = useUserStore();
  const { weeklySummary, fetchWeeklySummary } = useNutritionStore();
  
  const [dashboardData, setDashboardData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  // Lấy dữ liệu từ Backend
  React.useEffect(() => {
    fetchProfile(); // Load latest profile
    
    // Gọi API lấy dữ liệu tuần
    const today = new Date();
    fetchWeeklySummary(today.toISOString().split('T')[0]);

    const fetchDashboard = async () => {
      try {
        const { USE_MOCK } = require('../../../mocks');
        let responseData;
        
        if (USE_MOCK) {
          console.log('--- ĐANG SỬ DỤNG MOCK DASHBOARD ---');
          await new Promise(resolve => setTimeout(resolve, 800));
          responseData = {
            todayCalories: { consumed: 1250, target: 2000 },
            todayMacros: { proteinG: 85, carbsG: 120, fatG: 45 }
          };
        } else {
          const response = await dashboardService.getUserDashboard();
          responseData = response.data;
        }
        
        if (responseData) {
          setDashboardData(responseData);
        }
      } catch (error) {
        console.warn('Không thể lấy dữ liệu dashboard:', error.message || error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const displayUser = isPTView ? studentData : (profile || user);

  // Lấy Target từ kết quả Onboarding trong Store
  const metrics = storeMetrics || displayUser?.metrics || {};
  const targetCalories = metrics.dailyCalorieTarget || 2000;
  const targetProtein = metrics.macros?.proteinG || 0;
  const targetCarbs = metrics.macros?.carbsG || 0;
  const targetFat = metrics.macros?.fatG || 0;

  // Dữ liệu tiêu thụ thực tế (từ Dashboard API hoặc mặc định là 0)
  const consumedCalories = dashboardData?.todayCalories?.consumed || 0;
  const consumedProtein = dashboardData?.todayMacros?.proteinG || 0;
  const consumedCarbs = dashboardData?.todayMacros?.carbsG || 0;
  const consumedFat = dashboardData?.todayMacros?.fatG || 0;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng,';
    if (hour < 18) return 'Chào buổi chiều,';
    return 'Chào buổi tối,';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* ===== Curved Header ===== */}
        <View style={styles.headerContainer}>
          <View style={styles.headerTop}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {isPTView && (
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12 }}>
                  <ChevronLeft color="#fff" size={28} />
                </TouchableOpacity>
              )}
              <View style={styles.profileInfo}>
                <View style={styles.avatarContainer}>
                  <Image 
                    source={{ uri: displayUser?.avatarUrl || displayUser?.avatar || 'https://i.pravatar.cc/100' }} 
                    style={styles.avatar} 
                  />
                </View>
                <View>
                  <Text style={styles.greeting}>{isPTView ? 'Học viên của bạn' : getGreeting()}</Text>
                  <Text style={styles.userName}>{displayUser?.fullName || 'Người dùng Nutri'}</Text>
                </View>
              </View>
            </View>
            {!isPTView && (
              <TouchableOpacity style={styles.notificationBtn}>
                <Bell color="#fff" size={22} />
                <View style={styles.badge} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ===== Calorie Card ===== */}
        <NutriCard style={styles.calorieCard}>
          <Text style={styles.cardTitle}>LƯỢNG CALO HÔM NAY</Text>
          <View style={styles.chartWrapper}>
            <CalorieChart current={consumedCalories} target={targetCalories} />
          </View>
          
          <View style={styles.macrosRow}>
            <View style={styles.macroItem}>
              <Text style={styles.macroLabel}>Carbs</Text>
              <Text style={styles.macroValue}>{consumedCarbs}/{targetCarbs}g</Text>
              <View style={[styles.macroBar, { backgroundColor: '#FF8A65', width: (consumedCarbs / (targetCarbs || 1)) * 40 }]} />
            </View>
            <View style={styles.macroItem}>
              <Text style={styles.macroLabel}>Protein</Text>
              <Text style={styles.macroValue}>{consumedProtein}/{targetProtein}g</Text>
              <View style={[styles.macroBar, { backgroundColor: COLORS.primary, width: (consumedProtein / (targetProtein || 1)) * 40 }]} />
            </View>
            <View style={styles.macroItem}>
              <Text style={styles.macroLabel}>Fat</Text>
              <Text style={styles.macroValue}>{consumedFat}/{targetFat}g</Text>
              <View style={[styles.macroBar, { backgroundColor: '#FFC107', width: (consumedFat / (targetFat || 1)) * 40 }]} />
            </View>
          </View>
        </NutriCard>

        {/* ===== Gợi ý bữa ăn ===== */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Gợi ý bữa ăn</Text>
          <TouchableOpacity onPress={() => navigation.navigate('SuggestedMeals')}>
            <Text style={styles.viewAll}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
          <TouchableOpacity style={styles.suggestionCard}>
            <Image source={{ uri: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80' }} style={styles.suggestionImg} />
            <View style={styles.calorieTag}><Text style={styles.tagText}>350 kcal</Text></View>
            <View style={styles.suggestionInfo}>
              <Text style={styles.foodName}>Phở gà</Text>
              <Text style={styles.foodDesc}>Giàu đạm, ít béo</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.suggestionCard}>
            <Image source={{ uri: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80' }} style={styles.suggestionImg} />
            <View style={styles.calorieTag}><Text style={styles.tagText}>280 kcal</Text></View>
            <View style={styles.suggestionInfo}>
              <Text style={styles.foodName}>Gỏi cuốn</Text>
              <Text style={styles.foodDesc}>Nhiều rau xanh</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.suggestionCard}>
            <Image source={{ uri: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=400&q=80' }} style={styles.suggestionImg} />
            <View style={styles.calorieTag}><Text style={styles.tagText}>420 kcal</Text></View>
            <View style={styles.suggestionInfo}>
              <Text style={styles.foodName}>Cơm gà</Text>
              <Text style={styles.foodDesc}>Cân bằng dinh dưỡng</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>

        {/* ===== PRO Upgrade Banner (Only for Free Users) ===== */}
        {displayUser?.tier !== 'PRO' && (
          <TouchableOpacity 
            style={styles.proBanner} 
            onPress={() => navigation.navigate('Pricing')}
          >
            <View style={styles.proBannerContent}>
              <View>
                <Text style={styles.proTitle}>Nâng cấp NutriCoach PRO</Text>
                <Text style={styles.proDesc}>Mở khóa AI Quét thực phẩm & thực đơn riêng</Text>
              </View>
              <Zap size={24} color="#F1C40F" fill="#F1C40F" />
            </View>
          </TouchableOpacity>
        )}

        {/* ===== Dinh dưỡng tuần này ===== */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Dinh dưỡng tuần này</Text>
        </View>
        <NutriCard style={styles.weeklyCard}>
           <View style={styles.barChartRow}>
              {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day, idx) => {
                // Tính toán ngày hiện tại (getDay: 0 là Chủ nhật, 1 là T2)
                const currentDay = new Date().getDay();
                const mappedTodayIdx = currentDay === 0 ? 6 : currentDay - 1;
                const isToday = idx === mappedTodayIdx;
                
                // Xử lý dữ liệu trả về từ API hoặc fallback
                let barHeight = 8; // Chiều cao tối thiểu
                if (weeklySummary && weeklySummary[idx]) {
                  const dayData = weeklySummary[idx];
                  if (dayData.targetCalories > 0) {
                    const ratio = dayData.consumedCalories / dayData.targetCalories;
                    barHeight = Math.min(80, Math.max(8, ratio * 80)); // Max height = 80
                  }
                } else if (!weeklySummary) {
                  // Fallback UI trong lúc chưa có API hoặc đang dùng Mock
                  const mockHeights = [60, 45, 80, 35, 50, 0, 0];
                  barHeight = mockHeights[idx] || 8;
                }

                return (
                  <View key={day} style={styles.barContainer}>
                    <View style={[
                      styles.bar, 
                      { 
                        height: barHeight, 
                        backgroundColor: isToday ? COLORS.primary : '#E9ECEF' 
                      }
                    ]} />
                    <Text style={[styles.barLabel, isToday && { color: COLORS.primary, fontWeight: '700' }]}>{day}</Text>
                  </View>
                );
              })}
           </View>
           <View style={styles.weeklySummary}>
              <Text style={styles.summaryTitle}>Tổng calo hôm nay</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryValue}>{consumedCalories}/{targetCalories} calo</Text>
                <TouchableOpacity style={styles.summaryLink} onPress={() => navigation.navigate('NutritionOverview')}>
                  <Text style={styles.summaryLinkText}>Xem tổng quan</Text>
                  <ChevronRight size={14} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>
           </View>
        </NutriCard>

        {/* ===== Bữa ăn hôm nay ===== */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Bữa ăn hôm nay</Text>
        </View>
        {['Bữa sáng', 'Bữa trưa', 'Bữa tối'].map((meal) => (
          <TouchableOpacity 
            key={meal} 
            style={styles.mealRow}
            onPress={() => navigation.navigate('MealLog')}
          >
            <Text style={styles.mealName}>{meal}</Text>
            <ChevronRight size={20} color={COLORS.textLight} />
          </TouchableOpacity>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  // ===== Header =====
  headerContainer: {
    backgroundColor: COLORS.primary,
    height: 160,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    paddingHorizontal: 20,
    paddingTop: 50,
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
    backgroundColor: '#fff',
    padding: 2,
    marginRight: 12,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
  },
  greeting: {
    fontSize: 13,
    color: COLORS.primaryLight,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  notificationBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF5252',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  // ===== Calorie Card =====
  calorieCard: {
    marginHorizontal: 20,
    marginTop: -40,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    letterSpacing: 1,
    marginBottom: 20,
  },
  chartWrapper: {
    marginBottom: 28,
  },
  macrosRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  macroItem: {
    alignItems: 'center',
    flex: 1,
  },
  macroLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  macroValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  macroBar: {
    height: 3,
    width: 40,
    borderRadius: 2,
  },
  // ===== Sections =====
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 28,
    marginBottom: 16,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },
  viewAll: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  // ===== Suggestions =====
  horizontalScroll: {
    paddingLeft: 20,
    paddingRight: 10,
  },
  suggestionCard: {
    width: 180,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginRight: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  suggestionImg: {
    width: '100%',
    height: 110,
  },
  calorieTag: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  suggestionInfo: {
    padding: 12,
  },
  foodName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  foodDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  // ===== Weekly Chart =====
  weeklyCard: {
    marginHorizontal: 20,
    padding: 20,
  },
  barChartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 100,
    marginBottom: 20,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 24,
    borderRadius: 6,
  },
  barLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  weeklySummary: {
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    paddingTop: 16,
  },
  summaryTitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  summaryLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryLinkText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  // ===== Meals =====
  mealRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: SPACING.borderRadius.lg,
    marginBottom: 8,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  proBanner: {
    marginHorizontal: 20,
    marginTop: 25,
    backgroundColor: COLORS.text,
    borderRadius: 20,
    padding: 20,
    elevation: 4,
  },
  proBannerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  proTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  proDesc: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
});

export default StudentDashboardScreen;
