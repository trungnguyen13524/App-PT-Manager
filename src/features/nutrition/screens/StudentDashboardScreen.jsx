import React, { useState, useRef, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity, 
  StatusBar,
  Modal,
  Platform,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { X, Dumbbell } from 'lucide-react-native';
import Svg, { Defs, LinearGradient, Stop, Rect, Circle as SvgCircle } from 'react-native-svg';

import { usersService, dashboardService, questsService, nutritionService } from '../../../api/services';
import { COLORS } from '../../../theme';

// Subcomponents
import DashboardHeader from '../../../components/student/dashboard/DashboardHeader';
import CalorieCoreCard from '../../../components/student/dashboard/CalorieCoreCard';
import DailyQuestsCard from '../../../components/student/dashboard/DailyQuestsCard';
import ProUpgradeBanner from '../../../components/student/dashboard/ProUpgradeBanner';
import WeeklyNutritionTracker from '../../../components/student/dashboard/WeeklyNutritionTracker';
import MealLoggingSection from '../../../components/student/dashboard/MealLoggingSection';

// Shared
import CalorieChart from '../../../components/student/CalorieChart';

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
  
  // State
  const [userData, setUserData] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [questsData, setQuestsData] = useState({ quests: [], totalPoints: 0 });
  const [weeklyData, setWeeklyData] = useState([]);
  const [todayMacrosData, setTodayMacrosData] = useState(null);
  
  // Loading States
  const [loadingMain, setLoadingMain] = useState(true);
  const [loadingWeekly, setLoadingWeekly] = useState(true);
  
  // Share Modal
  const [isShareModalVisible, setIsShareModalVisible] = useState(false);
  const viewShotRef = useRef();

  const fetchMainData = useCallback(async () => {
    try {
      // We don't want to set loadingMain to true for background refreshes
      // to avoid flashing the whole screen.
      const [userRes, dashRes, questRes] = await Promise.all([
        usersService.getMe(),
        dashboardService.getUserDashboard(),
        questsService.getDailyQuests()
      ]);

      const user = userRes.data;
      if (user.onboardingCompleted === false) {
        navigation.replace('Onboarding');
        return;
      }

      setUserData(user);
      setDashboardData(dashRes.data || {});
      setQuestsData({
        quests: questRes.data?.quests || [],
        totalPoints: questRes.data?.totalPoints || 0
      });
    } catch (error) {
      console.warn('Lỗi tải dữ liệu Dashboard:', error);
    }
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadAll = async () => {
        setLoadingMain(true);
        await fetchMainData();
        if (isActive) setLoadingMain(false);
      };
      
      loadAll();

      const fetchWeeklyData = async () => {
        try {
          setLoadingWeekly(true);
          
          // Get start of the week (Monday) based on UTC to align with backend
          const today = new Date();
          const utcNow = new Date(today.toISOString().split('T')[0] + 'T12:00:00Z');
          const currentDay = utcNow.getUTCDay();
          const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;
          
          const startDate = new Date(utcNow);
          startDate.setUTCDate(utcNow.getUTCDate() - distanceToMonday);

          const dateStrings = [];
          for (let i = 0; i < 7; i++) {
            const date = new Date(startDate);
            date.setUTCDate(startDate.getUTCDate() + i);
            dateStrings.push(date.toISOString().split('T')[0]);
          }

          // Fetch all 7 days parallel, catching individual errors to fallback to 0
          const weeklyPromises = dateStrings.map(dateStr => 
            nutritionService.getDailySummary({ date: dateStr })
              .then(res => {
                const unwrapped = res.data || res;
                return {
                  date: dateStr,
                  consumedCalories: unwrapped.consumed?.calories || unwrapped.consumedCalories || unwrapped.todayCalories?.consumed || 0,
                  targetCalories: unwrapped.target?.calories || unwrapped.targetCalories || unwrapped.todayCalories?.target || 2000
                };
              })
              .catch(() => ({
                date: dateStr,
                consumedCalories: 0,
                targetCalories: 2000
              }))
          );

          const weeklyResults = await Promise.all(weeklyPromises);
          
          // Fetch exact today summary to get macros
          const todayStr = new Date().toISOString().split('T')[0];
          try {
            const todayRes = await nutritionService.getDailySummary({ date: todayStr });
            const todayUnwrapped = todayRes.data || todayRes;
            setTodayMacrosData({
              protein: { consumed: todayUnwrapped?.consumed?.proteinG || 0, target: todayUnwrapped?.target?.proteinG || 150 },
              carbs: { consumed: todayUnwrapped?.consumed?.carbsG || 0, target: todayUnwrapped?.target?.carbsG || 200 },
              fat: { consumed: todayUnwrapped?.consumed?.fatG || 0, target: todayUnwrapped?.target?.fatG || 60 }
            });
          } catch(e) {
            setTodayMacrosData(null);
          }
          
          if (isActive) {
            setWeeklyData(weeklyResults);
            setLoadingWeekly(false);
          }
        } catch (error) {
          console.warn('Lỗi tải thống kê tuần:', error);
          if (isActive) setLoadingWeekly(false);
        }
      };

      fetchWeeklyData();

      return () => {
        isActive = false;
      };
    }, [fetchMainData])
  );

  const handleQuestPress = async (quest) => {
    if (quest.isCompleted) return;
    const { useMissionStore } = require('../../../store/missionStore');
    const todayStr = new Date().toISOString().split('T')[0];
    const success = await useMissionStore.getState().triggerMissionAction(quest.type || quest.id || quest.questId, undefined, todayStr);
    if (success) {
      fetchMainData();
    }
  };

  const executeShare = async () => {
    try {
      let uri = null;
      if (Platform.OS !== 'web' && viewShotRef.current) {
        uri = await viewShotRef.current.capture();
      }
      
      if (uri) {
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(uri, { 
            mimeType: 'image/png', 
            dialogTitle: 'Khoe thành tích NutriCoach của bạn!',
            UTI: 'public.image' 
          });
        }
      }
      setIsShareModalVisible(false);
      
      // Auto trigger DAILY_SHARE mission
      const { useMissionStore } = require('../../../store/missionStore');
      const todayStr = new Date().toISOString().split('T')[0];
      const success = await useMissionStore.getState().triggerMissionAction('DAILY_SHARE', undefined, todayStr);
      if (success) {
        fetchMainData();
      }
    } catch (error) {
      console.error('Lỗi khi share:', error);
      setIsShareModalVisible(false);
    }
  };

  if (loadingMain) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <AbstractBackground />
        <ActivityIndicator size="large" color="#00FF66" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <AbstractBackground />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <DashboardHeader user={userData} totalPoints={questsData.totalPoints} />
        
        <CalorieCoreCard 
          todayCalories={dashboardData?.todayCalories}
          todayMacros={todayMacrosData || dashboardData?.todayMacros}
          streakDays={dashboardData?.streakDays || 0}
          onShareClick={() => setIsShareModalVisible(true)}
        />
        
        <DailyQuestsCard quests={questsData.quests} onQuestPress={handleQuestPress} />
        
        <ProUpgradeBanner tier={userData?.tier} />
        
        <WeeklyNutritionTracker 
          weeklyData={weeklyData} 
          loading={loadingWeekly} 
          todayConsumed={dashboardData?.todayCalories?.consumed || 0}
          todayTarget={dashboardData?.todayCalories?.target || 2000}
        />
        
        <MealLoggingSection mealsBreakdown={dashboardData?.mealsBreakdown} />
      </ScrollView>

      {/* SHARE MODAL */}
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
                  <Text style={styles.shareGreetingName}>{userData?.fullName || 'Nutri User'}</Text>
                </View>

                <View style={styles.shareChartBox}>
                  <Text style={styles.shareTitle}>THÀNH TÍCH HÔM NAY</Text>
                  <CalorieChart 
                    current={dashboardData?.todayCalories?.consumed || 0} 
                    target={dashboardData?.todayCalories?.target || 2000} 
                  />
                </View>
              </View>
            </ViewShot>

            <TouchableOpacity style={styles.shareActionBtn} onPress={executeShare}>
              <Text style={styles.shareActionBtnText}>Đăng Khoảnh Khắc</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sharePreviewContainer: {
    width: '85%',
    alignItems: 'center',
  },
  closeModalBtn: {
    alignSelf: 'flex-end',
    marginBottom: 16,
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
  },
  shareCardTemplate: {
    width: 320,
    backgroundColor: '#0F172A',
    borderRadius: 24,
    padding: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  shareHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#00FF66',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  shareAppName: {
    color: '#00FF66',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  shareGreeting: {
    marginBottom: 24,
  },
  shareGreetingText: {
    color: '#94A3B8',
    fontSize: 14,
    marginBottom: 4,
  },
  shareGreetingName: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  shareChartBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  shareTitle: {
    color: '#00B3FF',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 16,
  },
  shareActionBtn: {
    backgroundColor: '#00FF66',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginTop: 32,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#00FF66',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  shareActionBtnText: {
    color: '#0B0F19',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default StudentDashboardScreen;
