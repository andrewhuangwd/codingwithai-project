"use client";
import { api } from "@/convex/_generated/api";
import { getDateKey, getMondayWeekKey } from "@/lib/dates";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useRef, useState } from "react";
import { AndyCard } from "./AndyCard";
import { EmptyState } from "./EmptyState";
import { SideNav } from "./SideNav";
import { TodayPanel } from "./TodayPanel";

type AndyDoc = { _id: string; name: string; dimension: string; hp: number };
type BadgeDoc = { _id: string; badgeType: string; title: string; andyId: string };
type InstanceDoc = { _id: string; andyId: string; status: string };

type Props = { userId: string; pluralName: string };

export function HomeDashboard({ userId, pluralName }: Props) {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const dateKey = getDateKey(currentDate);
  const weekKey = getMondayWeekKey(currentDate);
  const todayKey = getDateKey(new Date());
  const isToday = dateKey === todayKey;

  const andies = useQuery(api.andies.listByUser, { userId } as any) as AndyDoc[] | undefined;
  const badges = useQuery(api.badges.listByUser, { userId } as any) as BadgeDoc[] | undefined;
  const weekInstances = useQuery(api.instances.listByWeek, { userId, weekKey } as any) as InstanceDoc[] | undefined;
  const createInstances = useMutation(api.instances.createManyForWeek);
  const lastWeekKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (lastWeekKeyRef.current !== weekKey) {
      lastWeekKeyRef.current = weekKey;
      (createInstances as any)({ userId, anchorDateIso: currentDate.toISOString() }).catch(console.error);
    }
  }, [weekKey, userId, currentDate, createInstances]);

  function moveDate(delta: number) {
    setCurrentDate((d) => {
      const next = new Date(d);
      next.setDate(next.getDate() + delta);
      return next;
    });
  }

  const badgesByAndy: Record<string, BadgeDoc[]> = {};
  for (const andy of andies ?? []) {
    badgesByAndy[andy._id] = (badges ?? []).filter((b) => b.andyId === andy._id);
  }

  const weekStatsByAndy: Record<string, { completed: number; total: number }> = {};
  for (const inst of weekInstances ?? []) {
    if (!weekStatsByAndy[inst.andyId]) weekStatsByAndy[inst.andyId] = { completed: 0, total: 0 };
    weekStatsByAndy[inst.andyId].total++;
    if (inst.status === "completed") weekStatsByAndy[inst.andyId].completed++;
  }

  return (
    <div className="appLayout">
      <SideNav pluralName={pluralName} />

      <main className="mainContent">
        <header className="appHeader">
          <div>
            <h1 className="appTitle">Dashboard</h1>
            <p className="weekLabel">Week of {weekKey}</p>
          </div>
          <div className="dateNavRow">
            <button className="dateNavBtn" onClick={() => moveDate(-1)}>‹</button>
            <span className="dateNavLabel">{dateKey}</span>
            <button className="dateNavBtn" onClick={() => moveDate(1)}>›</button>
            {!isToday && (
              <button className="dateNavToday" onClick={() => setCurrentDate(new Date())}>
                Today
              </button>
            )}
          </div>
        </header>

        <section className="dashboardGrid">
          {andies === undefined && <p>Loading…</p>}
          {andies !== undefined && andies.length === 0 && (
            <EmptyState message="No Andies yet. Complete onboarding to get started." />
          )}
          {(andies ?? []).map((andy) => (
            <AndyCard
              key={andy._id}
              andy={andy}
              badges={badgesByAndy[andy._id] ?? []}
              weekStats={weekStatsByAndy[andy._id] ?? null}
            />
          ))}
        </section>

        <TodayPanel userId={userId} currentDate={currentDate} />
      </main>
    </div>
  );
}
