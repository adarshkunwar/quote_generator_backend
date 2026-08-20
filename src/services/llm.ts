import { LLAMA_SERVER_URL, MODEL, SYSTEM_PROMPT } from "../config";

interface ChatCompletionResponse {
  choices?: Array<{
    id?: number;
    message?: string;
  }>;
}

export async function generateQuote(userContent: string): Promise<string> {
  const response = await fetch(LLAMA_SERVER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: `${MODEL}`,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userContent },
      ],
      max_token: 5000,
      temperature: 0.8,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("llama-server error:", response.status, errText);
    throw new Error("Model server returned an error");
  }

  const data = (await response.json()) as ChatCompletionResponse;
  const quote: string | undefined = data?.choices?.[0]?.message;

  if (!quote) {
    throw new Error("Model returned no text content");
  }

  return quote.trim();
}
