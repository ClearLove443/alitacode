// 配置私有部署的 embedding API
const EMBEDDING_API_URL = process.env.EMBEDDING_API_URL || "http://localhost:8080/embeddings";
const EMBEDDING_API_KEY = process.env.EMBEDDING_API_KEY;
const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || "qwen3-embedding-8b";

import { Log } from "../../util/log";

const log = Log.create({ service: "embedding" });

async function getPipeline() {
  // 对于私有部署的 API，不需要本地 pipeline
  return null;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  if (!EMBEDDING_API_URL) {
    throw new Error("EMBEDDING_API_URL environment variable is required");
  }

  log.info("Generating embedding for:", { text });
  log.info("API URL:", { url: EMBEDDING_API_URL });
  log.info("Model:", { model: EMBEDDING_MODEL });

  try {
    const response = await fetch(EMBEDDING_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(EMBEDDING_API_KEY && { "Authorization": `Bearer ${EMBEDDING_API_KEY}` }),
      },
      body: JSON.stringify({
        input: text,
        model: EMBEDDING_MODEL, // 从环境变量获取模型名称
      }),
    });

    log.info("Response status:", { status: response.status });

    if (!response.ok) {
      throw new Error(`Embedding API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    log.info("Response data:", { data });

    // 根据你的 API 响应格式调整这里
    // 常见格式: data[0].embedding 或 embeddings[0]
    const embedding = data.data?.[0]?.embedding || data.embeddings?.[0] || data.embedding;

    if (!Array.isArray(embedding)) {
      throw new Error("Invalid embedding response format");
    }

    log.info("Embedding generated successfully", { length: embedding.length });
    return embedding;
  } catch (error) {
    log.error("Failed to generate embedding via API", { error });
    throw error;
  }
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(
      `Embedding dimension mismatch: ${a.length} vs ${b.length}`,
    );
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    const ai = a[i]!;
    const bi = b[i]!;
    dotProduct += ai * bi;
    normA += ai * ai;
    normB += bi * bi;
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;
  return dotProduct / denominator;
}
