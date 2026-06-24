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
import { AbstractBackground } from '../../../components/common';
import { SafeAreaView } from 'react-native-safe-area-context';

const PublicPTProfileScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Lấy dữ liệu PT từ màn hình trước truyền sang
  const pt = route.params?.pt || {};

  React.useEffect(() => {
    const triggerMission = async () => {
      try {
        const { useMissionStore } = require('../../../store/missionStore');
        const todayStr = new Date().toISOString().split('T')[0];
        // referenceId should be undefined instead of null to avoid VALIDATION_ERROR "Expected string, received null"
        await useMissionStore.getState().triggerMissionAction('PT_VISIT', undefined, todayStr);
      } catch (error) {
        console.warn('Cannot trigger PT_VISIT mission', error);
      }
    };
    triggerMission();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <AbstractBackground />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft color="#1A202C" size={24} />
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
              <CheckCircle size={14} color="#FFFFFF" fill="#556B2F" />
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
            {pt.bio || pt.description || pt.bioExcerpt || 'Huấn luyện viên này chưa cập nhật phần giới thiệu bản thân.'}
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
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'transparent',
  },
  backBtn: {
    padding: 5,
  },
  headerTitle: {
    ...TYPOGRAPHY.h3,
    color: '#1A202C',
    fontWeight: '900',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  coverPhoto: {
    height: 120,
    backgroundColor: 'rgba(85, 107, 47, 0.08)',
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
    backgroundColor: '#FFFFFF',
    padding: 4,
    position: 'absolute',
    bottom: -50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
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
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 2,
  },
  infoSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  fullName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1A202C',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#556B2F',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1A202C',
    marginBottom: 4,
  },
  statLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    shadowColor: '#2D4A33',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1A202C',
    marginBottom: 16,
  },
  bioText: {
    fontSize: 15,
    color: '#4A5568',
    lineHeight: 24,
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagBadge: {
    backgroundColor: 'rgba(85, 107, 47, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(85, 107, 47, 0.2)',
  },
  tagText: {
    color: '#2D4A33',
    fontSize: 13,
    fontWeight: '800',
  },
});

export default PublicPTProfileScreen;
