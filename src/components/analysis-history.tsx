"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { VideoAnalysis } from "@/types";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  FileVideo,
  CheckCircle2,
  Loader2,
  AlertCircle,
  History,
  ChevronRight,
  Flame,
} from "lucide-react";

const statusConfig: Record<
  string,
  { label: string; color: string; icon: React.ReactNode }
> = {
  uploading: {
    label: "上传中",
    color: "bg-blue-500/20 text-blue-400",
    icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
  },
  processing: {
    label: "处理中",
    color: "bg-yellow-500/20 text-yellow-400",
    icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
  },
  analyzing: {
    label: "分析中",
    color: "bg-purple-500/20 text-purple-400",
    icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
  },
  completed: {
    label: "已完成",
    color: "bg-green-500/20 text-green-400",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  failed: {
    label: "失败",
    color: "bg-red-500/20 text-red-400",
    icon: <AlertCircle className="h-3.5 w-3.5" />,
  },
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return "刚刚";
  if (diffMin < 60) return `${diffMin} 分钟前`;
  if (diffHour < 24) return `${diffHour} 小时前`;
  if (diffDay < 7) return `${diffDay} 天前`;
  return date.toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
}

export function AnalysisHistory() {
  const [analyses, setAnalyses] = useState<VideoAnalysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch("/api/analyses");
        if (res.ok) {
          const data: VideoAnalysis[] = await res.json();
          setAnalyses(data);
        }
      } catch {
        // 静默处理
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-zinc-500">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        加载历史记录...
      </div>
    );
  }

  if (analyses.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <History className="h-5 w-5 text-zinc-400" />
        <h3 className="text-lg font-semibold text-zinc-200">分析历史</h3>
        <span className="text-sm text-zinc-500">({analyses.length})</span>
      </div>

      <div className="space-y-3">
        {analyses.map((item) => {
          const status = statusConfig[item.status] ?? statusConfig.failed;
          const viralScore = item.result?.viralFactors?.viralScore;

          return (
            <Link key={item.id} href={`/analysis/${item.id}`}>
              <div className="group rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 hover:border-zinc-600 hover:bg-zinc-900 transition-all cursor-pointer">
                <div className="flex items-center justify-between">
                  {/* 左侧：文件信息 */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex-shrink-0 rounded-lg bg-zinc-800 p-2">
                      <FileVideo className="h-5 w-5 text-pink-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-zinc-200 truncate">
                        {item.fileName}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
                        <span>{formatFileSize(item.fileSize)}</span>
                        {item.duration && (
                          <span>{item.duration.toFixed(1)}s</span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(item.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 右侧：状态和评分 */}
                  <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                    {viralScore != null && (
                      <div className="flex items-center gap-1 text-sm">
                        <Flame className="h-4 w-4 text-orange-500" />
                        <span className="font-semibold text-orange-400">
                          {viralScore}
                        </span>
                      </div>
                    )}
                    <Badge className={`${status.color} flex items-center gap-1`}>
                      {status.icon}
                      {status.label}
                    </Badge>
                    <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
