import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { 
  ChevronLeft, 
  Plus, 
  Calendar, 
  Utensils, 
  Dumbbell, 
  TrendingUp,
  MessageSquare
} from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../../theme';
import NutriCard from '../../../components/shared/NutriCard';
import ptService from '../../../api/services/pt.service';

const { width } = Dimensions.get('window');

const PTStudentDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { studentId } = route.params || {};
  
  const [student, setStudent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStudentDetail();
  }, [studentId]);

  const loadStudentDetail = async () => {
    setIsLoading(true);
    try {
      const response = await ptService.getStudentDetail(studentId);
      setStudent(response.data);
    } catch (err) {
      console.error(err);
      Alert.alert('Lỗi', 'Không thể tải thông tin học viên');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
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
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={COLORS.text} size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Học viên</Text>
        <TouchableOpacity style={styles.msgBtn}>
          <MessageSquare color={COLORS.primary} size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Profile Info */}
        <View style={styles.profileSection}>
          <Image 
            source={{ uri: student?.avatar || 'https://i.pravatar.cc/150' }} 
            style={styles.avatar} 
          />
          <Text style={styles.studentName}>{student?.fullName}</Text>
          <Text style={styles.studentGoal}>{student?.goal || 'Giảm mỡ • Cơ bản'}</Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{student?.metrics?.weightKg || '--'}kg</Text>
            <Text style={styles.statLabel}>Hiện tại</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{student?.metrics?.targetWeightKg || '--'}kg</Text>
            <Text style={styles.statLabel}>Mục tiêu</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statVal}>85%</Text>
            <Text style={styles.statLabel}>Tiến độ</Text>
          </View>
        </View>

        {/* Assignments Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Chương trình hiện tại</Text>
        </View>

        {/* Meal Plan Card */}
        <NutriCard style={styles.assignCard}>
          <View style={styles.assignHeader}>
            <View style={styles.assignTitleRow}>
              <View style={[styles.iconBox, { backgroundColor: '#FF980020' }]}>
                <Utensils size={20} color="#FF9800" />
              </View>
              <Text style={styles.assignTitle}>Thực đơn dinh dưỡng</Text>
            </View>
            <TouchableOpacity style={styles.addBtn}>
              <Plus size={18} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.assignDesc}>
            {student?.activeMealPlan?.title || 'Chưa gán thực đơn cho tuần này'}
          </Text>
        </NutriCard>

        {/* Workout Card */}
        <NutriCard style={styles.assignCard}>
          <View style={styles.assignHeader}>
            <View style={styles.assignTitleRow}>
              <View style={[styles.iconBox, { backgroundColor: COLORS.primaryLight }]}>
                <Dumbbell size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.assignTitle}>Bài tập luyện</Text>
            </View>
            <TouchableOpacity style={styles.addBtn}>
              <Plus size={18} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.assignDesc}>
             {student?.activeWorkout?.title || 'Chưa gán bài tập cho hôm nay'}
          </Text>
        </NutriCard>

        <View style={{ height: 100 }} />
      </ScrollView>
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
    paddingVertical: 12,
  },
  backBtn: { padding: 4 },
  headerTitle: { ...TYPOGRAPHY.h3, color: COLORS.text },
  msgBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20 },
  profileSection: { alignItems: 'center', marginBottom: 30 },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 15, borderWidth: 4, borderColor: COLORS.primaryLight },
  studentName: { fontSize: 24, fontWeight: '800', color: COLORS.text },
  studentGoal: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: 24,
    paddingVertical: 20,
    marginBottom: 30,
  },
  statBox: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, height: '50%', backgroundColor: COLORS.divider, alignSelf: 'center' },
  statVal: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  statLabel: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4 },
  sectionHeader: { marginBottom: 15 },
  sectionTitle: { ...TYPOGRAPHY.h3, color: COLORS.text },
  assignCard: { padding: 16, marginBottom: 16 },
  assignHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  assignTitleRow: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  assignTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  addBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center' },
  assignDesc: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20 }
});

export default PTStudentDetailScreen;
