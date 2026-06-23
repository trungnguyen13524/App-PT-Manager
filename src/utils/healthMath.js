/**
 * Tính chỉ số khối cơ thể (BMI)
 * @param {number} weight - Cân nặng (kg)
 * @param {number} height - Chiều cao (cm)
 * @returns {number} - Chỉ số BMI đã làm tròn 1 chữ số thập phân
 */
export const calculateBMI = (weight, height) => {
  if (!weight || !height) return 0;
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);
  return Math.round(bmi * 10) / 10;
};

/**
 * Đánh giá phân loại BMI
 * @param {number} bmi 
 * @returns {string} Phân loại
 */
export const getBMICategory = (bmi) => {
  if (bmi < 18.5) return 'Thiếu cân';
  if (bmi >= 18.5 && bmi < 24.9) return 'Bình thường';
  if (bmi >= 25 && bmi < 29.9) return 'Thừa cân';
  return 'Béo phì';
};

/**
 * Tính BMR (Basal Metabolic Rate) dựa trên công thức Mifflin-St Jeor
 * @param {number} weight - Cân nặng (kg)
 * @param {number} height - Chiều cao (cm)
 * @param {number} age - Tuổi
 * @param {string} gender - Giới tính ('male' | 'female')
 * @returns {number} - BMR (calo)
 */
export const calculateBMR = (weight, height, age, gender) => {
  if (!weight || !height || !age) return 0;
  
  // Công thức chung: (10 * weight) + (6.25 * height) - (5 * age)
  let bmr = (10 * weight) + (6.25 * height) - (5 * age);
  
  // Điều chỉnh theo giới tính
  if (gender === 'male') {
    bmr += 5;
  } else {
    bmr -= 161;
  }
  
  return Math.round(bmr);
};

/**
 * Tính TDEE (Total Daily Energy Expenditure)
 * @param {number} bmr - Chỉ số BMR
 * @param {number} activityLevel - Hệ số vận động (1.2 đến 1.9)
 * @returns {number} - TDEE (calo)
 */
export const calculateTDEE = (bmr, activityLevel) => {
  const multipliers = {
    sedentary: 1.2,      // Ít vận động
    light: 1.375,        // Vận động nhẹ (1-3 ngày/tuần)
    moderate: 1.55,      // Vận động vừa (3-5 ngày/tuần)
    active: 1.725,       // Vận động nhiều (6-7 ngày/tuần)
    veryActive: 1.9      // Vận động rất nhiều (2 lần/ngày)
  };
  
  const multiplier = multipliers[activityLevel] || 1.2;
  return Math.round(bmr * multiplier);
};
