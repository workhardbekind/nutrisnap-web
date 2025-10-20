"use client";

import { useEffect, useState } from "react";

type DayTotals = { date: string; calories: number; protein: number; carbs: number; fat: number };

export default function Trends() {
  const [days, setDays] = useState<DayTotals[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [trendsRes, suggRes] = await Promise.all([fetch("/api/trends"), fetch("/api/suggestions")]);
      if (trendsRes.ok) setDays(await trendsRes.json());
      if (suggRes.ok) setSuggestions((await suggRes.json()).suggestions || []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <p className="text-sm text-gray-500">Loading trends...</p>;

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600">
              <th className="py-2 pr-4">Date</th>
              <th className="py-2 pr-4">Calories</th>
              <th className="py-2 pr-4">Protein</th>
              <th className="py-2 pr-4">Carbs</th>
              <th className="py-2 pr-4">Fat</th>
            </tr>
          </thead>
          <tbody>
            {days.map((d) => (
              <tr key={d.date} className="border-t">
                <td className="py-2 pr-4">{new Date(d.date).toLocaleDateString()}</td>
                <td className="py-2 pr-4">{d.calories}</td>
                <td className="py-2 pr-4">{d.protein}g</td>
                <td className="py-2 pr-4">{d.carbs}g</td>
                <td className="py-2 pr-4">{d.fat}g</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {suggestions.length > 0 && (
        <div className="rounded border p-3 bg-amber-50">
          <div className="font-medium mb-1">Suggestions</div>
          <ul className="list-disc ml-5 space-y-1">
            {suggestions.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}