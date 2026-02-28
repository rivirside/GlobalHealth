import { NextResponse } from "next/server";
import { getReadinessScore, getAllReadinessScores } from "@/lib/data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ iso3: string }> }
) {
  const { iso3 } = await params;

  if (iso3.toLowerCase() === "all") {
    const all = getAllReadinessScores();
    return NextResponse.json(all);
  }

  const readiness = getReadinessScore(iso3.toUpperCase());
  if (!readiness) {
    return NextResponse.json({ error: "No readiness data" }, { status: 404 });
  }
  return NextResponse.json(readiness);
}
