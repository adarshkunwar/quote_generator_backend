import { Router } from "express";
import { db } from "../db";
import { getExamples } from "../feedback";
import { generateQuote } from "../services/llm";
import { buildSubmissionPrompt } from "../prompts";

const router = Router();

router.get("/generate-quote", async (req, res) => {
  const { topic, style = "inspiring" } = req.query;

  if (!topic) {
    return res.status(400).json({
      error: "Topic parameter is required",
      usage: "GET /api/generate-quote?topic=your-topic&style=optional",
    });
  }

  try {
    const { liked, disliked } = getExamples();
    const userContent = buildSubmissionPrompt({
      topic: String(topic),
      style: String(style),
      liked,
      disliked,
    });

    const quote = await generateQuote(userContent);

    db.prepare(
      "INSERT INTO generated_quotes (topic, style, quote) VALUES (?, ?, ?)",
    ).run(String(topic), String(style), quote);

    res.json({
      topic,
      style,
      quote,
    });
  } catch (err) {
    console.error("Error generating quote:", err);
    res.status(502).json({
      error: "Failed to generate quote. Is llama-server running?",
    });
  }
});

export default router;
