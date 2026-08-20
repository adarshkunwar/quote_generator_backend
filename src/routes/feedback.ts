import { Router } from "express";
import { addFeedback } from "../feedback";

const router = Router();

router.post("/feedback", (req, res) => {
  const { quote, vote } = req.body ?? {};

  if (typeof quote !== "string" || !quote.trim()) {
    return res.status(400).json({ error: "quote is required" });
  }
  if (vote !== "liked" && vote !== "disliked") {
    return res
      .status(400)
      .json({ error: 'vote must be "liked" or "disliked"' });
  }

  const id = addFeedback(vote, quote.trim());
  res.status(201).json({ status: "ok", id, vote, quote: quote.trim() });
});

export default router;
