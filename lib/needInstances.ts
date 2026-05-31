import {
  getCurrentWeekDates,
  getDateKey,
  getDateKeyFromScheduledFor,
  getMondayWeekKey,
} from "./dates";
import type { Need, NeedInstance, Weekday } from "./types";

export function generateCurrentWeekInstances(
  needs: Need[],
  anchorDate: Date,
): NeedInstance[] {
  const weekKey = getMondayWeekKey(anchorDate);
  const weekDates = getCurrentWeekDates(anchorDate);
  const weekDateKeys = new Set(weekDates.map(getDateKey));

  return needs.flatMap((need) => {
    if (!need.active) return [];

    if (need.type === "scheduled_recurring") {
      return weekDates
        .filter((date) => need.schedule.weekdays.includes(date.getDay() as Weekday))
        .map((date) => {
          const dateKey = getDateKey(date);
          const startTime = need.schedule.startTime;

          return {
            id: `${need.id}-${dateKey}-${startTime}`,
            andyId: need.andyId,
            needId: need.id,
            title: need.title,
            scheduledFor: `${dateKey}T${startTime}`,
            durationMinutes: need.schedule.durationMinutes,
            status: "pending",
            weekKey,
          };
        });
    }

    if (need.type === "daily_checkin") {
      return weekDates.map((date) => {
        const dateKey = getDateKey(date);

        return {
          id: `${need.id}-${dateKey}`,
          andyId: need.andyId,
          needId: need.id,
          title: need.title,
          scheduledFor: dateKey,
          durationMinutes: null,
          status: "pending",
          weekKey,
        };
      });
    }

    if (need.type === "weekly_checkin") {
      return [
        {
          id: `${need.id}-${weekKey}`,
          andyId: need.andyId,
          needId: need.id,
          title: need.title,
          scheduledFor: weekKey,
          durationMinutes: null,
          status: "pending",
          weekKey,
        },
      ];
    }

    if (need.type === "one_off" && need.schedule.dueDateTime) {
      const dueDateKey = getDateKeyFromScheduledFor(need.schedule.dueDateTime);
      if (!dueDateKey || !weekDateKeys.has(dueDateKey)) return [];

      return [
        {
          id: `${need.id}-${need.schedule.dueDateTime}`,
          andyId: need.andyId,
          needId: need.id,
          title: need.title,
          scheduledFor: need.schedule.dueDateTime,
          durationMinutes:
            need.schedule.durationMinutes ?? need.durationMinutes ?? null,
          status: "pending",
          weekKey,
        },
      ];
    }

    return [];
  });
}
