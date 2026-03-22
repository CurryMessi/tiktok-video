"use client";

import { useRouter } from "next/navigation";
import { UploadZone } from "@/components/upload-zone";
import { AnalysisHistory } from "@/components/analysis-history";
import { Film, Sparkles, Scissors, Copy } from "lucide-react";

export default function Home() {
  const router = useRouter();

  const handleUploadComplete = async (id: string) => {
    // 上传完成后触发分析
    await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    // 跳转到分析结果页
    router.push(`/analysis/${id}`);
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="border-b border-zinc-800">
        <div className="mx-auto max-w-5xl px-6 py-4 flex items-center gap-3">
          <Film className="h-6 w-6 text-pink-500" />
          <h1 className="text-xl font-bold">TikTok 视频拆解器</h1>
        </div>
      </div>

      {/* Hero */}
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            AI 逆向分析
            <span className="text-pink-500"> 爆款视频</span>
          </h2>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            上传 TikTok 视频，AI 帮你逆向提示词、拆解视频片段、
            分析爆款要素，让你轻松复刻爆款
          </p>
        </div>

        {/* 上传区域 */}
        <div className="max-w-2xl mx-auto mb-16">
          <UploadZone onUploadComplete={handleUploadComplete} />
        </div>

        {/* 分析历史 */}
        <div className="max-w-2xl mx-auto mb-16">
          <AnalysisHistory />
        </div>

        {/* 功能介绍 */}
        <div className="grid gap-6 md:grid-cols-3">
          <FeatureCard
            icon={<Sparkles className="h-6 w-6 text-pink-500" />}
            title="逆向提示词"
            description="AI 分析视频内容，逆向推测出可能使用的生成提示词，直接复制即可使用"
          />
          <FeatureCard
            icon={<Scissors className="h-6 w-6 text-blue-500" />}
            title="片段拆解"
            description="自动将视频切分为多个片段，逐段分析视觉元素、转场方式和情绪节奏"
          />
          <FeatureCard
            icon={<Copy className="h-6 w-6 text-purple-500" />}
            title="复刻指南"
            description="生成详细的复刻步骤，推荐工具和注意事项，帮你快速上手制作同类爆款"
          />
        </div>
      </div>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <div className="mb-3">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-zinc-400">{description}</p>
    </div>
  );
}
