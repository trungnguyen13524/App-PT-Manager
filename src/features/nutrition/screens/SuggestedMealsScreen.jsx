import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Dimensions, StatusBar, ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FOOD_IMAGES, toImageKey } from '../../../assets';
import foodsData from '../../../assets/foods.json';
import ptService from '../../../api/services/pt.service';
import { useNutritionStore } from '../../../store/nutritionStore';
import { Sparkles } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const cardWidth = (width - 60) / 2;

const SuggestedMealsScreen = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('ai'); // 'ai' | 'library'
  const [ptMeals, setPtMeals] = useState(null);
  const [isFetchingPT, setIsFetchingPT] = useState(true);
  const { suggestedMenu, generateAIMealPlan, isLoading: isGeneratingAI } = useNutritionStore();

  useEffect(() => {
    fetchPTMeals();
  }, []);

  const fetchPTMeals = async () => {
    try {
      const res = await ptService.getAssignments('MEAL_PLAN');
      if (res.data && res.data.days && res.data.days.length > 0) {
        // Assume we show the first day's meals for today
        setPtMeals(res.data.days[0].meals || []);
      }
    } catch (err) {
      console.log('No PT meals or error', err.response?.data || err.message);
    } finally {
      setIsFetchingPT(false);
    }
  };

  const handleGenerateAI = async () => {
    await generateAIMealPlan();
  };

  const renderAIMealCard = (meal, dayIndex, mealIndex) => {
    const imgKey = toImageKey(meal.items?.[0] || meal.name);
    const imageSource = FOOD_IMAGES[imgKey] || FOOD_IMAGES['uc_ga_ap_chao'];

    // Map to the format MealDetail expects from JSON (fallback for UI)
    const payloadItem = {
      Description_VN: meal.items?.join(', ') || meal.name,
      Calories: meal.calories,
      Protein: 0, 
      Carbohydrate: 0, 
      TotalFat: 0
    };

    return (
      <TouchableOpacity 
        key={`ai-${dayIndex}-${mealIndex}`} 
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => handlePressCard(payloadItem)}
      >
        <View style={styles.imageContainer}>
          {imageSource ? (
            <Image source={imageSource} style={styles.image} />
          ) : (
             <View style={[styles.image, { backgroundColor: '#CBD5E1' }]} />
          )}
          <View style={styles.glassTag}>
            <Text style={styles.glassTagText}>{meal.calories} kcal</Text>
          </View>
        </View>
        <View style={styles.cardFooter}>
          <Text style={styles.mealTypeName}>
            {meal.name}
          </Text>
          <Text style={styles.foodName} numberOfLines={2}>
            {meal.items?.join(', ')}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const handlePressCard = (item) => {
    navigation.navigate('MealDetail', { item });
  };

  const renderCard = (meal, isPT = false) => {
    const imgKey = toImageKey(meal.name);
    const imageSource = FOOD_IMAGES[imgKey] || FOOD_IMAGES['uc_ga_ap_chao'];

    // Map to the format MealDetail expects from JSON
    const payloadItem = {
      Description_VN: meal.name,
      Calories: meal.calories,
      Protein: meal.macros?.proteinG || 0, 
      Carbohydrate: meal.macros?.carbsG || 0, 
      TotalFat: meal.macros?.fatG || 0
    };

    return (
      <TouchableOpacity 
        key={meal.id || meal.name} 
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => handlePressCard(payloadItem)}
      >
        <View style={styles.imageContainer}>
          {imageSource ? (
            <Image source={imageSource} style={styles.image} />
          ) : (
             <View style={[styles.image, { backgroundColor: '#CBD5E1' }]} />
          )}
          <View style={[styles.glassTag, isPT && { backgroundColor: 'rgba(230, 126, 34, 0.9)' }]}>
            <Text style={styles.glassTagText}>{meal.calories} kcal</Text>
          </View>
        </View>
        <View style={styles.cardFooter}>
          <Text style={[styles.mealTypeName, isPT && { color: '#E67E22' }]}>
            {isPT ? '👑 PT Giao' : mealTypeLabels[meal.mealType]}
          </Text>
          <Text style={styles.foodName} numberOfLines={2}>{meal.name}</Text>
          {isPT && meal.notes ? (
            <Text style={{ fontSize: 11, color: '#4A5568', marginTop: 4 }}>{meal.notes}</Text>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  const renderLibrary = () => {
    return (
      <View style={styles.grid}>
        {foodsData.map((item, index) => {
          const key = toImageKey(item.Description_VN);
          const imageSource = FOOD_IMAGES[key];
          const cal = Math.round(Number(item.Calories) || 0);

          return (
            <TouchableOpacity 
              key={`lib-${index}`} 
              style={[styles.card, { width: cardWidth }]}
              activeOpacity={0.8}
              onPress={() => handlePressCard(item)}
            >
              <View style={styles.imageContainer}>
                {imageSource ? (
                   <Image source={imageSource} style={styles.image} />
                ) : (
                   <View style={[styles.image, { backgroundColor: '#CBD5E1' }]} />
                )}
                <View style={styles.glassTag}>
                  <Text style={styles.glassTagText}>{cal} kcal</Text>
                </View>
              </View>
              <View style={styles.cardFooter}>
                <Text style={styles.foodName} numberOfLines={2}>{item.Description_VN}</Text>
              </View>
            </TouchableOpacity>
          )
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#2D3748" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color="#2D3748" size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gợi Ý & Thư Viện</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'ai' && styles.activeTab]}
          onPress={() => setActiveTab('ai')}
        >
          <Text style={[styles.tabText, activeTab === 'ai' && styles.activeTabText]}>Thực đơn AI</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'library' && styles.activeTab]}
          onPress={() => setActiveTab('library')}
        >
          <Text style={[styles.tabText, activeTab === 'library' && styles.activeTabText]}>Thư viện món</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {activeTab === 'ai' ? (
          isFetchingPT ? (
            <View style={{ marginTop: 50, alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#38BDF8" />
            </View>
          ) : ptMeals && ptMeals.length > 0 ? (
            <View style={styles.verticalList}>
              {ptMeals.map((m) => renderCard(m, true))}
            </View>
          ) : (
            <View style={styles.verticalList}>
              {!suggestedMenu || suggestedMenu.length === 0 ? (
                <View style={styles.emptyAIContainer}>
                  <Text style={styles.emptyAIText}>Bạn chưa có thực đơn AI nào.</Text>
                  <TouchableOpacity 
                    style={styles.generateBtn}
                    onPress={handleGenerateAI}
                    disabled={isGeneratingAI}
                  >
                    {isGeneratingAI ? (
                      <ActivityIndicator color="#0A0B10" />
                    ) : (
                      <>
                        <Sparkles color="#0A0B10" size={20} style={{ marginRight: 8 }} />
                        <Text style={styles.generateBtnText}>TẠO THỰC ĐƠN & LỊCH TẬP AI</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                suggestedMenu.map((dayPlan, dayIndex) => (
                  <View key={`day-${dayIndex}`} style={styles.dayGroup}>
                    <View style={styles.dayHeader}>
                      <Text style={styles.dayTitle}>Ngày {dayPlan.day}</Text>
                      <Text style={styles.dayCalo}>{dayPlan.calories_estimate} kcal</Text>
                    </View>
                    {dayPlan.meals?.map((meal, mealIndex) => 
                      renderAIMealCard(meal, dayIndex, mealIndex)
                    )}
                  </View>
                ))
              )}
            </View>
          )
        ) : (
          renderLibrary()
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backBtn: { padding: 4, marginLeft: -8 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#2D3748' },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#EADDCA',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: { backgroundColor: '#334155' },
  tabText: { color: '#718096', fontWeight: '600', fontSize: 15 },
  activeTabText: { color: '#2D3748', fontWeight: '800' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  verticalList: { gap: 20 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  card: {
    backgroundColor: '#EADDCA',
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 16,
  },
  imageContainer: {
    width: '100%',
    height: 160,
    position: 'relative',
    backgroundColor: '#334155'
  },
  image: {
    width: '100%',
    height: '100%',
  },
  glassTag: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  glassTagText: {
    color: '#556B2F',
    fontSize: 12,
    fontWeight: '800',
  },
  cardFooter: {
    padding: 16,
  },
  mealTypeName: {
    fontSize: 12,
    color: '#556B2F',
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase'
  },
  foodName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2D3748',
  },
  emptyAIContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyAIText: {
    color: '#9CA3AF',
    fontSize: 16,
    marginBottom: 24,
  },
  generateBtn: {
    flexDirection: 'row',
    backgroundColor: '#38BDF8',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  generateBtnText: {
    color: '#0A0B10',
    fontWeight: '800',
    fontSize: 15,
  },
  dayGroup: {
    marginBottom: 24,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#EADDCA',
  },
  dayCalo: {
    fontSize: 14,
    fontWeight: '700',
    color: '#38BDF8',
  }
});

export default SuggestedMealsScreen;
