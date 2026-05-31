import { describe, expect, it } from "vitest";
import { applyHpDelta, getHpState } from "@/lib/hp";

describe("applyHpDelta", () => {
  it("adds HP and caps at 100", () => {
    expect(applyHpDelta(98, 5)).toBe(100);
  });

  it("subtracts HP and floors at 0", () => {
    expect(applyHpDelta(2, -5)).toBe(0);
  });
});

describe("getHpState", () => {
  it("maps HP to visual states", () => {
    expect(getHpState(0)).toBe("dead");
    expect(getHpState(9)).toBe("dreadful");
    expect(getHpState(24)).toBe("poor");
    expect(getHpState(50)).toBe("normal");
    expect(getHpState(80)).toBe("healthy");
    expect(getHpState(95)).toBe("very_healthy");
    expect(getHpState(100)).toBe("powered_up");
  });
});
