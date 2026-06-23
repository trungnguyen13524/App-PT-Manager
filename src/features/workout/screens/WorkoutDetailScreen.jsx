import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeft, Play, Info, CheckCircle2, Circle } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../../theme';
import { useWorkoutStore } from '../../../store/workoutStore';
import { useDialogStore } from '../../../store/dialogStore';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const WorkoutDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { programId } = route.params || {};
  
  const { 
    currentWorkout, 
    startSession, 
    isLoading 
  } = useWorkoutStore();

  const handleStartWorkout = async () => {
    const res = await startSession(programId);
    if (res.success) {
      navigation.navigate('ActiveWorkout');
    } else {
      useDialogStore.getState().showDialog({
        title: 'Lỗi',
        message: res.error || 'Không thể bắt đầu buổi tập',
        type: 'error'
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Image */}
      <View style={styles.headerImageContainer}>
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80' }} 
          style={styles.headerImg} 
        />
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft color="#fff" size={28} />
        </TouchableOpacity>
        <View style={styles.headerOverlay}>
          <Text style={styles.programTitle}>Giảm mỡ toàn thân</Text>
          <Text style={styles.programSub}>Level 1 • 45 phút • 12 bài tập</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        <View style={styles.infoRow}>
          <View style={styles.infoBox}>
            <Text style={styles.infoVal}>450</Text>
            <Text style={styles.infoLabel}>Kcal dự kiến</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoBox}>
            <Text style={styles.infoVal}>12</Text>
            <Text style={styles.infoLabel}>Động tác</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoBox}>
            <Text style={styles.infoVal}>Nhạc</Text>
            <Text style={styles.infoLabel}>Năng động</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Danh sách bài tập</Text>

        {currentWorkout.map((exercise, index) => {
          const isCompleted = completedExercises.includes(exercise.id);
          return (
            <TouchableOpacity 
              key={exercise.id} 
              style={styles.exerciseCard}
              onPress={() => navigation.navigate('ExerciseVideo', { exercise })}
            >
              <View style={styles.exerciseImgContainer}>
                <Image source={{ uri: exercise.image }} style={styles.exerciseImg} />
                <View style={styles.playIconSmall}>
                  <Play color="#fff" size={14} fill="#fff" />
                </View>
              </View>
              
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>{index + 1}. {exercise.name}</Text>
                <Text style={styles.exerciseStats}>{exercise.sets} Sets x {exercise.reps} Reps</Text>
              </View>

              <TouchableOpacity 
                onPress={() => toggleExerciseComplete(exercise.id)}
                style={styles.checkBtn}
              >
                {isCompleted ? (
                  <CheckCircle2 color={COLORS.primary} size={28} />
                ) : (
                  <Circle color={COLORS.divider} size={28} />
                )}
              </TouchableOpacity>
            </TouchableOpacity>
          );
        })}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Start Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.startBtn, isLoading && { opacity: 0.7 }]} 
          onPress={handleStartWorkout}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.startBtnText}>Bắt đầu luyện tập</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  headerImageContainer: { height: 280, position: 'relative' },
  headerImg: { width: '100%', height: '100%' },
  backBtn: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerOverlay: {
    position: 'absolute',
    bottom: 30,
    left: 20,
  },
  programTitle: { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 5 },
  programSub: { fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  content: { flex: 1, marginTop: -20, backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20 },
  infoRow: { flexDirection: 'row', backgroundColor: COLORS.background, borderRadius: 20, padding: 15, marginBottom: 25 },
  infoBox: { flex: 1, alignItems: 'center' },
  infoVal: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  infoLabel: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  divider: { width: 1, height: 30, backgroundColor: COLORS.divider },
  sectionTitle: { ...TYPOGRAPHY.h3, marginBottom: 15 },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  exerciseImgContainer: { position: 'relative' },
  exerciseImg: { width: 70, height: 70, borderRadius: 12 },
  playIconSmall: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -12,
    marginTop: -12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseInfo: { flex: 1, marginLeft: 15 },
  exerciseName: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  exerciseStats: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
  checkBtn: { padding: 5 },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    backgroundColor: '#fff',
  },
  startBtn: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' }
});

export default WorkoutDetailScreen;
