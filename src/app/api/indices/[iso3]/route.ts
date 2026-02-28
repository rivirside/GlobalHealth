import { NextResponse } from "next/server";
import { getIndices } from "@/lib/data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ iso3: string }> }
) {
  const { iso3 } = await params;
  const all = getIndices();
  const indices = all[iso3.toUpperCase()] || [];
  return NextResponse.json(indices);
}
