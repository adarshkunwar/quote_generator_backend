export function buildSubmissionPrompt({
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
