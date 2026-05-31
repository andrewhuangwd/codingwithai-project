import { describe, expect, it } from "vitest";
import { getCurrentWeekDates, getDateKey, getMondayWeekKey } from "@/lib/dates";

describe("date helpers", () => {
  it("formats local date keys", () => {
    expect(getDateKey(new Date(2026, 4, 31, 10))).toBe("2026-05-31");
  });

  it("uses Monday week starts", () => {
    expect(getMondayWeekKey(new Date(2026, 4, 31, 10))).toBe(
      "week-2026-05-25",
    );
    expect(getMondayWeekKey(new Date(2026, 5, 1, 10))).toBe(
      "week-2026-06-01",
    );
  });

  it("uses collision-free Monday date keys across year boundaries", () => {
    expect(getMondayWeekKey(new Date(2024, 0, 1, 10))).toBe("week-2024-01-01");
    expect(getMondayWeekKey(new Date(2024, 11, 31, 10))).toBe(
      "week-2024-12-30",
    );
  });

  it("returns the browser-local dates for the current Monday-start week", () => {
    expect(
      getCurrentWeekDates(new Date(2026, 5, 3, 12)).map(getDateKey),
    ).toEqual([
      "2026-06-01",
      "2026-06-02",
      "2026-06-03",
      "2026-06-04",
      "2026-06-05",
      "2026-06-06",
      "2026-06-07",
    ]);
  });
});
