import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  Platform,
  Alert,
  Linking,
  Modal
} from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect, Circle } from 'react-native-svg';
import { AbstractBackground, GlassCard } from '../../../components/common';
import { Search, Star, PlayCircle, Users, CheckCircle, ChevronRight, Loader2, Shield, Award, X, Lock } from 'lucide-react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import NativeVideoPlayer from '../../../components/shared/NativeVideoPlayer';
import { useNavigation } from '@react-navigation/native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../../theme';
import paymentService from '../../../api/services/payment.service';
import contentService from '../../../api/services/content.service';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const MOCK_COURSES = [
  {
    id: '123e4567-e89b-12d3-a456-426614174001',
    ptFullName: 'Nguyễn Trần Duy Nhất',
    ptAvatarUrl: 'https://i.pravatar.cc/150?img=11',
    title: 'Giảm mỡ thần tốc 21 ngày với HIIT',
    description: 'Chương trình luyện tập cường độ cao giúp đốt cháy calo tối đa, kèm theo thực đơn chi tiết từng bữa ăn.',
    priceVnd: 499000,
    rating: 4.8,
    students: 1240,
    totalLessons: 21,
    durationDays: 21,
    thumbnailUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800',
    tags: ['Giảm mỡ', 'Tại nhà', 'Không dụng cụ']
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174002',
    ptFullName: 'Lê Thu Trang',
    ptAvatarUrl: 'https://i.pravatar.cc/150?img=5',
    title: 'Yoga Pilates Trị Liệu Cổ Vai Gáy',
    description: 'Giải pháp hoàn hảo cho dân văn phòng. 15 phút mỗi ngày để xua tan cơn đau mỏi cổ vai gáy vĩnh viễn.',
    priceVnd: 350000,
    rating: 4.9,
    students: 3105,
    totalLessons: 15,
    durationDays: 30,
    thumbnailUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800',
    tags: ['Trị liệu', 'Yoga', 'Thư giãn']
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174003',
    ptFullName: 'Phạm Minh Quân',
    ptAvatarUrl: 'https://i.pravatar.cc/150?img=12',
    title: 'Xây dựng cơ bắp toàn diện (Gym)',
    description: 'Lộ trình tăng cơ bài bản 8 tuần. Yêu cầu có thẻ thành viên phòng gym hoặc tạ đơn tại nhà.',
    priceVnd: 899000,
    rating: 4.7,
    students: 856,
    totalLessons: 32,
    durationDays: 56,
    thumbnailUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=800',
    tags: ['Tăng cơ', 'Phòng Gym']
  }
];

const PTConnectScreen = () => {
  const navigation = useNavigation();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasingId, setPurchasingId] = useState(null);
  const [filterDays, setFilterDays] = useState('all');

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseDetail, setCourseDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [playingLessonDemo, setPlayingLessonDemo] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await contentService.getDiscoverPTCourses({ page: 1, limit: 20 });
        if (response && response.data) {
          setCourses(response.data);
        } else {
          setCourses(MOCK_COURSES); // Fallback nếu API lỗi
        }
      } catch (error) {
        console.warn('Không thể lấy danh sách khóa học:', error);
        setCourses(MOCK_COURSES); // Fallback
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleOpenDetail = async (course) => {
    setPlayingLessonDemo(null); // Reset demo video state
    setSelectedCourse(course);
    setModalVisible(true);
    setLoadingDetail(true);
    try {
      const response = await contentService.getPTCourseDetail(course.id);
      if (response && response.data) {
        setCourseDetail(response.data);
      } else {
        // Fallback to basic info if response is empty
        setCourseDetail({ ...course, modules: [] });
      }
    } catch (error) {
      console.warn('Lỗi lấy chi tiết khóa học:', error?.response?.data || error);
      // Fallback to allow testing UI even if backend crashes
      setCourseDetail({ ...course, modules: [] });
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleBuyCourse = async (courseId) => {
    setPurchasingId(courseId);
    try {
      const payload = {
        productType: 'PT_COURSE',
        productId: courseId,
        returnUrl: 'app-pt-manager://payment/success',
        cancelUrl: 'app-pt-manager://payment/cancel'
      };
      const response = await paymentService.createCheckout(payload);
      if (response && response.checkoutUrl) {
        Linking.openURL(response.checkoutUrl);
      } else {
        Alert.alert('Lỗi', 'Không thể tạo phiên thanh toán.');
      }
    } catch (error) {
      console.warn('Lỗi thanh toán:', error);
      Alert.alert('Lỗi', 'Đã có lỗi xảy ra. Vui lòng thử lại sau.');
    } finally {
      setPurchasingId(null);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const FILTERS = [
    { id: 'all', label: 'Tất cả' },
    { id: 'short', label: '< 15 ngày' },
    { id: 'medium', label: '15-30 ngày' },
    { id: 'long', label: '> 30 ngày' }
  ];

  const filteredCourses = courses.filter(course => {
    if (filterDays === 'all') return true;
    const duration = course.durationDays || 0;
    if (filterDays === 'short') return duration > 0 && duration < 15;
    if (filterDays === 'medium') return duration >= 15 && duration <= 30;
    if (filterDays === 'long') return duration > 30;
    return true;
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5DC" />
      <AbstractBackground />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Khóa học</Text>
          <Text style={styles.headerSubtitle}>Gói tập & Chương trình từ Chuyên gia</Text>
        </View>
        <TouchableOpacity style={styles.searchBtn}>
          <Search color="#2D3748" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Banner */}
        <View style={styles.bannerContainer}>
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>Học Cùng Chuyên Gia</Text>
            <Text style={styles.bannerText}>Chọn một huấn luyện viên phù hợp để đẩy nhanh tiến độ của bạn.</Text>
            <TouchableOpacity style={styles.bannerBtn}>
              <Text style={styles.bannerBtnText}>Tìm hiểu thêm</Text>
            </TouchableOpacity>
          </View>
          <Image 
            source={{ uri: 'https://cdn3d.iconscout.com/3d/premium/thumb/fitness-trainer-6086392-5016599.png' }} 
            style={styles.bannerImage} 
          />
        </View>

        {/* Filters/Categories (Static for now) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Chương trình Nổi bật</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {FILTERS.map(filter => (
            <TouchableOpacity 
              key={filter.id} 
              style={[styles.filterPill, filterDays === filter.id && styles.filterPillActive]}
              onPress={() => setFilterDays(filter.id)}
            >
              <Text style={[styles.filterText, filterDays === filter.id && styles.filterTextActive]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
        ) : (
          <View style={styles.listContainer}>
            {filteredCourses.length === 0 ? (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Text style={{ color: '#A0AEC0', fontSize: 14 }}>Không có khóa học nào phù hợp.</Text>
              </View>
            ) : (
              filteredCourses.map((course) => (
                <TouchableOpacity 
                  key={course.id} 
                style={styles.courseCard} 
                activeOpacity={0.9}
                onPress={() => handleOpenDetail(course)}
              >
                <Image source={{ uri: course.thumbnailUrl || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80' }} style={styles.courseImage} />
                
                <View style={styles.courseContent}>
                  {/* PT Info */}
                  <View style={styles.ptInfoRow}>
                    <Image source={{ uri: course.ptAvatarUrl || 'https://i.pravatar.cc/150' }} style={styles.ptAvatar} />
                    <View style={styles.ptNameContainer}>
                      <Text style={styles.ptName}>{course.ptFullName}</Text>
                      <CheckCircle color="#556B2F" size={12} style={{ marginLeft: 4 }} />
                    </View>
                  </View>

                  <Text style={styles.courseTitle} numberOfLines={2}>{course.title}</Text>
                  
                  {/* Meta info: Rating, Students, Lessons */}
                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <Star color="#FFD700" size={14} fill="#FFD700" />
                      <Text style={styles.metaText}>{course.rating}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Users color="#4A5568" size={14} />
                      <Text style={styles.metaText}>{course.students?.toLocaleString()}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <PlayCircle color="#4A5568" size={14} />
                      <Text style={styles.metaText}>{course.totalLessons} bài</Text>
                    </View>
                  </View>

                  {/* Tags */}
                  <View style={styles.tagsRow}>
                    {course.tags.map((tag, index) => (
                      <View key={index} style={styles.tagPill}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Price & Action */}
                  <View style={styles.priceRow}>
                    <Text style={styles.priceText}>{formatPrice(course.priceVnd)}</Text>
                    <TouchableOpacity 
                      style={styles.buyBtn} 
                      activeOpacity={0.8}
                      onPress={() => handleBuyCourse(course.id)}
                      disabled={purchasingId === course.id}
                    >
                      {purchasingId === course.id ? (
                        <ActivityIndicator size="small" color="#556B2F" style={{ marginRight: 4 }} />
                      ) : (
                        <>
                          <Text style={styles.buyBtnText}>Mua ngay</Text>
                          <ChevronRight color="#556B2F" size={16} />
                        </>
                      )}
                    </TouchableOpacity>
                  </View>

                </View>
              </TouchableOpacity>
            ))
            )}
          </View>
        )}
        
        {/* Padding cho Bottom Tabs */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Course Detail Modal */}
      <Modal visible={isModalVisible} animationType="slide" transparent={true} onRequestClose={() => { setModalVisible(false); setPlayingLessonDemo(null); }}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle} numberOfLines={1}>{selectedCourse?.title}</Text>
              <TouchableOpacity onPress={() => { setModalVisible(false); setPlayingLessonDemo(null); }} style={styles.closeBtn}>
                <X color="#2D3748" size={24} />
              </TouchableOpacity>
            </View>
            
            {loadingDetail ? (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#556B2F" />
              </View>
            ) : courseDetail ? (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Video Demo Area */}
                {(() => {
                  if (playingLessonDemo) {
                    if (playingLessonDemo.type === 'cloudinary') {
                      return <NativeVideoPlayer sourceUri={playingLessonDemo.url} style={styles.demoVideo} />;
                    } else if (playingLessonDemo.type === 'youtube') {
                      return (
                        <View style={styles.demoVideo}>
                          <YoutubePlayer
                            height={200}
                            play={true}
                            videoId={playingLessonDemo.url}
                          />
                        </View>
                      );
                    }
                  }

                  // Default: Show thumbnail. Never auto-play anything unless a preview lesson is clicked.
                  return <Image source={{ uri: courseDetail?.thumbnailUrl || selectedCourse?.thumbnailUrl || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80' }} style={styles.demoVideo} />;
                })()}

                {/* PT Info Area - Simplified */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Thông tin Huấn luyện viên</Text>
                  
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Image 
                        source={{ uri: courseDetail.pt?.avatarUrl || selectedCourse?.ptAvatarUrl || 'https://i.pravatar.cc/150' }} 
                        style={{ width: 50, height: 50, borderRadius: 25, marginRight: 12, backgroundColor: '#333' }} 
                      />
                      <Text style={{ color: '#2D3748', fontSize: 16, fontWeight: 'bold' }}>
                        {courseDetail.pt?.fullName || selectedCourse?.ptFullName || 'Huấn luyện viên'}
                      </Text>
                    </View>
                    
                    <TouchableOpacity 
                      style={{ backgroundColor: 'rgba(85, 107, 47, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: '#556B2F' }}
                      onPress={() => {
                        setModalVisible(false);
                        setPlayingLessonDemo(null);
                        navigation.navigate('PublicPTProfile', { pt: courseDetail.pt || { fullName: selectedCourse?.ptFullName, avatarUrl: selectedCourse?.ptAvatarUrl } });
                      }}
                    >
                      <Text style={{ color: '#556B2F', fontSize: 12, fontWeight: 'bold' }}>Xem chi tiết</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Course Details */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Giới thiệu gói tập</Text>
                  <Text style={styles.courseDescription}>{courseDetail.description || 'Chưa có mô tả chi tiết cho chương trình này.'}</Text>
                  
                  {/* Copyright Note */}
                  <View style={styles.copyrightNote}>
                    <Shield color={COLORS.info} size={20} />
                    <Text style={styles.copyrightText}>
                      Tài liệu này được thiết kế độc quyền. Vui lòng không chia sẻ ra ngoài để tôn trọng bản quyền của Huấn luyện viên.
                    </Text>
                  </View>
                </View>

                {/* Curriculum / Modules */}
                {courseDetail.modules && courseDetail.modules.length > 0 && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Nội dung giáo trình</Text>
                    {courseDetail.modules.map((mod, mIdx) => (
                      <View key={mod.id || mIdx} style={styles.curriculumModule}>
                        <Text style={styles.curriculumModuleTitle}>{mod.title}</Text>
                        <View style={styles.curriculumLessons}>
                          {mod.lessons && mod.lessons.map((lesson, lIdx) => {
                            const hasVideo = lesson.cloudinaryVideoUrl || lesson.videoUrl || lesson.youtubeVideoId;
                            const canPreview = lesson.isPreview;
                            return (
                              <View key={lesson.id || lIdx} style={styles.curriculumLessonItem}>
                                <View style={styles.curriculumLessonInfo}>
                                  <Text style={styles.curriculumLessonName}>Bài {lIdx + 1}: {lesson.title}</Text>
                                </View>
                                {canPreview ? (
                                  <TouchableOpacity 
                                    style={styles.previewBtn}
                                    onPress={() => {
                                      console.log('DEMO_LESSON_DATA:', JSON.stringify(lesson, null, 2));
                                      if (lesson.cloudinaryVideoUrl || lesson.videoUrl) setPlayingLessonDemo({ type: 'cloudinary', url: lesson.cloudinaryVideoUrl || lesson.videoUrl });
                                      else if (lesson.youtubeVideoId) {
                                        let ytId = lesson.youtubeVideoId;
                                        const match = ytId.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
                                        if (match) ytId = match[1];
                                        
                                        // Hiển thị Preview YouTube ở khung trên cùng
                                        setPlayingLessonDemo({ type: 'youtube', url: ytId });
                                      } else {
                                        const { useDialogStore } = require('../../../store/dialogStore');
                                        const cleanText = lesson.content ? lesson.content.replace(/<[^>]*>?/gm, '') : 'Bài học này chỉ chứa nội dung văn bản nhưng chưa được thêm nội dung.';
                                        useDialogStore.getState().showDialog({
                                          title: `Xem thử: ${lesson.title}`,
                                          message: cleanText,
                                          type: 'info'
                                        });
                                      }
                                    }}
                                  >
                                    <PlayCircle size={16} color={COLORS.primary} style={{ marginRight: 4 }} />
                                    <Text style={styles.previewBtnText}>Xem thử</Text>
                                  </TouchableOpacity>
                                ) : (
                                  <View style={styles.lockedBtn}><Lock size={14} color={COLORS.textLight} /></View>
                                )}
                              </View>
                            );
                          })}
                        </View>
                      </View>
                    ))}
                  </View>
                )}
                <View style={{ height: 100 }} />
              </ScrollView>
            ) : null}

            {/* Bottom Bar */}
            <View style={styles.modalBottomBar}>
              <Text style={styles.modalPriceText}>{formatPrice(selectedCourse?.priceVnd || 0)}</Text>
              <TouchableOpacity style={styles.buyBtnLarge} onPress={() => { setModalVisible(false); setPlayingLessonDemo(null); handleBuyCourse(selectedCourse?.id); }}>
                <Text style={styles.buyBtnLargeText}>Đăng ký ngay</Text>
              </TouchableOpacity>
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
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 10,
    paddingBottom: 15,
  },
  headerTitle: {
    ...TYPOGRAPHY.h2,
    color: '#1A202C',
    fontWeight: '900',
  },
  headerSubtitle: {
    ...TYPOGRAPHY.body2,
    color: '#4A5568',
    marginTop: 4,
    fontWeight: '600',
  },
  searchBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  // Banner
  bannerContainer: {
    backgroundColor: 'rgba(85, 107, 47, 0.08)',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(85, 107, 47, 0.2)',
    marginHorizontal: 20,
  },
  bannerContent: {
    flex: 1,
    zIndex: 2,
    paddingRight: 10,
  },
  bannerTitle: {
    ...TYPOGRAPHY.h3,
    color: '#2D4A33',
    fontWeight: '900',
    marginBottom: 8,
    fontSize: 20,
  },
  bannerText: {
    ...TYPOGRAPHY.body2,
    color: '#4A5568',
    fontWeight: '600',
    marginBottom: 16,
    opacity: 0.9,
    lineHeight: 20,
  },
  bannerBtn: {
    backgroundColor: '#556B2F',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
    shadowColor: '#556B2F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  bannerBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  bannerImage: {
    width: 120,
    height: 120,
    position: 'absolute',
    right: 20,
    bottom: -10,
  },
  // Sections
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 12 },
  sectionTitle: { ...TYPOGRAPHY.h3, color: '#1A202C', fontWeight: '900' },
  seeAllText: { color: '#556B2F', fontWeight: 'bold' },
  filterScroll: { paddingHorizontal: 20, paddingBottom: 16, gap: 8 },
  filterPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0' },
  filterPillActive: { backgroundColor: '#556B2F', borderColor: '#556B2F' },
  filterText: { color: '#4A5568', fontWeight: '600', fontSize: 13 },
  filterTextActive: { color: '#FFFFFF' },
  // List
  listContainer: { paddingHorizontal: 20, paddingBottom: 40 },
  courseCard: { backgroundColor: '#FFFFFF', borderRadius: 20, marginBottom: 20, overflow: 'hidden', elevation: 4, shadowColor: '#2D4A33', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 24 },
  courseImage: { width: '100%', height: 180 },
  courseContent: {
    padding: 16,
  },
  ptInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ptAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.15)',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  ptNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  ptName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1A202C',
  },
  courseTitle: {
    ...TYPOGRAPHY.h3,
    fontSize: 17,
    fontWeight: '800',
    color: '#1A202C',
    marginBottom: 12,
    lineHeight: 24,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 13,
    color: '#1A202C',
    marginLeft: 6,
    fontWeight: '800',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tagPill: {
    backgroundColor: 'rgba(85, 107, 47, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(85, 107, 47, 0.2)',
  },
  tagText: {
    fontSize: 12,
    color: '#2D4A33',
    fontWeight: '900',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.02)',
    paddingTop: 16,
  },
  priceText: {
    ...TYPOGRAPHY.h3,
    fontSize: 22,
    color: '#2D4A33',
    fontWeight: '900',
  },
  buyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#556B2F',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4C602A',
  },
  buyBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
    marginRight: 4,
  },
  copyrightNote: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(49, 130, 206, 0.1)', padding: 12, borderRadius: 8, marginTop: 16, borderWidth: 1, borderColor: 'rgba(49, 130, 206, 0.3)' },
  copyrightText: { color: '#1A202C', fontWeight: '700', fontSize: 13, marginLeft: 10, flex: 1, lineHeight: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, height: '90%', overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  modalTitle: { ...TYPOGRAPHY.h3, color: '#1A202C', fontWeight: '900', flex: 1, marginRight: 10 },
  closeBtn: { padding: 4, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 20 },
  demoVideo: { width: '100%', height: 200, backgroundColor: '#000' },
  modalSection: { padding: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  modalSectionTitle: { ...TYPOGRAPHY.h3, color: '#1A202C', fontWeight: '900', marginBottom: 16 },
  ptProfileHeaderLarge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: 'rgba(0, 0, 0, 0.02)', marginBottom: 16 },
  ptProfileAvatarContainerLarge: { marginRight: 16 },
  ptProfileAvatarLarge: { width: 70, height: 70, borderRadius: 35, borderWidth: 2, borderColor: '#556B2F' },
  ptProfileInfoLarge: { flex: 1 },
  ptProfileNameLarge: { ...TYPOGRAPHY.h2, fontSize: 20, color: '#2D3748' },
  expBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(85, 107, 47, 0.1)', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginTop: 8, borderWidth: 1, borderColor: 'rgba(85, 107, 47, 0.3)' },
  expBadgeText: { color: '#556B2F', fontSize: 12, fontWeight: '600', marginLeft: 4 },
  ptBioContainerLarge: { backgroundColor: 'rgba(0,0,0,0.2)', padding: 14, borderRadius: 12, marginBottom: 16 },
  bioLabel: { fontSize: 13, color: '#4A5568', fontWeight: '600', marginBottom: 6, textTransform: 'uppercase' },
  ptBioTextLarge: { color: '#2D3748', fontSize: 15, lineHeight: 24 },
  specialtiesWrapper: { marginTop: 4 },
  tagsRowLarge: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tagPillLarge: { backgroundColor: 'rgba(255, 255, 255, 0.08)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.15)' },
  tagTextLarge: { fontSize: 13, color: '#4A5568', fontWeight: '500' },
  courseDescription: { color: '#1A202C', fontWeight: '600', fontSize: 15, lineHeight: 24 },
  modalBottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingBottom: Platform.OS === 'ios' ? 30 : 20, borderTopWidth: 1, borderTopColor: 'rgba(0, 0, 0, 0.1)', shadowColor: '#000', shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 10 },
  modalPriceText: { ...TYPOGRAPHY.h2, color: '#2D4A33', fontWeight: '900', fontSize: 24 },
  buyBtnLarge: { backgroundColor: '#556B2F', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 16 },
  buyBtnLargeText: { color: '#F5F5DC', fontWeight: 'bold', fontSize: 16 },
  curriculumModule: { marginBottom: 16, backgroundColor: 'rgba(0, 0, 0, 0.02)', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: 'rgba(0, 0, 0, 0.08)' },
  curriculumModuleTitle: { ...TYPOGRAPHY.subtitle, color: '#1A202C', fontWeight: '900', marginBottom: 12 },
  curriculumLessons: { paddingLeft: 4 },
  curriculumLessonItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderTopWidth: 1, borderColor: 'rgba(0, 0, 0, 0.05)' },
  curriculumLessonInfo: { flex: 1, paddingRight: 16 },
  curriculumLessonName: { fontSize: 14, color: '#1A202C', fontWeight: '700' },
  previewBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(85, 107, 47, 0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(85, 107, 47, 0.3)' },
  previewBtnText: { fontSize: 12, fontWeight: '800', color: '#2D4A33' },
  lockedBtn: { padding: 6, backgroundColor: 'rgba(0, 0, 0, 0.05)', borderRadius: 20 }
});

export default PTConnectScreen;
