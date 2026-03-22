import { NextResponse } from "next/server";
import { getAllAnalyses } from "@/lib/store";

export async function GET() {
  const analyses = getAllAnalyses();
  return NextResponse.json(analyses);
}
