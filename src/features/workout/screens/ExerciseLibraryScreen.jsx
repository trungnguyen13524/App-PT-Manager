import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Dimensions,
  StatusBar,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { ChevronLeft, Search, Filter, Play, Clock, Flame, Activity, Dumbbell, Zap, X } from 'lucide-react-native';
import Svg, { Defs, LinearGradient, Stop, Rect, Circle } from 'react-native-svg';
import { Modal } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../../theme';
import { useWorkoutStore } from '../../../store/workoutStore';
import { USE_MOCK } from '../../../mocks';

const MOCK_FALLBACK_EXERCISES = [
  { id: 'ex_pushup_standard', nameVi: 'Hít đất tiêu chuẩn', nameEn: 'Standard Push-Up', muscleGroups: ['CHEST', 'TRICEPS'], equipment: 'BODYWEIGHT', difficulty: 'BEGINNER', caloriesPerMinute: 7.5, thumbnailUrl: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=800', youtubeVideoId: 'IODxDxX7oi4' },
  { id: 'ex_crunch', nameVi: 'Gập bụng', nameEn: 'Crunch', muscleGroups: ['CORE'], equipment: 'BODYWEIGHT', difficulty: 'BEGINNER', caloriesPerMinute: 5.0, thumbnailUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800', youtubeVideoId: 'Xyd_fa5zoEU' },
  { id: 'ex_squat', nameVi: 'Squat', nameEn: 'Squat', muscleGroups: ['LEGS', 'GLUTES'], equipment: 'BODYWEIGHT', difficulty: 'INTERMEDIATE', caloriesPerMinute: 10.0, thumbnailUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800', youtubeVideoId: 'YaXPRqUwItQ' }
];

const TRANSLATIONS = {
  muscleGroups: {
    CHEST: 'Ngực',
    BACK: 'Lưng',
    SHOULDERS: 'Vai',
    BICEPS: 'Tay trước',
    TRICEPS: 'Tay sau',
    LEGS: 'Chân',
    GLUTES: 'Mông',
    CORE: 'Bụng/Lõi',
    CARDIO: 'Cardio',
    FULL_BODY: 'Toàn thân'
  },
  difficulty: {
    BEGINNER: 'Cơ bản',
    INTERMEDIATE: 'Nâng cao',
    ADVANCED: 'Chuyên gia'
  }
};

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
          <Stop offset="100%" stopColor="#00B3FF" stopOpacity="0.02" />
        </LinearGradient>
        <LinearGradient id="circleGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FF4D00" stopOpacity="0.1" />
          <Stop offset="100%" stopColor="#FF0080" stopOpacity="0.02" />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#bgGrad)" />
      
      <Circle cx="80%" cy="10%" r="150" fill="url(#circleGrad1)" />
      <Circle cx="10%" cy="50%" r="200" fill="url(#circleGrad2)" />
    </Svg>
  </View>
));

const { width } = Dimensions.get('window');

const ExerciseLibraryScreen = () => {
  const navigation = useNavigation();
  const { library = [], fetchExercises } = useWorkoutStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [selectedExercise, setSelectedExercise] = useState(null);

  React.useEffect(() => {
    fetchExercises();
  }, []);

  // Bảo vệ fallback data
  const safeLibrary = (library && library.length > 0 && library[0]?.title) 
    ? library 
    : MOCK_FALLBACK_EXERCISES;

  // Cập nhật categories theo cấu trúc mới
  const categories = ['Tất cả', 'Ngực', 'Lưng', 'Chân', 'Vai', 'Bụng/Lõi', 'Toàn thân'];

  const filteredExercises = safeLibrary.filter(ex => {
    const title = ex?.nameVi || ex?.nameEn || '';
    const matchesSearch = title.toLowerCase().includes((searchQuery || '').toLowerCase());
    
    let matchesCategory = true;
    if (activeCategory !== 'Tất cả') {
      // Dịch từ tiếng Anh sang tiếng Việt để so sánh với activeCategory
      const muscleGroupVi = ex?.muscleGroups?.[0] 
        ? (TRANSLATIONS.muscleGroups[ex.muscleGroups[0]] || 'Khác') 
        : 'Chung';
      matchesCategory = muscleGroupVi === activeCategory;
    }
    
    return matchesSearch && matchesCategory;
  });

  const handleOpenVideo = (url) => {
    if (url) {
      Linking.openURL(url).catch(err => console.error("Không thể mở video:", err));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <AbstractBackground />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color="#FFFFFF" size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thư viện bài tập</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#94A3B8" />
          <TextInput
            placeholder="Tìm kiếm bài tập..."
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.filterBtn}>
          <Filter size={20} color="#00FF66" />
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <View style={styles.categoriesWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesContent}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setActiveCategory(cat)}
              style={[
                styles.categoryChip,
                activeCategory === cat && styles.activeCategoryChip
              ]}
            >
              <Text style={[
                styles.categoryText,
                activeCategory === cat && styles.activeCategoryText
              ]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Exercise List */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
        {filteredExercises.map((exercise, index) => (
          <TouchableOpacity 
            key={exercise?.id || index} 
            activeOpacity={0.9} 
            style={styles.exerciseCardWrapper}
            onPress={() => setSelectedExercise(exercise)}
          >
            <View style={styles.exerciseCard}>
              <Image 
                source={{ uri: exercise?.thumbnailUrl || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800' }} 
                style={styles.exerciseImage} 
              />
              <View style={styles.exerciseInfo}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>
                    {exercise?.muscleGroups?.[0] 
                      ? (TRANSLATIONS.muscleGroups[exercise.muscleGroups[0]] || 'Khác') 
                      : 'Chung'}
                  </Text>
                </View>
                <Text style={styles.exerciseTitle}>{exercise?.nameVi || exercise?.nameEn || 'Bài tập mới'}</Text>
                
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Clock size={14} color="#94A3B8" />
                    <Text style={styles.statText}>Linh hoạt</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Flame size={14} color="#94A3B8" />
                    <Text style={styles.statText}>{exercise?.caloriesPerMinute || '0'} kcal/p</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Zap size={14} color="#94A3B8" />
                    <Text style={styles.statText}>
                      {exercise?.difficulty 
                        ? (TRANSLATIONS.difficulty[exercise.difficulty] || 'Tự do') 
                        : 'Tự do'}
                    </Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.playBtn}
                onPress={() => setSelectedExercise(exercise)}
              >
                <Play size={20} color="#000" fill="#000" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
        {filteredExercises.length === 0 && (
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyIllustration}>
              <Dumbbell size={64} color="#00FF66" strokeWidth={1.5} />
            </View>
            <Text style={styles.emptyTitle}>Chưa có bài tập nào!</Text>
            <Text style={styles.emptyDesc}>Chúng tôi không tìm thấy bài tập phù hợp với tìm kiếm của bạn.</Text>
            <TouchableOpacity 
              style={styles.emptyBtn}
              onPress={() => {
                setSearchQuery('');
                setActiveCategory('Tất cả');
              }}
            >
              <Text style={styles.emptyBtnText}>Khám phá bài tập</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Video Modal */}
      <Modal
        visible={!!selectedExercise}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedExercise(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedExercise?.nameVi || selectedExercise?.nameEn}</Text>
              <TouchableOpacity onPress={() => setSelectedExercise(null)} style={styles.closeBtn}>
                <X size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.videoContainer}>
              {selectedExercise?.youtubeVideoId ? (
                <YoutubePlayer
                  height={220}
                  play={true}
                  videoId={selectedExercise.youtubeVideoId}
                />
              ) : (
                <View style={styles.noVideoPlaceholder}>
                  <Text style={styles.noVideoText}>Video đang cập nhật</Text>
                </View>
              )}
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.modalDesc}>
                Đây là bài tập thuộc nhóm cơ <Text style={{fontWeight: 'bold', color: '#00FF66'}}>
                  {selectedExercise?.muscleGroups?.[0] ? (TRANSLATIONS.muscleGroups[selectedExercise.muscleGroups[0]] || 'Khác') : 'Chung'}
                </Text>.
                Mức độ: <Text style={{fontWeight: 'bold', color: '#00FF66'}}>
                  {selectedExercise?.difficulty ? (TRANSLATIONS.difficulty[selectedExercise.difficulty] || 'Tự do') : 'Tự do'}
                </Text>.
              </Text>
              <Text style={styles.modalDesc}>
                Lượng calo tiêu thụ trung bình: <Text style={{fontWeight: 'bold', color: '#00FF66'}}>{selectedExercise?.caloriesPerMinute} kcal/phút</Text>.
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    ...TYPOGRAPHY.h3,
    color: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 10,
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    paddingHorizontal: 12,
    borderRadius: 16,
    height: 48,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: '#FFFFFF',
  },
  filterBtn: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(0, 255, 102, 0.1)',
    borderRadius: 16,
    marginLeft: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 102, 0.3)',
  },
  categoriesWrapper: {
    marginTop: 20,
  },
  categoriesContent: {
    paddingHorizontal: 20,
    paddingBottom: 4,
  },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  activeCategoryChip: {
    backgroundColor: 'rgba(0, 255, 102, 0.2)',
    borderColor: '#00FF66',
    shadowColor: '#00FF66',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  categoryText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '600',
  },
  activeCategoryText: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  exerciseCardWrapper: {
    marginBottom: 16,
  },
  exerciseCard: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  exerciseImage: {
    width: 90,
    height: 90,
    borderRadius: 16,
  },
  exerciseInfo: {
    flex: 1,
    marginLeft: 16,
  },
  categoryBadge: {
    backgroundColor: 'rgba(0, 255, 102, 0.1)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#00FF66',
    textTransform: 'uppercase',
  },
  exerciseTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  statText: {
    fontSize: 12,
    color: '#94A3B8',
    marginLeft: 4,
  },
  playBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00FF66',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    shadowColor: '#00FF66',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIllustration: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(0, 255, 102, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 102, 0.2)',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 255, 102, 0.1)',
    borderWidth: 1,
    borderColor: '#00FF66',
  },
  emptyBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00FF66',
  },
  demoBannerCard: {
    backgroundColor: 'rgba(0, 255, 102, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 102, 0.3)',
    marginBottom: 20,
    padding: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: '60%',
    paddingBottom: 40,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  modalTitle: {
    ...TYPOGRAPHY.h4,
    color: '#FFFFFF',
  },
  closeBtn: {
    padding: 4,
  },
  videoContainer: {
    backgroundColor: '#000',
    width: '100%',
    height: 220,
  },
  noVideoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noVideoText: {
    color: '#94A3B8',
    fontSize: 16,
  },
  modalBody: {
    padding: 20,
  },
  modalDesc: {
    fontSize: 15,
    color: '#E2E8F0',
    lineHeight: 24,
    marginBottom: 10,
  },
});

export default ExerciseLibraryScreen;
