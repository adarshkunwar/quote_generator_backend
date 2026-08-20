import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { readFileSync } from "fs";
import { addFeedback, getExamples } from "./feedback";

dotenv.config();

interface ChatCompletionResponse {
  choices?: Array<{
    id?: number;
    message?: string;
  }>;
}

const app = express();
const PORT = process.env.PORT || 3000;
const MODAL = process.env.modal || "TheStageAI/Qwen3.5-9B-GGUF:Q4_K_M";

app.use(cors());
app.use(express.json());

const SYSTEM_PROMPT = readFileSync(
  process.env.SYSTEM_PROMPT_PATH ||
    "src/system-prompt/quote_generator_prompt.txt",
  "utf-8",
);

const LLAMA_SERVER_URL =
  process.env.LLAMA_SERVER_URL || "http://127.0.0.1:8080/v1/chat/completions";

function buildSubmissionPrompt({
  topic,
  style,
  liked,
  disliked,
}: {
  topic: string;
  style: string;
  liked: string[];
  disliked: string[];
}): string {
  const sections: string[] = [];

  sections.push(`Generate a quote about "${topic}" in a "${style}" style.`);

  if (liked.length > 0) {
    sections.push(
      `The user has previously LIKED quotes with this quality. Imitate the tone, structure, and voice of these EXACT examples:\n${liked
        .map((q, i) => `${i + 1}. "${q}"`)
        .join("\n")}`,
    );
  }

  if (disliked.length > 0) {
    sections.push(
      `The user has previously DISLIKED quotes like these. Do NOT mirror their tone, structure, or phrasing:\n${disliked
        .map((q, i) => `${i + 1}. "${q}"`)
        .join("\n")}`,
    );
  }

  sections.push(
    `Return ONLY the quote text. No analysis, no JSON, no extra commentary.`,
  );

  return sections.join("\n\n");
}

// Load system prompt

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
    const { liked, disliked } = getExamples();
    const userContent = buildSubmissionPrompt({
      topic: String(topic),
      style: String(style),
      liked,
      disliked,
    });

    const response = await fetch(LLAMA_SERVER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: `${MODAL}`,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userContent },
        ],
        max_token: 5000,
        temperature: 0.8,
      }),
    });

    console.log("response", response);

    if (!response.ok) {
      const errText = await response.text();
      console.error("llama-server error:", response.status, errText);
      return res.status(502).json({
        error: "Local model server returned an error",
      });
    }

    const data = (await response.json()) as ChatCompletionResponse;
    const quote: string | undefined = data?.choices?.[0]?.message;

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

app.post("/api/feedback", (req: Request, res: Response) => {
  const { quote, vote } = req.body ?? {};

  if (typeof quote !== "string" || !quote.trim()) {
    return res.status(400).json({ error: "quote is required" });
  }
  if (vote !== "liked" && vote !== "disliked") {
    return res
      .status(400)
      .json({ error: 'vote must be "liked" or "disliked"' });
  }

  addFeedback(vote, quote.trim());
  res.status(201).json({ status: "ok", vote, quote: quote.trim() });
});

app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Quote Generator API running on port ${PORT}`);
});
