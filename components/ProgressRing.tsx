/**
 * ProgressRing component
 * Renders a radial progress ring indicator
 */

import { clsx } from "clsx";

interface ProgressRingProps {
  color: string;
  fill?: number; // 0-100
  dashed?: boolean;
  size?: "sm" | "md";
}

export function ProgressRing({
  color,
  fill = 0,
  dashed = false,
  size = "sm",
}: ProgressRingProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
  };

  // Helper function to calculate pie slice path
  const getArcPath = (percentage: number) => {
    const radius = 6;
    const centerX = 8;
    const centerY = 8;

    // Start from top (12 o'clock position)
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + (2 * Math.PI * percentage) / 100;

    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);

    const largeArcFlag = percentage > 50 ? 1 : 0;

    if (percentage === 100) {
      // Full circle
      return `M ${centerX} ${centerY - radius}
              A ${radius} ${radius} 0 1 1 ${centerX} ${centerY + radius}
              A ${radius} ${radius} 0 1 1 ${centerX} ${centerY - radius}`;
    } else if (percentage === 0) {
      return "";
    } else {
      // Pie slice
      return `M ${centerX} ${centerY}
              L ${x1} ${y1}
              A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
              Z`;
    }
  };

  return (
    <svg
      viewBox="0 0 16 16"
      className={clsx(sizeClasses[size], "flex-shrink-0")}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background circle (dashed for new, solid outline for others) */}
      <circle
        cx="8"
        cy="8"
        r="6"
        stroke={color}
        strokeWidth="1.5"
        strokeDasharray={dashed ? "2 2" : undefined}
        opacity={0.3}
        fill="none"
      />

      {/* Radial fill (pie chart style) */}
      {fill > 0 && fill < 100 && <path d={getArcPath(fill)} fill={color} opacity={0.3} />}

      {/* Solid fill for done status */}
      {fill === 100 && <circle cx="8" cy="8" r="6" fill={color} opacity={0.9} />}
    </svg>
  );
}
