import OpenAI from "openai";

export interface AIMessage {
  role: "system" | "user";
  content: string | AIContentPart[];
}

export type AIContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

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

  const response = await client.chat.completions.create({
    model,
    messages: openaiMessages,
    max_tokens: 4096,
    temperature: 0.7,
  });

  return response.choices[0]?.message?.content || "";
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
