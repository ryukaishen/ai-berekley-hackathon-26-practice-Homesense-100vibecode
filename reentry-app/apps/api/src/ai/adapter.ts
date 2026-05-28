import { findPolicyViolations } from "./policy.js";
import type { PromptTemplate } from "./templates.js";

export type AiTextResult = {
  provider: string;
  usedFallback: boolean;
  text: string;
  safetyNotes: string[];
};

export type AiFallback = () => AiTextResult;

export interface AiAdapter {
  name: string;
  isConfigured(): boolean;
  complete(prompt: PromptTemplate, fallback: AiFallback): Promise<AiTextResult>;
}

type OpenAiCompatibleConfig = {
  apiKey: string;
  baseUrl: string;
  model: string;
};

export function createAiAdapter(env: NodeJS.ProcessEnv = process.env): AiAdapter {
  const apiKey = env.AI_API_KEY ?? env.OPENAI_API_KEY;
  if (!apiKey) return new NoopAiAdapter();

  return new OpenAiCompatibleAdapter({
    apiKey,
    baseUrl: env.AI_BASE_URL ?? "https://api.openai.com/v1/chat/completions",
    model: env.AI_MODEL ?? "gpt-4o-mini"
  });
}

class NoopAiAdapter implements AiAdapter {
  name = "noop";

  isConfigured() {
    return false;
  }

  async complete(_prompt: PromptTemplate, fallback: AiFallback) {
    const result = fallback();
    return {
      ...result,
      provider: this.name,
      usedFallback: true,
      safetyNotes: [
        "No AI API key was configured, so the deterministic fallback was used.",
        ...result.safetyNotes
      ]
    };
  }
}

class OpenAiCompatibleAdapter implements AiAdapter {
  name = "openai-compatible";

  constructor(private readonly config: OpenAiCompatibleConfig) {}

  isConfigured() {
    return Boolean(this.config.apiKey);
  }

  async complete(prompt: PromptTemplate, fallback: AiFallback) {
    try {
      const response = await fetch(this.config.baseUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            { role: "system", content: prompt.system },
            { role: "user", content: prompt.user }
          ],
          temperature: 0.2,
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        throw new Error(`AI provider returned ${response.status}`);
      }

      const payload = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const content = payload.choices?.[0]?.message?.content;
      if (!content) throw new Error("AI provider response did not include message content.");

      const parsed = parseProviderJson(content);
      const violations = findPolicyViolations(parsed.text);
      if (violations.length > 0) {
        return {
          ...fallback(),
          provider: this.name,
          usedFallback: true,
          safetyNotes: ["AI output was rejected by policy checks.", ...violations]
        };
      }

      return {
        provider: this.name,
        usedFallback: false,
        text: parsed.text,
        safetyNotes: parsed.safetyNotes
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown AI provider failure.";
      const result = fallback();
      return {
        ...result,
        provider: this.name,
        usedFallback: true,
        safetyNotes: [`AI provider failed, so deterministic fallback was used: ${message}`, ...result.safetyNotes]
      };
    }
  }
}

function parseProviderJson(content: string) {
  const parsed = JSON.parse(content) as { text?: unknown; safetyNotes?: unknown };
  if (typeof parsed.text !== "string") {
    throw new Error("AI provider JSON did not include a text string.");
  }

  return {
    text: parsed.text,
    safetyNotes: Array.isArray(parsed.safetyNotes)
      ? parsed.safetyNotes.filter((note): note is string => typeof note === "string")
      : []
  };
}
