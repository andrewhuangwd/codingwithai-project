import type { DIMENSIONS } from "./constants";

export type Dimension = (typeof DIMENSIONS)[number];
export type NeedType =
  | "scheduled_recurring"
  | "daily_checkin"
  | "weekly_checkin"
  | "one_off";
export type NeedInstanceStatus = "pending" | "completed" | "missed";
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

type BaseNeed = {
  id: string;
  andyId: string;
  title: string;
  durationMinutes?: number;
  active: boolean;
};

export type ScheduledRecurringNeed = BaseNeed & {
  type: "scheduled_recurring";
  schedule: {
    weekdays: Weekday[];
    startTime: string;
    durationMinutes: number;
  };
};

export type DailyCheckinNeed = BaseNeed & {
  type: "daily_checkin";
  schedule: Record<string, never>;
};

export type WeeklyCheckinNeed = BaseNeed & {
  type: "weekly_checkin";
  schedule: Record<string, never>;
};

export type OneOffNeed = BaseNeed & {
  type: "one_off";
  schedule: {
    dueDateTime?: string;
    durationMinutes?: number;
  };
};

export type Need =
  | ScheduledRecurringNeed
  | DailyCheckinNeed
  | WeeklyCheckinNeed
  | OneOffNeed;

export type NeedInstance = {
  id: string;
  andyId: string;
  needId: string;
  title: string;
  scheduledFor: string | null;
  durationMinutes: number | null;
  status: NeedInstanceStatus;
  weekKey: string;
};

export type BadgeType =
  | "first_care"
  | "three_day_streak"
  | "three_in_a_row"
  | "perfect_week"
  | "comeback";
