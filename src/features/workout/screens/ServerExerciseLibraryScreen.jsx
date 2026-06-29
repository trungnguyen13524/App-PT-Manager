import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Dimensions, StatusBar, ActivityIndicator, TextInput, FlatList
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Search, Filter, Flame, Activity, Check } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WORKOUT_IMAGES, toImageKey } from '../../../assets';
import { useWorkoutStore } from '../../../store/workoutStore';
import { COLORS } from '../../../theme';

const { width } = Dimensions.get('window');
const cardWidth = (width - 60) / 2;

// ENUMS matching Backend
const MUSCLE_GROUPS = [
  { id: '', label: 'Tất cả' },
  { id: 'CHEST', label: 'Cơ ngực' },
  { id: 'BACK', label: 'Cơ lưng' },
  { id: 'SHOULDERS', label: 'Cơ vai' },
  { id: 'BICEPS', label: 'Tay trước' },
  { id: 'TRICEPS', label: 'Tay sau' },
  { id: 'LEGS', label: 'Cơ chân' },
  { id: 'GLUTES', label: 'Cơ mông' },
  { id: 'CORE', label: 'Cơ bụng' },
  { id: 'CARDIO', label: 'Cardio' },
  { id: 'FULL_BODY', label: 'Toàn thân' }
];

const DIFFICULTIES = [
  { id: '', label: 'Tất cả độ khó' },
  { id: 'BEGINNER', label: 'Cơ bản' },
  { id: 'INTERMEDIATE', label: 'Trung bình' },
  { id: 'ADVANCED', label: 'Nâng cao' }
];

// Dictionary ánh xạ ID từ Server sang Tên file ảnh dưới Local (Do Server lưu tiếng Anh, Local lưu tiếng Việt)
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

const ServerExerciseLibraryScreen = () => {
  const navigation = useNavigation();
  const { library, isLoading, fetchExercises } = useWorkoutStore();

  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  
  // Debounce search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadData();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search, selectedMuscle, selectedDifficulty]);

  const loadData = () => {
    const params = {
      page: 1,
      limit: 50
    };
    if (search) params.search = search;
    if (selectedMuscle) params.muscleGroup = selectedMuscle;
    if (selectedDifficulty) params.difficulty = selectedDifficulty;
    
    fetchExercises(params);
  };

  const handlePressCard = (item) => {
    navigation.navigate('ServerExerciseDetail', { exerciseId: item.id });
  };

  const renderFilterChips = (data, selectedId, onSelect) => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
      {data.map(item => {
        const isActive = selectedId === item.id;
        return (
          <TouchableOpacity
            key={item.id || 'all'}
            style={[styles.filterChip, isActive && styles.filterChipActive]}
            onPress={() => onSelect(isActive ? '' : item.id)}
          >
            <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  const getInitials = (name) => {
    if (!name) return 'X';
    return name.charAt(0).toUpperCase();
  };

  const getAvatarColor = (name) => {
    const colors = ['#FEE2E2', '#FEF3C7', '#D1FAE5', '#DBEAFE', '#F3E8FF', '#FCE7F3', '#E0E7FF'];
    const textColors = ['#991B1B', '#92400E', '#065F46', '#1E40AF', '#6B21A8', '#9D174D', '#3730A3'];
    if (!name) return { bg: colors[0], text: textColors[0] };
    const hash = name.length > 0 ? name.charCodeAt(0) % colors.length : 0;
    return { bg: colors[hash], text: textColors[hash] };
  };

  const renderCard = ({ item }) => {
    const exObj = item.exercise || item;
    const exName = exObj.nameVi || exObj.name || exObj.nameEn || exObj.display_name || exObj.title || 'Bài tập';
    const muscleGroup = exObj.targetMuscle || exObj.muscleGroup || exObj.muscle_group || exObj.focus || 'Toàn thân';
    const difficultyLevel = item.difficulty || item.difficulty_level || item.level || exObj.difficulty || 'BEGINNER';
    
    const mappedKey = EXERCISE_ID_IMAGE_MAP[item.id] || EXERCISE_ID_IMAGE_MAP[exObj.id];
    const key = mappedKey || toImageKey(exName !== 'Bài tập' ? exName : item.slug);
    const imageSource = WORKOUT_IMAGES[key];
    const difficultyColors = {
      'BEGINNER': '#10B981', // Green
      'INTERMEDIATE': '#F59E0B', // Orange
      'ADVANCED': '#EF4444' // Red
    };

    const diffColor = difficultyColors[difficultyLevel?.toUpperCase()] || '#64748B';
    const avatarStyle = getAvatarColor(exName);

    return (
      <TouchableOpacity 
        style={styles.premiumListCard}
        activeOpacity={0.8}
        onPress={() => handlePressCard(item)}
      >
        {imageSource ? (
          <Image source={imageSource} style={styles.premiumThumb} resizeMode="cover" />
        ) : (
          <View style={[styles.premiumThumb, { backgroundColor: avatarStyle.bg, justifyContent: 'center', alignItems: 'center' }]}>
            <Text style={{ fontSize: 24, fontWeight: '800', color: avatarStyle.text }}>
              {getInitials(exName)}
            </Text>
          </View>
        )}
        
        <View style={styles.premiumInfo}>
          <Text style={styles.premiumNameText} numberOfLines={1}>{exName}</Text>
          <View style={styles.premiumBadgesRow}>
            <View style={styles.badge}>
              <Flame color="#F59E0B" size={12} style={{ marginRight: 4 }} />
              <Text style={styles.badgeText}>{muscleGroup}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: diffColor + '15' }]}>
              <View style={[styles.dot, { backgroundColor: diffColor, marginRight: 4 }]} />
              <Text style={[styles.badgeText, { color: diffColor }]}>{difficultyLevel}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color="#0F172A" size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thư Viện Bài Tập</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Search color="#94A3B8" size={20} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo tên bài tập..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersSection}>
        {renderFilterChips(MUSCLE_GROUPS, selectedMuscle, setSelectedMuscle)}
        {renderFilterChips(DIFFICULTIES, selectedDifficulty, setSelectedDifficulty)}
      </View>

      {/* Content */}
      {isLoading && library.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={library}
          keyExtractor={(item) => item.id}
          numColumns={1}
          contentContainerStyle={styles.listContent}
          renderItem={renderCard}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Activity color="#CBD5E1" size={48} style={{ marginBottom: 16 }} />
              <Text style={styles.emptyText}>Không tìm thấy bài tập nào!</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
  searchSection: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 50,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  searchIcon: { marginRight: 10 },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '500',
  },
  filtersSection: {
    paddingBottom: 12,
  },
  filterScroll: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  premiumListCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
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
    width: 64,
    height: 64,
    borderRadius: 12,
    marginRight: 14,
  },
  premiumInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  premiumNameText: {
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '700',
    marginBottom: 8,
  },
  premiumBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '700',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 15,
    color: '#94A3B8',
    fontWeight: '500',
  }
});

export default ServerExerciseLibraryScreen;
