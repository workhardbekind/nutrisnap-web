import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { z } from "zod";

const MealSchema = z.object({
  date: z.string(), // yyyy-mm-dd
  name: z.string().optional(),
  notes: z.string().optional(),
  calories: z.number().int().min(0),
  protein: z.number().int().min(0),
  carbs: z.number().int().min(0),
  fat: z.number().int().min(0),
});

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const where: any = { userId: (session.user as any).id };
  if (from || to) {
    where.date = {};
    if (from) where.date.gte = new Date(from);
    if (to) where.date.lte = new Date(to);
  }

  const meals = await prisma.meal.findMany({
    where,
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(meals);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = MealSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { date, ...rest } = parsed.data;
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);

  const meal = await prisma.meal.create({
    data: {
      userId: (session.user as any).id,
      date: d,
      ...rest,
    },
  });

  return NextResponse.json(meal, { status: 201 });
}