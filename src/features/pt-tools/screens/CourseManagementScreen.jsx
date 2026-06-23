import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Plus, BookOpen, Edit2, CheckCircle } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../../theme';
import NutriButton from '../../../components/shared/NutriButton';
import { usePTStore } from '../../../store/ptStore';
import { useDialogStore } from '../../../store/dialogStore';
import ptService from '../../../api/services/pt.service';

const CourseManagementScreen = () => {
  const navigation = useNavigation();
  const { courses, isLoading, verificationStatus, fetchCourses, error } = usePTStore();

  useEffect(() => {
    const init = async () => {
      let currentStatus = verificationStatus;
      if (!currentStatus) {
        currentStatus = await usePTStore.getState().fetchVerificationStatus();
      }
      if (currentStatus === 'APPROVED') {
        fetchCourses();
      }
    };
    init();
  }, [verificationStatus]);

  if (verificationStatus === 'PENDING_REVIEW' || verificationStatus === 'PENDING') {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ color: '#fff', marginTop: 20, fontSize: 16 }}>Đang chờ Admin duyệt hồ sơ PT...</Text>
      </View>
    );
  }

  if (verificationStatus === 'NONE' || verificationStatus === null) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <Text style={{ color: '#fff', marginBottom: 20, fontSize: 16 }}>Bạn chưa đăng ký làm Huấn luyện viên</Text>
        <TouchableOpacity 
          style={{ backgroundColor: COLORS.primary, padding: 12, borderRadius: 8 }} 
          onPress={() => navigation.navigate('PTVerification')}
        >
          <Text style={{ color: '#1E293B', fontWeight: 'bold' }}>Đăng ký ngay</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handlePublish = async (courseId) => {
    try {
      // Gọi API lấy detail để kiểm tra xem có bài học nào chưa
      const detailRes = await ptService.getCourseDetail(courseId);
      const courseDetail = detailRes.data;
      const hasLessons = courseDetail.modules && courseDetail.modules.some(m => m.lessons && m.lessons.length > 0);

      if (!hasLessons) {
        useDialogStore.getState().showDialog({
          title: 'Giáo trình trống',
          message: 'Khóa học chưa có bài học nào. Vui lòng soạn giáo trình trước khi xuất bản.',
          type: 'error',
          buttons: [
            {
              text: 'Soạn giáo trình',
              onPress: () => navigation.navigate('CurriculumBuilder', { courseId })
            },
            { text: 'Đóng', style: 'cancel' }
          ]
        });
        return;
      }

      // Pre-check frontend: Tìm chính xác bài học nào đang thiếu video
      const missingLessons = [];
      courseDetail.modules?.forEach(m => {
        m.lessons?.forEach(l => {
          if (!l.videoUrl && !l.youtubeVideoId) {
            missingLessons.push(`- ${m.title}: ${l.title}`);
          }
        });
      });

      if (missingLessons.length > 0) {
        useDialogStore.getState().showDialog({
          title: 'Chưa đủ điều kiện xuất bản',
          message: 'Hệ thống phát hiện các bài học sau CHƯA CÓ VIDEO trên Cloud:\n' + missingLessons.join('\n') + '\n\nVui lòng vào Soạn Giáo Trình để tải lại video cho các bài này.',
          type: 'error',
          buttons: [
            {
              text: 'Sửa giáo trình',
              onPress: () => navigation.navigate('CurriculumBuilder', { courseId })
            },
            { text: 'Đóng', style: 'cancel' }
          ]
        });
        return;
      }

      const result = await usePTStore.getState().publishCourse(courseId);
    if (result.success) {
      useDialogStore.getState().showDialog({
        title: 'Thành công',
        message: 'Khóa học đã được xuất bản.',
        type: 'success'
      });
    } else {
      if (result.payload && result.payload.code === 'CURRICULUM_INCOMPLETE') {
        const missingInfo = result.payload.details ? JSON.stringify(result.payload.details) : '';
        useDialogStore.getState().showDialog({
          title: 'Giáo trình chưa hoàn thiện',
          message: `Còn bài học thiếu Video. Vui lòng kiểm tra lại giáo trình.\nChi tiết: ${missingInfo}`,
          type: 'error',
          buttons: [
            {
              text: 'Sửa giáo trình',
              onPress: () => navigation.navigate('CurriculumBuilder', { courseId })
            },
            { text: 'Đóng', style: 'cancel' }
          ]
        });
      } else {
        useDialogStore.getState().showDialog({
          title: 'Lỗi',
          message: result.error || 'Không thể xuất bản khóa học.',
          type: 'error'
        });
      }
    }
  } catch (error) {
      useDialogStore.getState().showDialog({
        title: 'Lỗi',
        message: (error.response?.data?.error?.message) || error.message || 'Lỗi hệ thống khi kết nối.',
        type: 'error'
      });
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
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quản lý khóa học</Text>
        <TouchableOpacity onPress={() => navigation.navigate('CourseMeta')}>
          <Plus size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {error ? (
          <View style={styles.emptyState}>
            <Text style={{ color: COLORS.error, marginTop: 10, textAlign: 'center' }}>
              Lỗi từ Backend khi tải khóa học: {typeof error === 'object' ? JSON.stringify(error) : String(error)}
            </Text>
            <NutriButton 
              title="Thử lại" 
              style={[styles.createButton, { marginTop: 20 }]} 
              onPress={() => fetchCourses()}
            />
          </View>
        ) : courses.length === 0 ? (
          <View style={styles.emptyState}>
            <BookOpen size={48} color={COLORS.textLight} />
            <Text style={styles.emptyText}>Bạn chưa có khóa học nào</Text>
            <NutriButton 
              title="Tạo khóa học mới" 
              style={styles.createButton} 
              onPress={() => navigation.navigate('CourseMeta')}
            />
          </View>
        ) : (
          courses.map(course => (
            <View key={course.id} style={styles.courseCard}>
              <View style={styles.courseInfo}>
                <Text style={styles.courseTitle}>{course.title}</Text>
                <Text style={styles.coursePrice}>
                  {((course.priceVnd ?? course.price_vnd ?? 0)).toLocaleString('vi-VN')} đ
                </Text>
                <View style={styles.statsRow}>
                  <Text style={styles.statText}>Học viên: {course.enrolled || course.total_students || 0}</Text>
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
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => navigation.navigate('CurriculumBuilder', { courseId: course.id })}
                >
                  <BookOpen size={16} color={COLORS.primary} />
                  <Text style={styles.actionText}>Giáo trình</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => navigation.navigate('CourseMeta', { course })}
                >
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
    backgroundColor: COLORS.background,
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
    backgroundColor: COLORS.surface,
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
