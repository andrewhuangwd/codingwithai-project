import { describe, expect, it } from "vitest";
import {
  hasExistingHpEvent,
  shouldPrunePendingInstanceForNeed,
} from "@/lib/convexCore";

describe("shouldPrunePendingInstanceForNeed", () => {
  it("only prunes pending instances for the updated Need", () => {
    expect(
      shouldPrunePendingInstanceForNeed({
        instanceNeedId: "need-1",
        instanceStatus: "pending",
        updatedNeedId: "need-1",
      }),
    ).toBe(true);

    expect(
      shouldPrunePendingInstanceForNeed({
        instanceNeedId: "need-1",
        instanceStatus: "completed",
        updatedNeedId: "need-1",
      }),
    ).toBe(false);

    expect(
      shouldPrunePendingInstanceForNeed({
        instanceNeedId: "need-2",
        instanceStatus: "pending",
        updatedNeedId: "need-1",
      }),
    ).toBe(false);
  });
});

describe("hasExistingHpEvent", () => {
  it("matches by instance id and reason", () => {
    expect(
      hasExistingHpEvent(
        [
          { needInstanceId: "instance-1", reason: "completed_need" },
          { needInstanceId: "instance-2", reason: "missed_need" },
        ],
        "instance-1",
        "completed_need",
      ),
    ).toBe(true);

    expect(
      hasExistingHpEvent(
        [{ needInstanceId: "instance-1", reason: "missed_need" }],
        "instance-1",
        "completed_need",
      ),
    ).toBe(false);
  });
});
