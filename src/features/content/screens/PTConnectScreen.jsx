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
  Linking
} from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect, Circle } from 'react-native-svg';
import { AbstractBackground, GlassCard } from '../../../components/common';
import { Search, Star, PlayCircle, Users, CheckCircle, ChevronRight, Loader2 } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../../theme';
import { USE_MOCK } from '../../../mocks';
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
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasingId, setPurchasingId] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        if (USE_MOCK) {
          // Giả lập delay mạng
          await new Promise(resolve => setTimeout(resolve, 800));
          setCourses(MOCK_COURSES);
        } else {
          const response = await contentService.getDiscoverPTCourses({ page: 1, limit: 20 });
          if (response && response.data) {
            setCourses(response.data);
          } else {
            setCourses(MOCK_COURSES); // Fallback nếu API lỗi
          }
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

  const handleBuyCourse = async (courseId) => {
    try {
      setPurchasingId(courseId);
      
      // Gọi API Payment Checkout
      const payload = {
        productType: 'PT_COURSE',
        productId: courseId
      };
      
      const response = await paymentService.createCheckout(payload);
      
      // Response trả về chứa checkoutUrl (trang quét mã QR của PayOS)
      if (response && response.data && response.data.checkoutUrl) {
        // Mở trình duyệt ngoài hoặc in-app browser để thanh toán
        const supported = await Linking.canOpenURL(response.data.checkoutUrl);
        if (supported) {
          await Linking.openURL(response.data.checkoutUrl);
        } else {
          Alert.alert('Lỗi', 'Không thể mở trang thanh toán.');
        }
      } else {
        throw new Error('Không lấy được link thanh toán từ hệ thống.');
      }
    } catch (error) {
      console.warn('Lỗi thanh toán:', error);
      Alert.alert(
        'Thanh toán thất bại',
        error.message || 'Có lỗi xảy ra khi tạo giao dịch thanh toán. Vui lòng thử lại.'
      );
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
              <TouchableOpacity key={course.id} style={styles.courseCard} activeOpacity={0.9}>
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
  }
});

export default PTConnectScreen;
