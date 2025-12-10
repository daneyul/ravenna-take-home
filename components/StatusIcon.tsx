import { ProgressRing } from "./ProgressRing";

interface StatusIconProps {
  statusId: string;
  color?: string;
  size?: "sm" | "md";
}

const NEW = "new";
const IN_PROGRESS = "in-progress";
const WAITING_VENDOR = "waiting-vendor";
const WAITING_REQUESTER = "waiting-requester";
const DONE = "done";

export function StatusIcon({ statusId, color, size = "sm" }: StatusIconProps) {
  const getStatusStyle = () => {
    switch (statusId) {
      case NEW:
        return {
          fill: 0,
          dashed: true,
        };
      case IN_PROGRESS:
        return {
          fill: 50,
          dashed: false,
        };
      case WAITING_VENDOR:
      case WAITING_REQUESTER:
        return {
          fill: 50,
          dashed: false,
        };
      case DONE:
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

  return <ProgressRing color={strokeColor} fill={fill} dashed={dashed} size={size} />;
}
