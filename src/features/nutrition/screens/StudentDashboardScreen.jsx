import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity, 
  Image,
  Dimensions,
  StatusBar,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { Bell, ChevronRight, Zap, ChevronLeft, CheckCircle, Shield, Share2, X, Dumbbell } from 'lucide-react-native';
import Svg, { Defs, LinearGradient, Stop, Rect, Circle as SvgCircle } from 'react-native-svg';
import { COLORS, TYPOGRAPHY, SPACING } from '../../../theme';
import { useUserStore } from '../../../store/userStore';
import { useNutritionStore } from '../../../store/nutritionStore';
import { useAuthStore } from '../../../store/authStore';
import { useMissionStore } from '../../../store/missionStore';
import CalorieChart from '../../../components/student/CalorieChart';
import NutriCard from '../../../components/shared/NutriCard';

const { width } = Dimensions.get('window');

import { dashboardService } from '../../../api/services';

const AbstractBackground = React.memo(() => (
  <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
    <Svg width="100%" height="100%">
      <Defs>
        <LinearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#0F172A" />
          <Stop offset="100%" stopColor="#1E293B" />
        </LinearGradient>
        <LinearGradient id="circleGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#00FF66" stopOpacity="0.1" />
          <Stop offset="100%" stopColor="#00B3FF" stopOpacity="0.03" />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#bgGrad)" />
      <SvgCircle cx="15%" cy="10%" r="140" fill="url(#circleGrad1)" />
      <SvgCircle cx="90%" cy="40%" r="180" fill="url(#circleGrad1)" />
    </Svg>
  </View>
));

const StudentDashboardScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { isPTView, studentData } = route.params || {};
  
  const { user } = useAuthStore();
  const { profile, metrics: storeMetrics, fetchProfile } = useUserStore();
  const { weeklySummary, fetchWeeklySummary } = useNutritionStore();
  const { totalPoints, showReward, fetchDailyMissions, triggerMissionAction } = useMissionStore();
  
  const [dashboardData, setDashboardData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  
  const [isShareModalVisible, setIsShareModalVisible] = React.useState(false);
  const viewShotRef = React.useRef();

  const handleShareClick = () => {
    setIsShareModalVisible(true);
  };

  const executeShare = async () => {
    try {
      if (!viewShotRef.current) return;
      const uri = await viewShotRef.current.capture();
      
      setIsShareModalVisible(false);
      
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        alert("Chia sẻ không khả dụng trên thiết bị của bạn");
        return;
      }
      
      await Sharing.shareAsync(uri, { dialogTitle: 'Khoe thành tích NutriCoach của bạn!' });
      
      // Trigger mission
      const todayStr = new Date().toISOString().split('T')[0];
      await triggerMissionAction('DAILY_SHARE', 'dashboard', todayStr);
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  React.useEffect(() => {
    fetchProfile(); 
    
    const todayStr = new Date().toISOString().split('T')[0];
    fetchWeeklySummary(todayStr);

    if (!isPTView) {
      fetchDailyMissions(todayStr);
    }

    const fetchDashboard = async () => {
      try {
        const { USE_MOCK } = require('../../../mocks');
        let responseData;
        
        if (USE_MOCK) {
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
  const metrics = storeMetrics || displayUser?.metrics || {};
  const targetCalories = metrics.dailyCalorieTarget || 2000;
  const targetProtein = metrics.macros?.proteinG || 0;
  const targetCarbs = metrics.macros?.carbsG || 0;
  const targetFat = metrics.macros?.fatG || 0;

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
      <AbstractBackground />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        
        {/* ===== Header (Player Profile) ===== */}
        <View style={styles.headerContainer}>
          <View style={styles.headerTop}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              {isPTView && (
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12 }}>
                  <ChevronLeft color="rgba(255, 255, 255, 0.9)" size={28} />
                </TouchableOpacity>
              )}
              <View style={styles.profileInfo}>
                <View style={styles.avatarContainer}>
                  <Image 
                    source={{ uri: displayUser?.avatarUrl || displayUser?.avatar || 'https://i.pravatar.cc/100' }} 
                    style={styles.avatar} 
                  />
                </View>
                <View style={{ flex: 1, justifyContent: 'center' }}>
                  <Text style={styles.greeting}>{isPTView ? 'Học viên của bạn' : getGreeting()}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[styles.userName, { flexShrink: 1 }]} numberOfLines={1}>{displayUser?.fullName || 'Người dùng Nutri'}</Text>
                  </View>
                </View>
              </View>
            </View>
            <View style={styles.headerRight}>
              <View style={styles.rankBadge}>
                <Shield color="#00FF66" size={12} strokeWidth={3} />
                <Text style={styles.rankText}>LV.12</Text>
              </View>
              <TouchableOpacity style={styles.walletBadge} activeOpacity={0.8} onPress={() => navigation.navigate('RewardsStore')}>
                <Text style={styles.walletIcon}>🪙</Text>
                <Text style={styles.walletText}>{totalPoints.toLocaleString('en-US')}</Text>
              </TouchableOpacity>
              {!isPTView && (
                <TouchableOpacity style={[styles.notificationBtn, { marginLeft: 12 }]}>
                  <Bell color="#00FF66" size={22} />
                  <View style={styles.badge} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* ===== Main Calorie Card (Energy Core) ===== */}
        <View style={[styles.glassCard, styles.calorieCard]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={styles.cardTitle}>NĂNG LƯỢNG LÕI</Text>
            {!isPTView && (
              <TouchableOpacity onPress={handleShareClick} style={styles.shareBtn}>
                <Share2 color="#FFF" size={16} />
                <Text style={styles.shareText}>Khoe ngay</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.chartWrapper}>
            <CalorieChart current={consumedCalories} target={targetCalories} />
          </View>
        
          <View style={styles.macrosRow}>
            <View style={styles.macroItem}>
              <Text style={styles.macroLabel}>Carbs</Text>
              <Text style={styles.macroValue}>{consumedCarbs}/{targetCarbs}g</Text>
              <View style={styles.macroTrack}>
                <View style={[styles.macroBar, { backgroundColor: '#00B3FF', width: `${Math.min((consumedCarbs / (targetCarbs || 1)) * 100, 100)}%`, shadowColor: '#00B3FF' }]} />
              </View>
            </View>
            <View style={styles.macroItem}>
              <Text style={styles.macroLabel}>Protein</Text>
              <Text style={styles.macroValue}>{consumedProtein}/{targetProtein}g</Text>
              <View style={styles.macroTrack}>
                <View style={[styles.macroBar, { backgroundColor: '#00FF66', width: `${Math.min((consumedProtein / (targetProtein || 1)) * 100, 100)}%`, shadowColor: '#00FF66' }]} />
              </View>
            </View>
            <View style={styles.macroItem}>
              <Text style={styles.macroLabel}>Fat</Text>
              <Text style={styles.macroValue}>{consumedFat}/{targetFat}g</Text>
              <View style={styles.macroTrack}>
                <View style={[styles.macroBar, { backgroundColor: '#FF4D00', width: `${Math.min((consumedFat / (targetFat || 1)) * 100, 100)}%`, shadowColor: '#FF4D00' }]} />
              </View>
            </View>
          </View>
        </View>

        {/* ===== Nhiệm vụ hôm nay (Daily Quests) ===== */}
        <View style={styles.sectionHeader}>
          <TouchableOpacity style={styles.questTitleWrapper} activeOpacity={0.7} onPress={() => navigation.navigate('Quests')}>
            <Text style={styles.sectionTitle}>Nhiệm vụ hôm nay</Text>
            <ChevronRight color="rgba(255, 255, 255, 0.4)" size={20} style={{ marginLeft: 4 }} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.storeBtnContainer} activeOpacity={0.8} onPress={() => navigation.navigate('RewardsStore')}>
            <View style={styles.storeBtnBg}>
              <Svg width="100%" height="100%">
                <Defs>
                  <LinearGradient id="storeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor="#FFB800" stopOpacity="1" />
                    <Stop offset="100%" stopColor="#FF4D00" stopOpacity="1" />
                  </LinearGradient>
                </Defs>
                <Rect width="100%" height="100%" fill="url(#storeGrad)" />
              </Svg>
            </View>
            <View style={styles.storeBtnContent}>
              <Text style={styles.storeBtnIcon}>🎁</Text>
              <Text style={styles.storeBtnText}>Đổi Quà</Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={[styles.questsContainer, { marginBottom: 32 }]}>
          <TouchableOpacity style={styles.questCard} activeOpacity={0.8}>
            <View style={styles.questIconCompleted}>
              <CheckCircle color="#0F172A" size={20} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.questTitleCompleted}>Scan bữa sáng</Text>
              <Text style={styles.questReward}>+50 XP (Đã nhận)</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.questCard} activeOpacity={0.8}>
            <View style={styles.questIconPending}>
              <View style={styles.questDot} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.questTitle}>Scan bữa trưa</Text>
              <Text style={styles.questRewardActive}>+50 XP</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ===== Gợi ý bữa ăn ===== */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Gợi ý bữa ăn</Text>
          <TouchableOpacity onPress={() => navigation.navigate('SuggestedMeals')}>
            <Text style={styles.viewAllLink}>Xem tất cả</Text>
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

        {/* ===== PRO Upgrade Banner ===== */}
        {displayUser?.tier !== 'PRO' && (
          <TouchableOpacity 
            style={styles.proBannerWrapper} 
            onPress={() => navigation.navigate('Pricing')}
            activeOpacity={0.9}
          >
            <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
              <Defs>
                <LinearGradient id="proGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#FF8A00" stopOpacity="1" />
                  <Stop offset="100%" stopColor="#E52E71" stopOpacity="1" />
                </LinearGradient>
              </Defs>
              <Rect width="100%" height="100%" fill="url(#proGrad)" />
            </Svg>
            <View style={styles.proBannerContent}>
              <View>
                <Text style={styles.proTitle}>👑 VIP UNLOCK</Text>
                <Text style={styles.proDesc}>Mở khóa AI Quét thực phẩm & thực đơn riêng</Text>
              </View>
              <Zap size={28} color="#FFF" fill="#FFF" />
            </View>
          </TouchableOpacity>
        )}

        {/* ===== Dinh dưỡng tuần này ===== */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Dinh dưỡng tuần này</Text>
        </View>
        <View style={[styles.glassCard, styles.weeklyCard]}>
           <View style={styles.barChartRow}>
              {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day, idx) => {
                const currentDay = new Date().getDay();
                const mappedTodayIdx = currentDay === 0 ? 6 : currentDay - 1;
                const isToday = idx === mappedTodayIdx;
                
                let barHeight = 8;
                if (weeklySummary && weeklySummary[idx]) {
                  const dayData = weeklySummary[idx];
                  if (dayData.targetCalories > 0) {
                    const ratio = dayData.consumedCalories / dayData.targetCalories;
                    barHeight = Math.min(80, Math.max(8, ratio * 80));
                  }
                } else if (!weeklySummary) {
                  const mockHeights = [60, 45, 80, 35, 50, 0, 0];
                  barHeight = mockHeights[idx] || 8;
                }

                return (
                  <View key={day} style={styles.barContainer}>
                    <View style={[
                      styles.bar, 
                      { 
                        height: barHeight, 
                        backgroundColor: isToday ? '#00FF66' : 'rgba(255,255,255,0.1)' 
                      },
                      isToday && styles.glowShadow
                    ]} />
                    <Text style={[styles.barLabel, isToday && { color: '#00FF66', fontWeight: '900' }]}>{day}</Text>
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
                  <ChevronRight size={14} color="#00FF66" />
                </TouchableOpacity>
              </View>
           </View>
        </View>

        {/* ===== Bữa ăn hôm nay ===== */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Bữa ăn hôm nay</Text>
        </View>
        {['Bữa sáng', 'Bữa trưa', 'Bữa tối'].map((meal) => (
          <TouchableOpacity 
            key={meal} 
            style={[styles.glassCard, styles.mealRow]}
            onPress={() => navigation.navigate('MealLog')}
          >
            <Text style={styles.mealName}>{meal}</Text>
            <ChevronRight size={20} color="#00FF66" />
          </TouchableOpacity>
        ))}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* SHARE PREVIEW MODAL */}
      <Modal visible={isShareModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.sharePreviewContainer}>
            <TouchableOpacity 
              style={styles.closeModalBtn} 
              onPress={() => setIsShareModalVisible(false)}
            >
              <X color="#FFF" size={24} />
            </TouchableOpacity>

            <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1 }}>
              <View style={styles.shareCardTemplate}>
                <Svg style={StyleSheet.absoluteFillObject}>
                  <Defs>
                    <LinearGradient id="shareBg" x1="0%" y1="0%" x2="100%" y2="100%">
                      <Stop offset="0%" stopColor="#0F172A" />
                      <Stop offset="50%" stopColor="#1E293B" />
                      <Stop offset="100%" stopColor="#0F172A" />
                    </LinearGradient>
                  </Defs>
                  <Rect width="100%" height="100%" fill="url(#shareBg)" />
                </Svg>

                <View style={styles.shareHeader}>
                  <View style={styles.logoBadge}>
                    <Dumbbell color="#0F172A" size={16} />
                  </View>
                  <Text style={styles.shareAppName}>NutriCoach</Text>
                </View>

                <View style={styles.shareGreeting}>
                  <Text style={styles.shareGreetingText}>Chiến binh</Text>
                  <Text style={styles.shareGreetingName}>{displayUser?.fullName || 'Nutri User'}</Text>
                </View>

                <View style={styles.shareChartBox}>
                  <Text style={styles.shareTitle}>THÀNH TÍCH HÔM NAY</Text>
                  <CalorieChart current={consumedCalories} target={targetCalories} />
                </View>

                <View style={styles.shareMacrosBox}>
                  <View style={styles.shareMacroItem}>
                    <Text style={styles.shareMacroLabel}>CARBS</Text>
                    <Text style={styles.shareMacroValue}>{consumedCarbs}/{targetCarbs}g</Text>
                  </View>
                  <View style={styles.shareMacroItem}>
                    <Text style={styles.shareMacroLabel}>PROTEIN</Text>
                    <Text style={styles.shareMacroValue}>{consumedProtein}/{targetProtein}g</Text>
                  </View>
                  <View style={styles.shareMacroItem}>
                    <Text style={styles.shareMacroLabel}>FAT</Text>
                    <Text style={styles.shareMacroValue}>{consumedFat}/{targetFat}g</Text>
                  </View>
                </View>

                <Text style={styles.shareFooterText}>Cùng sống khỏe, rèn luyện thông minh! 🚀</Text>
              </View>
            </ViewShot>

            <TouchableOpacity style={styles.confirmShareBtn} onPress={executeShare}>
              <Share2 color="#0F172A" size={20} />
              <Text style={styles.confirmShareText}>Chia sẻ ngay (+30 XP)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    overflow: 'hidden',
  },
  glowShadow: {
    shadowColor: '#00FF66',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
  },
  
  // ===== Header =====
  headerContainer: {
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 12,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0, 255, 102, 0.1)',
    padding: 3,
    marginRight: 16,
    borderWidth: 1.5,
    borderColor: '#00FF66',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
  },
  greeting: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.65)',
    marginBottom: 4,
  },
  userName: {
    fontSize: 20,
    fontWeight: '900',
    color: 'rgba(255, 255, 255, 0.9)',
    marginRight: 8,
  },
  rankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 102, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 102, 0.3)',
  },
  rankText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#00FF66',
    marginLeft: 4,
  },
  walletBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 184, 0, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 184, 0, 0.4)',
    marginLeft: 8,
    shadowColor: '#FFB800',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 4,
  },
  walletIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  walletText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFB800',
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF4D00',
  },

  // ===== Calorie Card =====
  calorieCard: {
    marginHorizontal: 20,
    marginTop: 10,
    padding: 24,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 2,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)'
  },
  shareText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
    marginLeft: 4,
  },
  chartWrapper: {
    marginBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
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
    color: 'rgba(255, 255, 255, 0.65)',
    marginBottom: 6,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  macroValue: {
    fontSize: 16,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 10,
    fontVariant: ['tabular-nums'],
  },
  macroTrack: {
    height: 6,
    width: 40,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  macroBar: {
    height: '100%',
    borderRadius: 3,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 5,
  },

  // ===== Sections =====
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 32,
    marginBottom: 16,
  },
  questTitleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 24,
  },
  storeBtnContainer: {
    borderRadius: 16,
    shadowColor: '#FF8A00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 2,
    backgroundColor: '#FF8A00',
  },
  storeBtnBg: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    overflow: 'hidden',
  },
  storeBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  storeBtnIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  storeBtnText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  viewAllLink: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.65)',
    fontWeight: '600',
  },

  // ===== Daily Quests =====
  questsContainer: {
    marginHorizontal: 20,
    gap: 12,
  },
  questCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  questIconCompleted: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#00FF66',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#00FF66',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
  questIconPending: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  questDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
  },
  questTitleCompleted: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.65)',
    textDecorationLine: 'line-through',
  },
  questTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  questReward: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.65)',
    marginTop: 4,
  },
  questRewardActive: {
    fontSize: 13,
    color: '#00FF66',
    fontWeight: '700',
    marginTop: 4,
  },

  // ===== Suggestions =====
  horizontalScroll: {
    paddingLeft: 20,
    paddingRight: 10,
  },
  suggestionCard: {
    width: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 24,
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    overflow: 'hidden',
  },
  suggestionImg: {
    width: '100%',
    height: 130,
  },
  calorieTag: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  tagText: {
    color: '#00FF66',
    fontSize: 12,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  suggestionInfo: {
    padding: 16,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  foodDesc: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.65)',
    marginTop: 4,
  },

  // ===== Weekly Chart =====
  weeklyCard: {
    marginHorizontal: 20,
    padding: 24,
  },
  barChartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    marginBottom: 24,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 12,
    borderRadius: 6,
  },
  barLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.65)',
    fontWeight: '700',
    marginTop: 12,
  },
  weeklySummary: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 20,
  },
  summaryTitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.65)',
    fontWeight: '700',
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '900',
    color: 'rgba(255, 255, 255, 0.9)',
    fontVariant: ['tabular-nums'],
  },
  summaryLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryLinkText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#00FF66',
    marginRight: 4,
  },

  // ===== Meals =====
  mealRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    padding: 20,
    marginBottom: 12,
  },
  mealName: {
    fontSize: 18,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  
  // ===== PRO Banner =====
  proBannerWrapper: {
    marginHorizontal: 20,
    marginTop: 32,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#FF8A00',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  proBannerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
  },
  proTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  proDesc: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontWeight: '500',
  },
  // Modal & Share Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sharePreviewContainer: {
    width: '90%',
    alignItems: 'center',
  },
  closeModalBtn: {
    position: 'absolute',
    top: -40,
    right: 0,
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    zIndex: 10,
  },
  shareCardTemplate: {
    width: 320,
    height: 480,
    borderRadius: 24,
    overflow: 'hidden',
    padding: 24,
    justifyContent: 'space-between',
    backgroundColor: '#0F172A',
  },
  shareHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#00FF66',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  shareAppName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 1,
  },
  shareGreeting: {
    marginTop: 16,
  },
  shareGreetingText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  shareGreetingName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFF',
  },
  shareChartBox: {
    alignItems: 'center',
    marginVertical: 16,
    paddingVertical: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  shareTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#00B3FF',
    letterSpacing: 2,
    marginBottom: 16,
  },
  shareMacrosBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  shareMacroItem: {
    alignItems: 'center',
  },
  shareMacroLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 4,
  },
  shareMacroValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
  shareFooterText: {
    textAlign: 'center',
    color: '#00FF66',
    fontWeight: '700',
    fontSize: 14,
    marginTop: 16,
  },
  confirmShareBtn: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00FF66',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    shadowColor: '#00FF66',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  confirmShareText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginLeft: 8,
  },
});

export default StudentDashboardScreen;
