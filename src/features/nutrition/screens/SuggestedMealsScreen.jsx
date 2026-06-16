import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Filter, Flame, Clock } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../../theme';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const cardWidth = (width - 60) / 2; // 2 columns with padding

const SuggestedMealsScreen = () => {
  const navigation = useNavigation();

  // Mock data for suggested meals
  const categories = ['Tất cả', 'Tăng cơ', 'Giảm mỡ', 'Ít Carbs', 'Thuần chay'];
  const [activeCategory, setActiveCategory] = React.useState('Tất cả');

  const meals = [
    {
      id: 1,
      name: 'Phở gà',
      desc: 'Giàu đạm, ít béo',
      calories: 350,
      time: '15 phút',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80',
      tags: ['Tăng cơ']
    },
    {
      id: 2,
      name: 'Gỏi cuốn',
      desc: 'Nhiều rau xanh',
      calories: 280,
      time: '10 phút',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
      tags: ['Giảm mỡ', 'Ít Carbs']
    },
    {
      id: 3,
      name: 'Cơm gà gạo lứt',
      desc: 'Cân bằng dinh dưỡng',
      calories: 420,
      time: '25 phút',
      image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=400&q=80',
      tags: ['Tăng cơ']
    },
    {
      id: 4,
      name: 'Salad cá hồi',
      desc: 'Giàu Omega-3',
      calories: 310,
      time: '15 phút',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80',
      tags: ['Giảm mỡ', 'Ít Carbs']
    },
    {
      id: 5,
      name: 'Bún đậu chay',
      desc: 'Thanh đạm',
      calories: 380,
      time: '20 phút',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
      tags: ['Thuần chay']
    },
    {
      id: 6,
      name: 'Bò bít tết',
      desc: 'Nhiều đạm',
      calories: 550,
      time: '30 phút',
      image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=400&q=80',
      tags: ['Tăng cơ']
    }
  ];

  const filteredMeals = activeCategory === 'Tất cả' 
    ? meals 
    : meals.filter(meal => meal.tags.includes(activeCategory));

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={COLORS.text} size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gợi ý bữa ăn</Text>
        <TouchableOpacity style={styles.filterBtn}>
          <Filter color={COLORS.text} size={24} />
        </TouchableOpacity>
      </View>

      {/* Categories Horizontal Scroll */}
      <View style={styles.categoriesWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
          {categories.map((cat, index) => (
            <TouchableOpacity 
              key={index} 
              style={[styles.categoryBadge, activeCategory === cat && styles.categoryBadgeActive]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text style={[styles.categoryText, activeCategory === cat && styles.categoryTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Meals Grid */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.gridContent}>
        <View style={styles.gridContainer}>
          {filteredMeals.map((meal) => (
            <TouchableOpacity 
              key={meal.id} 
              style={styles.mealCard}
              onPress={() => navigation.navigate('MealDetail', { 
                meal: {
                  ...meal,
                  title: meal.name,
                  protein: 25, // Mock default macros
                  carbs: 30,
                  fat: 10,
                  instructions: 'Hướng dẫn chế biến đang cập nhật...',
                  alternatives: []
                } 
              })}
              activeOpacity={0.8}
            >
              <View style={styles.imageContainer}>
                <Image source={{ uri: meal.image }} style={styles.mealImage} />
                <View style={styles.calorieTag}>
                  <Flame size={12} color="#FFF" style={{ marginRight: 4 }} />
                  <Text style={styles.tagText}>{meal.calories} kcal</Text>
                </View>
              </View>
              <View style={styles.mealInfo}>
                <Text style={styles.mealName} numberOfLines={1}>{meal.name}</Text>
                <Text style={styles.mealDesc} numberOfLines={1}>{meal.desc}</Text>
                <View style={styles.timeRow}>
                  <Clock size={12} color={COLORS.textLight} />
                  <Text style={styles.timeText}>{meal.time}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
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
    paddingVertical: 16,
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
  },
  filterBtn: {
    padding: 8,
    marginRight: -8,
  },
  categoriesWrapper: {
    marginBottom: 16,
  },
  categoriesScroll: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  categoryBadgeActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  categoryTextActive: {
    color: '#fff',
  },
  gridContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  mealCard: {
    width: cardWidth,
    backgroundColor: '#fff',
    borderRadius: 24,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
  },
  imageContainer: {
    width: '100%',
    height: 130,
    position: 'relative',
  },
  mealImage: {
    width: '100%',
    height: '100%',
  },
  calorieTag: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  },
  tagText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  mealInfo: {
    padding: 16,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  mealDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    color: COLORS.textLight,
    marginLeft: 4,
    fontWeight: '500',
  }
});

export default SuggestedMealsScreen;
