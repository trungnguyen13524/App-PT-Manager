import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeft, ChevronRight, Play, CheckCircle2, Clock, Flame, X } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../../theme';
import { useWorkoutStore } from '../../../store/workoutStore';

const { width } = Dimensions.get('window');

const ActiveWorkoutScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { currentSession, finishSession, isLoading } = useWorkoutStore();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef(null);

  // Lấy danh sách bài tập từ Session (Backend trả về exercises trong session)
  const sessionExercises = currentSession?.exercises || [];
  const currentExercise = sessionExercises[currentIndex];

  useEffect(() => {
    // Bắt đầu đếm giờ
    timerRef.current = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, []);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const nextExercise = () => {
    if (currentIndex < sessionExercises.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    Alert.alert(
      'Hoàn thành?',
      'Bạn đã hoàn thành tất cả các bài tập trong buổi hôm nay!',
      [
        { text: 'Tiếp tục tập', style: 'cancel' },
        { 
          text: 'Kết thúc buổi tập', 
          onPress: async () => {
            clearInterval(timerRef.current);
            const res = await finishSession({
              totalDurationSec: seconds,
              totalCaloriesBurned: 150 // Mock calo
            });
            if (res.success) {
              Alert.alert('Tuyệt vời!', 'Buổi tập đã được lưu lại.');
              navigation.navigate('Trang chủ');
            }
          }
        }
      ]
    );
  };

  if (!currentSession) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <X color={COLORS.text} size={24} />
        </TouchableOpacity>
        <View style={styles.timerContainer}>
          <Clock size={16} color={COLORS.primary} />
          <Text style={styles.timerText}>{formatTime(seconds)}</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.progressText}>Bài tập {currentIndex + 1} / {sessionExercises.length}</Text>
        
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: currentExercise?.image || 'https://images.unsplash.com/photo-1566241142559-40e1bfc26cd1' }} 
            style={styles.exerciseImg} 
          />
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.exerciseName}>{currentExercise?.name || 'Tên bài tập'}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{currentExercise?.sets || 3}</Text>
              <Text style={styles.statLabel}>Hiệp</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{currentExercise?.reps || '12-15'}</Text>
              <Text style={styles.statLabel}>Lần/Hiệp</Text>
            </View>
          </View>
          
          <View style={styles.instructionsBox}>
             <Text style={styles.instructionsTitle}>Hướng dẫn:</Text>
             <Text style={styles.instructionsText}>
               {currentExercise?.instructions || 'Hãy thực hiện đúng kỹ thuật để đạt hiệu quả cao nhất.'}
             </Text>
          </View>
        </View>
      </View>

      {/* Footer Actions */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.finishBtn} 
          onPress={nextExercise}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.finishBtnText}>
                {currentIndex === sessionExercises.length - 1 ? 'Hoàn thành buổi tập' : 'Bài tiếp theo'}
              </Text>
              <ChevronRight color="#fff" size={20} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  closeBtn: { padding: 10 },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  timerText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
    marginLeft: 8,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace'
  },
  content: { flex: 1, paddingHorizontal: 20, alignItems: 'center' },
  progressText: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '600', marginBottom: 20 },
  imageContainer: {
    width: width - 40,
    height: width - 40,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: COLORS.background,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  exerciseImg: { width: '100%', height: '100%' },
  infoSection: { width: '100%', marginTop: 30, alignItems: 'center' },
  exerciseName: { fontSize: 24, fontWeight: '800', color: COLORS.text, marginBottom: 20, textAlign: 'center' },
  statsRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 30 },
  statBox: { marginHorizontal: 20, alignItems: 'center' },
  statVal: { fontSize: 28, fontWeight: '800', color: COLORS.primary },
  statLabel: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '600' },
  instructionsBox: {
    width: '100%',
    backgroundColor: COLORS.background,
    padding: 20,
    borderRadius: 20,
  },
  instructionsTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  instructionsText: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22 },
  footer: { padding: 20, paddingBottom: 30 },
  finishBtn: {
    backgroundColor: COLORS.primary,
    height: 60,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  finishBtnText: { color: '#fff', fontSize: 18, fontWeight: '700', marginRight: 10 }
});

export default ActiveWorkoutScreen;
