import { describe, expect, it } from "vitest";
import { generateCurrentWeekInstances } from "@/lib/needInstances";
import type { Need } from "@/lib/types";

describe("generateCurrentWeekInstances", () => {
  it("creates scheduled instances for matching weekdays", () => {
    const needs: Need[] = [
      {
        id: "need-1",
        andyId: "andy-1",
        title: "Run",
        type: "scheduled_recurring",
        schedule: {
          weekdays: [1, 3, 5],
          startTime: "07:00",
          durationMinutes: 30,
        },
        active: true,
      },
    ];

    const instances = generateCurrentWeekInstances(
      needs,
      new Date(2026, 5, 3, 12),
    );

    expect(instances).toHaveLength(3);
    expect(instances.map((instance) => instance.title)).toEqual([
      "Run",
      "Run",
      "Run",
    ]);
    expect(instances.map((instance) => instance.scheduledFor)).toEqual([
      "2026-06-01T07:00",
      "2026-06-03T07:00",
      "2026-06-05T07:00",
    ]);
    expect(instances.every((instance) => instance.status === "pending")).toBe(
      true,
    );
  });

  it("creates daily check-ins for every date in the current week", () => {
    const needs: Need[] = [
      {
        id: "need-2",
        andyId: "andy-1",
        title: "Spend under $100",
        type: "daily_checkin",
        schedule: {},
        active: true,
      },
    ];

    const instances = generateCurrentWeekInstances(
      needs,
      new Date(2026, 5, 3, 12),
    );

    expect(instances).toHaveLength(7);
    expect(instances.map((instance) => instance.scheduledFor)).toEqual([
      "2026-06-01",
      "2026-06-02",
      "2026-06-03",
      "2026-06-04",
      "2026-06-05",
      "2026-06-06",
      "2026-06-07",
    ]);
    expect(instances.every((instance) => instance.status === "pending")).toBe(
      true,
    );
  });

  it("creates one weekly check-in for the current Monday-start week", () => {
    const needs: Need[] = [
      {
        id: "need-3",
        andyId: "andy-1",
        title: "Call parents",
        type: "weekly_checkin",
        schedule: {},
        active: true,
      },
    ];

    const instances = generateCurrentWeekInstances(
      needs,
      new Date(2026, 5, 3, 12),
    );

    expect(instances).toHaveLength(1);
    expect(instances[0]).toMatchObject({
      id: "need-3-week-2026-06-01",
      scheduledFor: "week-2026-06-01",
      weekKey: "week-2026-06-01",
    });
  });

  it("only creates one-off tasks due inside the current week", () => {
    const needs: Need[] = [
      {
        id: "need-4",
        andyId: "andy-1",
        title: "Book checkup",
        type: "one_off",
        schedule: { dueDateTime: "2026-06-06T09:30", durationMinutes: 20 },
        active: true,
      },
      {
        id: "need-5",
        andyId: "andy-1",
        title: "Later errand",
        type: "one_off",
        schedule: { dueDateTime: "2026-06-12T09:30" },
        active: true,
      },
    ];

    const instances = generateCurrentWeekInstances(
      needs,
      new Date(2026, 5, 3, 12),
    );

    expect(instances).toHaveLength(1);
    expect(instances[0]).toMatchObject({
      id: "need-4-2026-06-06T09:30",
      durationMinutes: 20,
      scheduledFor: "2026-06-06T09:30",
    });
  });

  it("requires scheduled recurring needs to include a full schedule shape", () => {
    // @ts-expect-error Scheduled recurring needs require weekdays, startTime, and durationMinutes.
    const invalidScheduledNeed: Need = {
      id: "need-invalid",
      andyId: "andy-1",
      title: "Run",
      type: "scheduled_recurring",
      schedule: {},
      active: true,
    };

    expect(invalidScheduledNeed.type).toBe("scheduled_recurring");
  });
});
