import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, CheckCircle, Zap, Star, Shield, Target } from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useMissionStore } from '../../../store/missionStore';
import WaveBackground from '../../../components/common/WaveBackground';
import { COLORS } from '../../../theme';

const { width } = Dimensions.get('window');

const QuestsScreen = () => {
  const navigation = useNavigation();
  const { totalPoints, dailyQuests, challengeQuests, triggerMissionAction, fetchDailyMissions } = useMissionStore();
  const [activeTab, setActiveTab] = useState('daily'); // 'daily' | 'challenge'

  useFocusEffect(
    useCallback(() => {
      const todayStr = new Date().toISOString().split('T')[0];
      fetchDailyMissions(todayStr);
    }, [fetchDailyMissions])
  );

  const getIconForQuest = (id) => {
    switch (id) {
      case 'DAILY_LOGIN': return <Star color="#FFD700" size={24} />;
      case 'AI_SCAN': return <Zap color="#00B3FF" size={24} />;
      case 'PERFECT_DIARY': return <Target color="#556B2F" size={24} />;
      case 'DISCIPLINE_MASTER': return <Shield color="#FF8A00" size={24} />;
      case 'WORKOUT_LIMIT': return <Zap color="#FF4D00" size={24} />;
      case 'PT_VISIT': return <Star color="#00B3FF" size={24} />;
      case 'DAILY_SHARE': return <Star color="#556B2F" size={24} />;
      default: return <Star color="#FFD700" size={24} />;
    }
  };

  const renderQuestCard = (quest) => {
    const isCompleted = quest.status === 'COMPLETED' || quest.status === 'completed' || quest.isCompleted === true || quest.completed === true || (quest.progress !== undefined && quest.target !== undefined && quest.progress >= quest.target);
    const points = quest.points || quest.reward || quest.pointsAwarded || quest.xp || 50;

    return (
      <TouchableOpacity 
        key={quest.id || Math.random().toString()} 
        style={[styles.questCard, isCompleted && styles.questCardCompleted]}
        activeOpacity={0.8}
        onPress={() => {
          if (!isCompleted) {
            const todayStr = new Date().toISOString().split('T')[0];
            triggerMissionAction(quest.type || quest.id || quest.questId, undefined, todayStr);
          }
        }}
      >
        <View style={styles.questIconContainer}>
          {getIconForQuest(quest.id || quest.type)}
        </View>
        <View style={styles.questInfo}>
          <Text style={[styles.questTitle, isCompleted && styles.questTitleCompleted]}>
            {quest.title}
          </Text>
          <View style={styles.rewardRow}>
            <Text style={styles.questReward}>+{points} XP</Text>
            {(quest.max || quest.target) && (
              <Text style={styles.progressText}>
                {quest.progress || 0}/{quest.max || quest.target}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.statusContainer}>
          {isCompleted ? (
            <CheckCircle color={COLORS.primary} size={28} />
          ) : (
            <View style={styles.pendingCircle}>
              <View style={styles.pendingDot} />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={COLORS.text} size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nhiệm Vụ</Text>
        <View style={styles.walletBadge}>
          <Text style={styles.walletIcon}>🪙</Text>
          <Text style={styles.walletText}>{totalPoints.toLocaleString('en-US')}</Text>
        </View>
      </View>

      {/* List */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Nhiệm vụ hôm nay</Text>
        
        {dailyQuests.length > 0 
          ? dailyQuests.map(renderQuestCard) 
          : <Text style={{color: COLORS.textLight, textAlign: 'center', marginTop: 20}}>Chưa có nhiệm vụ</Text>
        }
        
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    color: COLORS.secondary,
  },
  walletBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(217, 119, 6, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.3)',
  },
  walletIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  walletText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#D97706',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  tabText: {
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '700',
  },
  activeTabText: {
    color: '#556B2F',
    fontWeight: '900',
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.secondary,
    marginBottom: 16,
  },
  questCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  questCardCompleted: {
    backgroundColor: 'rgba(85, 107, 47, 0.08)',
    borderColor: COLORS.primary,
  },
  questIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  questInfo: {
    flex: 1,
  },
  questTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  questTitleCompleted: {
    color: COLORS.textSecondary,
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  questReward: {
    fontSize: 14,
    fontWeight: '800',
    color: '#D97706',
    marginRight: 12,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusContainer: {
    marginLeft: 16,
  },
  pendingCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pendingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
});

export default QuestsScreen;
