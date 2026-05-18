import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Plus, BookOpen, Edit2, CheckCircle } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../../theme';
import NutriButton from '../../../components/shared/NutriButton';
import ptService from '../../../api/services/pt.service';

const CourseManagementScreen = () => {
  const navigation = useNavigation();
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      // Gọi API giả lập hoặc thật
      // const response = await ptService.getCourses();
      // Giả lập data nếu API chưa có data
      const mockCourses = [
        { id: 'crs_1', title: 'Giảm 5kg trong 30 ngày', priceVnd: 1490000, status: 'PUBLISHED', enrolled: 12 },
        { id: 'crs_2', title: 'Tăng cơ giảm mỡ cơ bản', priceVnd: 990000, status: 'DRAFT', enrolled: 0 }
      ];
      setCourses(mockCourses);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async (courseId) => {
    try {
      // await ptService.publishCourse(courseId);
      Alert.alert('Thành công', 'Khóa học đã được gửi yêu cầu duyệt xuất bản.');
      fetchCourses();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể xuất bản khóa học.');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quản lý khóa học</Text>
        <TouchableOpacity>
          <Plus size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {courses.length === 0 ? (
          <View style={styles.emptyState}>
            <BookOpen size={48} color={COLORS.textLight} />
            <Text style={styles.emptyText}>Bạn chưa có khóa học nào</Text>
            <NutriButton title="Tạo khóa học mới" style={styles.createButton} />
          </View>
        ) : (
          courses.map(course => (
            <View key={course.id} style={styles.courseCard}>
              <View style={styles.courseInfo}>
                <Text style={styles.courseTitle}>{course.title}</Text>
                <Text style={styles.coursePrice}>
                  {course.priceVnd.toLocaleString('vi-VN')} đ
                </Text>
                <View style={styles.statsRow}>
                  <Text style={styles.statText}>Học viên: {course.enrolled}</Text>
                  <View style={[
                    styles.statusBadge, 
                    { backgroundColor: course.status === 'PUBLISHED' ? COLORS.successLight : COLORS.warningLight }
                  ]}>
                    <Text style={[
                      styles.statusText,
                      { color: course.status === 'PUBLISHED' ? COLORS.success : COLORS.warning }
                    ]}>
                      {course.status === 'PUBLISHED' ? 'Đã xuất bản' : 'Bản nháp'}
                    </Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.actionButton}>
                  <Edit2 size={16} color={COLORS.primary} />
                  <Text style={styles.actionText}>Sửa</Text>
                </TouchableOpacity>
                {course.status === 'DRAFT' && (
                  <TouchableOpacity 
                    style={styles.publishButton}
                    onPress={() => handlePublish(course.id)}
                  >
                    <CheckCircle size={16} color={COLORS.white} />
                    <Text style={styles.publishText}>Xuất bản</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: 50,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.white,
  },
  headerTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },
  content: {
    padding: SPACING.lg,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    marginTop: SPACING.md,
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  createButton: {
    marginTop: SPACING.lg,
  },
  courseCard: {
    backgroundColor: COLORS.white,
    borderRadius: SPACING.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  courseInfo: {
    marginBottom: SPACING.md,
  },
  courseTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
    marginBottom: 4,
  },
  coursePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.md,
    justifyContent: 'flex-end',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: SPACING.sm,
    backgroundColor: COLORS.primaryLight,
  },
  actionText: {
    marginLeft: 4,
    color: COLORS.primary,
    fontWeight: '600',
  },
  publishButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: SPACING.sm,
    backgroundColor: COLORS.success,
  },
  publishText: {
    marginLeft: 4,
    color: COLORS.white,
    fontWeight: '600',
  }
});

export default CourseManagementScreen;
