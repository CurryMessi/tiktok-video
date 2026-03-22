"use client";

import { useCallback, useState } from "react";
import { Upload, Film, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface UploadZoneProps {
  onUploadComplete: (id: string) => void;
}

export function UploadZone({ onUploadComplete }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      setIsUploading(true);

      try {
        const formData = new FormData();
        formData.append("video", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "上传失败");

        onUploadComplete(data.id);
      } catch (err) {
        setError(err instanceof Error ? err.message : "上传失败");
      } finally {
        setIsUploading(false);
      }
    },
    [onUploadComplete]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <Card
      className={`relative border-2 border-dashed p-12 text-center transition-colors cursor-pointer
        ${isDragging ? "border-pink-500 bg-pink-500/10" : "border-zinc-700 hover:border-zinc-500"}
      `}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => {
        if (!isUploading) document.getElementById("video-input")?.click();
      }}
    >
      <input
        id="video-input"
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        className="hidden"
        onChange={handleFileInput}
        disabled={isUploading}
      />

      <div className="flex flex-col items-center gap-4">
        {isUploading ? (
          <>
            <Loader2 className="h-12 w-12 text-pink-500 animate-spin" />
            <p className="text-lg text-zinc-300">正在上传视频...</p>
          </>
        ) : (
          <>
            <div className="rounded-full bg-pink-500/20 p-4">
              {isDragging ? (
                <Film className="h-12 w-12 text-pink-500" />
              ) : (
                <Upload className="h-12 w-12 text-pink-500" />
              )}
            </div>
            <div>
              <p className="text-lg font-medium text-zinc-200">
                拖拽视频到这里，或点击选择文件
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                支持 MP4 / WebM / MOV 格式，最大 100MB
              </p>
            </div>
            <Button variant="outline" className="mt-2">
              选择视频文件
            </Button>
          </>
        )}

        {error && (
          <p className="text-sm text-red-400 mt-2">{error}</p>
        )}
      </div>
    </Card>
  );
}
