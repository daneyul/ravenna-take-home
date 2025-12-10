import { atom } from "jotai";
import type { Priority, Ticket } from "@/types/ticket";
import { filteredTicketsAtom } from "./filters";
import { assigneesAtom, labelsAtom, statusesAtom, ticketsAtom } from "./state";

export type GroupBy = "status" | "assignee" | "priority" | "label";

export interface GroupColumn {
  id: string;
  name: string;
  color?: string;
  order: number;
}

export const groupByAtom = atom<GroupBy>("status");

// Generate columns based on grouping mode
export const groupColumnsAtom = atom((get) => {
  const groupBy = get(groupByAtom);
  const statuses = get(statusesAtom);
  const assignees = get(assigneesAtom);
  const labels = get(labelsAtom);

  const columns: GroupColumn[] = [];

  switch (groupBy) {
    case "status":
      return statuses.map((s) => ({
        id: s.id,
        name: s.name,
        color: s.color,
        order: s.order,
      }));

    case "assignee":
      // Add all assignees
      assignees.forEach((assignee, index) => {
        columns.push({
          id: assignee.email,
          name: assignee.name,
          order: index,
        });
      });
      // Add "Unassigned" column
      columns.push({
        id: "unassigned",
        name: "Unassigned",
        order: assignees.length,
      });
      return columns;

    case "priority": {
      const priorities: { value: Priority; label: string; order: number }[] = [
        { value: "severe", label: "Severe", order: 0 },
        { value: "high", label: "High", order: 1 },
        { value: "medium", label: "Medium", order: 2 },
        { value: "low", label: "Low", order: 3 },
        { value: "none", label: "None", order: 4 },
      ];
      return priorities.map((p) => ({ id: p.value, name: p.label, order: p.order }));
    }

    case "label":
      // Add all labels
      labels.forEach((label, index) => {
        columns.push({
          id: label.id,
          name: label.name,
          color: label.color,
          order: index,
        });
      });
      // Add "No Labels" column
      columns.push({
        id: "no-labels",
        name: "No Labels",
        order: labels.length,
      });
      return columns;

    default:
      return statuses.map((s) => ({
        id: s.id,
        name: s.name,
        color: s.color,
        order: s.order,
      }));
  }
});

// Group tickets based on current grouping mode
export const ticketsByGroupAtom = atom((get) => {
  const tickets = get(filteredTicketsAtom);
  const groupBy = get(groupByAtom);
  const columns = get(groupColumnsAtom);

  const grouped = new Map<string, Ticket[]>();

  // Initialize empty arrays for each column
  columns.forEach((column) => {
    grouped.set(column.id, []);
  });

  // Group tickets
  tickets.forEach((ticket) => {
    let groupKey: string;

    switch (groupBy) {
      case "status":
        groupKey = ticket.status;
        break;

      case "assignee":
        groupKey = ticket.assignee?.email || "unassigned";
        break;

      case "priority":
        groupKey = ticket.priority;
        break;

      case "label":
        // Use first label, or "no-labels" if empty
        groupKey = ticket.labels.length > 0 ? ticket.labels[0].id : "no-labels";
        break;

      default:
        groupKey = ticket.status;
    }

    const groupTickets = grouped.get(groupKey) || [];
    groupTickets.push(ticket);
    grouped.set(groupKey, groupTickets);
  });

  // Sort tickets within each group by priority, then by order
  const priorityOrder = { severe: 0, high: 1, medium: 2, low: 3, none: 4 };
  grouped.forEach((tickets) => {
    tickets.sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return a.order - b.order;
    });
  });

  return grouped;
});

// Legacy atom for backwards compatibility - now just filters by status
export const ticketsByStatusAtom = atom((get) => {
  const tickets = get(filteredTicketsAtom);
  const statuses = get(statusesAtom);

  const grouped = new Map<string, Ticket[]>();

  statuses.forEach((status) => {
    grouped.set(status.id, []);
  });

  tickets.forEach((ticket) => {
    const statusTickets = grouped.get(ticket.status) || [];
    statusTickets.push(ticket);
    grouped.set(ticket.status, statusTickets);
  });

  // Sort tickets within each status by priority, then by order
  const priorityOrder = { severe: 0, high: 1, medium: 2, low: 3, none: 4 };
  grouped.forEach((tickets) => {
    tickets.sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return a.order - b.order;
    });
  });

  return grouped;
});

// Update ticket based on grouping mode
export const updateTicketGroupAtom = atom(
  null,
  (
    get,
    set,
    {
      ticketId,
      groupValue,
      newOrder,
    }: {
      ticketId: string;
      groupValue: string;
      newOrder: number;
    }
  ) => {
    const groupBy = get(groupByAtom);
    const tickets = get(ticketsAtom);
    const ticket = tickets.find((t) => t.id === ticketId);
    const assignees = get(assigneesAtom);
    const labels = get(labelsAtom);

    if (!ticket) return;

    const oldOrder = ticket.order;
    let oldGroupValue: string;
    const updatedTicket: Ticket = { ...ticket, order: newOrder };

    // Determine old group value and update ticket based on groupBy
    switch (groupBy) {
      case "status":
        oldGroupValue = ticket.status;
        updatedTicket.status = groupValue;
        break;

      case "assignee":
        oldGroupValue = ticket.assignee?.email || "unassigned";
        if (groupValue === "unassigned") {
          updatedTicket.assignee = undefined;
        } else {
          const assignee = assignees.find((a) => a.email === groupValue);
          if (assignee) {
            updatedTicket.assignee = assignee;
          }
        }
        break;

      case "priority":
        oldGroupValue = ticket.priority;
        updatedTicket.priority = groupValue as Priority;
        break;

      case "label":
        oldGroupValue = ticket.labels.length > 0 ? ticket.labels[0].id : "no-labels";
        if (groupValue === "no-labels") {
          updatedTicket.labels = [];
        } else {
          const label = labels.find((l) => l.id === groupValue);
          if (label) {
            // Replace first label or add if no labels
            updatedTicket.labels = [label, ...ticket.labels.slice(1)];
          }
        }
        break;

      default:
        oldGroupValue = ticket.status;
        updatedTicket.status = groupValue;
    }

    let updatedTickets = [...tickets];

    // If moving within the same group
    if (oldGroupValue === groupValue) {
      updatedTickets = updatedTickets.map((t) => {
        if (t.id === ticketId) {
          return updatedTicket;
        }
        // Get this ticket's group value
        let tGroupValue: string;
        switch (groupBy) {
          case "status":
            tGroupValue = t.status;
            break;
          case "assignee":
            tGroupValue = t.assignee?.email || "unassigned";
            break;
          case "priority":
            tGroupValue = t.priority;
            break;
          case "label":
            tGroupValue = t.labels.length > 0 ? t.labels[0].id : "no-labels";
            break;
          default:
            tGroupValue = t.status;
        }

        if (tGroupValue === groupValue) {
          // Adjust orders for other tickets in the same group
          if (oldOrder < newOrder) {
            // Moving down: decrement order for tickets in between
            if (t.order > oldOrder && t.order <= newOrder) {
              return { ...t, order: t.order - 1 };
            }
          } else {
            // Moving up: increment order for tickets in between
            if (t.order >= newOrder && t.order < oldOrder) {
              return { ...t, order: t.order + 1 };
            }
          }
        }
        return t;
      });
    } else {
      // Moving between groups
      updatedTickets = updatedTickets.map((t) => {
        if (t.id === ticketId) {
          return updatedTicket;
        }

        // Get this ticket's group value
        let tGroupValue: string;
        switch (groupBy) {
          case "status":
            tGroupValue = t.status;
            break;
          case "assignee":
            tGroupValue = t.assignee?.email || "unassigned";
            break;
          case "priority":
            tGroupValue = t.priority;
            break;
          case "label":
            tGroupValue = t.labels.length > 0 ? t.labels[0].id : "no-labels";
            break;
          default:
            tGroupValue = t.status;
        }

        // Decrement order for tickets in old group after the moved ticket
        if (tGroupValue === oldGroupValue && t.order > oldOrder) {
          return { ...t, order: t.order - 1 };
        }
        // Increment order for tickets in new group at or after the new position
        if (tGroupValue === groupValue && t.order >= newOrder) {
          return { ...t, order: t.order + 1 };
        }
        return t;
      });
    }

    set(ticketsAtom, updatedTickets);
  }
);
