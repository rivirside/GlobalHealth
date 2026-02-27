import { NextResponse } from "next/server";
import { getOutbreaks } from "@/lib/data";

export async function GET() {
  const outbreaks = getOutbreaks();
  return NextResponse.json(outbreaks);
}
