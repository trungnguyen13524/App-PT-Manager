/**
 * Công cụ tính toán các chỉ số sức khỏe dựa trên chuẩn y khoa
 */

export const calculateMetrics = (data) => {
  const age = data.dateOfBirth ? (new Date().getFullYear() - new Date(data.dateOfBirth).getFullYear()) : 25;
  const w = data.weightKg || 65;
  const h = data.heightCm || 170;
  
  // BMR (Mifflin-St Jeor)
  let bmr = (10 * w) + (6.25 * h) - (5 * age);
  bmr += (data.gender === 'FEMALE') ? -161 : 5;
  
  // TDEE
  const activityMultipliers = {
    'SEDENTARY': 1.2,
    'LIGHTLY_ACTIVE': 1.375,
    'MODERATE': 1.55,
    'VERY_ACTIVE': 1.725,
    'EXTRA_ACTIVE': 1.9
  };
  const multiplier = activityMultipliers[data.activityLevel] || 1.2;
  let tdee = Math.round(bmr * multiplier);
  
  // Goal
  let dailyCalorieTarget = tdee;
  if (data.goal === 'LOSE_WEIGHT') dailyCalorieTarget -= 500;
  if (data.goal === 'GAIN_WEIGHT') dailyCalorieTarget += 500;
  
  // Macros
  const proteinG = Math.round(w * 2.2); // ~2.2g per kg
  const fatG = Math.round((dailyCalorieTarget * 0.25) / 9);
  const carbsG = Math.round((dailyCalorieTarget - (proteinG * 4) - (fatG * 9)) / 4);

  return {
    bmr: Math.round(bmr),
    tdee,
    dailyCalorieTarget,
    macros: { proteinG, carbsG, fatG }
  };
};
