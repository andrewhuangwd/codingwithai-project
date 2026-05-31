import { getBadgeLabel } from "@/lib/sprites";

const BADGE_COLORS: Record<string, string> = {
  first_care: "#f59e0b",
  three_day_streak: "#3b82f6",
  three_in_a_row: "#8b5cf6",
  perfect_week: "#10b981",
  comeback: "#ec4899",
};

const BADGE_TITLES: Record<string, string> = {
  first_care: "First Care",
  three_day_streak: "3-Day Streak",
  three_in_a_row: "3 in a Row",
  perfect_week: "Perfect Week",
  comeback: "Comeback",
};

type Props = {
  badgeType: string;
  size?: number;
};

export function BadgeImage({ badgeType, size = 40 }: Props) {
  const color = BADGE_COLORS[badgeType] ?? "#6b7280";
  const label = getBadgeLabel(badgeType);
  const title = BADGE_TITLES[badgeType] ?? badgeType;

  return (
    <div
      title={title}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: color,
        border: "2px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.3,
        fontWeight: "bold",
        color: "#fff",
        flexShrink: 0,
      }}
    >
      {label}
    </div>
  );
}
