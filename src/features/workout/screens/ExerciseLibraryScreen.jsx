import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Dimensions, StatusBar, ActivityIndicator, TextInput
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Flame, Library, Clock, Activity } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WORKOUT_IMAGES, toImageKey } from '../../../assets';
import exercisesData from '../../../assets/exercises.json';
import workoutService from '../../../api/services/workout.service';
import dashboardService from '../../../api/services/dashboard.service';
import ptService from '../../../api/services/pt.service';
import { useDialogStore } from '../../../store/dialogStore';
import WaveBackground from '../../../components/common/WaveBackground';
import { COLORS } from '../../../theme';

const { width } = Dimensions.get('window');
const cardWidth = (width - 60) / 2;

const ExerciseLibraryScreen = () => {
  const navigation = useNavigation();
  const [isLogging, setIsLogging] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  
  // PT Assignment & Library States
  const [isLibraryMode, setIsLibraryMode] = useState(false);
  const [selectedDay, setSelectedDay] = useState(1);
  const [ptWorkoutPlan, setPtWorkoutPlan] = useState([]);
  const [loadingPtPlan, setLoadingPtPlan] = useState(false);

  // Duration State for Modal
  const [durationMinutes, setDurationMinutes] = useState('15');

  useEffect(() => {
    fetchPtWorkoutPlan();
  }, []);

  const fetchPtWorkoutPlan = async () => {
    setLoadingPtPlan(true);
    try {
      const res = await ptService.getAssignments('EXERCISE_ADDITION');
      if (res.success && res.data) {
        setPtWorkoutPlan(res.data);
      }
    } catch (err) {
      console.warn('Lỗi lấy giáo án thể dục:', err);
    } finally {
      setLoadingPtPlan(false);
    }
  };

  const getExercisesForDay = (dayIndex) => {
    // Không còn giả lập AI nữa vì chưa có backend support.
    // Tạm thời chỉ hiển thị các bài tập do PT giao.

    // 2. Lấy bài tập do PT giao (Tích lũy - Không ghi đè)
    const ptAssigned = [];
    if (ptWorkoutPlan && Array.isArray(ptWorkoutPlan)) {
      ptWorkoutPlan.forEach(p => {
        // Find matching exercise in library or use custom
        let matchedEx = exercisesData.find(e => e.ID === p.exerciseId || `ex_${e.ID}` === p.exerciseId);
        if (!matchedEx) {
          // Fallback if custom
          matchedEx = { 
            Exercise_Name_VN: p.name || 'Bài tập PT giao', 
            Target_Muscle_Group: 'Theo yêu cầu PT',
            Est_Calories_Burned_Per_30_Min: 150 
          };
        }
        ptAssigned.push({
          ...matchedEx,
          isPTAssigned: true,
          ptDetails: p // contains sets, reps, durationSec, notes
        });
      });
    }

    return ptAssigned;
  };

  const currentExercises = isLibraryMode ? exercisesData : getExercisesForDay(selectedDay);

  const handleLogExercise = async (item) => {
    setIsLogging(true);
    try {
      const minutes = Number(durationMinutes) || 15;
      const caloriesPer30Min = Number(item.Est_Calories_Burned_Per_30_Min) || 150;
      const caloriesPerMin = caloriesPer30Min / 30;
      const durationSec = minutes * 60; 
      const caloriesBurned = Math.round(caloriesPerMin * minutes);

      const slug = item.Exercise_Name_EN 
        ? 'ex_' + item.Exercise_Name_EN.toLowerCase().replace(/[^a-z0-9]+/g, '_')
        : 'ex_custom_exercise';

      const payload = {
        name: item.Exercise_Name_VN || 'Bài tập tự do',
        performedAt: new Date().toISOString(),
        durationSec: durationSec,
        caloriesBurned: caloriesBurned,
        notes: item.Target_Muscle_Group || '',
        logs: [{
          exerciseId: slug,
          orderIndex: 0,
          setNumber: 1,
          reps: 15,
          weightKg: 0,
          restSec: 30,
          notes: ''
        }]
      };

      await workoutService.createSession(payload);

      // Đồng bộ Dashboard
      try {
        await dashboardService.getUserDashboard();
      } catch (e) {}

      setSelectedExercise(null);
      useDialogStore.getState().showDialog({
        title: 'Tuyệt vời!',
        message: `Đã ghi nhận bài tập ${item.Exercise_Name_VN} (+${caloriesBurned} kcal).`,
        type: 'success',
      });
    } catch (err) {
      console.warn('Lỗi ghi nhận bài tập:', err);
      useDialogStore.getState().showDialog({
        title: 'Lỗi',
        message: 'Không thể ghi nhận bài tập lúc này.',
        type: 'error',
      });
    } finally {
      setIsLogging(false);
    }
  };

  const renderModal = () => {
    if (!selectedExercise) return null;
    
    const key = toImageKey(selectedExercise.Exercise_Name_VN);
    const imageSource = WORKOUT_IMAGES[key];
    const calPerMin = Math.round((Number(selectedExercise.Est_Calories_Burned_Per_30_Min) || 0) / 30 * 10) / 10;

    return (
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {imageSource ? (
            <Image source={imageSource} style={styles.modalImage} resizeMode="cover" />
          ) : (
            <View style={[styles.modalImage, { backgroundColor: '#334155', justifyContent: 'center', alignItems: 'center' }]}>
              <Text style={{color: '#4A5568'}}>Chưa có ảnh mô phỏng</Text>
            </View>
          )}
          
          <TouchableOpacity 
            style={styles.closeBtn} 
            onPress={() => !isLogging && setSelectedExercise(null)}
          >
            <ChevronLeft color={COLORS.text} size={24} />
          </TouchableOpacity>

          <View style={styles.modalInfo}>
            <Text style={styles.modalTitle}>{selectedExercise.Exercise_Name_VN}</Text>
            
            <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 12}}>
              <View style={styles.tag}>
                <Text style={styles.tagText}>{selectedExercise.Target_Muscle_Group}</Text>
              </View>
              <View style={[styles.tag, {backgroundColor: 'rgba(85, 107, 47, 0.1)', borderColor: 'rgba(85, 107, 47, 0.2)'}]}>
                <Flame color="#556B2F" size={12} style={{ marginRight: 4 }} />
                <Text style={[styles.tagText, {color: '#556B2F'}]}>{calPerMin} kcal/p</Text>
              </View>
            </View>

            <Text style={styles.modalDesc}>{selectedExercise.Description_VN}</Text>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Thời gian tập (phút):</Text>
              <TextInput
                style={styles.durationInput}
                value={durationMinutes}
                onChangeText={setDurationMinutes}
                keyboardType="numeric"
                maxLength={3}
              />
            </View>

            <TouchableOpacity 
              style={[styles.logBtn, isLogging && { opacity: 0.7 }]}
              activeOpacity={0.8}
              onPress={() => handleLogExercise(selectedExercise)}
              disabled={isLogging}
            >
              {isLogging ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.logBtnText}>Ghi nhận ({Math.round(calPerMin * (Number(durationMinutes) || 15))} kcal)</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={COLORS.text} size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isLibraryMode ? 'Thư Viện Bài Tập' : 'Bài Tập Hôm Nay'}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.navigate('WorkoutHistory')} style={[styles.libraryBtn, { marginRight: 12 }]}>
            <Clock color={COLORS.text} size={24} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsLibraryMode(!isLibraryMode)} style={styles.libraryBtn}>
            <Library color={isLibraryMode ? COLORS.primary : COLORS.text} size={24} />
          </TouchableOpacity>
        </View>
      </View>

      {!isLibraryMode && (
        <View style={{ paddingHorizontal: 20 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            {[1, 2, 3, 4, 5, 6, 7].map(day => (
              <TouchableOpacity 
                key={day}
                style={[styles.dayBadge, selectedDay === day && styles.dayBadgeActive]}
                onPress={() => setSelectedDay(day)}
              >
                <Text style={[styles.dayBadgeText, selectedDay === day && styles.dayBadgeTextActive]}>
                  Ngày {day}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>


        {loadingPtPlan && !isLibraryMode ? (
          <ActivityIndicator size="large" color="#556B2F" style={{ marginTop: 50 }} />
        ) : (!isLibraryMode && currentExercises.length === 0) ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Bạn chưa có bài tập</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {currentExercises.map((item, idx) => {
              const key = toImageKey(item.Exercise_Name_VN);
              const imageSource = WORKOUT_IMAGES[key];
              const cal = Math.round(Number(item.Est_Calories_Burned_Per_30_Min) || 0);

              return (
                <TouchableOpacity 
                  key={`ex-${idx}`} 
                  style={[styles.card, { width: cardWidth, borderColor: item.isPTAssigned ? '#E67E22' : 'transparent', borderWidth: item.isPTAssigned ? 1 : 0 }]}
                  activeOpacity={0.8}
                  onPress={() => setSelectedExercise(item)}
                >
                  <View style={styles.imageContainer}>
                    {imageSource ? (
                      <Image source={imageSource} style={styles.image} resizeMode="cover" />
                    ) : (
                      <View style={[styles.image, { backgroundColor: '#EADDCA', justifyContent: 'center', alignItems: 'center' }]}>
                        <Activity color="#475569" size={32} />
                      </View>
                    )}
                    {item.isPTAssigned && (
                      <View style={[styles.glassTag, { backgroundColor: 'rgba(230, 126, 34, 0.9)', left: 12, right: 'auto' }]}>
                        <Text style={[styles.glassTagText, { fontSize: 10 }]}>👑 PT Giao</Text>
                      </View>
                    )}
                    <View style={[styles.glassTag, { right: 12, left: 'auto' }]}>
                      <Flame color="#556B2F" size={12} style={{ marginRight: 4 }} />
                      <Text style={styles.glassTagText}>{cal} kcal/30p</Text>
                    </View>
                  </View>
                  <View style={styles.cardFooter}>
                    <Text style={[styles.exerciseName, item.isPTAssigned && { color: '#E67E22' }]} numberOfLines={2}>
                      {item.Exercise_Name_VN}
                    </Text>
                    <Text style={styles.muscleGroup} numberOfLines={1}>{item.Target_Muscle_Group}</Text>
                    {item.isPTAssigned && item.ptDetails && (
                      <Text style={{ fontSize: 11, color: '#4A5568', marginTop: 4 }}>
                        {item.ptDetails.durationSec ? `${item.ptDetails.durationSec / 60} phút Cardio` : `${item.ptDetails.sets} Sets x ${item.ptDetails.reps} Reps`}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              )
            })}
          </View>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Detail Modal */}
      {selectedExercise && renderModal()}

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
    paddingTop: 20,
    paddingBottom: 16,
  },
  backBtn: { padding: 4, marginLeft: -8 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: COLORS.secondary },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
  },
  imageContainer: {
    width: '100%',
    height: 140,
    position: 'relative',
    backgroundColor: 'rgba(0,0,0,0.03)'
  },
  image: {
    width: '100%',
    height: '100%',
  },
  glassTag: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  glassTagText: {
    color: COLORS.secondary,
    fontSize: 12,
    fontWeight: '800',
  },
  cardFooter: {
    padding: 12,
  },
  exerciseName: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  muscleGroup: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600'
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 20,
    zIndex: 100,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 10,
  },
  modalImage: {
    width: '100%',
    height: 200,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modalInfo: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.secondary,
    marginBottom: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  modalDesc: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 22,
    marginTop: 8,
    marginBottom: 24,
  },
  logBtn: {
    backgroundColor: COLORS.primary,
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  libraryBtn: {
    padding: 8,
  },
  dayBadge: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  dayBadgeActive: {
    backgroundColor: 'rgba(85, 107, 47, 0.1)',
    borderColor: COLORS.primary,
  },
  dayBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  dayBadgeTextActive: {
    color: COLORS.primary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginTop: 16,
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 50,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  inputLabel: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginRight: 10,
  },
  durationInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.secondary,
    textAlign: 'center'
  },
  logBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '800',
  }
});

export default ExerciseLibraryScreen;
