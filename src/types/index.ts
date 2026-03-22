// 分析状态
export type AnalysisStatus = "uploading" | "processing" | "analyzing" | "completed" | "failed";

// 视频片段
export interface VideoSegment {
  id: string;
  index: number;
  startTime: number; // 秒
  endTime: number;
  duration: number;
  thumbnailPath: string; // 截帧图片路径
  analysis?: SegmentAnalysis;
}

// 单个片段的分析结果
export interface SegmentAnalysis {
  description: string; // 片段内容描述
  visualElements: string[]; // 视觉元素
  transition: string; // 转场方式
  textOverlay: string; // 文字覆盖内容
  mood: string; // 情绪/氛围
  estimatedPrompt: string; // 推测的生成提示词
}

// 整体分析结果
export interface AnalysisResult {
  // 逆向提示词
  reversePrompt: string;
  promptBreakdown: {
    style: string; // 视觉风格
    subject: string; // 主题
    motion: string; // 运动/动作描述
    camera: string; // 镜头语言
    lighting: string; // 光线
    mood: string; // 氛围
    music: string; // 音乐/声效描述
  };

  // 爆款要素分析
  viralFactors: {
    hookScore: number; // 开头吸引力评分 1-10
    hookAnalysis: string;
    emotionCurve: string; // 情绪曲线描述
    pacing: string; // 节奏分析
    ctaAnalysis: string; // CTA 分析
    viralScore: number; // 爆款综合评分 1-10
  };

  // 结构分析
  structure: {
    totalSegments: number;
    avgSegmentDuration: number;
    transitionStyle: string;
    narrativeArc: string; // 叙事弧线
  };

  // 可操作建议
  actionableInsights: string[];

  // 复刻指南
  replicationGuide: {
    tools: string[]; // 推荐工具
    steps: string[]; // 复刻步骤
    tips: string[]; // 注意事项
  };
}

// 视频分析任务
export interface VideoAnalysis {
  id: string;
  status: AnalysisStatus;
  fileName: string;
  filePath: string;
  fileSize: number;
  duration?: number;
  resolution?: string;
  createdAt: string;
  updatedAt: string;
  segments: VideoSegment[];
  result?: AnalysisResult;
  error?: string;
  progress: number; // 0-100
}
