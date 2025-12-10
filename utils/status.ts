import type { Status } from "@/types/ticket";

export function mapValueToStatusId(value: string): string {
  if (value === "waiting-for-vendor") {
    return "waiting-vendor";
  }
  if (value === "waiting-for-requester") {
    return "waiting-requester";
  }
  return value;
}

export function getStatusColor(value: string, statuses: Status[]): string | undefined {
  if (value === "all") return undefined;
  const statusId = mapValueToStatusId(value);
  return statuses.find((s) => s.id === statusId)?.color;
}
