import { NextResponse } from "next/server";
import { getCountryCapacity } from "@/lib/data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ iso3: string }> }
) {
  const { iso3 } = await params;
  const capacity = getCountryCapacity(iso3.toUpperCase());

  if (!capacity) {
    return NextResponse.json(
      { error: "Country not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(capacity);
}
