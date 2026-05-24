import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeft, Clock, Flame, ChevronRight, CheckCircle2, RefreshCw } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../../theme';
import NutriCard from '../../../components/shared/NutriCard';

const { width } = Dimensions.get('window');

const MealDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { meal } = route.params || {};
  
  if (!meal) return null; // Or a loading/error state

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Top Image & Back Button */}
      <View style={styles.headerContainer}>
        <Image source={{ uri: meal.image }} style={styles.topImage} />
        <View style={styles.overlay} />
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color="#fff" size={28} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.mainInfo}>
          <Text style={styles.mealTitle}>{meal.title}</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Flame size={18} color={COLORS.primary} />
              <Text style={styles.statVal}>{meal.calories} kcal</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statBox}>
              <Clock size={18} color={COLORS.primary} />
              <Text style={styles.statVal}>15-20p</Text>
            </View>
          </View>

          <View style={styles.macroRow}>
            <View style={styles.macroItem}>
              <Text style={styles.macroLabel}>Carbs</Text>
              <Text style={styles.macroVal}>{meal.carbs || 0}g</Text>
            </View>
            <View style={styles.macroItem}>
              <Text style={styles.macroLabel}>Protein</Text>
              <Text style={styles.macroVal}>{meal.protein || 0}g</Text>
            </View>
            <View style={styles.macroItem}>
              <Text style={styles.macroLabel}>Fat</Text>
              <Text style={styles.macroVal}>{meal.fat || 0}g</Text>
            </View>
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cách chế biến</Text>
          <View style={styles.instructionBox}>
            <Text style={styles.instructionText}>{meal.instructions || 'Đang cập nhật hướng dẫn chế biến cho món ăn này...'}</Text>
          </View>
        </View>

        {/* Alternatives */}
        {(meal.alternatives && meal.alternatives.length > 0) && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Món ăn tương đương</Text>
              <RefreshCw size={18} color={COLORS.primary} />
            </View>
            <Text style={styles.subTitle}>Các món có cùng lượng Calo bạn có thể đổi:</Text>
            
            {meal.alternatives.map((alt, index) => (
              <TouchableOpacity key={index} style={styles.altItem} activeOpacity={0.7}>
                <View style={styles.altInfo}>
                  <CheckCircle2 size={20} color={COLORS.primary} />
                  <Text style={styles.altName}>{alt}</Text>
                </View>
                <View style={styles.swapBtn}>
                  <Text style={styles.swapText}>Đổi món</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Add to Log Button */}
      <SafeAreaView style={styles.footer}>
        <TouchableOpacity style={styles.logBtn}>
          <Text style={styles.logBtnText}>Đã ăn món này</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    height: 300,
    position: 'relative',
  },
  topImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginTop: -30,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
  },
  mainInfo: {
    paddingTop: 30,
    marginBottom: 24,
  },
  mealTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 16,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statVal: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: 8,
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: COLORS.divider,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.divider,
    marginHorizontal: 4,
  },
  macroLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  macroVal: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  subTitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  instructionBox: {
    backgroundColor: COLORS.background,
    padding: 16,
    borderRadius: 16,
  },
  instructionText: {
    fontSize: 15,
    lineHeight: 24,
    color: COLORS.textSecondary,
  },
  altItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.divider,
    marginBottom: 12,
  },
  altInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  altName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 12,
  },
  swapBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 8,
  },
  swapText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  footer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  logBtn: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  logBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});

export default MealDetailScreen;
