import { NextResponse } from "next/server";
import { getCountries } from "@/lib/data";

export async function GET() {
  const countries = getCountries();
  return NextResponse.json(countries);
}
