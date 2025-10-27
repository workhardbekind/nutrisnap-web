"use client";

import { useEffect, useState } from "react";

type Meal = {
  id: string;
  date: string;
  name?: string | null;
  notes?: string | null;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export default function MealList() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchMeals() {
    setLoading(true);
    const res = await fetch("/api/meals");
    if (res.ok) setMeals(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    fetchMeals();
    const onUpdate = () => fetchMeals();
    window.addEventListener("meals:updated", onUpdate);
    return () => window.removeEventListener("meals:updated", onUpdate);
  }, []);

  async function deleteMeal(id: string) {
    const res = await fetch(`/api/meals/${id}`, { method: "DELETE" });
    if (res.ok) fetchMeals();
  }

  if (loading) return <p className="text-sm text-gray-500">Loading...</p>;
  if (!meals.length) return <p className="text-sm text-gray-500">No meals yet. Add your first above.</p>;

  return (
    <div className="border rounded divide-y">
      {meals.map((m) => (
        <div key={m.id} className="p-3 flex items-center justify-between">
          <div>
            <div className="font-medium">{m.name || "Meal"} • {new Date(m.date).toLocaleDateString()}</div>
            <div className="text-sm text-gray-600">{m.calories} kcal • P {m.protein}g • C {m.carbs}g • F {m.fat}g</div>
            {m.notes && <div className="text-sm text-gray-500 mt-1">{m.notes}</div>}
          </div>
          <button onClick={() => deleteMeal(m.id)} className="text-sm text-red-600 hover:underline">Delete</button>
        </div>
      ))}
    </div>
  );
}
