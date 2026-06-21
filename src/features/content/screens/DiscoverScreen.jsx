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
  Linking,
  ActivityIndicator,
  Platform
} from 'react-native';
import { Search, Compass, ExternalLink, Bookmark, Clock } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Stop, Rect, Circle } from 'react-native-svg';
import { COLORS, TYPOGRAPHY, SPACING } from '../../../theme';
import contentService from '../../../api/services/content.service';

const { width } = Dimensions.get('window');

const AbstractBackground = React.memo(() => (
  <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
    <Svg width="100%" height="100%">
      <Defs>
        <LinearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#0F172A" />
          <Stop offset="100%" stopColor="#1E293B" />
        </LinearGradient>
        <LinearGradient id="circleGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#00FF66" stopOpacity="0.1" />
          <Stop offset="100%" stopColor="#00B3FF" stopOpacity="0.02" />
        </LinearGradient>
        <LinearGradient id="circleGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FF4D00" stopOpacity="0.1" />
          <Stop offset="100%" stopColor="#FF0080" stopOpacity="0.02" />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#bgGrad)" />
      
      <Circle cx="10%" cy="10%" r="120" fill="url(#circleGrad1)" />
      <Circle cx="90%" cy="40%" r="150" fill="url(#circleGrad2)" />
      <Circle cx="20%" cy="80%" r="180" fill="url(#circleGrad1)" />
    </Svg>
  </View>
));

const DiscoverScreen = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Tất cả');

  const categories = ['Tất cả', 'Dinh dưỡng', 'Kiến thức', 'Thực đơn', 'Tập luyện'];

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await contentService.getArticles();
        setArticles(response.data || []);
      } catch (error) {
        // console.warn('Không thể lấy bài viết:', error);
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
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <AbstractBackground />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Khám phá</Text>
          <Text style={styles.headerSubtitle}>Kiến thức dinh dưỡng & sức khỏe</Text>
        </View>
        <TouchableOpacity style={styles.searchBtn}>
          <Search color="#FFFFFF" size={24} />
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
          <ActivityIndicator size="large" color="#00FF66" style={{ marginTop: 50 }} />
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
                <View style={styles.featuredGradientOverlay}>
                  <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
                    <Defs>
                      <LinearGradient id="overlayGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <Stop offset="0%" stopColor="#000000" stopOpacity="0" />
                        <Stop offset="50%" stopColor="#000000" stopOpacity="0.4" />
                        <Stop offset="100%" stopColor="#000000" stopOpacity="0.95" />
                      </LinearGradient>
                    </Defs>
                    <Rect width="100%" height="100%" fill="url(#overlayGrad)" />
                  </Svg>
                </View>
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
                      <TouchableOpacity style={styles.actionBtn}>
                        <ExternalLink size={18} color="#00FF66" />
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
    backgroundColor: '#0F172A',
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
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  searchBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  categoriesWrapper: {
    paddingBottom: 15,
  },
  categoriesContainer: {
    paddingHorizontal: 15,
  },
  categoryPill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoryPillActive: {
    backgroundColor: 'rgba(0, 255, 102, 0.15)',
    borderColor: '#00FF66',
    shadowColor: '#00FF66',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  categoryTextActive: {
    color: '#00FF66',
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 20,
  },
  featuredCard: {
    width: '100%',
    height: 280,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 24,
    backgroundColor: '#1E293B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredGradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingTop: 40,
  },
  tagBadge: {
    backgroundColor: 'rgba(0, 255, 102, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 102, 0.5)',
  },
  tagText: {
    color: '#00FF66',
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  featuredTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
    lineHeight: 30,
  },
  featuredMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredMetaText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
    marginLeft: 6,
    fontWeight: '500',
  },
  featuredMetaDot: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 12,
    marginHorizontal: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  listContainer: {
    marginBottom: 20,
  },
  articleCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 20,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  articleImage: {
    width: 110,
    height: 110,
    borderRadius: 16,
  },
  articleContent: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  articleCategory: {
    color: '#00B3FF',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 10,
    lineHeight: 22,
  },
  articleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  articleMeta: {
    color: '#9CA3AF',
    fontSize: 13,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 255, 102, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#9CA3AF',
    marginTop: 30,
    fontStyle: 'italic',
    fontSize: 15,
  }
});

export default DiscoverScreen;
