import { VideoAnalysis } from "@/types";

// MVP 内存存储
const analyses = new Map<string, VideoAnalysis>();

export function getAnalysis(id: string): VideoAnalysis | undefined {
  return analyses.get(id);
}

export function setAnalysis(analysis: VideoAnalysis): void {
  analyses.set(analysis.id, analysis);
}

export function updateAnalysis(
  id: string,
  updates: Partial<VideoAnalysis>
): VideoAnalysis | undefined {
  const existing = analyses.get(id);
  if (!existing) return undefined;
  const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
  analyses.set(id, updated);
  return updated;
}

export function getAllAnalyses(): VideoAnalysis[] {
  return Array.from(analyses.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
