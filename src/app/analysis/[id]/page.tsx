"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { VideoAnalysis } from "@/types";
import { PromptDisplay } from "@/components/prompt-display";
import { AnalysisCard } from "@/components/analysis-card";
import { SegmentPlayer } from "@/components/segment-player";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Film, ArrowLeft, Loader2, AlertCircle } from "lucide-react";

export default function AnalysisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [analysis, setAnalysis] = useState<VideoAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const fetchAnalysis = async () => {
      try {
        const res = await fetch(`/api/analysis/${id}`);
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "获取分析结果失败");
        }
        const data: VideoAnalysis = await res.json();
        setAnalysis(data);

        // 如果分析完成或失败，停止轮询
        if (data.status === "completed" || data.status === "failed") {
          clearInterval(intervalId);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "未知错误");
        clearInterval(intervalId);
      }
    };

    fetchAnalysis();
    intervalId = setInterval(fetchAnalysis, 2000);

    return () => clearInterval(intervalId);
  }, [id]);

  const statusLabels: Record<string, string> = {
    uploading: "上传中",
    processing: "视频处理中",
    analyzing: "AI 分析中",
    completed: "分析完成",
    failed: "分析失败",
  };

  const statusColors: Record<string, string> = {
    uploading: "bg-blue-500/20 text-blue-400",
    processing: "bg-yellow-500/20 text-yellow-400",
    analyzing: "bg-purple-500/20 text-purple-400",
    completed: "bg-green-500/20 text-green-400",
    failed: "bg-red-500/20 text-red-400",
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="border-b border-zinc-800">
        <div className="mx-auto max-w-5xl px-6 py-4 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80">
            <Film className="h-6 w-6 text-pink-500" />
            <h1 className="text-xl font-bold">TikTok 视频拆解器</h1>
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-8">
        {/* 返回按钮 */}
        <Link href="/">
          <Button variant="ghost" className="mb-6 text-zinc-400 hover:text-white">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回首页
          </Button>
        </Link>

        {/* 错误状态 */}
        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-6 text-center">
            <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-3" />
            <p className="text-red-400">{error}</p>
            <Link href="/">
              <Button variant="outline" className="mt-4">
                重新上传
              </Button>
            </Link>
          </div>
        )}

        {/* 加载 / 分析中状态 */}
        {!error && analysis && analysis.status !== "completed" && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold">{analysis.fileName}</h2>
              <Badge className={statusColors[analysis.status]}>
                {statusLabels[analysis.status]}
              </Badge>
            </div>

            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-8 text-center">
              <Loader2 className="h-12 w-12 text-pink-500 animate-spin mx-auto mb-4" />
              <p className="text-lg text-zinc-300 mb-4">
                {statusLabels[analysis.status]}...
              </p>
              <Progress value={analysis.progress} className="max-w-md mx-auto" />
              <p className="text-sm text-zinc-500 mt-2">{analysis.progress}%</p>
            </div>

            {/* 视频信息 */}
            {analysis.duration && (
              <div className="flex gap-4 text-sm text-zinc-500">
                <span>时长: {analysis.duration.toFixed(1)}s</span>
                {analysis.resolution && <span>分辨率: {analysis.resolution}</span>}
                <span>
                  大小: {(analysis.fileSize / 1024 / 1024).toFixed(1)}MB
                </span>
              </div>
            )}
          </div>
        )}

        {/* 失败状态 */}
        {!error && analysis?.status === "failed" && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-6 text-center">
            <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-3" />
            <p className="text-red-400 mb-2">分析失败</p>
            <p className="text-sm text-zinc-500">{analysis.error}</p>
            <Link href="/">
              <Button variant="outline" className="mt-4">
                重新上传
              </Button>
            </Link>
          </div>
        )}

        {/* 分析完成 - 展示结果 */}
        {analysis?.status === "completed" && analysis.result && (
          <div className="space-y-6">
            {/* 标题 */}
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold">{analysis.fileName}</h2>
              <Badge className={statusColors.completed}>
                {statusLabels.completed}
              </Badge>
            </div>

            {/* 视频信息 */}
            <div className="flex gap-4 text-sm text-zinc-500">
              {analysis.duration && (
                <span>时长: {analysis.duration.toFixed(1)}s</span>
              )}
              {analysis.resolution && (
                <span>分辨率: {analysis.resolution}</span>
              )}
              <span>
                大小: {(analysis.fileSize / 1024 / 1024).toFixed(1)}MB
              </span>
              <span>片段: {analysis.segments.length} 段</span>
            </div>

            {/* 逆向提示词 */}
            <PromptDisplay
              prompt={analysis.result.reversePrompt}
              breakdown={analysis.result.promptBreakdown}
            />

            {/* 片段拆解 */}
            <SegmentPlayer
              segments={analysis.segments}
              videoSrc={analysis.filePath}
            />

            {/* 详细分析 */}
            <AnalysisCard result={analysis.result} />
          </div>
        )}
      </div>
    </main>
  );
}
