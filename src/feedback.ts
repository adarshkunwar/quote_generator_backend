import { existsSync, mkdirSync, readFileSync, appendFileSync, writeFileSync } from "fs";

export type Vote = "liked" | "disliked";

const DATA_DIR = process.env.DATA_DIR || "data";
const LIKED_FILE = `${DATA_DIR}/liked.txt`;
const DISLIKED_FILE = `${DATA_DIR}/disliked.txt`;

// Prepend the file header/instruction line on first create
const LIKED_HEADER =
  "# One quote per line. These are examples of quotes the user LIKES.";
const DISLIKED_HEADER =
  "# One quote per line. These are examples of quotes the user DISLIKES.";

function ensureFiles(): void {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  for (const [file, header] of [
    [LIKED_FILE, LIKED_HEADER],
    [DISLIKED_FILE, DISLIKED_HEADER],
  ] as const) {
    if (!existsSync(file)) {
      writeFileSync(file, `${header}\n`, "utf-8");
    }
  }
}

function readLines(file: string): string[] {
  if (!existsSync(file)) return [];
  return readFileSync(file, "utf-8")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith("#"));
}

function appendLine(file: string, line: string): void {
  appendFileSync(file, `${line}\n`, "utf-8");
}

export function addFeedback(vote: Vote, quote: string): void {
  ensureFiles();
  appendLine(vote === "liked" ? LIKED_FILE : DISLIKED_FILE, quote);
}

export function getExamples(maxLiked = 5, maxDisliked = 5): {
  liked: string[];
  disliked: string[];
} {
  ensureFiles();
  return {
    liked: readLines(LIKED_FILE).slice(-maxLiked),
    disliked: readLines(DISLIKED_FILE).slice(-maxDisliked),
  };
}