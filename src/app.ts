import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { readFileSync } from "fs";

dotenv.config();

interface ChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

const app = express();
const PORT = process.env.PORT || 3000;
const MODAL = process.env.modal || "TheStageAI/Qwen3.5-9B-GGUF:Q4_K_M";

app.use(express.json());

// Load system prompt
const SYSTEM_PROMPT = readFileSync(
  process.env.SYSTEM_PROMPT_PATH ||
    "src/system-prompt/quote_generator_prompt.txt",
  "utf-8",
);

const LLAMA_SERVER_URL =
  process.env.LLAMA_SERVER_URL || "http://127.0.0.1:8080/v1/chat/completions";

app.get("/api/generate-quote", async (req: Request, res: Response) => {
  const { topic, style = "inspiring" } = req.query;

  if (!topic) {
    return res.status(400).json({
      error: "Topic parameter is required",
      usage: "GET /api/generate-quote?topic=your-topic&style=optional",
    });
  }

  // In production, this would call your LLM/API
  try {
    const response = await fetch(LLAMA_SERVER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: `${MODAL}`,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Generate a quote about ${topic} in a ${style} style`,
          },
        ],
        max_token: 5000,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("llama-server error:", response.status, errText);
      return res.status(502).json({
        error: "Local model server returned an error",
      });
    }

    const data = (await response.json()) as ChatCompletionResponse;
    const quote: string | undefined = data?.choices?.[0]?.message?.content;

    if (!quote) {
      return res.status(502).json({
        error: "Model returned no text content",
      });
    }

    res.json({
      topic,
      style,
      quote: quote.trim(),
    });
  } catch (err) {
    console.error("Error generating quote:", err);
    res.status(500).json({
      error: "Failed to generate quote. Is llama-server running?",
    });
  }
});

app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Quote Generator API running on port ${PORT}`);
});
