import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Search, Filter, Play, Clock, BarChart, Dumbbell, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../../theme';
import { useWorkoutStore } from '../../../store/workoutStore';
import { useNutritionStore } from '../../../store/nutritionStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WORKOUT_IMAGES, toImageKey } from '../../../assets';

const { width } = Dimensions.get('window');

const WorkoutListScreen = () => {
  const navigation = useNavigation();
  const { programs, isLoading: isProgramsLoading, fetchExercises, startSession } = useWorkoutStore();
  const { suggestedWorkout, fetchActiveMealPlan, isLoading: isNutritionLoading } = useNutritionStore();

  // Mặc định mở Ngày đầu tiên (index 0), các ngày khác đóng
  const [expandedDays, setExpandedDays] = useState({ 0: true });

  const toggleDay = (idx) => {
    setExpandedDays(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleStartAiWorkout = (dayPlan, dayIndex) => {
    const sessionData = {
      id: `ai_day_${dayIndex + 1}`,
      name: `Buổi tập AI - Ngày ${dayIndex + 1}: ${dayPlan.focus}`,
      exercises: dayPlan.exercises.map(ex => ({
        ...ex,
        title: ex.display_name || ex.exercise_name,
        name: ex.display_name || ex.exercise_name,
      }))
    };
    startSession(sessionData);
    navigation.navigate('ActiveWorkout');
  };

  useEffect(() => {
    fetchExercises();
    fetchActiveMealPlan();
  }, []);

  const isLoading = isProgramsLoading || isNutritionLoading;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Luyện tập</Text>
        <TouchableOpacity style={styles.historyBtn} onPress={() => navigation.navigate('WorkoutHistory')}>
          <Clock color={COLORS.primary} size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {isLoading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
        ) : (
          <>
            {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search color={COLORS.textLight} size={20} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm bài tập, nhóm cơ..."
            placeholderTextColor={COLORS.textLight}
          />
          <TouchableOpacity style={styles.filterBtn}>
            <Filter color="#fff" size={18} />
          </TouchableOpacity>
        </View>

        {/* Categories (Quick Filter) */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categories}>
          {['Tất cả', 'Cơ ngực', 'Cơ bụng', 'Cơ chân', 'Yoga', 'Cardio'].map((cat, idx) => (
            <TouchableOpacity 
              key={idx} 
              style={[styles.catBtn, cat === 'Tất cả' && styles.catBtnActive]}
            >
              <Text style={[styles.catBtnText, cat === 'Tất cả' && styles.catBtnTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity 
          style={styles.libraryBanner} 
          activeOpacity={0.8}
          onPress={() => navigation.navigate('ServerExerciseLibrary')}
        >
          <View style={styles.libraryBannerIcon}>
            <Search color="#fff" size={24} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.libraryBannerTitle}>Khám phá Thư Viện Bài Tập</Text>
            <Text style={styles.libraryBannerSub}>Hơn 200+ bài tập với hướng dẫn chi tiết</Text>
          </View>
        </TouchableOpacity>

        {/* AI Workout Section */}
        {suggestedWorkout && suggestedWorkout.length > 0 && (
          <View style={{ marginBottom: 25 }}>
            <Text style={styles.sectionTitle}>Lịch tập AI (Gợi ý cho bạn)</Text>
            {suggestedWorkout.map((dayPlan, idx) => {
              const isRest = !dayPlan.exercises || dayPlan.exercises.length === 0;
              return (
                <View key={`ai-work-${idx}`} style={styles.aiWorkoutCard}>
                  <TouchableOpacity 
                    style={styles.aiHeader}
                    onPress={() => toggleDay(idx)}
                    activeOpacity={0.7}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.aiDayText}>Ngày {dayPlan.day} • {dayPlan.session_name}</Text>
                      <Text style={styles.aiDuration}>{dayPlan.duration_minutes} phút</Text>
                    </View>
                    <View style={styles.expandIconContainer}>
                      {expandedDays[idx] ? (
                        <ChevronUp color="#94A3B8" size={24} />
                      ) : (
                        <ChevronDown color="#94A3B8" size={24} />
                      )}
                    </View>
                  </TouchableOpacity>

                  {/* Chỉ hiển thị nội dung nếu ngày đó được mở */}
                  {expandedDays[idx] && (
                    <View style={styles.aiExpandedContent}>
                      {isRest ? (
                        <View style={styles.restDayContainer}>
                          <Text style={styles.restText}>Hôm nay là ngày nghỉ (Rest Day) 🌿</Text>
                          <Text style={styles.restNotes}>{dayPlan.notes}</Text>
                        </View>
                      ) : (
                        <View style={styles.aiContent}>
                          <Text style={styles.aiFocus}>Nhóm cơ: {dayPlan.focus}</Text>
                          {dayPlan.exercises.map((ex, exIdx) => {
                            const exName = ex.display_name || ex.exercise_name;
                            const imgKey = toImageKey(exName);
                            const imageSource = WORKOUT_IMAGES[imgKey];
                            
                            return (
                              <View key={exIdx} style={styles.premiumExerciseCard}>
                                {imageSource ? (
                                  <Image source={imageSource} style={styles.premiumThumb} />
                                ) : (
                                  <View style={[styles.premiumThumb, { backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center' }]}>
                                    <Dumbbell color="#94A3B8" size={24} />
                                  </View>
                                )}
                                <View style={styles.premiumInfo}>
                                  <Text style={styles.premiumNameText} numberOfLines={1}>{exName}</Text>
                                  <View style={styles.premiumBadgesRow}>
                                    <View style={styles.badge}>
                                      <Text style={styles.badgeText}>{ex.sets} Sets</Text>
                                    </View>
                                    <View style={styles.badge}>
                                      <Text style={styles.badgeText}>{ex.reps}</Text>
                                    </View>
                                  </View>
                                </View>
                                <TouchableOpacity style={styles.premiumPlayBtn}>
                                  <ChevronRight color="#94A3B8" size={20} />
                                </TouchableOpacity>
                              </View>
                            );
                          })}
                          <TouchableOpacity 
                              style={styles.startAiBtn}
                              onPress={() => handleStartAiWorkout(dayPlan, idx)}
                            >
                              <Play color="#FFF" size={20} style={{ marginRight: 8 }} />
                              <Text style={styles.startAiBtnText}>Bắt đầu buổi tập này</Text>
                            </TouchableOpacity>
                          {dayPlan.notes ? <Text style={styles.aiNotes}>💡 {dayPlan.notes}</Text> : null}
                        </View>
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        <Text style={styles.sectionTitle}>Chương trình tiêu biểu</Text>

        {/* Workout Program Cards */}
        {programs.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={styles.programCard}
            onPress={() => navigation.navigate('WorkoutDetail', { programId: item.id })}
          >
            <Image source={{ uri: item.image }} style={styles.programImg} />
            <View style={styles.overlay} />
            
            <View style={styles.programInfo}>
              <View style={styles.levelTag}>
                <Text style={styles.levelText}>{item.level}</Text>
              </View>
              <Text style={styles.programTitle}>{item.title}</Text>
              
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Clock color="#fff" size={14} />
                  <Text style={styles.statText}>{item.duration}</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <BarChart color="#fff" size={14} />
                  <Text style={styles.statText}>{item.exercisesCount} bài tập</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.playBtn}>
              <Play color={COLORS.primary} size={24} fill={COLORS.primary} />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}

          </>
        )}
        <View style={{ height: 100 }} />
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
    paddingVertical: 15,
  },
  headerTitle: { ...TYPOGRAPHY.h2, color: COLORS.text },
  historyBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: { paddingHorizontal: 20 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 50,
    marginBottom: 20,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 15, color: COLORS.text },
  filterBtn: {
    backgroundColor: COLORS.primary,
    padding: 8,
    borderRadius: 10,
  },
  categories: { marginBottom: 25 },
  catBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    marginRight: 10,
  },
  catBtnActive: { backgroundColor: COLORS.primary },
  catBtnText: {
    color: COLORS.textLight,
    fontWeight: '600',
    fontSize: 14,
  },
  catBtnTextActive: {
    color: '#fff',
  },
  libraryBanner: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  libraryBannerIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  libraryBannerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  libraryBannerSub: {
    fontSize: 13,
    color: '#94A3B8',
  },
  startAiBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 8,
  },
  startAiBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  sectionTitle: { ...TYPOGRAPHY.h3, color: COLORS.text, marginBottom: 15 },
  programCard: {
    height: 200,
    borderRadius: 25,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  programImg: { width: '100%', height: '100%' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  programInfo: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  levelTag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  levelText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  programTitle: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 8 },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  statItem: { flexDirection: 'row', alignItems: 'center' },
  statText: { color: '#fff', fontSize: 12, marginLeft: 5 },
  statDivider: { width: 1, height: 12, backgroundColor: 'rgba(255,255,255,0.3)', mx: 10, marginHorizontal: 12 },
  playBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiWorkoutCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  aiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expandIconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
  },
  aiExpandedContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  aiDayText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  aiDuration: {
    fontSize: 13,
    fontWeight: '700',
    color: '#059669', // Dark green like in screenshot
  },
  restDayContainer: {
    backgroundColor: '#ECFDF5',
    padding: 12,
    borderRadius: 8,
  },
  restText: {
    color: '#059669',
    fontWeight: '800',
    fontSize: 15,
    marginBottom: 4,
  },
  restNotes: {
    color: '#047857',
    fontSize: 13,
  },
  aiContent: {
    paddingTop: 4,
  },
  aiFocus: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 12,
  },
  premiumExerciseCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  premiumThumb: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 14,
  },
  premiumInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  premiumNameText: {
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '800',
    marginBottom: 6,
  },
  premiumBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  badge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '700',
  },
  premiumPlayBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  aiNotes: {
    marginTop: 12,
    fontSize: 13,
    color: '#D97706',
    backgroundColor: '#FEF3C7',
    padding: 8,
    borderRadius: 8,
  }
});

export default WorkoutListScreen;
