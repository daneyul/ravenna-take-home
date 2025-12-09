/**
 * Status icon component
 * Renders status indicators like Linear with radial progress
 */

import { ProgressRing } from "./ProgressRing";

interface StatusIconProps {
  statusId: string;
  color?: string;
  size?: "sm" | "md";
}

export function StatusIcon({ statusId, color, size = "sm" }: StatusIconProps) {
  // Determine fill percentage and style based on status
  const getStatusStyle = () => {
    switch (statusId) {
      case "new":
        return {
          fill: 0,
          dashed: true,
        };
      case "in-progress":
        return {
          fill: 50,
          dashed: false,
        };
      case "waiting-vendor":
      case "waiting-requester":
        return {
          fill: 50,
          dashed: false,
        };
      case "done":
        return {
          fill: 100,
          dashed: false,
        };
      default:
        return {
          fill: 0,
          dashed: true,
        };
    }
  };

  const { fill, dashed } = getStatusStyle();
  const strokeColor = color || "#000";

  return (
    <ProgressRing
      color={strokeColor}
      fill={fill}
      dashed={dashed}
      size={size}
    />
  );
}
