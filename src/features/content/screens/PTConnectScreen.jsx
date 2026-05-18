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
  StatusBar,
  ActivityIndicator,
  Platform
} from 'react-native';
import { Search, Star, PlayCircle, Users, CheckCircle, ChevronRight } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../../theme';
import { USE_MOCK } from '../../../mocks';

const { width } = Dimensions.get('window');

// Mock Data cho Khóa học PT
const MOCK_COURSES = [
  {
    id: 'course_1',
    ptName: 'Nguyễn Trần Duy Nhất',
    ptAvatar: 'https://i.pravatar.cc/150?img=11',
    title: 'Giảm mỡ thần tốc 21 ngày với HIIT',
    description: 'Chương trình luyện tập cường độ cao giúp đốt cháy calo tối đa, kèm theo thực đơn chi tiết từng bữa ăn.',
    price: 499000,
    rating: 4.8,
    students: 1240,
    lessons: 21,
    imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800',
    tags: ['Giảm mỡ', 'Tại nhà', 'Không dụng cụ']
  },
  {
    id: 'course_2',
    ptName: 'Lê Thu Trang',
    ptAvatar: 'https://i.pravatar.cc/150?img=5',
    title: 'Yoga Pilates Trị Liệu Cổ Vai Gáy',
    description: 'Giải pháp hoàn hảo cho dân văn phòng. 15 phút mỗi ngày để xua tan cơn đau mỏi cổ vai gáy vĩnh viễn.',
    price: 350000,
    rating: 4.9,
    students: 3105,
    lessons: 15,
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800',
    tags: ['Trị liệu', 'Yoga', 'Thư giãn']
  },
  {
    id: 'course_3',
    ptName: 'Phạm Minh Quân',
    ptAvatar: 'https://i.pravatar.cc/150?img=12',
    title: 'Xây dựng cơ bắp toàn diện (Gym)',
    description: 'Lộ trình tăng cơ bài bản 8 tuần. Yêu cầu có thẻ thành viên phòng gym hoặc tạ đơn tại nhà.',
    price: 899000,
    rating: 4.7,
    students: 856,
    lessons: 32,
    imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=800',
    tags: ['Tăng cơ', 'Phòng Gym']
  }
];

const PTConnectScreen = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        if (USE_MOCK) {
          // Giả lập delay mạng
          await new Promise(resolve => setTimeout(resolve, 800));
          setCourses(MOCK_COURSES);
        } else {
          // Tương lai: const response = await contentService.getPTCourses();
          // setCourses(response.data);
          setCourses(MOCK_COURSES); // Tạm fallback
        }
      } catch (error) {
        console.warn('Không thể lấy danh sách khóa học:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>PT Connect</Text>
          <Text style={styles.headerSubtitle}>Khóa học từ chuyên gia hàng đầu</Text>
        </View>
        <TouchableOpacity style={styles.searchBtn}>
          <Search color={COLORS.text} size={24} />
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
              <TouchableOpacity key={course.id} style={styles.courseCard} activeOpacity={0.9}>
                <Image source={{ uri: course.imageUrl }} style={styles.courseImage} />
                
                <View style={styles.courseContent}>
                  {/* PT Info */}
                  <View style={styles.ptInfoRow}>
                    <Image source={{ uri: course.ptAvatar }} style={styles.ptAvatar} />
                    <View style={styles.ptNameContainer}>
                      <Text style={styles.ptName}>{course.ptName}</Text>
                      <CheckCircle color={COLORS.primary} size={12} style={{ marginLeft: 4 }} />
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
                      <Users color={COLORS.textSecondary} size={14} />
                      <Text style={styles.metaText}>{course.students.toLocaleString()}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <PlayCircle color={COLORS.textSecondary} size={14} />
                      <Text style={styles.metaText}>{course.lessons} bài</Text>
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
                    <Text style={styles.priceText}>{formatPrice(course.price)}</Text>
                    <View style={styles.buyBtn}>
                      <Text style={styles.buyBtnText}>Mua ngay</Text>
                      <ChevronRight color="#fff" size={16} />
                    </View>
                  </View>

                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
        
        {/* Padding cho Bottom Tabs */}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 10,
    paddingBottom: 15,
    backgroundColor: '#fff',
  },
  headerTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.body2,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  searchBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 20,
  },
  // Banner
  bannerContainer: {
    backgroundColor: COLORS.primaryLight || '#E8F5E9',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    overflow: 'hidden',
  },
  bannerContent: {
    flex: 1,
    zIndex: 2,
  },
  bannerTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primaryDark || '#1B5E20',
    marginBottom: 8,
  },
  bannerText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.primaryDark || '#1B5E20',
    marginBottom: 16,
    opacity: 0.8,
  },
  bannerBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  bannerBtnText: {
    color: '#fff',
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
    color: COLORS.text,
  },
  seeAllText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  // List
  listContainer: {
    gap: 20,
  },
  courseCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
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
    borderColor: '#eee',
  },
  ptNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  ptName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  courseTitle: {
    ...TYPOGRAPHY.h3,
    fontSize: 17,
    color: COLORS.text,
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
    color: COLORS.textSecondary,
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
    backgroundColor: COLORS.surface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 16,
  },
  priceText: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primary,
  },
  buyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  buyBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    marginRight: 4,
  }
});

export default PTConnectScreen;
