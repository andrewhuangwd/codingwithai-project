import { getDimensionColor, getDimensionEmoji } from "@/lib/sprites";

type Props = {
  dimension: string;
  size?: number;
};

export function PixelSprite({ dimension, size = 80 }: Props) {
  const color = getDimensionColor(dimension);
  const emoji = getDimensionEmoji(dimension);

  return (
    <div
      className="pixelSprite"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        border: "3px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.52,
        flexShrink: 0,
        lineHeight: 1,
      }}
    >
      {emoji}
    </div>
  );
}
