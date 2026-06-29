import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Dimensions, StatusBar, ActivityIndicator
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ChevronLeft, Flame, Activity, CheckCircle2 } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WORKOUT_IMAGES, toImageKey } from '../../../assets';
import workoutService from '../../../api/services/workout.service';
import { COLORS } from '../../../theme';

const { width } = Dimensions.get('window');

// Dictionary ánh xạ ID từ Server sang Tên file ảnh dưới Local
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

const ServerExerciseDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { exerciseId } = route.params;

  const [exercise, setExercise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDetail();
  }, [exerciseId]);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const response = await workoutService.getExerciseDetail(exerciseId);
      setExercise(response.data);
    } catch (err) {
      setError('Không thể tải chi tiết bài tập.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error || !exercise) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || 'Bài tập không tồn tại.'}</Text>
        <TouchableOpacity style={styles.backBtnError} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnErrorText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const exObj = exercise || {};
  const exName = exObj.nameVi || exObj.nameEn || exObj.name || exObj.title || 'Chi tiết bài tập';
  const muscleGroup = exObj.targetMuscle || exObj.muscleGroup || exObj.focus || 'Toàn thân';
  const difficultyLevel = exObj.difficulty || exObj.difficulty_level || exObj.level || 'BEGINNER';

  const mappedKey = EXERCISE_ID_IMAGE_MAP[exObj.id] || EXERCISE_ID_IMAGE_MAP[exerciseId];
  const key = mappedKey || toImageKey(exName);
  const imageSource = WORKOUT_IMAGES[key];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color="#0F172A" size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi Tiết Bài Tập</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Hero Image */}
        <View style={styles.imageContainer}>
          {imageSource ? (
            <Image source={imageSource} style={styles.image} resizeMode="cover" />
          ) : (
             <View style={[styles.image, { backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center' }]}>
               <Activity color="#94A3B8" size={64} />
             </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.contentSection}>
          <Text style={styles.title}>{exName}</Text>
          
          <View style={styles.tagsRow}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{muscleGroup}</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{exObj.equipment || 'Không dụng cụ'}</Text>
            </View>
            <View style={[styles.tag, { backgroundColor: '#FEF3C7' }]}>
              <Flame color="#D97706" size={14} style={{ marginRight: 4 }} />
              <Text style={[styles.tagText, { color: '#D97706' }]}>{difficultyLevel}</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Mô tả</Text>
          <Text style={styles.description}>
            {exercise.description || 'Chưa có mô tả cho bài tập này.'}
          </Text>

          {exercise.instructions && exercise.instructions.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Hướng dẫn thực hiện</Text>
              {exercise.instructions.map((step, index) => (
                <View key={index} style={styles.instructionStep}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </>
          )}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  errorText: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 16,
  },
  backBtnError: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#0F172A',
    borderRadius: 8,
  },
  backBtnErrorText: {
    color: '#fff',
    fontWeight: '600',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: { padding: 4, marginLeft: -8 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  scrollContent: {
    paddingBottom: 40,
  },
  imageContainer: {
    width: width,
    height: width * 0.7,
    backgroundColor: '#F1F5F9',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  contentSection: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    minHeight: 400,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 12,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
    marginTop: 8,
  },
  description: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 24,
    marginBottom: 24,
  },
  instructionStep: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    color: '#334155',
    lineHeight: 24,
  }
});

export default ServerExerciseDetailScreen;
