import type { NeedType } from "@/lib/types";

export type ReviewNeed = {
  localId: string;
  title: string;
  type: NeedType;
  weekdays: number[];
  startTime: string;
  durationMinutes: number;
};

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

type Props = {
  need: ReviewNeed;
  onChange: (updated: ReviewNeed) => void;
  onDelete: () => void;
};

export function NeedEditor({ need, onChange, onDelete }: Props) {
  function update(patch: Partial<ReviewNeed>) {
    onChange({ ...need, ...patch });
  }

  function toggleWeekday(day: number) {
    const next = need.weekdays.includes(day)
      ? need.weekdays.filter((d) => d !== day)
      : [...need.weekdays, day].sort();
    update({ weekdays: next });
  }

  return (
    <div className="needEditor">
      <div className="needEditorRow">
        <input
          className="fieldInput needTitleInput"
          value={need.title}
          onChange={(e) => update({ title: e.target.value })}
          placeholder="Need title"
        />
        <button
          type="button"
          className="btnSmall btnDanger"
          onClick={onDelete}
          aria-label="Remove need"
        >
          x
        </button>
      </div>

      <select
        className="fieldSelect"
        value={need.type}
        onChange={(e) => update({ type: e.target.value as NeedType })}
      >
        <option value="daily_checkin">Daily check-in</option>
        <option value="weekly_checkin">Weekly check-in</option>
        <option value="scheduled_recurring">Scheduled recurring</option>
        <option value="one_off">One-off task</option>
      </select>

      {need.type === "scheduled_recurring" && (
        <div className="scheduleFields">
          <div className="weekdayPicker">
            {WEEKDAY_LABELS.map((label, day) => (
              <button
                key={day}
                type="button"
                className={`weekdayBtn ${need.weekdays.includes(day) ? "active" : ""}`}
                onClick={() => toggleWeekday(day)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="timeRow">
            <label className="fieldLabel inlineLabel">
              Time
              <input
                className="fieldInput timeInput"
                type="time"
                value={need.startTime}
                onChange={(e) => update({ startTime: e.target.value })}
              />
            </label>
            <label className="fieldLabel inlineLabel">
              Duration (min)
              <input
                className="fieldInput durationInput"
                type="number"
                min={5}
                max={480}
                value={need.durationMinutes}
                onChange={(e) =>
                  update({ durationMinutes: Number(e.target.value) || 30 })
                }
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
