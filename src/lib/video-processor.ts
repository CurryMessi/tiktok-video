import ffmpeg from "fluent-ffmpeg";
import path from "path";
import fs from "fs";
import { VideoSegment } from "@/types";
import { v4 as uuidv4 } from "uuid";

const FRAMES_DIR = path.join(process.cwd(), "public", "uploads", "frames");

// 超时时间（毫秒）
const FFPROBE_TIMEOUT = 30_000; // 30 秒
const FFMPEG_TIMEOUT = 5 * 60_000; // 5 分钟

// 确保帧目录存在
function ensureFramesDir(analysisId: string): string {
  const dir = path.join(FRAMES_DIR, analysisId);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

// 带超时的 Promise 包装
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${label} 超时（${ms / 1000}s），请检查视频文件是否损坏`));
    }, ms);

    promise
      .then((val) => {
        clearTimeout(timer);
        resolve(val);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

// 获取视频元信息
export function getVideoMetadata(
  filePath: string
): Promise<{ duration: number; width: number; height: number }> {
  const inner = new Promise<{ duration: number; width: number; height: number }>(
    (resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) return reject(err);
        const video = metadata.streams.find((s) => s.codec_type === "video");
        resolve({
          duration: metadata.format.duration || 0,
          width: video?.width || 0,
          height: video?.height || 0,
        });
      });
    }
  );

  return withTimeout(inner, FFPROBE_TIMEOUT, "视频元信息读取");
}

// 截取关键帧
export function extractFrames(
  filePath: string,
  analysisId: string,
  intervalSeconds: number = 2
): Promise<string[]> {
  const framesDir = ensureFramesDir(analysisId);

  const inner = new Promise<string[]>((resolve, reject) => {
    const framePaths: string[] = [];
    let killed = false;

    const command = ffmpeg(filePath)
      .outputOptions([`-vf fps=1/${intervalSeconds}`, "-q:v 2"])
      .output(path.join(framesDir, "frame_%04d.jpg"))
      .on("end", () => {
        if (killed) return;
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
      .on("error", (err) => {
        if (killed) return;
        reject(err);
      });

    command.run();

    // 超时后强制 kill FFmpeg 进程
    setTimeout(() => {
      killed = true;
      command.kill("SIGKILL");
      reject(new Error(`帧提取超时（${FFMPEG_TIMEOUT / 1000}s），视频可能过大或损坏`));
    }, FFMPEG_TIMEOUT);
  });

  return inner;
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
