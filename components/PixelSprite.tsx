import { getDimensionColor, getDimensionInitial } from "@/lib/sprites";

type Props = {
  dimension: string;
  size?: number;
};

export function PixelSprite({ dimension, size = 80 }: Props) {
  const color = getDimensionColor(dimension);
  const label = getDimensionInitial(dimension);

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
        fontWeight: "bold",
        fontSize: size * 0.3,
        color: "#fff",
        flexShrink: 0,
      }}
    >
      {label}
    </div>
  );
}
