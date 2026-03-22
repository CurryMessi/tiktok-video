import { VideoAnalysis, AnalysisResult, SegmentAnalysis, VideoSegment } from "@/types";
import { callAI, buildImageAnalysisMessages } from "./ai-provider";
import { frameToBase64 } from "./video-processor";
import { updateAnalysis } from "./store";

const SYSTEM_PROMPT = `你是一个专业的短视频分析师，擅长分析 TikTok 爆款视频。
你需要从视频截帧中逆向分析出视频的制作方式、可能使用的 AI 提示词、爆款要素等。
请用中文回答，并以 JSON 格式返回结果。`;

// 主分析流程
export async function analyzeVideo(analysis: VideoAnalysis): Promise<void> {
  try {
    updateAnalysis(analysis.id, { status: "analyzing", progress: 30 });

    // 收集所有帧的 base64
    const allFramePaths = analysis.segments
      .map((s) => s.thumbnailPath)
      .filter(Boolean);
    // 限制发送帧数，避免超出 token 限制（最多取 12 帧）
    const selectedPaths = selectFrames(allFramePaths, 12);
    const base64Frames = selectedPaths
      .map((p) => frameToBase64(p))
      .filter(Boolean);

    if (base64Frames.length === 0) {
      throw new Error("无法提取视频帧");
    }

    updateAnalysis(analysis.id, { progress: 40 });

    // 整体分析
    const overallResult = await analyzeOverall(base64Frames);
    updateAnalysis(analysis.id, { progress: 70 });

    // 片段分析（对每个片段的缩略帧进行分析）
    const segmentsWithAnalysis = await analyzeSegments(
      analysis.segments,
      base64Frames
    );
    updateAnalysis(analysis.id, { progress: 90 });

    updateAnalysis(analysis.id, {
      status: "completed",
      progress: 100,
      result: overallResult,
      segments: segmentsWithAnalysis,
    });
  } catch (error) {
    updateAnalysis(analysis.id, {
      status: "failed",
      error: error instanceof Error ? error.message : "分析失败",
    });
  }
}

// 均匀选取帧
function selectFrames(paths: string[], maxCount: number): string[] {
  if (paths.length <= maxCount) return paths;
  const step = paths.length / maxCount;
  const selected: string[] = [];
  for (let i = 0; i < maxCount; i++) {
    selected.push(paths[Math.floor(i * step)]);
  }
  return selected;
}

// 整体分析
async function analyzeOverall(base64Frames: string[]): Promise<AnalysisResult> {
  const userPrompt = `请分析这些视频截帧，以JSON格式返回以下分析结果（不要包含markdown代码块标记）：
{
  "reversePrompt": "逆向推测的完整提示词",
  "promptBreakdown": {
    "style": "视觉风格",
    "subject": "主题",
    "motion": "运动/动作描述",
    "camera": "镜头语言",
    "lighting": "光线",
    "mood": "氛围",
    "music": "推测的音乐/声效风格"
  },
  "viralFactors": {
    "hookScore": 8,
    "hookAnalysis": "开头吸引力分析",
    "emotionCurve": "情绪曲线描述",
    "pacing": "节奏分析",
    "ctaAnalysis": "CTA分析",
    "viralScore": 7
  },
  "structure": {
    "totalSegments": 5,
    "avgSegmentDuration": 3,
    "transitionStyle": "转场风格",
    "narrativeArc": "叙事弧线"
  },
  "actionableInsights": ["建议1", "建议2"],
  "replicationGuide": {
    "tools": ["推荐工具1"],
    "steps": ["步骤1", "步骤2"],
    "tips": ["注意事项1"]
  }
}`;

  const messages = buildImageAnalysisMessages(SYSTEM_PROMPT, userPrompt, base64Frames);
  const response = await callAI(messages);

  try {
    // 清理可能的 markdown 代码块标记
    const cleaned = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    // 如果 JSON 解析失败，返回一个带有原始文本的默认结构
    return createDefaultResult(response);
  }
}

// 片段分析
async function analyzeSegments(
  segments: VideoSegment[],
  allBase64Frames: string[]
): Promise<VideoSegment[]> {
  // 为每个片段分配对应的帧进行分析
  const framesPerSegment = Math.max(1, Math.floor(allBase64Frames.length / segments.length));

  const analyzed = await Promise.all(
    segments.map(async (segment, idx) => {
      const startFrame = idx * framesPerSegment;
      const segmentFrames = allBase64Frames.slice(startFrame, startFrame + framesPerSegment);

      if (segmentFrames.length === 0) {
        return segment;
      }

      try {
        const analysis = await analyzeOneSegment(segment, segmentFrames);
        return { ...segment, analysis };
      } catch {
        return segment;
      }
    })
  );

  return analyzed;
}

async function analyzeOneSegment(
  segment: VideoSegment,
  base64Frames: string[]
): Promise<SegmentAnalysis> {
  const userPrompt = `分析这个视频片段（第${segment.index + 1}段，${segment.startTime.toFixed(1)}s - ${segment.endTime.toFixed(1)}s），以JSON格式返回（不要包含markdown代码块标记）：
{
  "description": "片段内容描述",
  "visualElements": ["视觉元素1", "视觉元素2"],
  "transition": "转场方式",
  "textOverlay": "画面上的文字内容",
  "mood": "情绪/氛围",
  "estimatedPrompt": "推测该片段的生成提示词"
}`;

  const messages = buildImageAnalysisMessages(SYSTEM_PROMPT, userPrompt, base64Frames);
  const response = await callAI(messages);

  try {
    const cleaned = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return {
      description: response,
      visualElements: [],
      transition: "未知",
      textOverlay: "",
      mood: "未知",
      estimatedPrompt: "",
    };
  }
}

function createDefaultResult(rawText: string): AnalysisResult {
  return {
    reversePrompt: rawText,
    promptBreakdown: {
      style: "待分析",
      subject: "待分析",
      motion: "待分析",
      camera: "待分析",
      lighting: "待分析",
      mood: "待分析",
      music: "待分析",
    },
    viralFactors: {
      hookScore: 5,
      hookAnalysis: "待分析",
      emotionCurve: "待分析",
      pacing: "待分析",
      ctaAnalysis: "待分析",
      viralScore: 5,
    },
    structure: {
      totalSegments: 0,
      avgSegmentDuration: 0,
      transitionStyle: "待分析",
      narrativeArc: "待分析",
    },
    actionableInsights: ["AI 返回格式异常，以上为原始分析文本"],
    replicationGuide: {
      tools: [],
      steps: [],
      tips: [],
    },
  };
}
