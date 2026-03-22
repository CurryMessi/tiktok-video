# TikTok 视频拆解器

AI 驱动的 TikTok 爆款视频逆向分析工具。上传视频，自动逆向提示词、拆解片段结构、分析爆款要素，帮你快速复刻爆款内容。

## 核心功能

- **逆向提示词** — AI 分析视频画面，推测生成该视频可能使用的提示词，可直接复制使用
- **片段拆解** — 自动将视频切分为多个片段，逐段分析视觉元素、转场方式和情绪节奏
- **爆款评分** — 从 Hook 吸引力、情绪曲线、节奏把控、CTA 等维度评估爆款潜力
- **复刻指南** — 生成详细的复刻步骤，推荐工具和注意事项

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Next.js 16 + React 19 + TypeScript |
| 样式 | Tailwind CSS 4 + shadcn/ui |
| AI | 豆包视觉模型（火山引擎 Ark，OpenAI 兼容协议） |
| 视频处理 | FFmpeg（fluent-ffmpeg） |

## 前置要求

- **Node.js** >= 18
- **FFmpeg** — 视频帧提取依赖

```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt install ffmpeg
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

编辑 `.env.local`：

```env
# AI 提供商: "doubao" 或 "openai"
AI_PROVIDER=doubao

# 豆包（火山引擎 Ark）
DOUBAO_API_KEY=your-api-key
DOUBAO_MODEL=doubao-seed-1-6-vision-250815

# 上传文件大小限制（MB）
MAX_UPLOAD_SIZE_MB=100
```

### 3. 启动开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 即可使用。

## 项目结构

```
src/
├── app/
│   ├── page.tsx                  # 首页 - 上传入口
│   ├── analysis/[id]/page.tsx    # 分析结果详情页
│   └── api/
│       ├── upload/route.ts       # 视频上传接口
│       ├── analyze/route.ts      # 启动分析接口
│       └── analysis/[id]/route.ts # 查询分析结果接口
├── components/
│   ├── upload-zone.tsx           # 拖拽上传组件
│   ├── prompt-display.tsx        # 逆向提示词展示
│   ├── segment-player.tsx        # 片段拆解展示
│   └── analysis-card.tsx         # 爆款分析卡片
├── lib/
│   ├── ai-provider.ts            # AI 调用封装（豆包/OpenAI）
│   ├── analyzer.ts               # 核心分析逻辑
│   ├── video-processor.ts        # 视频处理：截帧、分段、元数据
│   └── store.ts                  # 内存存储（MVP）
└── types/
    └── index.ts                  # TypeScript 类型定义
```

## API 接口

### POST /api/upload

上传视频文件。

- **Content-Type**: `multipart/form-data`
- **参数**: `file` — 视频文件（MP4 / WebM / MOV，最大 100MB）
- **返回**: `{ id, filename, size }`

### POST /api/analyze

启动视频分析（异步）。

- **参数**: `{ id }` — 上传返回的分析 ID
- **返回**: `{ success: true }`

### GET /api/analysis/[id]

查询分析进度和结果。

- **返回**: `{ status, progress, result }` — status 为 `uploading | processing | completed | error`

## 分析流程

```
上传视频 → 提取元数据 → 截取关键帧 → 逻辑分段
                                          ↓
                                   AI 整体分析（逆向提示词 + 爆款评分）
                                          ↓
                                   AI 片段分析（逐段视觉/转场/情绪）
                                          ↓
                                     返回完整分析结果
```

## 可用脚本

```bash
npm run dev      # 开发模式
npm run build    # 生产构建
npm start        # 生产运行
npm run lint     # 代码检查
```

## 注意事项

- 当前使用内存存储，服务重启后分析数据会丢失
- 上传的视频保存在 `public/uploads/`，需注意磁盘空间
- 视频分析耗时取决于视频时长和 AI 接口响应速度
