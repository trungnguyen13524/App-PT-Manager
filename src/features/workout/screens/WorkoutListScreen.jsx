import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Search, Filter, Play, Clock, BarChart } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../../theme';
import { useWorkoutStore } from '../../../store/workoutStore';

const { width } = Dimensions.get('window');

const WorkoutListScreen = () => {
  const navigation = useNavigation();
  const { programs, isLoading, fetchExercises } = useWorkoutStore();

  useEffect(() => {
    fetchExercises();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Luyện tập</Text>
        <TouchableOpacity style={styles.historyBtn}>
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
            <TouchableOpacity key={cat} style={[styles.categoryTag, idx === 0 && styles.categoryTagActive]}>
              <Text style={[styles.categoryText, idx === 0 && styles.categoryTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

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
  categoryTag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    marginRight: 10,
  },
  categoryTagActive: { backgroundColor: COLORS.primary },
  categoryText: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '600' },
  categoryTextActive: { color: '#fff' },
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
  }
});

export default WorkoutListScreen;
