import React, { useEffect, useState } from 'react';
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
import { ChevronLeft, Calendar, Flame, Clock, Dumbbell } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY } from '../../../theme';
import { useWorkoutStore } from '../../../store/workoutStore';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

const AbstractBackground = () => (
  <View style={StyleSheet.absoluteFill}>
    <View style={styles.bgBlob1} />
    <View style={styles.bgBlob2} />
    <View style={styles.bgBlob3} />
  </View>
);

const WorkoutHistoryScreen = () => {
  const navigation = useNavigation();
  const fetchHistory = useWorkoutStore(state => state.fetchHistory);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    const data = await fetchHistory();
    // sort by latest first
    const sorted = [...(data || [])].sort((a, b) => new Date(b.performedAt) - new Date(a.performedAt));
    setHistory(sorted);
    setLoading(false);
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderHistoryCard = (item) => (
    <View key={item.id || Math.random().toString()} style={styles.glassCard}>
      <View style={styles.cardHeader}>
        <View style={styles.titleRow}>
          <View style={styles.iconWrapper}>
            <Dumbbell size={20} color="#556B2F" />
          </View>
          <Text style={styles.cardTitle}>{item.name || 'Buổi tập không tên'}</Text>
        </View>
        <Text style={styles.dateText}>{formatDate(item.performedAt)}</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Flame size={16} color="#FF9800" style={{ marginRight: 6 }} />
          <Text style={styles.statValue}>{item.caloriesBurned || 0}</Text>
          <Text style={styles.statLabel}> kcal</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Clock size={16} color="#00B3FF" style={{ marginRight: 6 }} />
          <Text style={styles.statValue}>{Math.round((item.durationSec || 0) / 60)}</Text>
          <Text style={styles.statLabel}> phút</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{(item.logs || []).length}</Text>
          <Text style={styles.statLabel}> bài tập</Text>
        </View>
      </View>
      
      {item.notes ? (
        <Text style={styles.notesText}>Ghi chú: {item.notes}</Text>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <AbstractBackground />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color="#2D3748" size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch sử tập luyện</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator size="large" color="#556B2F" style={{ marginTop: 50 }} />
        ) : history.length === 0 ? (
          <View style={styles.emptyState}>
            <Calendar size={48} color="rgba(255,255,255,0.2)" />
            <Text style={styles.emptyText}>Bạn chưa có lịch sử tập luyện nào.</Text>
            <TouchableOpacity style={styles.ctaBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.ctaBtnText}>Bắt đầu tập ngay</Text>
            </TouchableOpacity>
          </View>
        ) : (
          history.map(renderHistoryCard)
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2D3748',
  },
  bgBlob1: {
    position: 'absolute',
    top: -100,
    right: -50,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(0, 255, 102, 0.08)',
    transform: [{ scaleX: 1.2 }, { scaleY: 0.8 }],
  },
  bgBlob2: {
    position: 'absolute',
    bottom: 100,
    left: -100,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(0, 179, 255, 0.08)',
    transform: [{ scaleX: 0.9 }, { scaleY: 1.1 }],
  },
  bgBlob3: {
    position: 'absolute',
    top: '40%',
    right: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(139, 92, 246, 0.06)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2D3748',
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  glassCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  cardHeader: {
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(85, 107, 47, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  cardTitle: {
    color: '#2D3748',
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  dateText: {
    color: '#9CA3AF',
    fontSize: 13,
    marginLeft: 42,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  statBox: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  statValue: {
    color: '#2D3748',
    fontSize: 15,
    fontWeight: '700',
  },
  statLabel: {
    color: '#9CA3AF',
    fontSize: 13,
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  notesText: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 12,
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  ctaBtn: {
    backgroundColor: 'rgba(85, 107, 47, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(85, 107, 47, 0.3)',
  },
  ctaBtnText: {
    color: '#556B2F',
    fontSize: 16,
    fontWeight: '600',
  }
});

export default WorkoutHistoryScreen;
