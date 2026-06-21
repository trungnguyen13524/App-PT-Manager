import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronRight, CheckCircle } from 'lucide-react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../../theme';

const DailyQuestsCard = ({ quests, onQuestPress }) => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <TouchableOpacity 
          style={styles.questTitleWrapper} 
          activeOpacity={0.7} 
          onPress={() => navigation.navigate('Quests')}
        >
          <Text style={styles.sectionTitle}>Nhiệm vụ hôm nay</Text>
          <ChevronRight color="rgba(255, 255, 255, 0.4)" size={20} style={{ marginLeft: 4 }} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.storeBtnContainer} 
          activeOpacity={0.8} 
          onPress={() => navigation.navigate('RewardsStore')}
        >
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
        {quests && quests.length > 0 ? (
          quests.slice(0, 3).map((quest, index) => {
            const isCompleted = quest.status === 'COMPLETED' || quest.status === 'completed' || quest.isCompleted === true || quest.completed === true || (quest.progress !== undefined && quest.target !== undefined && quest.progress >= quest.target);
            return (
              <TouchableOpacity 
                key={quest.id || index} 
                style={styles.questCard} 
                activeOpacity={0.8}
                onPress={() => {
                  if (onQuestPress) {
                    onQuestPress(quest);
                  } else if (!isCompleted) {
                    navigation.navigate('Quests');
                  }
                }}
              >
                {isCompleted ? (
                  <View style={styles.questIconCompleted}>
                    <CheckCircle color="#0F172A" size={20} />
                  </View>
                ) : (
                  <View style={styles.questIconPending}>
                    <View style={styles.questDot} />
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={isCompleted ? styles.questTitleCompleted : styles.questTitle}>
                    {quest.title || quest.name}
                  </Text>
                  <Text style={isCompleted ? styles.questReward : styles.questRewardActive}>
                    +{quest.pointsPerCompletion || quest.points || 50} XP {isCompleted ? '(Đã nhận)' : ''}
                  </Text>
                </View>
              </TouchableOpacity>
            )
          })
        ) : (
          <Text style={{color: '#94A3B8', textAlign: 'center', marginTop: 12}}>
            Chưa có nhiệm vụ hôm nay
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  questTitleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  storeBtnContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#FF4D00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  storeBtnBg: {
    ...StyleSheet.absoluteFillObject,
  },
  storeBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  storeBtnIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  storeBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  questsContainer: {
    gap: 12,
  },
  questCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  questIconPending: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  questDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00B3FF',
  },
  questIconCompleted: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#00FF66',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#00FF66',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
  questTitle: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  questTitleCompleted: {
    color: '#94A3B8',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
    textDecorationLine: 'line-through',
  },
  questRewardActive: {
    color: '#FFB800',
    fontSize: 13,
    fontWeight: 'bold',
  },
  questReward: {
    color: '#94A3B8',
    fontSize: 13,
  },
});

export default DailyQuestsCard;
