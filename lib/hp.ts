export type HpState =
  | "dead"
  | "dreadful"
  | "poor"
  | "normal"
  | "healthy"
  | "very_healthy"
  | "powered_up";

export function applyHpDelta(currentHp: number, delta: number): number {
  return Math.max(0, Math.min(100, currentHp + delta));
}

export function getHpState(hp: number): HpState {
  if (hp <= 0) return "dead";
  if (hp < 10) return "dreadful";
  if (hp < 25) return "poor";
  if (hp === 100) return "powered_up";
  if (hp >= 90) return "very_healthy";
  if (hp >= 75) return "healthy";
  return "normal";
}
