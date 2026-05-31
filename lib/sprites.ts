export function getDimensionColor(dimension: string): string {
  const d = dimension.toLowerCase();
  if (d.includes("fitness")) return "#3b82f6";
  if (d.includes("career")) return "#f59e0b";
  if (d.includes("intellect")) return "#8b5cf6";
  if (d.includes("relationship")) return "#ec4899";
  if (d.includes("money")) return "#10b981";
  if (d.includes("creativity")) return "#f97316";
  if (d.includes("spiritual")) return "#6366f1";
  return "#6b7280";
}

export function getDimensionEmoji(dimension: string): string {
  const d = dimension.toLowerCase();
  if (d.includes("fitness")) return "🏋️";
  if (d.includes("career")) return "💼";
  if (d.includes("intellect")) return "🧠";
  if (d.includes("relationship")) return "🤝";
  if (d.includes("money")) return "💰";
  if (d.includes("creativit")) return "🎨";
  if (d.includes("spiritual")) return "✨";
  return "⭐";
}

export function getBadgeLabel(badgeType: string): string {
  const labels: Record<string, string> = {
    first_care: "1st",
    three_day_streak: "3D",
    three_in_a_row: "3R",
    perfect_week: "PW",
    comeback: "CB",
  };
  return labels[badgeType] ?? "?";
}
