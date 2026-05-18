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
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Search, Filter, Play, Clock, Flame, Activity } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../../theme';
import { useWorkoutStore } from '../../../store/workoutStore';
import NutriCard from '../../../components/shared/NutriCard';

const { width } = Dimensions.get('window');

const ExerciseLibraryScreen = () => {
  const navigation = useNavigation();
  const { library = [], fetchExercises } = useWorkoutStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tất cả');

  React.useEffect(() => {
    fetchExercises();
  }, []);

  const categories = ['Tất cả', 'Ngực', 'Chân', 'Bụng', 'Lưng', 'Vai'];

  const filteredExercises = library.filter(ex => {
    const matchesSearch = ex.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'Tất cả' || ex.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={COLORS.text} size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thư viện bài tập</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color={COLORS.textSecondary} />
          <TextInput
            placeholder="Tìm kiếm bài tập..."
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.filterBtn}>
          <Filter size={20} color={COLORS.primary} />
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
        {filteredExercises.map((exercise) => (
          <TouchableOpacity key={exercise.id} activeOpacity={0.9} style={styles.exerciseCardWrapper}>
            <NutriCard style={styles.exerciseCard}>
              <Image source={{ uri: exercise.image }} style={styles.exerciseImage} />
              <View style={styles.exerciseInfo}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>{exercise.category}</Text>
                </View>
                <Text style={styles.exerciseTitle}>{exercise.title}</Text>
                
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Clock size={14} color={COLORS.textSecondary} />
                    <Text style={styles.statText}>{exercise.duration}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Flame size={14} color={COLORS.textSecondary} />
                    <Text style={styles.statText}>{exercise.calories} kcal</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Activity size={14} color={COLORS.textSecondary} />
                    <Text style={styles.statText}>{exercise.level}</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity style={styles.playBtn}>
                <Play size={20} color="#fff" fill="#fff" />
              </TouchableOpacity>
            </NutriCard>
          </TouchableOpacity>
        ))}
        {filteredExercises.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Không tìm thấy bài tập nào</Text>
          </View>
        )}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
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
    color: COLORS.text,
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
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    borderRadius: SPACING.borderRadius.lg,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: COLORS.text,
  },
  filterBtn: {
    width: 48,
    height: 48,
    backgroundColor: COLORS.primaryLight,
    borderRadius: SPACING.borderRadius.lg,
    marginLeft: 12,
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: COLORS.background,
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  activeCategoryChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  activeCategoryText: {
    color: COLORS.white,
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
  },
  exerciseImage: {
    width: 100,
    height: 100,
    borderRadius: SPACING.borderRadius.lg,
  },
  exerciseInfo: {
    flex: 1,
    marginLeft: 16,
  },
  categoryBadge: {
    backgroundColor: COLORS.primaryLight,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 6,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
  },
  exerciseTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
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
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  playBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
});

export default ExerciseLibraryScreen;
