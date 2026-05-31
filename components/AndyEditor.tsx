import { DIMENSIONS } from "@/lib/constants";
import { PixelSprite } from "./PixelSprite";
import { NeedEditor, type ReviewNeed } from "./NeedEditor";

export type ReviewAndy = {
  localId: string;
  name: string;
  dimension: string;
  needs: ReviewNeed[];
};

type Props = {
  andy: ReviewAndy;
  onChange: (updated: ReviewAndy) => void;
  onDelete: () => void;
  canAddMore: boolean;
};

let needCounter = 0;

export function AndyEditor({ andy, onChange, onDelete, canAddMore }: Props) {
  function update(patch: Partial<ReviewAndy>) {
    onChange({ ...andy, ...patch });
  }

  function updateNeed(localId: string, updated: ReviewNeed) {
    update({ needs: andy.needs.map((n) => (n.localId === localId ? updated : n)) });
  }

  function deleteNeed(localId: string) {
    update({ needs: andy.needs.filter((n) => n.localId !== localId) });
  }

  function addNeed() {
    if (!canAddMore || andy.needs.length >= 3) return;
    needCounter++;
    const newNeed: ReviewNeed = {
      localId: `new-need-${needCounter}`,
      title: "",
      type: "daily_checkin",
      weekdays: [1, 3, 5],
      startTime: "09:00",
      durationMinutes: 30,
    };
    update({ needs: [...andy.needs, newNeed] });
  }

  return (
    <div className="andyEditor">
      <div className="andyEditorHeader">
        <PixelSprite dimension={andy.dimension} size={56} />
        <div className="andyEditorFields">
          <input
            className="fieldInput andyNameInput"
            value={andy.name}
            onChange={(e) => update({ name: e.target.value })}
            placeholder="Andy name"
          />
          <select
            className="fieldSelect"
            value={andy.dimension}
            onChange={(e) => update({ dimension: e.target.value })}
          >
            {DIMENSIONS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          className="btnSmall btnDanger"
          onClick={onDelete}
          aria-label="Remove Andy"
        >
          x
        </button>
      </div>

      <div className="needsList">
        {andy.needs.map((need) => (
          <NeedEditor
            key={need.localId}
            need={need}
            onChange={(updated) => updateNeed(need.localId, updated)}
            onDelete={() => deleteNeed(need.localId)}
          />
        ))}
      </div>

      {andy.needs.length < 3 && (
        <button
          type="button"
          className="btnSmall"
          onClick={addNeed}
          disabled={!canAddMore}
        >
          + Add Need
        </button>
      )}
    </div>
  );
}
