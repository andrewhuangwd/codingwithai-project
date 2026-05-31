import { addDays, format, startOfWeek } from "date-fns";

export function getDateKey(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function getMondayWeekKey(date: Date): string {
  const monday = startOfWeek(date, { weekStartsOn: 1 });
  return `week-${getDateKey(monday)}`;
}

export function getCurrentWeekDates(anchorDate: Date): Date[] {
  const monday = startOfWeek(anchorDate, { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, index) => addDays(monday, index));
}

export function getDateKeyFromScheduledFor(scheduledFor: string | null): string | null {
  return scheduledFor?.slice(0, 10) ?? null;
}
