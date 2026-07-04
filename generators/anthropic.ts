import type { Generator } from "../loop/types.ts";

interface AnthropicContent {
  type?: unknown;
  text?: unknown;
}

interface AnthropicResponse {
  content?: unknown;
}

export const anthropicGenerator: Generator = async (prompt) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is required for --generator anthropic");
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-20250514",
      max_tokens: 512,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const body = await response.text();
  if (!response.ok) {
    throw new Error(`Anthropic Messages API returned ${response.status}: ${body.slice(0, 500)}`);
  }

  let parsed: AnthropicResponse;
  try {
    parsed = JSON.parse(body) as AnthropicResponse;
  } catch {
    throw new Error("Anthropic Messages API returned invalid JSON");
  }
  if (!Array.isArray(parsed.content)) {
    throw new Error("Anthropic Messages API response has no content array");
  }
  const text = (parsed.content as AnthropicContent[])
    .filter((block) => block.type === "text" && typeof block.text === "string")
    .map((block) => block.text as string)
    .join("");
  if (!text) throw new Error("Anthropic Messages API response contains no text");
  return text;
};
