import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import { defaultDailyTargets, macroSuggestions, sumMacros } from "../../../lib/nutrition";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id as string;
  const start = new Date();
  start.setDate(start.getDate() - 6);
  start.setHours(0, 0, 0, 0);

  const meals = await prisma.meal.findMany({
    where: { userId, date: { gte: start } },
  });

  // Average per day over last 7 days
  const totals = sumMacros(meals.map(m => ({ calories: m.calories, protein: m.protein, carbs: m.carbs, fat: m.fat })));
  const avg = {
    calories: Math.round(totals.calories / 7),
    protein: Math.round(totals.protein / 7),
    carbs: Math.round(totals.carbs / 7),
    fat: Math.round(totals.fat / 7),
  };

  const target = defaultDailyTargets();
  const suggestions = macroSuggestions(avg, target);

  return NextResponse.json({ periodDays: 7, average: avg, target, suggestions });
}
