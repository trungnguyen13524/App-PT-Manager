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
      const response = await paymentService.createCheckoutSession(courseId);
      if (response.success && response.data?.checkoutUrl) {
        Linking.openURL(response.data.checkoutUrl);
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0F19" />
      <AbstractBackground />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>PT Connect</Text>
          <Text style={styles.headerSubtitle}>Khóa học từ chuyên gia hàng đầu</Text>
        </View>
        <TouchableOpacity style={styles.searchBtn}>
          <Search color="#FFFFFF" size={24} />
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
          <Text style={styles.sectionTitle}>Khóa học Nổi bật</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
        ) : (
          <View style={styles.listContainer}>
            {courses.map((course) => (
              <TouchableOpacity 
                key={course.id} 
                style={styles.courseCard} 
                activeOpacity={0.9}
                onPress={() => handleOpenDetail(course)}
              >
                <Image source={{ uri: course.thumbnailUrl }} style={styles.courseImage} />
                
                <View style={styles.courseContent}>
                  {/* PT Info */}
                  <View style={styles.ptInfoRow}>
                    <Image source={{ uri: course.ptAvatarUrl }} style={styles.ptAvatar} />
                    <View style={styles.ptNameContainer}>
                      <Text style={styles.ptName}>{course.ptFullName}</Text>
                      <CheckCircle color="#00FF66" size={12} style={{ marginLeft: 4 }} />
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
                      <Users color="#94A3B8" size={14} />
                      <Text style={styles.metaText}>{course.students?.toLocaleString()}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <PlayCircle color="#94A3B8" size={14} />
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
                        <ActivityIndicator size="small" color="#00FF66" style={{ marginRight: 4 }} />
                      ) : (
                        <>
                          <Text style={styles.buyBtnText}>Mua ngay</Text>
                          <ChevronRight color="#00FF66" size={16} />
                        </>
                      )}
                    </TouchableOpacity>
                  </View>

                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
        
        {/* Padding cho Bottom Tabs */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Course Detail Modal */}
      <Modal visible={isModalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle} numberOfLines={1}>{selectedCourse?.title}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <X color="#FFF" size={24} />
              </TouchableOpacity>
            </View>
            
            {loadingDetail ? (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#00FF66" />
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
                          <YoutubePlayer height={200} play={false} videoId={playingLessonDemo.url} />
                        </View>
                      );
                    }
                  }

                  const ytTag = courseDetail?.tags?.find(t => t.startsWith('YT_'));
                  let parsedYtId = ytTag ? ytTag.replace('YT_', '') : courseDetail?.youtubeVideoId;
                  if (parsedYtId) {
                    const match = parsedYtId.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
                    if (match) parsedYtId = match[1];
                  }
                  
                  if (courseDetail?.cloudinaryVideoUrl) {
                    return <NativeVideoPlayer sourceUri={courseDetail.cloudinaryVideoUrl} style={styles.demoVideo} />;
                  } else if (parsedYtId) {
                    return (
                      <View style={styles.demoVideo}>
                        <YoutubePlayer height={200} play={false} videoId={parsedYtId} />
                      </View>
                    );
                  } else if (courseDetail?.demoVideoUrl) {
                    return <NativeVideoPlayer sourceUri={courseDetail.demoVideoUrl} style={styles.demoVideo} />;
                  } else {
                    return <Image source={{ uri: courseDetail?.thumbnailUrl || selectedCourse?.thumbnailUrl }} style={styles.demoVideo} />;
                  }
                })()}

                {/* PT Info Area */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Thông tin Huấn luyện viên</Text>
                  <TouchableOpacity 
                    style={styles.ptProfileHeaderLarge} 
                    activeOpacity={0.7}
                    onPress={() => {
                      const ptData = courseDetail?.pt || selectedCourse?.pt;
                      if (ptData) {
                        setModalVisible(false);
                        setTimeout(() => navigation.navigate('PublicPTProfile', { pt: ptData }), 300);
                      }
                    }}
                  >
                    <View style={styles.ptProfileHeader}>
                      {/* Avatar */}
                      <Image 
                        source={{ uri: courseDetail.pt?.avatar || courseDetail.pt?.avatarUrl || selectedCourse?.ptAvatarUrl || 'https://i.pravatar.cc/150' }} 
                        style={styles.ptProfileAvatarLarge} 
                      />
                      <View style={styles.ptProfileNameContainer}>
                        {/* Name */}
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Text style={styles.ptProfileNameLarge}>
                            {courseDetail.pt?.fullName || (courseDetail.pt?.firstName ? `${courseDetail.pt.firstName} ${courseDetail.pt.lastName}` : null) || selectedCourse?.ptFullName || 'Huấn luyện viên'}
                          </Text>
                          <CheckCircle color="#00FF66" size={16} style={{ marginLeft: 6 }} />
                        </View>
                        {/* Email or Phone */}
                        {(courseDetail.pt?.email || courseDetail.pt?.phoneNumber) && (
                          <Text style={{ color: '#A0A0A0', fontSize: 13, marginTop: 4 }}>
                            {courseDetail.pt?.email} {courseDetail.pt?.phoneNumber && `• ${courseDetail.pt?.phoneNumber}`}
                          </Text>
                        )}
                        {/* Experience */}
                        {(courseDetail.pt?.yearsOfExperience || courseDetail.pt?.experienceYears) && (
                          <View style={styles.expBadge}>
                            <Star color="#F5A623" size={12} style={{ marginRight: 4 }} />
                            <Text style={styles.expBadgeText}>{(courseDetail.pt?.yearsOfExperience || courseDetail.pt?.experienceYears)} năm kinh nghiệm</Text>
                          </View>
                        )}
                      </View>
                    </View>
                    <ChevronRight size={20} color={COLORS.textLight} />
                  </TouchableOpacity>
                  
                  <View style={styles.ptBioContainerLarge}>
                    {/* Bio */}
                    {(courseDetail.pt?.description || courseDetail.pt?.bio) && (
                      <View style={{ marginTop: 12 }}>
                        <Text style={styles.ptBioTextLarge}>{courseDetail.pt?.description || courseDetail.pt?.bio}</Text>
                      </View>
                    )}
                    
                    {/* Specialties / Tags */}
                    {courseDetail.pt?.specialties && courseDetail.pt.specialties.length > 0 && (
                      <View style={{ marginTop: 12 }}>
                        <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: 'bold', marginBottom: 8 }}>Chuyên môn:</Text>
                        <View style={styles.tagsRowLarge}>
                          {courseDetail.pt.specialties.map((spec, idx) => (
                            <View key={idx} style={styles.tagPillLarge}>
                              <Text style={styles.tagTextLarge}>{typeof spec === 'string' ? spec : spec.name}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}
                  </View>
                </View>

                {/* Course Details */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Giới thiệu khóa học</Text>
                  <Text style={styles.courseDescription}>{courseDetail.description || 'Chưa có mô tả chi tiết cho khóa học này.'}</Text>
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
                            const hasVideo = lesson.cloudinaryVideoUrl || lesson.youtubeVideoId;
                            const canPreview = lesson.isPreview && hasVideo;
                            return (
                              <View key={lesson.id || lIdx} style={styles.curriculumLessonItem}>
                                <View style={styles.curriculumLessonInfo}>
                                  <Text style={styles.curriculumLessonName}>Bài {lIdx + 1}: {lesson.title}</Text>
                                </View>
                                {canPreview ? (
                                  <TouchableOpacity 
                                    style={styles.previewBtn}
                                    onPress={() => {
                                      if (lesson.cloudinaryVideoUrl) setPlayingLessonDemo({ type: 'cloudinary', url: lesson.cloudinaryVideoUrl });
                                      else if (lesson.youtubeVideoId) {
                                        let ytId = lesson.youtubeVideoId;
                                        const match = ytId.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
                                        if (match) ytId = match[1];
                                        setPlayingLessonDemo({ type: 'youtube', url: ytId });
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
              <TouchableOpacity style={styles.buyBtnLarge} onPress={() => { setModalVisible(false); handleBuyCourse(selectedCourse?.id); }}>
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
    backgroundColor: '#0B0F19',
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
    color: '#FFFFFF',
  },
  headerSubtitle: {
    ...TYPOGRAPHY.body2,
    color: '#94A3B8',
    marginTop: 4,
  },
  searchBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  scrollContent: {
    padding: 20,
  },
  // Banner
  bannerContainer: {
    backgroundColor: 'rgba(0, 255, 102, 0.05)',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 102, 0.2)',
  },
  bannerContent: {
    flex: 1,
    zIndex: 2,
  },
  bannerTitle: {
    ...TYPOGRAPHY.h3,
    color: '#00FF66',
    marginBottom: 8,
  },
  bannerText: {
    ...TYPOGRAPHY.body2,
    color: '#E2E8F0',
    marginBottom: 16,
    opacity: 0.8,
  },
  bannerBtn: {
    backgroundColor: 'rgba(0, 255, 102, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 102, 0.5)',
  },
  bannerBtnText: {
    color: '#00FF66',
    fontWeight: 'bold',
    fontSize: 12,
  },
  bannerImage: {
    width: 120,
    height: 120,
    position: 'absolute',
    right: -10,
    bottom: -10,
    zIndex: 1,
  },
  // Sections
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: '#FFFFFF',
  },
  seeAllText: {
    color: '#00FF66',
    fontWeight: '600',
    fontSize: 14,
  },
  // List
  listContainer: {
    gap: 20,
  },
  courseCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  courseImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  courseContent: {
    padding: 16,
  },
  ptInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ptAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  ptNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  ptName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  courseTitle: {
    ...TYPOGRAPHY.h3,
    fontSize: 17,
    color: '#FFFFFF',
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
    fontSize: 12,
    color: '#94A3B8',
    marginLeft: 4,
    fontWeight: '500',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tagPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  tagText: {
    fontSize: 11,
    color: '#E2E8F0',
    fontWeight: '500',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: 16,
  },
  priceText: {
    ...TYPOGRAPHY.h3,
    color: '#00FF66',
  },
  buyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 102, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 102, 0.3)',
  },
  buyBtnText: {
    color: '#00FF66',
    fontWeight: 'bold',
    fontSize: 14,
    marginRight: 4,
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#0F172A', borderTopLeftRadius: 24, borderTopRightRadius: 24, height: '90%', overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  modalTitle: { ...TYPOGRAPHY.h3, color: '#FFF', flex: 1, marginRight: 10 },
  closeBtn: { padding: 4, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20 },
  demoVideo: { width: '100%', height: 200, backgroundColor: '#000' },
  modalSection: { padding: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  modalSectionTitle: { ...TYPOGRAPHY.h3, color: '#FFF', marginBottom: 16 },
  ptProfileHeaderLarge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)', marginBottom: 16 },
  ptProfileAvatarContainerLarge: { marginRight: 16 },
  ptProfileAvatarLarge: { width: 70, height: 70, borderRadius: 35, borderWidth: 2, borderColor: '#00FF66' },
  ptProfileInfoLarge: { flex: 1 },
  ptProfileNameLarge: { ...TYPOGRAPHY.h2, fontSize: 20, color: '#FFF' },
  expBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0, 255, 102, 0.1)', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginTop: 8, borderWidth: 1, borderColor: 'rgba(0, 255, 102, 0.3)' },
  expBadgeText: { color: '#00FF66', fontSize: 12, fontWeight: '600', marginLeft: 4 },
  ptBioContainerLarge: { backgroundColor: 'rgba(0,0,0,0.2)', padding: 14, borderRadius: 12, marginBottom: 16 },
  bioLabel: { fontSize: 13, color: '#94A3B8', fontWeight: '600', marginBottom: 6, textTransform: 'uppercase' },
  ptBioTextLarge: { color: '#F8FAFC', fontSize: 15, lineHeight: 24 },
  specialtiesWrapper: { marginTop: 4 },
  tagsRowLarge: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tagPillLarge: { backgroundColor: 'rgba(255, 255, 255, 0.08)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.15)' },
  tagTextLarge: { fontSize: 13, color: '#E2E8F0', fontWeight: '500' },
  courseDescription: { color: '#E2E8F0', fontSize: 15, lineHeight: 24 },
  modalBottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#0F172A', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingBottom: Platform.OS === 'ios' ? 30 : 20, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
  modalPriceText: { ...TYPOGRAPHY.h2, color: '#00FF66' },
  buyBtnLarge: { backgroundColor: '#00FF66', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 16 },
  buyBtnLargeText: { color: '#0B0F19', fontWeight: 'bold', fontSize: 16 },
  curriculumModule: { marginBottom: 16, backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  curriculumModuleTitle: { ...TYPOGRAPHY.subtitle, color: '#FFF', marginBottom: 12 },
  curriculumLessons: { paddingLeft: 4 },
  curriculumLessonItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  curriculumLessonInfo: { flex: 1, paddingRight: 16 },
  curriculumLessonName: { fontSize: 14, color: '#E2E8F0' },
  previewBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0, 255, 102, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(0, 255, 102, 0.2)' },
  previewBtnText: { fontSize: 12, fontWeight: '600', color: COLORS.primary },
  lockedBtn: { padding: 6, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20 }
});

export default PTConnectScreen;
