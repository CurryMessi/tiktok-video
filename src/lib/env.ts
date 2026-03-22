// 环境变量校验 — 在服务端模块首次加载时执行
// 如果缺少关键配置，直接抛出明确错误

function validateEnv() {
  const provider = process.env.AI_PROVIDER || "doubao";

  if (provider === "doubao") {
    if (!process.env.DOUBAO_API_KEY) {
      throw new Error(
        "[环境变量缺失] DOUBAO_API_KEY 未设置。请在 .env.local 中配置豆包 API Key。"
      );
    }
    if (!process.env.DOUBAO_MODEL) {
      console.warn(
        "[环境变量警告] DOUBAO_MODEL 未设置，将使用默认模型 doubao-1-5-vision-pro-32k-250115"
      );
    }
  } else if (provider === "openai") {
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "your-openai-api-key-here") {
      throw new Error(
        "[环境变量缺失] OPENAI_API_KEY 未设置。请在 .env.local 中配置 OpenAI API Key。"
      );
    }
  } else {
    throw new Error(
      `[环境变量错误] AI_PROVIDER="${provider}" 不支持，可选值: "doubao" | "openai"`
    );
  }

  console.log(`[配置] AI 提供商: ${provider}`);
}

// 模块加载时立即校验
validateEnv();

export {};
