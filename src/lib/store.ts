import { VideoAnalysis, VideoSegment, AnalysisResult } from "@/types";
import getDb from "./db";

// ============ 行数据 <-> VideoAnalysis 转换 ============

interface AnalysisRow {
  id: string;
  status: string;
  file_name: string;
  file_path: string;
  file_size: number;
  duration: number | null;
  resolution: string | null;
  created_at: string;
  updated_at: string;
  segments: string;
  result: string | null;
  error: string | null;
  progress: number;
}

function rowToAnalysis(row: AnalysisRow): VideoAnalysis {
  return {
    id: row.id,
    status: row.status as VideoAnalysis["status"],
    fileName: row.file_name,
    filePath: row.file_path,
    fileSize: row.file_size,
    duration: row.duration ?? undefined,
    resolution: row.resolution ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    segments: JSON.parse(row.segments) as VideoSegment[],
    result: row.result ? (JSON.parse(row.result) as AnalysisResult) : undefined,
    error: row.error ?? undefined,
    progress: row.progress,
  };
}

// ============ 对外 API（接口保持不变） ============

export function getAnalysis(id: string): VideoAnalysis | undefined {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM analyses WHERE id = ?")
    .get(id) as AnalysisRow | undefined;
  return row ? rowToAnalysis(row) : undefined;
}

export function setAnalysis(analysis: VideoAnalysis): void {
  const db = getDb();
  db.prepare(
    `INSERT INTO analyses (id, status, file_name, file_path, file_size, duration, resolution, created_at, updated_at, segments, result, error, progress)
     VALUES (@id, @status, @file_name, @file_path, @file_size, @duration, @resolution, @created_at, @updated_at, @segments, @result, @error, @progress)`
  ).run({
    id: analysis.id,
    status: analysis.status,
    file_name: analysis.fileName,
    file_path: analysis.filePath,
    file_size: analysis.fileSize,
    duration: analysis.duration ?? null,
    resolution: analysis.resolution ?? null,
    created_at: analysis.createdAt,
    updated_at: analysis.updatedAt,
    segments: JSON.stringify(analysis.segments),
    result: analysis.result ? JSON.stringify(analysis.result) : null,
    error: analysis.error ?? null,
    progress: analysis.progress,
  });
}

export function updateAnalysis(
  id: string,
  updates: Partial<VideoAnalysis>
): VideoAnalysis | undefined {
  const existing = getAnalysis(id);
  if (!existing) return undefined;

  const merged = { ...existing, ...updates, updatedAt: new Date().toISOString() };
  const db = getDb();

  db.prepare(
    `UPDATE analyses SET
       status = @status,
       file_name = @file_name,
       file_path = @file_path,
       file_size = @file_size,
       duration = @duration,
       resolution = @resolution,
       updated_at = @updated_at,
       segments = @segments,
       result = @result,
       error = @error,
       progress = @progress
     WHERE id = @id`
  ).run({
    id: merged.id,
    status: merged.status,
    file_name: merged.fileName,
    file_path: merged.filePath,
    file_size: merged.fileSize,
    duration: merged.duration ?? null,
    resolution: merged.resolution ?? null,
    updated_at: merged.updatedAt,
    segments: JSON.stringify(merged.segments),
    result: merged.result ? JSON.stringify(merged.result) : null,
    error: merged.error ?? null,
    progress: merged.progress,
  });

  return merged;
}

export function getAllAnalyses(): VideoAnalysis[] {
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM analyses ORDER BY created_at DESC")
    .all() as AnalysisRow[];
  return rows.map(rowToAnalysis);
}
