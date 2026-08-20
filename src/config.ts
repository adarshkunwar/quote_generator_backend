import dotenv from "dotenv";
import { readFileSync } from "fs";

dotenv.config();

export const PORT = process.env.PORT || 3000;
export const MODEL = process.env.modal || "TheStageAI/Qwen3.5-9B-GGUF:Q4_K_M";
export const SYSTEM_PROMPT = readFileSync(
  process.env.SYSTEM_PROMPT_PATH ||
    "src/system-prompt/quote_generator_prompt.txt",
  "utf-8",
);
export const LLAMA_SERVER_URL =
  process.env.LLAMA_SERVER_URL || "http://127.0.0.1:8080/v1/chat/completions";
