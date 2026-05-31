"use client";
import { api } from "@/convex/_generated/api";
import { getMondayWeekKey } from "@/lib/dates";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useRef } from "react";
import { AndyCard } from "./AndyCard";
import { EmptyState } from "./EmptyState";
import { TodayPanel } from "./TodayPanel";

type AndyDoc = { _id: string; name: string; dimension: string; hp: number };
type BadgeDoc = { _id: string; badgeType: string; title: string; andyId: string };

type Props = { userId: string; pluralName: string };

export function HomeDashboard({ userId, pluralName }: Props) {
  const andies = useQuery(api.andies.listByUser, { userId } as any) as AndyDoc[] | undefined;
  const badges = useQuery(api.badges.listByUser, { userId } as any) as BadgeDoc[] | undefined;
  const createInstances = useMutation(api.instances.createManyForWeek);
  const instancesCreated = useRef(false);

  useEffect(() => {
    if (!instancesCreated.current) {
      instancesCreated.current = true;
      (createInstances as any)({ userId, anchorDateIso: new Date().toISOString() }).catch(console.error);
    }
  }, [userId, createInstances]);

  const badgesByAndy: Record<string, BadgeDoc[]> = {};
  for (const andy of andies ?? []) {
    badgesByAndy[andy._id] = (badges ?? []).filter((b) => b.andyId === andy._id);
  }

  return (
    <div className="appShell">
      <header className="appHeader">
        <h1 className="appTitle">{pluralName}</h1>
        <p className="weekLabel">Week {getMondayWeekKey(new Date())}</p>
      </header>

      <section className="dashboardGrid">
        {andies === undefined && <p>Loading…</p>}
        {andies !== undefined && andies.length === 0 && (
          <EmptyState message="No Andies yet. Complete onboarding to get started." />
        )}
        {(andies ?? []).map((andy) => (
          <AndyCard key={andy._id} andy={andy} badges={badgesByAndy[andy._id] ?? []} />
        ))}
      </section>

      <TodayPanel userId={userId} />
    </div>
  );
}
