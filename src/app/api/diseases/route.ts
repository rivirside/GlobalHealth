import { NextResponse } from "next/server";
import { getDiseases } from "@/lib/data";

export async function GET() {
  const diseases = getDiseases();
  return NextResponse.json(
    diseases.map((d) => ({ slug: d.slug, name: d.name, category: d.category }))
  );
}
