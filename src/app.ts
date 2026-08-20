import express from "express";
import cors from "cors";
import { PORT } from "./config";
import generateRouter from "./routes/generate";
import feedbackRouter from "./routes/feedback";
import healthRouter from "./routes/health";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", generateRouter);
app.use("/api", feedbackRouter);
app.use("/api", healthRouter);

app.listen(PORT, () => {
  console.log(`Quote Generator API running on port ${PORT}`);
});
