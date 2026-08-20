import { db, Vote } from "./db";

export type { Vote };

export function addFeedback(vote: Vote, quote: string): number {
  const info = db
    .prepare("INSERT INTO feedback (vote, quote) VALUES (?, ?)")
    .run(vote, quote);
  return Number(info.lastInsertRowid);
}

export function getExamples(maxLiked = 5, maxDisliked = 5): {
  liked: string[];
  disliked: string[];
} {
  const liked = db
    .prepare(
      `SELECT quote FROM feedback
       WHERE vote = 'liked'
       ORDER BY id DESC
       LIMIT ?`,
    )
    .all(maxLiked) as Array<{ quote: string }>;
  const disliked = db
    .prepare(
      `SELECT quote FROM feedback
       WHERE vote = 'disliked'
       ORDER BY id DESC
       LIMIT ?`,
    )
    .all(maxDisliked) as Array<{ quote: string }>;

  return {
    liked: liked.map((r) => r.quote),
    disliked: disliked.map((r) => r.quote),
  };
}

export function getAllFeedback(): Array<{
  id: number;
  quote: string;
  vote: Vote;
  created_at: string;
}> {
  return db
    .prepare("SELECT id, quote, vote, created_at FROM feedback ORDER BY id DESC")
    .all() as Array<{ id: number; quote: string; vote: Vote; created_at: string }>;
}