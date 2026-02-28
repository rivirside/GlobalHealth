import { NextResponse } from "next/server";
import { getRiskScore, getAllRiskScores } from "@/lib/data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ iso3: string }> }
) {
  const { iso3 } = await params;

  if (iso3 === "all") {
    const scores = getAllRiskScores();
    return NextResponse.json(scores);
  }

  const score = getRiskScore(iso3.toUpperCase());
  if (!score) {
    return NextResponse.json(
      { error: "Risk score not found" },
      { status: 404 }
    );
  }
  return NextResponse.json(score);
}
