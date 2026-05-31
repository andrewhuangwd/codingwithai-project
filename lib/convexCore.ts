import type { NeedInstanceStatus } from "./types";

type PendingPruneInput = {
  instanceNeedId: string;
  instanceStatus: NeedInstanceStatus;
  updatedNeedId: string;
};

type HpEventLike = {
  needInstanceId: string;
  reason: string;
};

export function shouldPrunePendingInstanceForNeed(
  input: PendingPruneInput,
): boolean {
  return (
    input.instanceNeedId === input.updatedNeedId &&
    input.instanceStatus === "pending"
  );
}

export function hasExistingHpEvent(
  events: HpEventLike[],
  needInstanceId: string,
  reason: string,
): boolean {
  return events.some(
    (event) =>
      event.needInstanceId === needInstanceId && event.reason === reason,
  );
}
