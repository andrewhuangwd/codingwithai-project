# Andies MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Andies MVP from the approved PRD: first setup, AI onboarding, generated Andies/Needs, current-week Need instances, HP/badges, daily/weekly reflections, journal, and sprite/badge asset support.

**Architecture:** Use a small Next.js app for the UI, Convex for persistent data and backend functions, and server-side OpenAI calls for text and image generation. Keep the first implementation thin and end-to-end: every phase should leave the app runnable locally, with graceful fallbacks for missing image generation or AI errors.

**Tech Stack:** Next.js, React, TypeScript, Convex, OpenAI API, Zod, date-fns, Vitest, Testing Library, CSS modules/global CSS.

---

## Scope Check

The PRD covers multiple features, but they are one connected product loop rather than independent products. Implement in vertical slices:

1. Runnable app shell.
2. Persistent data model.
3. Setup and onboarding.
4. Andies/Needs review.
5. Need instances, HP, badges.
6. Reflections and journal.
7. Sprite generation and badge assets.
8. Deployment prep.

Do not add Google Calendar, Telegram, login/auth, free-form journaling, or full HP-state sprite sheets in this MVP.

## Package Approval Gate

Before running any package installation command, ask the user to approve this package set:

- Runtime: `next`, `react`, `react-dom`, `convex`, `openai`, `zod`, `date-fns`
- Dev/test: `typescript`, `eslint`, `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `@types/node`, `@types/react`, `@types/react-dom`

If the user does not approve all packages, update this plan before implementing.

## File Structure

Create this project structure:

```text
/Users/andrewhuang/Documents/avatar-tracker/
  app/
    layout.tsx
    page.tsx
    globals.css
    andy/[andyId]/page.tsx
    journal/page.tsx
    weekly-review/page.tsx
  components/
    AndyCard.tsx
    AndyEditor.tsx
    BadgeImage.tsx
    DailyReflectionPanel.tsx
    EmptyState.tsx
    HomeDashboard.tsx
    NameSetupForm.tsx
    NeedEditor.tsx
    OnboardingDiagnostic.tsx
    PixelSprite.tsx
    TodayPanel.tsx
  convex/
    schema.ts
    users.ts
    onboarding.ts
    andies.ts
    needs.ts
    instances.ts
    badges.ts
    reflections.ts
    ai.ts
    seed.ts
    _generated/
  lib/
    aiSchemas.ts
    badgeRules.ts
    constants.ts
    dates.ts
    hp.ts
    needInstances.ts
    sprites.ts
    types.ts
  public/
    badges/
      first-care.svg
      three-day-streak.svg
      three-in-a-row.svg
      perfect-week.svg
      comeback.svg
    sprites/
      fallback-fitness.svg
      fallback-career.svg
      fallback-intellect.svg
      fallback-relationships.svg
      fallback-money.svg
      fallback-creativity.svg
      fallback-spirituality.svg
      fallback-general.svg
  tests/
    badgeRules.test.ts
    dates.test.ts
    hp.test.ts
    needInstances.test.ts
  .env.example
  .gitignore
  convex.json
  eslint.config.mjs
  next.config.ts
  package.json
  tsconfig.json
  vitest.config.ts
```

Responsibility boundaries:

- `lib/`: deterministic logic that can be tested without React or Convex.
- `convex/`: database schema, mutations, queries, actions, and OpenAI calls.
- `components/`: UI components with no direct OpenAI calls.
- `app/`: route composition only.
- `public/`: static MVP badge and fallback sprite assets.

## Task 1: Scaffold Project And Tooling

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `eslint.config.mjs`
- Create: `vitest.config.ts`
- Create: `.gitignore`
- Create: `.env.example`
- Create: `app/layout.tsx`
- Create: `app/page.tsx`
- Create: `app/globals.css`

- [ ] **Step 1: Ask package approval**

Ask:

```text
May I install the Andies MVP package set: next, react, react-dom, convex, openai, zod, date-fns, vitest, jsdom, Testing Library, TypeScript, ESLint, and React/Node types?
```

- [ ] **Step 2: Initialize npm project after approval**

Run:

```bash
npm init -y
```

Expected: `package.json` exists.

- [ ] **Step 3: Install approved packages**

Run:

```bash
npm install next react react-dom convex openai zod date-fns
npm install -D typescript eslint vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @types/node @types/react @types/react-dom
```

Expected: `node_modules/`, `package-lock.json`, and dependencies are created.

- [ ] **Step 4: Replace `package.json` scripts**

Edit `package.json` to include:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint app --ext .ts,.tsx --no-error-on-unmatched-pattern",
    "test": "vitest run --passWithNoTests",
    "test:watch": "vitest"
  }
}
```

Preserve dependency versions installed by npm.

- [ ] **Step 5: Add TypeScript config**

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "es2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts", ".next/dev/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 6: Add app shell files**

Create `app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Andies",
  description: "Care for your life-dimension Andies.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

Create `app/page.tsx`:

```tsx
export default function HomePage() {
  return (
    <main className="appShell">
      <section className="panel">
        <p className="eyebrow">Andies MVP</p>
        <h1>Care for the versions of yourself you want to grow.</h1>
        <p>Project shell is running. The setup flow comes next.</p>
      </section>
    </main>
  );
}
```

Create `app/globals.css`:

```css
:root {
  color-scheme: light;
  --ink: #243040;
  --paper: #fff8df;
  --field: #d7eadb;
  --accent: #2f7d65;
  --border: #273043;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: var(--field);
  color: var(--ink);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
}

button,
input,
textarea,
select {
  font: inherit;
}

.appShell {
  min-height: 100vh;
  padding: 32px;
}

.panel {
  max-width: 960px;
  margin: 0 auto;
  background: var(--paper);
  border: 4px solid var(--border);
  box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.45) inset;
  padding: 24px;
}

.eyebrow {
  margin: 0 0 8px;
  color: var(--accent);
  font-size: 12px;
  text-transform: uppercase;
}
```

- [ ] **Step 7: Configure Vitest**

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: [],
  },
});
```

- [ ] **Step 8: Add environment example**

Create `.env.example`:

```bash
OPENAI_API_KEY=
NEXT_PUBLIC_CONVEX_URL=
CONVEX_DEPLOYMENT=
```

- [ ] **Step 9: Add gitignore**

Create `.gitignore`:

```gitignore
.DS_Store
.env
.env.local
.next/
node_modules/
coverage/
dist/
.superpowers/brainstorm/
```

- [ ] **Step 10: Verify shell**

Run:

```bash
npm run test
npm run build
```

Expected: tests pass with no tests found or pass status; build succeeds. Next 16 does not provide `next lint`, so the initial scaffold lints `app` with `eslint app --ext .ts,.tsx --no-error-on-unmatched-pattern`. Later tasks should expand this script once `components`, `convex`, `lib`, and `tests` exist. Next 16 also rewrites TypeScript config to use `jsx: react-jsx` and include `.next/dev/types/**/*.ts`; those generated framework defaults are accepted for this project.

## Task 2: Deterministic Domain Logic

**Files:**
- Create: `lib/constants.ts`
- Create: `lib/types.ts`
- Create: `lib/hp.ts`
- Create: `lib/dates.ts`
- Create: `lib/needInstances.ts`
- Create: `lib/badgeRules.ts`
- Test: `tests/hp.test.ts`
- Test: `tests/dates.test.ts`
- Test: `tests/needInstances.test.ts`
- Test: `tests/badgeRules.test.ts`

- [ ] **Step 1: Add shared constants and types**

Create `lib/constants.ts`:

```ts
export const DEFAULT_USER_ID = "default-user";
export const DEFAULT_HP = 50;
export const HP_DELTA = 5;
export const MAX_ANDIES = 3;
export const MAX_NEEDS_PER_ANDY = 3;

export const DIMENSIONS = [
  "Fitness",
  "Career",
  "Intellect",
  "Relationships",
  "Money",
  "Creativity",
  "Spirituality",
  "General",
] as const;
```

Create `lib/types.ts`:

```ts
import type { DIMENSIONS } from "./constants";

export type Dimension = (typeof DIMENSIONS)[number];
export type NeedType = "scheduled_recurring" | "daily_checkin" | "weekly_checkin" | "one_off";
export type NeedInstanceStatus = "pending" | "completed" | "missed";
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type NeedSchedule = {
  weekdays?: Weekday[];
  startTime?: string;
  durationMinutes?: number;
  dueDateTime?: string;
};

export type Need = {
  id: string;
  andyId: string;
  title: string;
  type: NeedType;
  schedule: NeedSchedule;
  durationMinutes?: number;
  active: boolean;
};

export type NeedInstance = {
  id: string;
  andyId: string;
  needId: string;
  title: string;
  scheduledFor: string | null;
  durationMinutes: number | null;
  status: NeedInstanceStatus;
  weekKey: string;
};

export type BadgeType =
  | "first_care"
  | "three_day_streak"
  | "three_in_a_row"
  | "perfect_week"
  | "comeback";
```

- [ ] **Step 2: Write HP tests**

Create `tests/hp.test.ts`:

```ts
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
```

- [ ] **Step 3: Run HP tests and verify failure**

Run:

```bash
npm run test -- tests/hp.test.ts
```

Expected: fails because `lib/hp.ts` does not exist.

- [ ] **Step 4: Implement HP logic**

Create `lib/hp.ts`:

```ts
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
```

- [ ] **Step 5: Add date and instance tests**

Create `tests/dates.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { getDateKey, getMondayWeekKey } from "@/lib/dates";

describe("date helpers", () => {
  it("formats local date keys", () => {
    expect(getDateKey(new Date("2026-05-31T10:00:00+08:00"))).toBe("2026-05-31");
  });

  it("uses Monday week starts", () => {
    expect(getMondayWeekKey(new Date("2026-05-31T10:00:00+08:00"))).toBe("2026-W22");
    expect(getMondayWeekKey(new Date("2026-06-01T10:00:00+08:00"))).toBe("2026-W23");
  });
});
```

Create `tests/needInstances.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { generateCurrentWeekInstances } from "@/lib/needInstances";
import type { Need } from "@/lib/types";

describe("generateCurrentWeekInstances", () => {
  it("creates scheduled instances for matching weekdays", () => {
    const needs: Need[] = [{
      id: "need-1",
      andyId: "andy-1",
      title: "Run",
      type: "scheduled_recurring",
      schedule: { weekdays: [1, 3, 5], startTime: "07:00", durationMinutes: 30 },
      active: true,
    }];

    const instances = generateCurrentWeekInstances(needs, new Date("2026-06-03T12:00:00+08:00"));

    expect(instances).toHaveLength(3);
    expect(instances.map((instance) => instance.title)).toEqual(["Run", "Run", "Run"]);
    expect(instances.every((instance) => instance.status === "pending")).toBe(true);
  });

  it("creates one daily check-in for today", () => {
    const needs: Need[] = [{
      id: "need-2",
      andyId: "andy-1",
      title: "Spend under $100",
      type: "daily_checkin",
      schedule: {},
      active: true,
    }];

    const instances = generateCurrentWeekInstances(needs, new Date("2026-06-03T12:00:00+08:00"));

    expect(instances).toHaveLength(1);
    expect(instances[0].scheduledFor).toBe("2026-06-03");
  });
});
```

- [ ] **Step 6: Implement dates and Need instance generation**

Create `lib/dates.ts`:

```ts
import { format, getISOWeek, startOfWeek } from "date-fns";

export function getDateKey(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function getMondayWeekKey(date: Date): string {
  const monday = startOfWeek(date, { weekStartsOn: 1 });
  return `${format(monday, "yyyy")}-W${String(getISOWeek(monday)).padStart(2, "0")}`;
}

export function getCurrentWeekDates(anchorDate: Date): Date[] {
  const monday = startOfWeek(anchorDate, { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, index) => {
    const next = new Date(monday);
    next.setDate(monday.getDate() + index);
    return next;
  });
}
```

Create `lib/needInstances.ts`:

```ts
import { getCurrentWeekDates, getDateKey, getMondayWeekKey } from "./dates";
import type { Need, NeedInstance } from "./types";

export function generateCurrentWeekInstances(needs: Need[], anchorDate: Date): NeedInstance[] {
  const weekKey = getMondayWeekKey(anchorDate);
  const todayKey = getDateKey(anchorDate);
  const weekDates = getCurrentWeekDates(anchorDate);

  return needs.flatMap((need) => {
    if (!need.active) return [];

    if (need.type === "scheduled_recurring") {
      const weekdays = need.schedule.weekdays ?? [];
      return weekDates
        .filter((date) => weekdays.includes(date.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6))
        .map((date) => ({
          id: `${need.id}-${getDateKey(date)}-${need.schedule.startTime ?? "anytime"}`,
          andyId: need.andyId,
          needId: need.id,
          title: need.title,
          scheduledFor: `${getDateKey(date)}T${need.schedule.startTime ?? "00:00"}`,
          durationMinutes: need.schedule.durationMinutes ?? need.durationMinutes ?? null,
          status: "pending" as const,
          weekKey,
        }));
    }

    if (need.type === "daily_checkin") {
      return [{
        id: `${need.id}-${todayKey}`,
        andyId: need.andyId,
        needId: need.id,
        title: need.title,
        scheduledFor: todayKey,
        durationMinutes: null,
        status: "pending" as const,
        weekKey,
      }];
    }

    if (need.type === "weekly_checkin") {
      return [{
        id: `${need.id}-${weekKey}`,
        andyId: need.andyId,
        needId: need.id,
        title: need.title,
        scheduledFor: weekKey,
        durationMinutes: null,
        status: "pending" as const,
        weekKey,
      }];
    }

    if (need.type === "one_off" && need.schedule.dueDateTime) {
      return [{
        id: `${need.id}-${need.schedule.dueDateTime}`,
        andyId: need.andyId,
        needId: need.id,
        title: need.title,
        scheduledFor: need.schedule.dueDateTime,
        durationMinutes: need.schedule.durationMinutes ?? need.durationMinutes ?? null,
        status: "pending" as const,
        weekKey,
      }];
    }

    return [];
  });
}
```

- [ ] **Step 7: Add badge rule tests**

Create `tests/badgeRules.test.ts`:

```ts
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
  weekKey: "2026-W23",
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

  it("awards 3 in a Row for three completed instances of one Need", () => {
    const awards = getBadgeAwardsForEvent({
      completedInstance: { ...baseInstance, id: "instance-3", scheduledFor: "2026-06-05T07:00" },
      allInstancesForAndy: [
        { ...baseInstance, id: "instance-1", scheduledFor: "2026-06-01T07:00" },
        { ...baseInstance, id: "instance-2", scheduledFor: "2026-06-03T07:00" },
        { ...baseInstance, id: "instance-3", scheduledFor: "2026-06-05T07:00" },
      ],
      existingBadgeTypes: [],
    });

    expect(awards).toContain("three_in_a_row");
  });
});
```

- [ ] **Step 8: Implement simple badge rules**

Create `lib/badgeRules.ts`:

```ts
import type { BadgeType, NeedInstance } from "./types";

type BadgeRuleInput = {
  completedInstance: NeedInstance;
  allInstancesForAndy: NeedInstance[];
  existingBadgeTypes: BadgeType[];
};

export function getBadgeAwardsForEvent(input: BadgeRuleInput): BadgeType[] {
  const awards: BadgeType[] = [];
  const completed = input.allInstancesForAndy.filter((instance) => instance.status === "completed");

  if (!input.existingBadgeTypes.includes("first_care") && completed.length === 1) {
    awards.push("first_care");
  }

  const completedForSameNeed = completed
    .filter((instance) => instance.needId === input.completedInstance.needId)
    .sort((a, b) => String(a.scheduledFor).localeCompare(String(b.scheduledFor)));

  if (
    !input.existingBadgeTypes.includes("three_in_a_row") &&
    completedForSameNeed.length >= 3
  ) {
    awards.push("three_in_a_row");
  }

  if (!input.existingBadgeTypes.includes("comeback")) {
    const hadMiss = input.allInstancesForAndy.some((instance) => instance.status === "missed");
    if (hadMiss) awards.push("comeback");
  }

  return awards;
}
```

- [ ] **Step 9: Verify deterministic tests**

Run:

```bash
npm run test -- tests/hp.test.ts tests/dates.test.ts tests/needInstances.test.ts tests/badgeRules.test.ts
```

Expected: all tests pass.

## Task 3: Convex Schema And Core Mutations

**Files:**
- Create: `convex/schema.ts`
- Create: `convex/users.ts`
- Create: `convex/andies.ts`
- Create: `convex/needs.ts`
- Create: `convex/instances.ts`
- Create: `convex/badges.ts`
- Create: `convex/reflections.ts`
- Create: `convex.json`

- [ ] **Step 1: Initialize Convex**

Run:

```bash
npx convex dev --once
```

Expected: Convex creates generated files and asks for project setup if not configured. Follow prompts to create a development project.

- [ ] **Step 2: Add Convex schema**

Create `convex/schema.ts`:

```ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    singularName: v.string(),
    pluralName: v.string(),
    profilePhotoStatus: v.union(v.literal("none"), v.literal("uploaded"), v.literal("deleted")),
    createdAt: v.number(),
  }),
  dayZeroProfiles: defineTable({
    userId: v.id("users"),
    rawAnswers: v.any(),
    clarifyingAnswers: v.array(v.any()),
    summary: v.string(),
    extractedDimensions: v.array(v.string()),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),
  andies: defineTable({
    userId: v.id("users"),
    name: v.string(),
    dimension: v.string(),
    hp: v.number(),
    spriteKey: v.string(),
    spriteUrl: v.optional(v.string()),
    spriteGenerationStatus: v.union(v.literal("fallback"), v.literal("pending"), v.literal("generated"), v.literal("failed")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),
  needs: defineTable({
    userId: v.id("users"),
    andyId: v.id("andies"),
    title: v.string(),
    type: v.union(v.literal("scheduled_recurring"), v.literal("daily_checkin"), v.literal("weekly_checkin"), v.literal("one_off")),
    schedule: v.any(),
    durationMinutes: v.optional(v.number()),
    dueDateTime: v.optional(v.string()),
    active: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_andy", ["andyId"]).index("by_user", ["userId"]),
  needInstances: defineTable({
    userId: v.id("users"),
    andyId: v.id("andies"),
    needId: v.id("needs"),
    title: v.string(),
    scheduledFor: v.optional(v.string()),
    durationMinutes: v.optional(v.number()),
    status: v.union(v.literal("pending"), v.literal("completed"), v.literal("missed")),
    completedAt: v.optional(v.number()),
    missedAt: v.optional(v.number()),
    weekKey: v.string(),
    createdAt: v.number(),
  }).index("by_user_week", ["userId", "weekKey"]).index("by_andy", ["andyId"]),
  hpEvents: defineTable({
    userId: v.id("users"),
    andyId: v.id("andies"),
    needInstanceId: v.id("needInstances"),
    delta: v.number(),
    hpBefore: v.number(),
    hpAfter: v.number(),
    reason: v.string(),
    createdAt: v.number(),
  }).index("by_andy", ["andyId"]),
  badges: defineTable({
    userId: v.id("users"),
    andyId: v.id("andies"),
    badgeType: v.string(),
    title: v.string(),
    description: v.string(),
    awardedAt: v.number(),
    relatedNeedId: v.optional(v.id("needs")),
    relatedNeedInstanceId: v.optional(v.id("needInstances")),
  }).index("by_andy", ["andyId"]).index("by_user", ["userId"]),
  reflections: defineTable({
    userId: v.id("users"),
    type: v.union(v.literal("daily"), v.literal("weekly")),
    dateKey: v.optional(v.string()),
    weekKey: v.optional(v.string()),
    questions: v.array(v.string()),
    answers: v.array(v.string()),
    aiSummary: v.string(),
    patternNotes: v.string(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),
});
```

- [ ] **Step 3: Add user setup functions**

Create `convex/users.ts`:

```ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getFirstUser = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").first();
  },
});

export const createFirstUser = mutation({
  args: {
    singularName: v.string(),
    pluralName: v.string(),
    hasProfilePhoto: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("users").first();
    if (existing) return existing._id;

    return await ctx.db.insert("users", {
      singularName: args.singularName.trim(),
      pluralName: args.pluralName.trim(),
      profilePhotoStatus: args.hasProfilePhoto ? "uploaded" : "none",
      createdAt: Date.now(),
    });
  },
});
```

- [ ] **Step 4: Add Andies and Needs mutations**

Create `convex/andies.ts` and `convex/needs.ts` with create/list/update mutations for the fields in schema. Use `v.id("users")`, `v.id("andies")`, and exact schema fields.

- [ ] **Step 5: Add instance status mutation**

Create `convex/instances.ts` with:

- `listToday`
- `listByWeek`
- `createManyForWeek`
- `markCompleted`
- `markMissed`

`markCompleted` and `markMissed` must:

1. Read instance.
2. Skip if already completed/missed.
3. Read related Andy.
4. Apply `+5` or `-5`.
5. Patch Andy HP.
6. Patch instance status.
7. Insert HP event.
8. Call badge award helper mutation or duplicate simple rule logic initially.

- [ ] **Step 6: Run Convex codegen**

Run:

```bash
npx convex dev --once
```

Expected: schema compiles and generated types update.

## Task 4: Static Assets For Sprites And Badges

**Files:**
- Create: `public/sprites/fallback-fitness.svg`
- Create: `public/sprites/fallback-career.svg`
- Create: `public/sprites/fallback-intellect.svg`
- Create: `public/sprites/fallback-relationships.svg`
- Create: `public/sprites/fallback-money.svg`
- Create: `public/sprites/fallback-creativity.svg`
- Create: `public/sprites/fallback-spirituality.svg`
- Create: `public/sprites/fallback-general.svg`
- Create: `public/badges/first-care.svg`
- Create: `public/badges/three-day-streak.svg`
- Create: `public/badges/three-in-a-row.svg`
- Create: `public/badges/perfect-week.svg`
- Create: `public/badges/comeback.svg`
- Create: `lib/sprites.ts`

- [ ] **Step 1: Create simple fallback sprite SVGs**

Create SVGs using blocky 16-bit-inspired shapes. Keep each file under 80 lines. Use distinct colors per dimension.

Example for `public/sprites/fallback-fitness.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" shape-rendering="crispEdges">
  <rect width="96" height="96" fill="#bfe5cf"/>
  <rect x="34" y="12" width="28" height="18" fill="#f2c38b"/>
  <rect x="28" y="30" width="40" height="32" fill="#3b82f6"/>
  <rect x="18" y="34" width="12" height="26" fill="#f2c38b"/>
  <rect x="66" y="34" width="12" height="26" fill="#f2c38b"/>
  <rect x="32" y="62" width="12" height="22" fill="#1f2937"/>
  <rect x="52" y="62" width="12" height="22" fill="#1f2937"/>
  <rect x="28" y="84" width="16" height="6" fill="#111827"/>
  <rect x="52" y="84" width="16" height="6" fill="#111827"/>
</svg>
```

- [ ] **Step 2: Create static badge SVGs**

Create each badge as a pixel-art medal with distinct symbol:

- `first-care.svg`: heart in medal.
- `three-day-streak.svg`: three small suns.
- `three-in-a-row.svg`: three connected blocks.
- `perfect-week.svg`: seven-star ribbon.
- `comeback.svg`: upward arrow from crack.

- [ ] **Step 3: Add sprite mapping**

Create `lib/sprites.ts`:

```ts
import type { Dimension } from "./types";

export function getFallbackSpritePath(dimension: string): string {
  const normalized = dimension.toLowerCase();
  if (normalized.includes("fitness")) return "/sprites/fallback-fitness.svg";
  if (normalized.includes("career")) return "/sprites/fallback-career.svg";
  if (normalized.includes("intellect")) return "/sprites/fallback-intellect.svg";
  if (normalized.includes("relationship")) return "/sprites/fallback-relationships.svg";
  if (normalized.includes("money")) return "/sprites/fallback-money.svg";
  if (normalized.includes("creativity")) return "/sprites/fallback-creativity.svg";
  if (normalized.includes("spiritual")) return "/sprites/fallback-spirituality.svg";
  return "/sprites/fallback-general.svg";
}

export function getBadgeImagePath(badgeType: string): string {
  const paths: Record<string, string> = {
    first_care: "/badges/first-care.svg",
    three_day_streak: "/badges/three-day-streak.svg",
    three_in_a_row: "/badges/three-in-a-row.svg",
    perfect_week: "/badges/perfect-week.svg",
    comeback: "/badges/comeback.svg",
  };
  return paths[badgeType] ?? "/badges/first-care.svg";
}
```

## Task 5: Name Setup And App Shell UI

**Files:**
- Create: `components/NameSetupForm.tsx`
- Create: `components/EmptyState.tsx`
- Modify: `app/page.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Build `NameSetupForm`**

Create a client component with:

- singular name input
- plural name input
- optional photo file input
- submit button
- simple plural auto-suggestion when singular changes and plural is empty

Use Convex `createFirstUser`.

- [ ] **Step 2: Route home based on user setup**

Modify `app/page.tsx`:

- If no user, show `NameSetupForm`.
- If user exists but no Day Zero profile, show onboarding component placeholder.
- If profile exists, show home dashboard placeholder.

- [ ] **Step 3: Verify setup UI**

Run:

```bash
npm run dev
```

Open `http://localhost:3000`.

Expected: user can create first setup and see next-step placeholder.

## Task 6: AI Schemas And Diagnostic Flow

**Files:**
- Create: `lib/aiSchemas.ts`
- Create: `convex/ai.ts`
- Create: `convex/onboarding.ts`
- Create: `components/OnboardingDiagnostic.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Add Zod schemas for AI output**

Create schemas for:

- Day Zero summary
- clarifying question
- recommended Andies
- starter Needs
- reflection questions
- reflection summaries

- [ ] **Step 2: Add OpenAI actions**

Create `convex/ai.ts` actions:

- `generateClarifyingQuestion`
- `generateOnboardingRecommendations`
- `generateDailyReflectionQuestions`
- `generateDailySummary`
- `generateWeeklySummary`
- `generateAndySprite`

Each action must:

- Check `process.env.OPENAI_API_KEY`.
- Return a typed error if missing.
- Use structured JSON output for text features.
- Use fallback dimensions/Needs if parsing fails.

- [ ] **Step 3: Build onboarding UI**

`OnboardingDiagnostic` should:

1. Ask four core questions.
2. Submit to AI for clarification decision.
3. Ask up to 5 clarifying questions one at a time.
4. Show recommended Andies and Needs for review.

- [ ] **Step 4: Save Day Zero profile**

Create `convex/onboarding.ts` mutation to save:

- raw answers
- clarifying answers
- summary
- dimensions

## Task 7: Andies And Needs Review/Edit

**Files:**
- Create: `components/AndyEditor.tsx`
- Create: `components/NeedEditor.tsx`
- Modify: `convex/andies.ts`
- Modify: `convex/needs.ts`
- Modify: `convex/instances.ts`

- [ ] **Step 1: Build editable recommendation screen**

Allow:

- rename Andy
- edit dimension label
- edit Need title
- choose Need type
- set weekdays/time/duration for scheduled recurring Needs
- set daily/weekly check-in
- set one-off due date/time
- delete Needs
- add Needs up to cap

- [ ] **Step 2: Persist accepted Andies and Needs**

Save all accepted Andies and Needs in one mutation or transaction-like flow.

- [ ] **Step 3: Generate current-week instances**

After saving Needs, call current-week instance generation and persist instances.

## Task 8: Home Dashboard, Today Panel, HP, And Badges

**Files:**
- Create: `components/HomeDashboard.tsx`
- Create: `components/AndyCard.tsx`
- Create: `components/TodayPanel.tsx`
- Create: `components/PixelSprite.tsx`
- Create: `components/BadgeImage.tsx`
- Modify: `app/page.tsx`
- Modify: `convex/instances.ts`
- Modify: `convex/badges.ts`

- [ ] **Step 1: Build vertical home layout**

Home order:

1. App title using plural name.
2. Andies dashboard grid.
3. Today panel.
4. Daily reflection panel entry point.

- [ ] **Step 2: Add HP visual states**

Use `getHpState` to apply CSS classes:

- `dead`
- `dreadful`
- `poor`
- `normal`
- `healthy`
- `very_healthy`
- `powered_up`

- [ ] **Step 3: Wire Complete/Missed buttons**

Clicking Complete:

- marks instance completed
- adds `+5` HP
- inserts HP event
- checks badges
- updates UI

Clicking Missed:

- marks instance missed
- subtracts `-5` HP
- inserts HP event
- updates UI

- [ ] **Step 4: Verify manually**

Run app locally and complete this script:

1. Create user.
2. Create one Andy with one daily check-in.
3. Mark it complete.
4. Confirm HP changes from 50 to 55.
5. Confirm First Care badge appears.

## Task 9: Andy Detail Screen

**Files:**
- Create: `app/andy/[andyId]/page.tsx`
- Modify: `components/AndyCard.tsx`
- Modify: `convex/andies.ts`

- [ ] **Step 1: Add route**

Create Andy detail page with:

- sprite
- HP
- Needs list
- current week progress
- recent HP events
- badges

- [ ] **Step 2: Link cards**

Clicking an Andy card opens `/andy/<andyId>`.

## Task 10: Daily Reflections And Journal

**Files:**
- Create: `components/DailyReflectionPanel.tsx`
- Create: `app/journal/page.tsx`
- Modify: `convex/reflections.ts`
- Modify: `convex/ai.ts`
- Modify: `app/page.tsx`

- [ ] **Step 1: Build daily reflection flow**

Flow:

1. User clicks Start Reflection.
2. App asks AI for 2-3 questions using today's outcomes and recent reflections.
3. User answers free-form.
4. App asks AI for summary and pattern notes.
5. App saves reflection.

- [ ] **Step 2: Add fallback questions**

If AI fails, use:

1. What went well today?
2. What got in the way today?
3. What is one small adjustment for tomorrow?

- [ ] **Step 3: Build Journal page**

Show:

- daily reflections
- weekly reflections
- AI summary
- pattern notes
- date/week labels

## Task 11: Weekly Review

**Files:**
- Create: `app/weekly-review/page.tsx`
- Modify: `convex/reflections.ts`
- Modify: `convex/ai.ts`

- [ ] **Step 1: Add weekly review page**

Page loads current week data:

- Need completions
- misses
- HP movement
- badges
- daily reflection themes

- [ ] **Step 2: Generate summary on open**

If current week has no weekly reflection yet, generate and store it when the user opens the page.

## Task 12: Sprite Generation From Profile Photo

**Files:**
- Modify: `components/NameSetupForm.tsx`
- Modify: `convex/ai.ts`
- Modify: `convex/andies.ts`
- Modify: `lib/sprites.ts`

- [ ] **Step 1: Store photo transiently**

For MVP, do not permanently store the raw profile photo. Convert selected file to a data URL in the browser and pass it only into the onboarding/sprite generation flow.

- [ ] **Step 2: Generate one sprite per accepted Andy**

Use profile photo plus dimension prompt. Prompt shape:

```text
Create an original retro 16-bit pixel-art RPG character sprite inspired by this person's appearance. The character represents the life dimension: <dimension>. Front-facing, full body, transparent or simple pastel background, readable at small size, charming but not copied from existing game characters.
```

- [ ] **Step 3: Fallback gracefully**

If image generation fails:

- set `spriteGenerationStatus` to `failed`
- use fallback sprite path
- keep onboarding unblocked

## Task 13: Polish Pass And Responsive Readability

**Files:**
- Modify: `app/globals.css`
- Modify: components as needed

- [ ] **Step 1: Desktop visual pass**

Check:

- vertical home structure
- readable cards
- Today panel below dashboard
- pixel-style borders
- no overlapping text

- [ ] **Step 2: Mobile visual pass**

Check at narrow width:

- cards stack
- buttons fit
- Today list remains readable
- reflection text areas are usable

## Task 14: Deployment Preparation

**Files:**
- Modify: `.env.example`
- Create: `README.md`
- Modify: `next.config.ts` if needed

- [ ] **Step 1: Document local setup**

Create `README.md` with:

```md
# Andies

## Local setup

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env.local`
3. Add `OPENAI_API_KEY`
4. Run Convex: `npx convex dev`
5. Run app: `npm run dev`

## MVP stack

- Next.js
- Convex
- OpenAI API

## Deployment

Recommended first deployment target: Vercel + Convex.
The app should remain portable to Node-capable hosts such as Render.
```

- [ ] **Step 2: Verify production build**

Run:

```bash
npm run build
```

Expected: build succeeds.

## Task 15: End-To-End Manual Acceptance Test

**Files:**
- Create: `docs/testing/manual-mvp-acceptance.md`

- [ ] **Step 1: Write acceptance script**

Create `docs/testing/manual-mvp-acceptance.md`:

```md
# Andies MVP Manual Acceptance Test

1. Open local app.
2. Complete name setup with singular `Andy`, plural `Andies`.
3. Upload or skip profile photo.
4. Complete Day Zero diagnostic.
5. Confirm Day Zero summary is under 100 words.
6. Confirm AI recommends up to 3 Andies.
7. Edit one Andy and one Need.
8. Accept recommendations.
9. Confirm home shows Andies dashboard above Today panel.
10. Complete one Need instance.
11. Confirm HP increases by 5.
12. Confirm First Care badge appears with image.
13. Mark one Need missed.
14. Confirm HP decreases by 5.
15. Complete daily reflection.
16. Confirm Journal shows saved reflection and AI summary.
17. Open weekly review.
18. Confirm weekly summary generates or shows existing summary.
```

- [ ] **Step 2: Run script**

Run through the app manually. Fix any blocking issue before considering the MVP complete.

## Final Verification

Run:

```bash
npm run test
npm run build
```

Expected:

- Tests pass.
- Production build succeeds.
- Manual acceptance script passes.

## Implementation Notes

- Ask before installing packages.
- Keep raw uploaded profile photos transient by default.
- Do not implement Google Calendar or Telegram in MVP.
- Do not block the core flow on sprite generation failures.
- Do not over-polish the UI before the main loop works.
- If the project is not a git repo when execution begins, ask whether to run `git init` before making implementation commits.
