import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { getAnalysis, updateAnalysis } from "@/lib/store";
import { getVideoMetadata, extractFrames, splitIntoSegments } from "@/lib/video-processor";
import { analyzeVideo } from "@/lib/analyzer";

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "缺少分析 ID" }, { status: 400 });
    }

    const analysis = getAnalysis(id);
    if (!analysis) {
      return NextResponse.json({ error: "未找到该分析记录" }, { status: 404 });
    }

    if (analysis.status === "analyzing" || analysis.status === "completed") {
      return NextResponse.json({ error: "该视频正在分析中或已完成" }, { status: 400 });
    }

    // 更新状态为处理中
    updateAnalysis(id, { status: "processing", progress: 15 });

    // 异步处理（不阻塞响应）
    processAndAnalyze(id).catch(console.error);

    return NextResponse.json({ message: "开始分析", id });
  } catch (error) {
    console.error("Analyze error:", error);
    return NextResponse.json({ error: "启动分析失败" }, { status: 500 });
  }
}

async function processAndAnalyze(id: string) {
  const analysis = getAnalysis(id);
  if (!analysis) return;

  try {
    const absolutePath = path.join(process.cwd(), "public", analysis.filePath);

    // 1. 获取视频元信息
    const metadata = await getVideoMetadata(absolutePath);
    updateAnalysis(id, {
      duration: metadata.duration,
      resolution: `${metadata.width}x${metadata.height}`,
      progress: 20,
    });

    // 2. 截取关键帧
    const framePaths = await extractFrames(absolutePath, id, 2);
    updateAnalysis(id, { progress: 25 });

    // 3. 切分片段
    const segments = splitIntoSegments(metadata.duration, id, 3, framePaths);
    updateAnalysis(id, { segments, progress: 30 });

    // 4. AI 分析
    const updatedAnalysis = getAnalysis(id);
    if (updatedAnalysis) {
      await analyzeVideo(updatedAnalysis);
    }
  } catch (error) {
    updateAnalysis(id, {
      status: "failed",
      error: error instanceof Error ? error.message : "处理失败",
    });
  }
}
