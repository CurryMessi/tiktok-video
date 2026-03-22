import ffmpeg from "fluent-ffmpeg";
import path from "path";
import fs from "fs";
import { VideoSegment } from "@/types";
import { v4 as uuidv4 } from "uuid";

const FRAMES_DIR = path.join(process.cwd(), "public", "uploads", "frames");

// 确保帧目录存在
function ensureFramesDir(analysisId: string): string {
  const dir = path.join(FRAMES_DIR, analysisId);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

// 获取视频元信息
export function getVideoMetadata(
  filePath: string
): Promise<{ duration: number; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);
      const video = metadata.streams.find((s) => s.codec_type === "video");
      resolve({
        duration: metadata.format.duration || 0,
        width: video?.width || 0,
        height: video?.height || 0,
      });
    });
  });
}

// 截取关键帧
export function extractFrames(
  filePath: string,
  analysisId: string,
  intervalSeconds: number = 2
): Promise<string[]> {
  const framesDir = ensureFramesDir(analysisId);

  return new Promise((resolve, reject) => {
    const framePaths: string[] = [];

    ffmpeg(filePath)
      .outputOptions([`-vf fps=1/${intervalSeconds}`, "-q:v 2"])
      .output(path.join(framesDir, "frame_%04d.jpg"))
      .on("end", () => {
        // 读取生成的帧文件
        const files = fs
          .readdirSync(framesDir)
          .filter((f) => f.startsWith("frame_") && f.endsWith(".jpg"))
          .sort();
        for (const file of files) {
          framePaths.push(`/uploads/frames/${analysisId}/${file}`);
        }
        resolve(framePaths);
      })
      .on("error", reject)
      .run();
  });
}

// 按固定时间间隔切分视频为片段（逻辑切分，不实际切割文件）
export function splitIntoSegments(
  duration: number,
  analysisId: string,
  segmentDuration: number = 3,
  framePaths: string[]
): VideoSegment[] {
  const segments: VideoSegment[] = [];
  let index = 0;
  let startTime = 0;

  while (startTime < duration) {
    const endTime = Math.min(startTime + segmentDuration, duration);
    // 找到该片段时间范围内的第一帧作为缩略图
    const frameIndex = Math.floor(startTime / 2); // 每2秒一帧
    const thumbnailPath = framePaths[frameIndex] || framePaths[framePaths.length - 1] || "";

    segments.push({
      id: uuidv4(),
      index,
      startTime,
      endTime,
      duration: endTime - startTime,
      thumbnailPath,
    });

    startTime = endTime;
    index++;
  }

  return segments;
}

// 将帧图片转换为 base64（供 AI 分析用）
export function frameToBase64(framePath: string): string {
  const absolutePath = path.join(process.cwd(), "public", framePath);
  if (!fs.existsSync(absolutePath)) return "";
  const buffer = fs.readFileSync(absolutePath);
  return buffer.toString("base64");
}
