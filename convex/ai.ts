"use node";
import Anthropic from "@anthropic-ai/sdk";
import { v } from "convex/values";
import { ClarifyingQuestionsSchema, OnboardingRecommendationsSchema } from "../lib/aiSchemas";
import { DIMENSIONS } from "../lib/constants";
import { action } from "./_convex";

function getClient(): Anthropic | null {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  return new Anthropic({ apiKey });
}

async function askClaude(client: Anthropic, system: string, user: string): Promise<string> {
  const msg = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    system,
    messages: [{ role: "user", content: user }],
  });
  const block = msg.content[0];
  return block.type === "text" ? block.text : "{}";
}

const CORE_QUESTIONS = [
  "How have you been feeling lately?",
  "What are you hoping to grow or care for in the next 3 months?",
  "What tends to get in the way of taking care of yourself?",
];

export const generateClarifyingQuestions = action({
  args: { coreAnswers: v.array(v.string()) },
  handler: async (_ctx, args): Promise<{ questions: string[] }> => {
    const client = getClient();
    if (!client) return { questions: [] };

    const userContent = CORE_QUESTIONS.map(
      (q, i) => `Q: ${q}\nA: ${args.coreAnswers[i] ?? ""}`,
    ).join("\n\n");

    try {
      const text = await askClaude(
        client,
        `You are a compassionate life coach helping someone set up a personal care plan. The user answered 4 questions. Generate 0–2 follow-up questions to clarify which life dimensions to focus on (${DIMENSIONS.join(", ")}). Only ask if answers are vague or crucial info is missing. Return JSON only: {"questions":["..."]} or {"questions":[]}`,
        userContent,
      );
      const parsed = ClarifyingQuestionsSchema.safeParse(JSON.parse(text));
      if (!parsed.success) return { questions: [] };
      return { questions: parsed.data.questions.slice(0, 2) };
    } catch (err) {
      console.error("[ai:generateClarifyingQuestions] error:", err);
      return { questions: [] };
    }
  },
});

export const generateOnboardingRecommendations = action({
  args: {
    coreAnswers: v.array(v.string()),
    clarifyingAnswers: v.array(v.string()),
  },
  handler: async (_ctx, args) => {
    const client = getClient();
    if (!client) return fallback();

    const coreText = CORE_QUESTIONS.map(
      (q, i) => `Q: ${q}\nA: ${args.coreAnswers[i] ?? ""}`,
    ).join("\n\n");
    const clarifyText =
      args.clarifyingAnswers.length > 0
        ? `\n\nAdditional context:\n${args.clarifyingAnswers.join("\n")}`
        : "";

    try {
      const text = await askClaude(
        client,
        `You are a compassionate life coach. Recommend 1–3 "Andies" — avatars for life dimensions the user wants to care for. Each Andy gets up to 3 actionable Needs.

Valid Need types: scheduled_recurring (needs weekdays 0=Sun–6=Sat, startTime HH:MM, durationMinutes), daily_checkin, weekly_checkin, one_off.
Valid dimensions: ${DIMENSIONS.join(", ")}.

Return JSON only:
{"summary":"1-2 sentences","andies":[{"name":"...","dimension":"...","needs":[{"title":"...","type":"daily_checkin"}]}],"extractedDimensions":["..."]}`,
        coreText + clarifyText,
      );
      const parsed = OnboardingRecommendationsSchema.safeParse(JSON.parse(text));
      if (!parsed.success) {
        console.error("[ai:generateOnboardingRecommendations] parse failed:", JSON.stringify(parsed.error));
        return fallback();
      }
      return {
        ...parsed.data,
        andies: parsed.data.andies.slice(0, 3).map((a) => ({
          ...a,
          needs: a.needs.slice(0, 3),
        })),
      };
    } catch (err) {
      console.error("[ai:generateOnboardingRecommendations] error:", err);
      return fallback();
    }
  },
});

function fallback() {
  return {
    summary: "Here are some starter Andies. Edit them to fit your life.",
    andies: [
      {
        name: "Wellness Andy",
        dimension: "Fitness",
        needs: [{ title: "Daily check-in", type: "daily_checkin" as const }],
      },
    ],
    extractedDimensions: ["Fitness"],
  };
}
