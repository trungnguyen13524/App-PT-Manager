import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
  TextInput
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeft, Plus, Search, Trash2, CheckCircle2, Calendar } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../../theme';
import ptService from '../../../api/services/pt.service';
import foodsData from '../../../assets/foods.json';
import exercisesData from '../../../assets/exercises.json';

const PTPlanBuilderScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { studentId, planType } = route.params; // 'MEAL_PLAN' or 'WORKOUT_PLAN'

  const [isSaving, setIsSaving] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [libraryData, setLibraryData] = useState([]);

  useEffect(() => {
    // Load library based on plan type
    if (planType === 'MEAL_PLAN') {
      setLibraryData(foodsData);
    } else {
      setLibraryData(exercisesData);
    }
  }, [planType]);

  const filteredLibrary = libraryData.filter(item => {
    if (!searchQuery) return true;
    const name = planType === 'MEAL_PLAN' ? item.Food_Name_VN : item.Exercise_Name_VN;
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  }).slice(0, 20); // show top 20 to avoid lag

  const addItem = (item) => {
    if (planType === 'MEAL_PLAN') {
      setSelectedItems([...selectedItems, {
        id: `meal_${Date.now()}_${Math.random()}`,
        foodId: item.ID,
        foodName: item.Description_VN || item.Food_Name_VN || 'Món ăn',
        calories: Math.round(Number(item.Calories || item.Energy_kcal) || 0),
        proteinG: Math.round(Number(item.Protein || item.Protein_g) || 0),
        carbsG: Math.round(Number(item.Carbohydrate || item.Carbohydrate_g) || 0),
        fatG: Math.round(Number(item.TotalFat || item.Fat_g) || 0),
        portion: 1
      }]);
    } else {
      const typeStr = item.Type || item.Target_Muscle_Group || '';
      const isCardio = typeStr.toLowerCase().includes('cardio') || typeStr.toLowerCase().includes('tim mạch') || typeStr.toLowerCase().includes('chạy');
      
      setSelectedItems([...selectedItems, {
        id: `ex_${Date.now()}_${Math.random()}`,
        exerciseId: `ex_${item.ID}`,
        exerciseName: item.Exercise_Name_VN,
        isCardio: isCardio,
        sets: isCardio ? 0 : 3,
        reps: isCardio ? 0 : 12,
        weightKg: 0,
        restSec: 60,
        durationMin: isCardio ? 15 : 0,
        notes: ''
      }]);
    }
  };

  const removeItem = (id) => {
    setSelectedItems(selectedItems.filter(i => i.id !== id));
  };

  const updateItem = (id, field, value) => {
    setSelectedItems(selectedItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleSave = async () => {
    if (selectedItems.length === 0) {
      Alert.alert('Chưa có dữ liệu', `Vui lòng chọn ít nhất 1 ${planType === 'MEAL_PLAN' ? 'món ăn' : 'bài tập'}`);
      return;
    }

    setIsSaving(true);
    try {
      if (planType === 'MEAL_PLAN') {
        const payload = {
          days: [
            {
              dayIndex: new Date().getDay(), // Assume 0-6 for current week
              meals: selectedItems.map(i => ({
                mealType: "LUNCH", // Defaulting to LUNCH, can be enhanced with a UI selector later
                name: i.foodName,
                calories: i.calories * (Number(i.portion) || 1),
                macros: {
                  proteinG: i.proteinG * (Number(i.portion) || 1),
                  carbsG: i.carbsG * (Number(i.portion) || 1),
                  fatG: i.fatG * (Number(i.portion) || 1)
                },
                notes: `Phần ăn: ${i.portion}`
              }))
            }
          ],
          note: "Assigned via mobile app"
        };
        await ptService.assignMealPlan(studentId, payload);
      } else {
        // Exercise endpoint assigns ONE exercise at a time
        const promises = selectedItems.map(i => {
          const payload = {
            exerciseId: i.exerciseId,
            scheduledDate: new Date().toISOString(),
            sets: i.isCardio ? null : Number(i.sets),
            reps: i.isCardio ? null : Number(i.reps),
            weightKg: i.isCardio ? null : Number(i.weightKg),
            durationSec: i.isCardio ? Number(i.durationMin) * 60 : null,
            restSec: Number(i.restSec) || 60,
            note: i.notes
          };
          return ptService.assignExercises(studentId, payload);
        });
        await Promise.all(promises);
      }
      
      Alert.alert('Thành công', 'Đã gán giáo án cho học viên!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể gán giáo án: ' + (error.response?.data?.error?.message || error.message));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={COLORS.text} size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Giao {planType === 'MEAL_PLAN' ? 'Thực Đơn' : 'Bài Tập'}
        </Text>
        <TouchableOpacity onPress={handleSave} disabled={isSaving}>
          {isSaving ? <ActivityIndicator size="small" color={COLORS.primary} /> : <CheckCircle2 color={COLORS.primary} size={28} />}
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Search color={COLORS.textLight} size={20} />
        <TextInput
          style={styles.searchInput}
          placeholder={`Tìm kiếm ${planType === 'MEAL_PLAN' ? 'món ăn' : 'bài tập'}...`}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={{ flex: 1, flexDirection: 'row' }}>
        {/* Library List */}
        <View style={styles.librarySection}>
          <Text style={styles.sectionTitle}>Thư viện</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {filteredLibrary.map((item, idx) => (
              <TouchableOpacity key={idx} style={styles.libraryItem} onPress={() => addItem(item)}>
                <View style={styles.libIconBox}>
                  <Plus size={16} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.libItemTitle} numberOfLines={2}>
                    {planType === 'MEAL_PLAN' ? (item.Description_VN || item.Food_Name_VN) : item.Exercise_Name_VN}
                  </Text>
                  <Text style={styles.libItemSub}>
                    {planType === 'MEAL_PLAN' ? `${Math.round(item.Calories || item.Energy_kcal || 0)} kcal` : item.Target_Muscle_Group}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Selected List */}
        <View style={styles.selectedSection}>
          <Text style={styles.sectionTitle}>Giáo án hôm nay</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {selectedItems.length === 0 ? (
              <Text style={styles.emptyText}>Chưa có mục nào được chọn.</Text>
            ) : (
              selectedItems.map((item) => (
                <View key={item.id} style={styles.selectedItemCard}>
                  <View style={styles.selectedItemHeader}>
                    <Text style={styles.selectedItemTitle} numberOfLines={2}>
                      {planType === 'MEAL_PLAN' ? item.foodName : item.exerciseName}
                    </Text>
                    <TouchableOpacity onPress={() => removeItem(item.id)}>
                      <Trash2 size={16} color={COLORS.error} />
                    </TouchableOpacity>
                  </View>
                  
                  {planType === 'MEAL_PLAN' ? (
                    <View>
                      <View style={styles.configRow}>
                        <Text style={styles.configLabel}>Số phần (portion):</Text>
                        <TextInput 
                          style={styles.configInput} 
                          value={String(item.portion)}
                          onChangeText={(val) => updateItem(item.id, 'portion', val)}
                          keyboardType="numeric"
                        />
                      </View>
                      <Text style={{ fontSize: 11, color: COLORS.textSecondary, marginTop: 4 }}>
                        Macro: {item.calories * (Number(item.portion)||1)} kcal • {item.proteinG * (Number(item.portion)||1)}g P • {item.carbsG * (Number(item.portion)||1)}g C • {item.fatG * (Number(item.portion)||1)}g F
                      </Text>
                    </View>
                  ) : (
                    <View>
                      {item.isCardio ? (
                        <View style={styles.configRow}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.configLabel}>Thời gian (Phút)</Text>
                            <TextInput 
                              style={styles.configInput} 
                              value={String(item.durationMin)}
                              onChangeText={(val) => updateItem(item.id, 'durationMin', val)}
                              keyboardType="numeric"
                            />
                          </View>
                        </View>
                      ) : (
                        <View style={styles.configRow}>
                          <View style={{ flex: 1, marginRight: 5 }}>
                            <Text style={styles.configLabel}>Số Sets</Text>
                            <TextInput 
                              style={styles.configInput} 
                              value={String(item.sets)}
                              onChangeText={(val) => updateItem(item.id, 'sets', val)}
                              keyboardType="numeric"
                            />
                          </View>
                          <View style={{ flex: 1, marginHorizontal: 5 }}>
                            <Text style={styles.configLabel}>Số Reps</Text>
                            <TextInput 
                              style={styles.configInput} 
                              value={String(item.reps)}
                              onChangeText={(val) => updateItem(item.id, 'reps', val)}
                              keyboardType="numeric"
                            />
                          </View>
                          <View style={{ flex: 1, marginLeft: 5 }}>
                            <Text style={styles.configLabel}>Mức tạ (Kg)</Text>
                            <TextInput 
                              style={styles.configInput} 
                              value={String(item.weightKg)}
                              onChangeText={(val) => updateItem(item.id, 'weightKg', val)}
                              keyboardType="numeric"
                            />
                          </View>
                        </View>
                      )}
                      
                      <View style={{ marginTop: 8 }}>
                        <Text style={styles.configLabel}>Ghi chú thêm</Text>
                        <TextInput 
                          style={styles.notesInput} 
                          value={item.notes}
                          onChangeText={(val) => updateItem(item.id, 'notes', val)}
                          placeholder="VD: Tập chậm lại..."
                        />
                      </View>
                    </View>
                  )}
                </View>
              ))
            )}
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider
  },
  backBtn: { padding: 4 },
  headerTitle: { ...TYPOGRAPHY.h3, color: COLORS.text },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    margin: 16,
    paddingHorizontal: 15,
    borderRadius: 12,
    height: 44,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: COLORS.text },
  sectionTitle: { ...TYPOGRAPHY.h4, color: COLORS.text, marginBottom: 10 },
  librarySection: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: COLORS.divider,
    padding: 10,
  },
  selectedSection: {
    flex: 1.2,
    padding: 10,
    backgroundColor: COLORS.background,
    borderLeftWidth: 1,
    borderLeftColor: COLORS.divider,
  },
  libraryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider
  },
  libIconBox: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center'
  },
  libItemTitle: { fontSize: 13, fontWeight: '600', color: COLORS.text },
  libItemSub: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  emptyText: { color: COLORS.textLight, fontSize: 13, textAlign: 'center', marginTop: 20 },
  selectedItemCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  selectedItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  selectedItemTitle: {
    fontSize: 14, fontWeight: '700', color: COLORS.text, flex: 1, paddingRight: 10
  },
  configRow: {
    flexDirection: 'row', alignItems: 'center'
  },
  configLabel: {
    fontSize: 11, color: COLORS.textSecondary, marginBottom: 4
  },
  configInput: {
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: 6,
    height: 32,
    paddingHorizontal: 8,
    fontSize: 13,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.divider
  },
  notesInput: {
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: 6,
    height: 32,
    paddingHorizontal: 8,
    fontSize: 12,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.divider
  }
});

export default PTPlanBuilderScreen;
