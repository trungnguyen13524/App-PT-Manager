import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { ChevronRight, CheckCircle } from 'lucide-react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../../theme';

const { width } = Dimensions.get('window');

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
          <ChevronRight color="rgba(0, 0, 0, 0.2)" size={20} style={{ marginLeft: 4 }} />
        </TouchableOpacity>
      </View>

      <View style={{ marginBottom: 32 }}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.scrollContainer}
        >
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
                      <CheckCircle color="#FFFFFF" size={20} />
                    </View>
                  ) : (
                    <View style={styles.questIconPending}>
                      <View style={styles.questDot} />
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={isCompleted ? styles.questTitleCompleted : styles.questTitle} numberOfLines={1}>
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
            <Text style={{color: '#4A5568', textAlign: 'center', marginTop: 12, width: '100%'}}>
              Chưa có nhiệm vụ hôm nay
            </Text>
          )}
        </ScrollView>
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
    color: '#2D3748',
    fontSize: 20,
    fontWeight: 'bold',
  },
  storeBtnContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: COLORS.secondary,
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
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  scrollContainer: {
    gap: 12,
    paddingRight: 24, // Extra padding at the end of scroll
  },
  questCard: {
    width: width * 0.75,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  questIconPending: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  questDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.secondary,
  },
  questIconCompleted: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
  questTitle: {
    color: '#2D3748',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  questTitleCompleted: {
    color: '#4A5568',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
    textDecorationLine: 'line-through',
  },
  questRewardActive: {
    color: COLORS.secondary,
    fontSize: 13,
    fontWeight: 'bold',
  },
  questReward: {
    color: '#4A5568',
    fontSize: 13,
  },
});

export default DailyQuestsCard;
