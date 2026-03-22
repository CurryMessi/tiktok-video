"use client";

import { useState } from "react";
import { Copy, Check, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PromptDisplayProps {
  prompt: string;
  breakdown?: {
    style: string;
    subject: string;
    motion: string;
    camera: string;
    lighting: string;
    mood: string;
    music: string;
  };
}

export function PromptDisplay({ prompt, breakdown }: PromptDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const breakdownLabels: Record<string, string> = {
    style: "视觉风格",
    subject: "主题",
    motion: "运动/动作",
    camera: "镜头语言",
    lighting: "光线",
    mood: "氛围",
    music: "音乐/声效",
  };

  return (
    <Card className="border-pink-500/30 bg-gradient-to-br from-pink-500/5 to-purple-500/5">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-pink-500" />
          逆向提示词
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="text-zinc-400 hover:text-zinc-200"
        >
          {copied ? (
            <Check className="h-4 w-4 mr-1 text-green-500" />
          ) : (
            <Copy className="h-4 w-4 mr-1" />
          )}
          {copied ? "已复制" : "复制"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-zinc-900 p-4 font-mono text-sm text-zinc-300 leading-relaxed">
          {prompt}
        </div>

        {breakdown && (
          <div className="flex flex-wrap gap-2">
            {Object.entries(breakdown).map(([key, value]) => (
              <Badge
                key={key}
                variant="secondary"
                className="bg-zinc-800 text-zinc-300"
              >
                <span className="text-zinc-500 mr-1">{breakdownLabels[key] || key}:</span>
                {value}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
