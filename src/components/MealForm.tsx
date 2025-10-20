"use client";

import { useState } from "react";

export default function MealForm() {
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [calories, setCalories] = useState<number>(0);
  const [protein, setProtein] = useState<number>(0);
  const [carbs, setCarbs] = useState<number>(0);
  const [fat, setFat] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          name: name || undefined,
          notes: notes || undefined,
          calories,
          protein,
          carbs,
          fat,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ? JSON.stringify(data.error) : "Failed to save");
      }
      setName(""); setNotes(""); setCalories(0); setProtein(0); setCarbs(0); setFat(0);
      window.dispatchEvent(new Event("meals:updated"));
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-2">
      {/* inputs ... */}
      <div className="md:col-span-2">
        <button type="submit" disabled={saving} className="rounded bg-blue-600 text-white px-4 py-2 disabled:opacity-60">
          {saving ? "Saving..." : "Add meal"}
        </button>
      </div>
    </form>
  );
}