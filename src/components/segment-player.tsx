"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VideoSegment } from "@/types";
import Image from "next/image";
import { Sparkles } from "lucide-react";

interface SegmentPlayerProps {
  segments: VideoSegment[];
  videoSrc: string;
}

export function SegmentPlayer({ segments }: SegmentPlayerProps) {
  if (segments.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">片段拆解 ({segments.length} 段)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {segments.map((segment) => (
            <Card key={segment.id} className="overflow-hidden border-zinc-800">
              {/* 缩略图 */}
              <div className="relative aspect-video bg-zinc-900">
                {segment.thumbnailPath ? (
                  <Image
                    src={segment.thumbnailPath}
                    alt={`片段 ${segment.index + 1}`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-zinc-600">
                    无缩略图
                  </div>
                )}
                <Badge className="absolute bottom-2 right-2 bg-black/70 text-xs">
                  {segment.startTime.toFixed(1)}s - {segment.endTime.toFixed(1)}s
                </Badge>
              </div>

              {/* 片段分析 */}
              <CardContent className="p-3 space-y-2">
                <div className="flex items-center gap-1 text-sm font-medium text-zinc-200">
                  <span>片段 {segment.index + 1}</span>
                  <span className="text-zinc-500">
                    ({segment.duration.toFixed(1)}s)
                  </span>
                </div>

                {segment.analysis ? (
                  <div className="space-y-2 text-sm">
                    <p className="text-zinc-400">{segment.analysis.description}</p>

                    {segment.analysis.visualElements.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {segment.analysis.visualElements.map((el, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {el}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {segment.analysis.estimatedPrompt && (
                      <div className="rounded bg-zinc-900 p-2 text-xs text-zinc-400">
                        <div className="flex items-center gap-1 mb-1 text-pink-400">
                          <Sparkles className="h-3 w-3" />
                          <span>片段提示词</span>
                        </div>
                        {segment.analysis.estimatedPrompt}
                      </div>
                    )}

                    <div className="flex gap-2 text-xs text-zinc-500">
                      {segment.analysis.transition !== "未知" && (
                        <span>转场: {segment.analysis.transition}</span>
                      )}
                      {segment.analysis.mood !== "未知" && (
                        <span>氛围: {segment.analysis.mood}</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-zinc-600">待分析</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
