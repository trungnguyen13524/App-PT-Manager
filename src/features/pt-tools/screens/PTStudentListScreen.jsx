import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronRight, Search, Filter } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../../theme';
import NutriCard from '../../../components/shared/NutriCard';
import { usePTStore } from '../../../store/ptStore';

const PTStudentListScreen = () => {
  const navigation = useNavigation();
  const { students, fetchStudents, isLoading } = usePTStore();

  useEffect(() => {
    fetchStudents();
  }, []);

  if (isLoading && students.length === 0) {
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
        <Text style={styles.headerTitle}>Học viên của bạn</Text>
        <TouchableOpacity style={styles.headerIconBtn}>
          <Filter size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Lọc & Tìm kiếm */}
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Search size={20} color={COLORS.textLight} />
            <Text style={styles.searchPlaceholder}>Tìm kiếm học viên...</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Tất cả học viên ({students.length})</Text>

        {/* Danh sách học viên */}
        <View style={styles.studentsList}>
          {students.map((student) => (
            <TouchableOpacity 
              key={student.id} 
              onPress={() => navigation.navigate('StudentDashboard', { isPTView: true, studentData: student })}
            >
              <NutriCard style={styles.studentCard}>
                <Image source={{ uri: student.avatar || 'https://via.placeholder.com/150' }} style={styles.studentAvatar} />
                <View style={styles.studentInfo}>
                  <Text style={styles.studentName}>{student.fullName}</Text>
                  <Text style={styles.studentGoal}>{student.goal || 'Giảm mỡ'}</Text>
                  
                  <View style={styles.studentMeta}>
                    <Text style={styles.metaText}>{student.weight || '--'} kg</Text>
                    <View style={styles.dot} />
                    <Text style={styles.metaText}>{student.height || '--'} cm</Text>
                  </View>
                </View>
                <View style={styles.progressCircle}>
                  <Text style={styles.progressText}>{student.progress || 0}%</Text>
                </View>
              </NutriCard>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
  },
  headerTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
  },
  headerIconBtn: {
    padding: 8,
    backgroundColor: COLORS.background,
    borderRadius: 20,
  },
  scrollContent: {
    padding: 20,
  },
  searchRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  searchBar: {
    flex: 1,
    height: 48,
    backgroundColor: COLORS.white,
    borderRadius: SPACING.borderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchPlaceholder: {
    color: COLORS.textLight,
    marginLeft: 12,
    fontSize: 14,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: 16,
  },
  studentsList: {
    gap: 12,
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 0,
  },
  studentAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 16,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  studentGoal: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  studentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.textLight,
    marginHorizontal: 8,
  },
  progressCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  }
});

export default PTStudentListScreen;
