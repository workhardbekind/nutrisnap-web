import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id as string;
  const now = new Date();
  const start = new Date();
  start.setDate(now.getDate() - 29);
  start.setHours(0, 0, 0, 0);

  const meals = await prisma.meal.findMany({
    where: { userId, date: { gte: start } },
    orderBy: { date: "asc" },
  });

  // Group by date (yyyy-mm-dd)
  const byDay = new Map<
    string,
    { calories: number; protein: number; carbs: number; fat: number }
  >();

  for (const m of meals) {
    const key = m.date.toISOString().slice(0, 10);
    const prev = byDay.get(key) ?? { calories: 0, protein: 0, carbs: 0, fat: 0 };
    byDay.set(key, {
      calories: prev.calories + m.calories,
      protein: prev.protein + m.protein,
      carbs: prev.carbs + m.carbs,
      fat: prev.fat + m.fat,
    });
  }

  const days: Array<{ date: string; calories: number; protein: number; carbs: number; fat: number }> = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    const totals = byDay.get(key) ?? { calories: 0, protein: 0, carbs: 0, fat: 0 };
    days.push({ date: key, ...totals });
  }

  return NextResponse.json(days);
}
