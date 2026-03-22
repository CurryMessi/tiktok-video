"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AnalysisResult } from "@/types";
import {
  Zap,
  TrendingUp,
  Lightbulb,
  Wrench,
  ListChecks,
} from "lucide-react";

interface AnalysisCardProps {
  result: AnalysisResult;
}

function ScoreBadge({ score, label }: { score: number; label: string }) {
  const color =
    score >= 8
      ? "bg-green-500/20 text-green-400"
      : score >= 6
        ? "bg-yellow-500/20 text-yellow-400"
        : "bg-red-500/20 text-red-400";

  return (
    <div className={`flex items-center gap-2 rounded-lg px-3 py-2 ${color}`}>
      <span className="text-2xl font-bold">{score}</span>
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function AnalysisCard({ result }: AnalysisCardProps) {
  return (
    <div className="space-y-4">
      {/* 爆款评分 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Zap className="h-5 w-5 text-yellow-500" />
            爆款评分
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-4">
            <ScoreBadge score={result.viralFactors.viralScore} label="综合评分" />
            <ScoreBadge score={result.viralFactors.hookScore} label="开头吸引力" />
          </div>
          <div className="space-y-3 text-sm text-zinc-400">
            <div>
              <span className="text-zinc-300 font-medium">Hook 分析：</span>
              {result.viralFactors.hookAnalysis}
            </div>
            <div>
              <span className="text-zinc-300 font-medium">情绪曲线：</span>
              {result.viralFactors.emotionCurve}
            </div>
            <div>
              <span className="text-zinc-300 font-medium">节奏分析：</span>
              {result.viralFactors.pacing}
            </div>
            <div>
              <span className="text-zinc-300 font-medium">CTA 分析：</span>
              {result.viralFactors.ctaAnalysis}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 结构分析 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            视频结构
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="rounded-lg bg-zinc-900 p-3">
              <div className="text-xs text-zinc-500">总片段数</div>
              <div className="text-lg font-bold text-zinc-200">
                {result.structure.totalSegments}
              </div>
            </div>
            <div className="rounded-lg bg-zinc-900 p-3">
              <div className="text-xs text-zinc-500">平均片段时长</div>
              <div className="text-lg font-bold text-zinc-200">
                {result.structure.avgSegmentDuration}s
              </div>
            </div>
          </div>
          <div className="space-y-2 text-sm text-zinc-400">
            <div>
              <span className="text-zinc-300 font-medium">转场风格：</span>
              {result.structure.transitionStyle}
            </div>
            <div>
              <span className="text-zinc-300 font-medium">叙事弧线：</span>
              {result.structure.narrativeArc}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 可操作建议 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            改进建议
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {result.actionableInsights.map((insight, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-zinc-400">
                <Badge variant="outline" className="mt-0.5 shrink-0 text-xs">
                  {i + 1}
                </Badge>
                {insight}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* 复刻指南 */}
      <Card className="border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Wrench className="h-5 w-5 text-purple-500" />
            复刻指南
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {result.replicationGuide.tools.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-zinc-300 mb-2">推荐工具</h4>
              <div className="flex flex-wrap gap-2">
                {result.replicationGuide.tools.map((tool, i) => (
                  <Badge key={i} className="bg-purple-500/20 text-purple-300">
                    {tool}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {result.replicationGuide.steps.length > 0 && (
            <div>
              <h4 className="flex items-center gap-1 text-sm font-medium text-zinc-300 mb-2">
                <ListChecks className="h-4 w-4" />
                复刻步骤
              </h4>
              <ol className="space-y-1.5">
                {result.replicationGuide.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-zinc-400">
                    <span className="shrink-0 text-purple-400 font-mono text-xs mt-0.5">
                      {i + 1}.
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {result.replicationGuide.tips.length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-medium text-zinc-300 mb-2">注意事项</h4>
                <ul className="space-y-1">
                  {result.replicationGuide.tips.map((tip, i) => (
                    <li key={i} className="text-sm text-zinc-500">
                      • {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
