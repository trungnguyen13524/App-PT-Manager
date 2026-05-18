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
  Linking,
  ActivityIndicator,
  Platform
} from 'react-native';
import { Search, Compass, ExternalLink, Bookmark, Clock } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../../theme';
import { USE_MOCK } from '../../../mocks';
import contentService from '../../../api/services/content.service';

const { width } = Dimensions.get('window');

// Mock Data cho Bài báo
const MOCK_ARTICLES = [
  {
    id: 'art_1',
    title: '5 nguyên tắc vàng để giảm mỡ bụng hiệu quả mà không cần nhịn ăn',
    excerpt: 'Nhịn ăn không phải là cách tốt nhất để giảm mỡ. Hãy cùng tìm hiểu 5 nguyên tắc khoa học giúp bạn...',
    imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=800',
    category: 'Dinh dưỡng',
    readTime: '5 phút',
    date: '15 Th05, 2026',
    url: 'https://nutricoach.vn/blog/5-nguyen-tac-giam-mo'
  },
  {
    id: 'art_2',
    title: 'Cách tính Macro (Đạm, Tinh bột, Béo) chuẩn cho người mới bắt đầu tập gym',
    excerpt: 'Đừng chỉ đếm Calo, tỷ lệ Macro mới quyết định bạn sẽ tăng cơ hay tăng mỡ. Hướng dẫn chi tiết cách tính...',
    imageUrl: 'https://images.unsplash.com/photo-1543362906-acfc16c67564?auto=format&fit=crop&q=80&w=800',
    category: 'Kiến thức',
    readTime: '8 phút',
    date: '14 Th05, 2026',
    url: 'https://nutricoach.vn/blog/cach-tinh-macro'
  },
  {
    id: 'art_3',
    title: 'Top 10 loại thực phẩm giàu Protein tự nhiên giá rẻ cho sinh viên',
    excerpt: 'Không cần dùng Whey Protein đắt đỏ, bạn vẫn có thể nạp đủ lượng Đạm cần thiết từ những thực phẩm quen thuộc này.',
    imageUrl: 'https://images.unsplash.com/photo-1615486171448-4af4d3752766?auto=format&fit=crop&q=80&w=800',
    category: 'Thực đơn',
    readTime: '4 phút',
    date: '10 Th05, 2026',
    url: 'https://nutricoach.vn/blog/top-thuc-pham-protein'
  }
];

const DiscoverScreen = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Tất cả');

  const categories = ['Tất cả', 'Dinh dưỡng', 'Kiến thức', 'Thực đơn', 'Tập luyện'];

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        if (USE_MOCK) {
          // Giả lập delay mạng
          await new Promise(resolve => setTimeout(resolve, 800));
          setArticles(MOCK_ARTICLES);
        } else {
          const response = await contentService.getArticles();
          setArticles(response.data || []);
        }
      } catch (error) {
        console.warn('Không thể lấy bài viết:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  const handleOpenLink = (url) => {
    if (url) {
      // Trong thực tế có thể mở WebView in-app, ở đây dùng Linking để mở trình duyệt
      Linking.openURL(url).catch(err => console.error("Không thể mở link:", err));
    }
  };

  const filteredArticles = activeCategory === 'Tất cả' 
    ? articles 
    : articles.filter(a => a.category === activeCategory);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Khám phá</Text>
          <Text style={styles.headerSubtitle}>Kiến thức dinh dưỡng & sức khỏe</Text>
        </View>
        <TouchableOpacity style={styles.searchBtn}>
          <Search color={COLORS.text} size={24} />
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <View style={styles.categoriesWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesContainer}>
          {categories.map((cat, index) => (
            <TouchableOpacity 
              key={index} 
              style={[styles.categoryPill, activeCategory === cat && styles.categoryPillActive]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text style={[styles.categoryText, activeCategory === cat && styles.categoryTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Main Content */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
        ) : (
          <>
            {/* Featured Article */}
            {filteredArticles.length > 0 && (
              <TouchableOpacity 
                style={styles.featuredCard} 
                activeOpacity={0.9}
                onPress={() => handleOpenLink(filteredArticles[0].url)}
              >
                <Image source={{ uri: filteredArticles[0].imageUrl }} style={styles.featuredImage} />
                <View style={styles.featuredOverlay}>
                  <View style={styles.tagBadge}>
                    <Text style={styles.tagText}>{filteredArticles[0].category}</Text>
                  </View>
                  <Text style={styles.featuredTitle} numberOfLines={2}>{filteredArticles[0].title}</Text>
                  <View style={styles.featuredMeta}>
                    <Clock color="#fff" size={14} />
                    <Text style={styles.featuredMetaText}>{filteredArticles[0].readTime}</Text>
                    <Text style={styles.featuredMetaDot}>•</Text>
                    <Text style={styles.featuredMetaText}>{filteredArticles[0].date}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}

            {/* List Articles */}
            <View style={styles.listContainer}>
              <Text style={styles.sectionTitle}>Mới nhất</Text>
              
              {filteredArticles.slice(1).map((article) => (
                <TouchableOpacity 
                  key={article.id} 
                  style={styles.articleCard}
                  onPress={() => handleOpenLink(article.url)}
                  activeOpacity={0.7}
                >
                  <Image source={{ uri: article.imageUrl }} style={styles.articleImage} />
                  <View style={styles.articleContent}>
                    <Text style={styles.articleCategory}>{article.category}</Text>
                    <Text style={styles.articleTitle} numberOfLines={2}>{article.title}</Text>
                    <View style={styles.articleFooter}>
                      <Text style={styles.articleMeta}>{article.date}</Text>
                      <TouchableOpacity>
                        <ExternalLink size={18} color={COLORS.primary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
              
              {filteredArticles.length === 0 && (
                <Text style={styles.emptyText}>Chưa có bài viết nào trong danh mục này.</Text>
              )}
            </View>
          </>
        )}
        
        {/* Padding for Bottom Tabs */}
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
  categoriesWrapper: {
    backgroundColor: '#fff',
    paddingBottom: 15,
  },
  categoriesContainer: {
    paddingHorizontal: 15,
  },
  categoryPill: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    marginHorizontal: 5,
  },
  categoryPillActive: {
    backgroundColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  categoryTextActive: {
    color: '#fff',
  },
  scrollContent: {
    padding: 20,
  },
  featuredCard: {
    width: '100%',
    height: 240,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 24,
    backgroundColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    opacity: 0.8,
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingTop: 40,
    // Tạo gradient từ code có thể phức tạp nên dùng background color bán trong suốt
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  tagBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  tagText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  featuredTitle: {
    ...TYPOGRAPHY.h3,
    color: '#fff',
    marginBottom: 8,
  },
  featuredMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredMetaText: {
    color: '#rgba(255,255,255,0.8)',
    fontSize: 12,
    marginLeft: 6,
  },
  featuredMetaDot: {
    color: '#rgba(255,255,255,0.8)',
    fontSize: 12,
    marginHorizontal: 8,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: 16,
  },
  listContainer: {
    marginBottom: 20,
  },
  articleCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  articleImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  articleContent: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  articleCategory: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  articleTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
    fontSize: 15,
    marginBottom: 8,
    lineHeight: 22,
  },
  articleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  articleMeta: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginTop: 20,
    fontStyle: 'italic'
  }
});

export default DiscoverScreen;
