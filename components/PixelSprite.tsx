import { getDimensionColor, getDimensionEmoji } from "@/lib/sprites";

type Props = {
  dimension: string;
  size?: number;
};

function getAnimation(dimension: string): string {
  const d = dimension.toLowerCase();
  if (d.includes("fitness")) return "spriteBounce 0.65s ease-in-out infinite";
  if (d.includes("creativit")) return "spriteSway 0.9s ease-in-out infinite";
  if (d.includes("spiritual")) return "spriteFloat 2.2s ease-in-out infinite";
  if (d.includes("relationship")) return "spriteSway 1.1s ease-in-out infinite";
  if (d.includes("career")) return "spriteNod 1.3s ease-in-out infinite";
  if (d.includes("intellect")) return "spriteNod 1.6s ease-in-out infinite";
  if (d.includes("money")) return "spriteFloat 1.8s ease-in-out infinite";
  return "spriteBounce 1s ease-in-out infinite";
}

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
        animation: getAnimation(dimension),
      }}
    >
      {emoji}
    </div>
  );
}
