import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import { VideoAnalysis } from "@/types";
import { setAnalysis } from "@/lib/store";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("video") as File | null;

    if (!file) {
      return NextResponse.json({ error: "请上传视频文件" }, { status: 400 });
    }

    // 校验文件类型
    const allowedTypes = ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "不支持的文件格式，请上传 MP4/WebM/MOV 格式" },
        { status: 400 }
      );
    }

    // 校验文件大小
    const maxSize = (parseInt(process.env.MAX_UPLOAD_SIZE_MB || "100")) * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `文件大小超过限制（最大 ${process.env.MAX_UPLOAD_SIZE_MB || 100}MB）` },
        { status: 400 }
      );
    }

    const id = uuidv4();
    const ext = path.extname(file.name) || ".mp4";
    const fileName = `${id}${ext}`;
    const filePath = path.join(UPLOADS_DIR, fileName);

    // 确保上传目录存在
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }

    // 保存文件
    const bytes = await file.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(bytes));

    // 创建分析记录
    const analysis: VideoAnalysis = {
      id,
      status: "uploading",
      fileName: file.name,
      filePath: `/uploads/${fileName}`,
      fileSize: file.size,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      segments: [],
      progress: 10,
    };

    setAnalysis(analysis);

    return NextResponse.json({ id, message: "上传成功" });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "上传失败" }, { status: 500 });
  }
}
