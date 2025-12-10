import type { Ticket, Priority } from "@/types/ticket";
import type { SortDirection } from "@/atoms";

const PRIORITY_ORDER: Record<Priority, number> = {
  severe: 0,
  high: 1,
  medium: 2,
  low: 3,
  none: 4,
};

export function sortTicketsByPriority(
  tickets: Ticket[],
  direction: SortDirection
): Ticket[] {
  if (!direction) return tickets;

  return [...tickets].sort((a, b) => {
    const priorityA = PRIORITY_ORDER[a.priority];
    const priorityB = PRIORITY_ORDER[b.priority];

    if (direction === "asc") {
      return priorityA - priorityB;
    } else {
      return priorityB - priorityA;
    }
  });
}
