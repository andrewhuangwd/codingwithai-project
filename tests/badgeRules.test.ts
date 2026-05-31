import { describe, expect, it } from "vitest";
import { getBadgeAwardsForEvent } from "@/lib/badgeRules";
import type { NeedInstance } from "@/lib/types";

const baseInstance: NeedInstance = {
  id: "instance-1",
  andyId: "andy-1",
  needId: "need-1",
  title: "Run",
  scheduledFor: "2026-06-01T07:00",
  durationMinutes: 30,
  status: "completed",
  weekKey: "week-2026-06-01",
};

describe("getBadgeAwardsForEvent", () => {
  it("awards First Care for the first completion", () => {
    const awards = getBadgeAwardsForEvent({
      completedInstance: baseInstance,
      allInstancesForAndy: [baseInstance],
      existingBadgeTypes: [],
    });

    expect(awards).toContain("first_care");
  });

  it("does not award already-owned badges", () => {
    const awards = getBadgeAwardsForEvent({
      completedInstance: baseInstance,
      allInstancesForAndy: [baseInstance],
      existingBadgeTypes: ["first_care"],
    });

    expect(awards).not.toContain("first_care");
  });

  it("awards 3-Day Streak across three consecutive calendar days", () => {
    const awards = getBadgeAwardsForEvent({
      completedInstance: {
        ...baseInstance,
        id: "instance-3",
        needId: "need-3",
        scheduledFor: "2026-06-03",
      },
      allInstancesForAndy: [
        { ...baseInstance, id: "instance-1", scheduledFor: "2026-06-01" },
        {
          ...baseInstance,
          id: "instance-2",
          needId: "need-2",
          scheduledFor: "2026-06-02",
        },
        {
          ...baseInstance,
          id: "instance-3",
          needId: "need-3",
          scheduledFor: "2026-06-03",
        },
      ],
      existingBadgeTypes: [],
    });

    expect(awards).toContain("three_day_streak");
  });

  it("ignores weekly check-in keys when calculating 3-Day Streak", () => {
    const awards = getBadgeAwardsForEvent({
      completedInstance: {
        ...baseInstance,
        id: "instance-3",
        needId: "need-3",
        scheduledFor: "2026-06-03",
      },
      allInstancesForAndy: [
        { ...baseInstance, id: "instance-1", scheduledFor: "2026-06-01" },
        {
          ...baseInstance,
          id: "instance-2",
          needId: "need-2",
          scheduledFor: "2026-06-02",
        },
        {
          ...baseInstance,
          id: "weekly-1",
          needId: "weekly-need",
          scheduledFor: "week-2026-06-01",
        },
        {
          ...baseInstance,
          id: "instance-3",
          needId: "need-3",
          scheduledFor: "2026-06-03",
        },
      ],
      existingBadgeTypes: [],
    });

    expect(awards).toContain("three_day_streak");
  });

  it("awards 3-Day Streak across a DST boundary", () => {
    const awards = getBadgeAwardsForEvent({
      completedInstance: {
        ...baseInstance,
        id: "dst-3",
        needId: "need-3",
        scheduledFor: "2025-03-10",
        weekKey: "week-2025-03-10",
      },
      allInstancesForAndy: [
        {
          ...baseInstance,
          id: "dst-1",
          scheduledFor: "2025-03-08",
          weekKey: "week-2025-03-03",
        },
        {
          ...baseInstance,
          id: "dst-2",
          needId: "need-2",
          scheduledFor: "2025-03-09",
          weekKey: "week-2025-03-03",
        },
        {
          ...baseInstance,
          id: "dst-3",
          needId: "need-3",
          scheduledFor: "2025-03-10",
          weekKey: "week-2025-03-10",
        },
      ],
      existingBadgeTypes: [],
    });

    expect(awards).toContain("three_day_streak");
  });

  it("awards 3 in a Row for three completed instances of one Need", () => {
    const awards = getBadgeAwardsForEvent({
      completedInstance: {
        ...baseInstance,
        id: "instance-3",
        scheduledFor: "2026-06-05T07:00",
      },
      allInstancesForAndy: [
        { ...baseInstance, id: "instance-1", scheduledFor: "2026-06-01T07:00" },
        { ...baseInstance, id: "instance-2", scheduledFor: "2026-06-03T07:00" },
        { ...baseInstance, id: "instance-3", scheduledFor: "2026-06-05T07:00" },
      ],
      existingBadgeTypes: [],
    });

    expect(awards).toContain("three_in_a_row");
  });

  it("awards Perfect Week when every current-week instance is completed", () => {
    const awards = getBadgeAwardsForEvent({
      completedInstance: {
        ...baseInstance,
        id: "instance-2",
        scheduledFor: "2026-06-02",
      },
      allInstancesForAndy: [
        { ...baseInstance, id: "instance-1", scheduledFor: "2026-06-01" },
        { ...baseInstance, id: "instance-2", scheduledFor: "2026-06-02" },
      ],
      existingBadgeTypes: [],
    });

    expect(awards).toContain("perfect_week");
  });

  it("awards Comeback after a previous miss", () => {
    const awards = getBadgeAwardsForEvent({
      completedInstance: baseInstance,
      allInstancesForAndy: [
        {
          ...baseInstance,
          id: "missed-1",
          scheduledFor: "2026-05-31",
          status: "missed",
        },
        baseInstance,
      ],
      existingBadgeTypes: [],
    });

    expect(awards).toContain("comeback");
  });

  it("does not award Comeback when the only miss is after the completed event", () => {
    const awards = getBadgeAwardsForEvent({
      completedInstance: {
        ...baseInstance,
        id: "completed-1",
        scheduledFor: "2026-06-01",
      },
      allInstancesForAndy: [
        {
          ...baseInstance,
          id: "completed-1",
          scheduledFor: "2026-06-01",
        },
        {
          ...baseInstance,
          id: "future-missed-1",
          scheduledFor: "2026-06-02",
          status: "missed",
        },
      ],
      existingBadgeTypes: [],
    });

    expect(awards).not.toContain("comeback");
  });
});
