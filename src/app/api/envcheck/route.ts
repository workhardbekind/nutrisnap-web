import { NextResponse } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const v = process.env.DATABASE_URL || "";
  return NextResponse.json({
    startsWithPostgres: v.startsWith("postgresql://") || v.startsWith("postgres://"),
    hasLeadingQuote: v.startsWith('"') || v.startsWith("'"),
    leadingCharCode: v ? v.charCodeAt(0) : null,
    length: v.length,
  });
}
