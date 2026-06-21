import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, CheckCircle, Star, Phone } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY } from '../../../theme';
import { SafeAreaView } from 'react-native-safe-area-context';

const PublicPTProfileScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Lấy dữ liệu PT từ màn hình trước truyền sang
  const pt = route.params?.pt || {};

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hồ sơ Huấn luyện viên</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Cover & Avatar */}
        <View style={styles.coverPhoto}>
          <View style={styles.avatarWrapper}>
            <Image 
              source={{ uri: pt.avatarUrl || pt.avatar || 'https://i.pravatar.cc/150' }} 
              style={styles.avatar} 
            />
            <View style={styles.verifiedBadge}>
              <CheckCircle size={14} color="#FFF" fill="#00FF66" />
            </View>
          </View>
        </View>

        {/* Info */}
        <View style={styles.infoSection}>
          <Text style={styles.fullName}>
            {pt.fullName || (pt.firstName ? `${pt.firstName} ${pt.lastName}` : null) || 'Huấn luyện viên'}
          </Text>
          <Text style={styles.subtitle}>
            PT Chuyên nghiệp • {(pt.yearsOfExperience || pt.experienceYears) ? `${(pt.yearsOfExperience || pt.experienceYears)} năm kinh nghiệm` : 'NutriCoach Gold'}
          </Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>10+</Text>
              <Text style={styles.statLabel}>Khóa học</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>Đang cập nhật</Text>
              <Text style={styles.statLabel}>Đánh giá</Text>
            </View>
          </View>
        </View>

        {/* Chuyên môn */}
        {pt.specialties && pt.specialties.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Chuyên môn</Text>
            <View style={styles.tagsContainer}>
              {pt.specialties.map((spec, index) => (
                <View key={index} style={styles.tagBadge}>
                  <Text style={styles.tagText}>{typeof spec === 'string' ? spec : spec.name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Giới thiệu */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Giới thiệu bản thân</Text>
          <Text style={styles.bioText}>
            {pt.description || pt.bio || 'Huấn luyện viên này chưa cập nhật phần giới thiệu bản thân.'}
          </Text>
        </View>

        <View style={{ height: 40 }} />
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: COLORS.surface,
  },
  backBtn: {
    padding: 5,
  },
  headerTitle: {
    ...TYPOGRAPHY.h3,
    color: '#fff',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  coverPhoto: {
    height: 120,
    backgroundColor: 'rgba(0, 255, 102, 0.1)',
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 50,
  },
  avatarWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.background,
    padding: 4,
    position: 'absolute',
    bottom: -50,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 45,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: 2,
  },
  infoSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  fullName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#00FF66',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  statLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  card: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },
  bioText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 22,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagBadge: {
    backgroundColor: 'rgba(0, 255, 102, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 102, 0.3)',
  },
  tagText: {
    color: '#00FF66',
    fontSize: 13,
    fontWeight: '500',
  },
});

export default PublicPTProfileScreen;
