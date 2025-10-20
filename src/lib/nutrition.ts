export type MacroTotals = { calories: number; protein: number; carbs: number; fat: number };

export function sumMacros(meals: Array<MacroTotals>): MacroTotals {
  return meals.reduce(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

export function defaultDailyTargets(): MacroTotals {
  // Sensible defaults; can be made user-configurable later
  return { calories: 2000, protein: 110, carbs: 250, fat: 70 };
}

export function macroSuggestions(avg: MacroTotals, target: MacroTotals): string[] {
  const suggestions: string[] = [];
  const diff = {
    calories: avg.calories - target.calories,
    protein: avg.protein - target.protein,
    carbs: avg.carbs - target.carbs,
    fat: avg.fat - target.fat,
  };

  if (diff.calories > 150) suggestions.push("Average calories are trending high; consider smaller portions or lower-calorie swaps at one meal.");
  if (diff.calories < -150) suggestions.push("Average calories are low; add a snack or slightly larger portions to meet energy needs.");

  if (diff.protein < -15) suggestions.push("Protein intake is low; add lean protein (eggs, yogurt, legumes, chicken, tofu) to meals.");
  if (diff.protein > 25) suggestions.push("Protein is quite high; rebalance by swapping some protein for vegetables or whole grains.");

  if (diff.carbs < -40) suggestions.push("Carbs are low; add whole grains, fruits, or starchy vegetables for sustained energy.");
  if (diff.carbs > 40) suggestions.push("Carbs are high; consider swapping refined carbs for vegetables or proteins.");

  if (diff.fat < -15) suggestions.push("Fats are low; add healthy fats like olive oil, nuts, seeds, or avocado.");
  if (diff.fat > 15) suggestions.push("Fats are high; limit added oils/sauces and choose leaner cooking methods.");

  if (suggestions.length === 0) suggestions.push("Great balance! Keep doing what you're doing.");
  return suggestions;
}