import OpenAI from "openai";
import "./env"; // 启动时校验环境变量

export interface AIMessage {
  role: "system" | "user";
  content: string | AIContentPart[];
}

export type AIContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

// 重试配置
const MAX_RETRIES = 3;
const RETRY_BASE_DELAY = 2000; // 2 秒起步，指数退避

function createClient(): { client: OpenAI; model: string } {
  const provider = process.env.AI_PROVIDER || "doubao";

  if (provider === "doubao") {
    return {
      client: new OpenAI({
        apiKey: process.env.DOUBAO_API_KEY,
        baseURL: "https://ark.cn-beijing.volces.com/api/v3",
      }),
      model: process.env.DOUBAO_MODEL || "doubao-1-5-vision-pro-32k-250115",
    };
  }

  if (provider === "openai") {
    return {
      client: new OpenAI({ apiKey: process.env.OPENAI_API_KEY }),
      model: process.env.OPENAI_MODEL || "gpt-4o",
    };
  }

  throw new Error(`Unsupported AI provider: ${provider}`);
}

// 延时工具
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function callAI(messages: AIMessage[]): Promise<string> {
  const { client, model } = createClient();

  const openaiMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = messages.map(
    (m) => {
      if (m.role === "system") {
        return { role: "system" as const, content: m.content as string };
      }
      return {
        role: "user" as const,
        content: m.content as OpenAI.Chat.Completions.ChatCompletionContentPart[] | string,
      };
    }
  );

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await client.chat.completions.create({
        model,
        messages: openaiMessages,
        max_tokens: 4096,
        temperature: 0.7,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("AI 返回内容为空");
      }
      return content;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(
        `AI 调用失败 (第 ${attempt}/${MAX_RETRIES} 次): ${lastError.message}`
      );

      // 最后一次不再等待
      if (attempt < MAX_RETRIES) {
        const delay = RETRY_BASE_DELAY * Math.pow(2, attempt - 1); // 2s, 4s, 8s
        console.log(`等待 ${delay / 1000}s 后重试...`);
        await sleep(delay);
      }
    }
  }

  throw new Error(`AI 调用失败，已重试 ${MAX_RETRIES} 次: ${lastError?.message}`);
}

// 构建带图片的分析消息
export function buildImageAnalysisMessages(
  systemPrompt: string,
  userPrompt: string,
  base64Images: string[]
): AIMessage[] {
  const imageParts: AIContentPart[] = base64Images.map((img) => ({
    type: "image_url",
    image_url: { url: `data:image/jpeg;base64,${img}` },
  }));

  return [
    { role: "system", content: systemPrompt },
    {
      role: "user",
      content: [{ type: "text", text: userPrompt }, ...imageParts],
    },
  ];
}
