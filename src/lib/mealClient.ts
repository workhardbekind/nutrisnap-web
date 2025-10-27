export type MacroResult = {
  calories: number;
  protein: number; // grams
  carbs: number;   // grams
  fat: number;     // grams
  name?: string;
  notes?: string;
  date?: string;   // yyyy-mm-dd (optional; defaults to today)
};

export async function createMealFromAnalysis(input: MacroResult) {
  // Normalize date to yyyy-mm-dd
  const dateIso = input.date ?? new Date().toISOString().slice(0, 10);

  const res = await fetch("/api/meals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      date: dateIso,
      name: input.name || "AI Meal",
      notes: input.notes,
      calories: Math.round(input.calories),
      protein: Math.round(input.protein),
      carbs: Math.round(input.carbs),
      fat: Math.round(input.fat),
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(
      data?.error ? JSON.stringify(data.error) : "Failed to create meal"
    );
  }

  const meal = await res.json();
  // Let any listeners (e.g., dashboard list) know it changed
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("meals:updated"));
  }
  return meal;
}
