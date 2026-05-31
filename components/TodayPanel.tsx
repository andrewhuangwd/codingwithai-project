"use client";
import { api } from "@/convex/_generated/api";
import { getDateKey } from "@/lib/dates";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";

type Instance = {
  _id: string;
  title: string;
  status: "pending" | "completed" | "missed";
  durationMinutes?: number;
};

type Props = { userId: string };

export function TodayPanel({ userId }: Props) {
  const todayKey = getDateKey(new Date());
  const instances = useQuery(api.instances.listToday, { userId, dateKey: todayKey } as any) as Instance[] | undefined;
  const markCompleted = useMutation(api.instances.markCompleted);
  const markMissed = useMutation(api.instances.markMissed);
  const [busy, setBusy] = useState<string | null>(null);

  if (instances === undefined) {
    return (
      <div className="todayPanel panel">
        <p className="eyebrow">Today</p>
        <p>Loading…</p>
      </div>
    );
  }

  const pending = instances.filter((i) => i.status === "pending");
  const done = instances.filter((i) => i.status !== "pending");

  async function handle(instanceId: string, action: "complete" | "miss") {
    setBusy(instanceId);
    try {
      if (action === "complete") await (markCompleted as any)({ needInstanceId: instanceId });
      else await (markMissed as any)({ needInstanceId: instanceId });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="todayPanel panel">
      <p className="eyebrow">Today — {todayKey}</p>
      <h2>Today&apos;s Needs</h2>

      {pending.length === 0 && done.length === 0 && (
        <p className="helpText">No Needs scheduled for today.</p>
      )}

      {pending.length > 0 && (
        <ul className="instanceList">
          {pending.map((inst) => (
            <li key={inst._id} className="instanceRow">
              <span className="instanceTitle">{inst.title}</span>
              {inst.durationMinutes && (
                <span className="instanceMeta">{inst.durationMinutes} min</span>
              )}
              <div className="instanceActions">
                <button className="btn btnSuccess btnSmall" disabled={busy === inst._id} onClick={() => handle(inst._id, "complete")}>Done</button>
                <button className="btn btnDanger btnSmall" disabled={busy === inst._id} onClick={() => handle(inst._id, "miss")}>Missed</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {done.length > 0 && (
        <>
          <p className="eyebrow" style={{ marginTop: 16 }}>Completed</p>
          <ul className="instanceList">
            {done.map((inst) => (
              <li key={inst._id} className={`instanceRow instanceRow-${inst.status}`}>
                <span className="instanceTitle">{inst.title}</span>
                <span className="instanceStatus">{inst.status === "completed" ? "+5 HP" : "-5 HP"}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
