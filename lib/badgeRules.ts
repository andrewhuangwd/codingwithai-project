import { differenceInCalendarDays } from "date-fns";
import { getDateKeyFromScheduledFor } from "./dates";
import type { BadgeType, NeedInstance } from "./types";

type BadgeRuleInput = {
  completedInstance: NeedInstance;
  allInstancesForAndy: NeedInstance[];
  existingBadgeTypes: BadgeType[];
};

type BadgeRule = {
  badgeType: BadgeType;
  matches: (input: BadgeRuleInput) => boolean;
};

export function getBadgeAwardsForEvent(input: BadgeRuleInput): BadgeType[] {
  return badgeRules
    .filter((rule) => !input.existingBadgeTypes.includes(rule.badgeType))
    .filter((rule) => rule.matches(input))
    .map((rule) => rule.badgeType);
}

const badgeRules: BadgeRule[] = [
  {
    badgeType: "first_care",
    matches: ({ allInstancesForAndy }) =>
      allInstancesForAndy.filter(isCompleted).length === 1,
  },
  {
    badgeType: "three_day_streak",
    matches: ({ allInstancesForAndy }) =>
      hasConsecutiveCompletedDays(allInstancesForAndy, 3),
  },
  {
    badgeType: "three_in_a_row",
    matches: ({ completedInstance, allInstancesForAndy }) =>
      hasThreeCompletedNeedInstancesInARow(
        completedInstance,
        allInstancesForAndy,
      ),
  },
  {
    badgeType: "perfect_week",
    matches: ({ completedInstance, allInstancesForAndy }) =>
      hasPerfectWeek(completedInstance, allInstancesForAndy),
  },
  {
    badgeType: "comeback",
    matches: ({ completedInstance, allInstancesForAndy }) =>
      hasPriorMiss(completedInstance, allInstancesForAndy),
  },
];

function isCompleted(instance: NeedInstance): boolean {
  return instance.status === "completed";
}

function hasConsecutiveCompletedDays(
  instances: NeedInstance[],
  requiredDays: number,
): boolean {
  const completedDayTimes = Array.from(
    new Set(
      instances
        .filter(isCompleted)
        .map((instance) => getDateKeyFromScheduledFor(instance.scheduledFor))
        .filter(isCalendarDateKey)
        .map(parseCalendarDateKey)
        .map((date) => date.getTime()),
    ),
  )
    .map((time) => new Date(time))
    .sort((a, b) => a.getTime() - b.getTime());

  let streak = 1;
  for (let index = 1; index < completedDayTimes.length; index += 1) {
    const daysBetween = differenceInCalendarDays(
      completedDayTimes[index],
      completedDayTimes[index - 1],
    );
    streak = daysBetween === 1 ? streak + 1 : 1;
    if (streak >= requiredDays) return true;
  }

  return completedDayTimes.length >= requiredDays && streak >= requiredDays;
}

function hasThreeCompletedNeedInstancesInARow(
  completedInstance: NeedInstance,
  allInstancesForAndy: NeedInstance[],
): boolean {
  const sameNeed = allInstancesForAndy
    .filter((instance) => instance.needId === completedInstance.needId)
    .sort(compareScheduledFor);
  const completedIndex = sameNeed.findIndex(
    (instance) => instance.id === completedInstance.id,
  );

  if (completedIndex < 2) return false;

  return sameNeed.slice(completedIndex - 2, completedIndex + 1).every(isCompleted);
}

function hasPerfectWeek(
  completedInstance: NeedInstance,
  allInstancesForAndy: NeedInstance[],
): boolean {
  const weekInstances = allInstancesForAndy.filter(
    (instance) => instance.weekKey === completedInstance.weekKey,
  );

  return (
    weekInstances.length > 0 &&
    weekInstances.every((instance) => instance.status === "completed")
  );
}

function compareScheduledFor(a: NeedInstance, b: NeedInstance): number {
  return String(a.scheduledFor).localeCompare(String(b.scheduledFor));
}

function isCalendarDateKey(dateKey: string | null): dateKey is string {
  return dateKey !== null && /^\d{4}-\d{2}-\d{2}$/.test(dateKey);
}

function parseCalendarDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function hasPriorMiss(
  completedInstance: NeedInstance,
  allInstancesForAndy: NeedInstance[],
): boolean {
  const completedOrder = getComparableScheduledFor(completedInstance);
  if (!completedOrder) return false;

  return allInstancesForAndy.some((instance) => {
    if (instance.status !== "missed") return false;
    const missedOrder = getComparableScheduledFor(instance);
    return missedOrder !== null && missedOrder < completedOrder;
  });
}

function getComparableScheduledFor(instance: NeedInstance): string | null {
  const dateKey = getDateKeyFromScheduledFor(instance.scheduledFor);
  if (!isCalendarDateKey(dateKey)) return null;
  return instance.scheduledFor;
}
