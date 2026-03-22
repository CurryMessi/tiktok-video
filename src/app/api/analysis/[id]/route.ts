import { NextRequest, NextResponse } from "next/server";
import { getAnalysis } from "@/lib/store";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const analysis = getAnalysis(id);
  if (!analysis) {
    return NextResponse.json({ error: "未找到该分析记录" }, { status: 404 });
  }

  return NextResponse.json(analysis);
}
