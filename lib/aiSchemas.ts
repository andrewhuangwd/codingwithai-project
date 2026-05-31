import { z } from "zod";

export const ClarifyingQuestionsSchema = z.object({
  questions: z.array(z.string()),
});

export const RecommendedNeedSchema = z.object({
  title: z.string(),
  type: z.union([
    z.literal("scheduled_recurring"),
    z.literal("daily_checkin"),
    z.literal("weekly_checkin"),
    z.literal("one_off"),
  ]),
  weekdays: z.array(z.number()).optional(),
  startTime: z.string().optional(),
  durationMinutes: z.number().optional(),
});

export const RecommendedAndySchema = z.object({
  name: z.string(),
  dimension: z.string(),
  needs: z.array(RecommendedNeedSchema),
});

export const OnboardingRecommendationsSchema = z.object({
  summary: z.string(),
  andies: z.array(RecommendedAndySchema),
  extractedDimensions: z.array(z.string()),
});

export type RecommendedNeed = z.infer<typeof RecommendedNeedSchema>;
export type RecommendedAndy = z.infer<typeof RecommendedAndySchema>;
export type OnboardingRecommendations = z.infer<typeof OnboardingRecommendationsSchema>;
