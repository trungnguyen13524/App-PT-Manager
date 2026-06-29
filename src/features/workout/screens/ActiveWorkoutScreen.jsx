import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  Platform
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronRight, Clock, X } from 'lucide-react-native';
import { COLORS } from '../../../theme';
import { useWorkoutStore } from '../../../store/workoutStore';
import { useDialogStore } from '../../../store/dialogStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WORKOUT_IMAGES, toImageKey } from '../../../assets';

const EXERCISE_ID_IMAGE_MAP = {
  'ex_burpees': 'bat_nhay_toan_than',
  'ex_high_knees': 'nang_cao_dui',
  'ex_tricep_dip': 'chong_day_nguoc',
  'ex_pushups': 'hit_dat_co_ban',
  'ex_plank': 'plank_co_ban',
  'ex_squats': 'ngoi_xom',
  'ex_lunges': 'buoc_gap_goi',
  'ex_pullups': 'du_xa_don',
  'ex_jumping_jacks': 'nhay_dang_tay_chan',
  'ex_crunches': 'gap_bung_co_ban',
  'ex_mountain_climbers': 'leo_nui_cheo_chan',
  'ex_situps': 'gap_bung_co_ban',
  'ex_wall_sit': 'ngoi_dua_tuong',
  'ex_jump_rope': 'nhay_day',
  'ex_bicycle_crunches': 'gap_bung_dap_xe',
  'ex_dips': 'chong_day_nguoc'
};

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

  const exerciseName = currentExercise?.name || currentExercise?.title || currentExercise?.display_name || 'Bài tập';
  const mappedKey = EXERCISE_ID_IMAGE_MAP[currentExercise?.id];
  const imgKey = mappedKey || toImageKey(exerciseName);
  const imageSource = WORKOUT_IMAGES[imgKey];

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
    useDialogStore.getState().showDialog({
      title: 'Hoàn thành?',
      message: 'Bạn đã hoàn thành tất cả các bài tập trong buổi hôm nay!',
      type: 'success',
      buttons: [
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
              useDialogStore.getState().showDialog({
                title: 'Tuyệt vời!',
                message: 'Buổi tập đã được lưu lại.',
                type: 'success',
                buttons: [{
                  text: 'OK',
                  onPress: () => navigation.navigate('Trang chủ')
                }]
              });
            } else {
              useDialogStore.getState().showDialog({
                title: 'Lỗi lưu trữ',
                message: res.error || 'Không thể lưu nhật ký tập luyện. Các bài tập có thể không hợp lệ.',
                type: 'error',
                buttons: [{ text: 'Đóng' }]
              });
            }
          }
        }
      ]
    });
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
            source={imageSource ? imageSource : { uri: currentExercise?.image || 'https://images.unsplash.com/photo-1566241142559-40e1bfc26cd1' }} 
            style={styles.exerciseImg} 
            resizeMode="cover"
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
  statVal: { fontSize: 28, fontWeight: '800', color: COLORS.primary, fontVariant: ['tabular-nums'] },
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
