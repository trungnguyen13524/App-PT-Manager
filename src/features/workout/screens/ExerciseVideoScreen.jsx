import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { ChevronLeft, Info, CheckCircle, AlertCircle } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../../theme';
import { useDialogStore } from '../../../store/dialogStore';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const ExerciseVideoScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { exercise } = route.params;
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(true);

  // Trích xuất ID video từ URL (ví dụ: https://www.youtube.com/embed/IODxDxX7oi4 -> IODxDxX7oi4)
  const videoId = exercise.videoUrl.split('/').pop();

  const onStateChange = useCallback((state) => {
    if (state === "ended") {
      setPlaying(false);
      useDialogStore.getState().showDialog({
        title: "Tuyệt vời!",
        message: "Bạn đã hoàn thành việc xem hướng dẫn bài tập này.",
        type: 'success'
      });
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={COLORS.text} size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hướng dẫn kỹ thuật</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Video Player */}
        <View style={styles.videoContainer}>
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator color={COLORS.primary} size="large" />
            </View>
          )}
          <YoutubePlayer
            height={width * (9/16)}
            play={playing}
            videoId={videoId}
            onChangeState={onStateChange}
            onReady={() => setLoading(false)}
          />
        </View>

        <View style={styles.content}>
          <Text style={styles.exerciseName}>{exercise.name}</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statChip}>
              <Text style={styles.statLabel}>Số hiệp:</Text>
              <Text style={styles.statValue}>{exercise.sets}</Text>
            </View>
            <View style={styles.statChip}>
              <Text style={styles.statLabel}>Số lần:</Text>
              <Text style={styles.statValue}>{exercise.reps}</Text>
            </View>
          </View>

          <View style={styles.instructionBox}>
            <View style={styles.instructionHeader}>
              <Info size={18} color={COLORS.primary} />
              <Text style={styles.instructionTitle}>Kỹ thuật thực hiện</Text>
            </View>
            <Text style={styles.instructionText}>{exercise.instructions}</Text>
          </View>

          <View style={styles.warningBox}>
            <View style={styles.instructionHeader}>
              <AlertCircle size={18} color="#FF8A65" />
              <Text style={[styles.instructionTitle, { color: '#FF8A65' }]}>Lưu ý quan trọng</Text>
            </View>
            <Text style={styles.warningText}>
              • Giữ nhịp thở đều đặn.{"\n"}
              • Không khóa khớp khi thực hiện động tác.{"\n"}
              • Dừng lại ngay nếu cảm thấy đau nhói ở khớp xương.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.completeBtn} 
          onPress={() => navigation.goBack()}
        >
          <CheckCircle color="#fff" size={20} />
          <Text style={styles.completeBtnText}>Tôi đã hiểu kỹ thuật</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  backBtn: { padding: 4 },
  headerTitle: { ...TYPOGRAPHY.h3, color: COLORS.text },
  videoContainer: {
    width: '100%',
    aspectRatio: 16/9,
    backgroundColor: '#000',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    zIndex: 1,
  },
  content: { padding: 20 },
  exerciseName: { fontSize: 24, fontWeight: '800', color: COLORS.text, marginBottom: 15 },
  statsRow: { flexDirection: 'row', marginBottom: 25 },
  statChip: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 12,
  },
  statLabel: { fontSize: 13, color: COLORS.textSecondary, marginRight: 5 },
  statValue: { fontSize: 13, fontWeight: '700', color: COLORS.primary, fontVariant: ['tabular-nums'] },
  instructionBox: {
    backgroundColor: COLORS.primaryLight,
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  instructionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  instructionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.primary, marginLeft: 8 },
  instructionText: { fontSize: 15, color: COLORS.text, lineHeight: 22 },
  warningBox: {
    backgroundColor: '#FFF3F0',
    padding: 20,
    borderRadius: 20,
    marginBottom: 40,
  },
  warningText: { fontSize: 14, color: '#555', lineHeight: 22 },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  completeBtn: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', marginLeft: 10 }
});

export default ExerciseVideoScreen;
