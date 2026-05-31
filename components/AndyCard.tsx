import type { HpState } from "@/lib/hp";
import { getHpState } from "@/lib/hp";
import { BadgeImage } from "./BadgeImage";
import { PixelSprite } from "./PixelSprite";

type BadgeDoc = {
  _id: string;
  badgeType: string;
  title: string;
};

type Props = {
  andy: {
    _id: string;
    name: string;
    dimension: string;
    hp: number;
  };
  badges: BadgeDoc[];
  weekStats: { completed: number; total: number } | null;
};

const HP_LABELS: Record<HpState, string> = {
  dead: "Gone",
  dreadful: "Dreadful",
  poor: "Poor",
  normal: "OK",
  healthy: "Healthy",
  very_healthy: "Thriving",
  powered_up: "Powered Up!",
};

export function AndyCard({ andy, badges, weekStats }: Props) {
  const hpState = getHpState(andy.hp);

  return (
    <div className={`andyCard hpState-${hpState}`}>
      <div className="andyCardTop">
        <PixelSprite dimension={andy.dimension} size={64} />
        <div className="andyCardInfo">
          <p className="andyName">{andy.name}</p>
          <p className="andyDimension">{andy.dimension}</p>
          <div className="hpRow">
            <div className="hpBar">
              <div
                className="hpFill"
                style={{ width: `${andy.hp}%` }}
              />
            </div>
            <span className="hpLabel">
              {andy.hp} HP — {HP_LABELS[hpState]}
            </span>
          </div>
          {weekStats !== null && weekStats.total > 0 && (
            <span className="weekProgress">
              {weekStats.completed}/{weekStats.total} this week
              {weekStats.completed === weekStats.total && weekStats.total > 0 && " 🔥"}
            </span>
          )}
        </div>
      </div>

      {badges.length > 0 && (
        <div className="badgeRow">
          {badges.map((b) => (
            <BadgeImage key={b._id} badgeType={b.badgeType} size={32} />
          ))}
        </div>
      )}
    </div>
  );
}
