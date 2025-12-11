import { atom } from "jotai";
import {
  MOCK_ASSIGNEES,
  MOCK_LABELS,
  MOCK_STATUSES,
  MOCK_TICKETS,
} from "@/data/mockData";
import type {
  Label,
  Priority,
  Requester,
  Status,
  Ticket,
  TicketFilters,
} from "@/types/ticket";
import { mapValueToStatusId } from "@/utils/status";

export type GroupBy = "status" | "assignee" | "priority" | "label";

export interface GroupColumn {
  id: string;
  name: string;
  color?: string;
  order: number;
}

export const ticketsAtom = atom<Ticket[]>(MOCK_TICKETS);
export const statusesAtom = atom<Status[]>(MOCK_STATUSES);
export const labelsAtom = atom<Label[]>(MOCK_LABELS);
export const assigneesAtom = atom<Requester[]>(MOCK_ASSIGNEES);
export const groupByAtom = atom<GroupBy>("status");

export const ticketFiltersAtom = atom<TicketFilters>({
  search: "",
  status: undefined,
  labels: undefined,
  assignee: undefined,
});

export const filteredTicketsAtom = atom((get) => {
  const tickets = get(ticketsAtom);
  const filters = get(ticketFiltersAtom);

  let filtered = tickets;

  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(
      (ticket) =>
        ticket.title.toLowerCase().includes(searchLower) ||
        ticket.description?.toLowerCase().includes(searchLower) ||
        ticket.requester.name.toLowerCase().includes(searchLower) ||
        ticket.labels.some((label) => label.name.toLowerCase().includes(searchLower))
    );
  }

  if (filters.status && filters.status !== "all") {
    const statusId = mapValueToStatusId(filters.status);
    filtered = filtered.filter((ticket) => ticket.status === statusId);
  }

  if (filters.labels && filters.labels.length > 0) {
    filtered = filtered.filter((ticket) =>
      filters.labels?.some((labelId) =>
        ticket.labels.some((label) => label.id === labelId)
      )
    );
  }

  if (filters.assignee) {
    filtered = filtered.filter((ticket) => ticket.assignee?.email === filters.assignee);
  }

  return filtered;
});

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
      labels.forEach((label, index) => {
        columns.push({
          id: label.id,
          name: label.name,
          color: label.color,
          order: index,
        });
      });
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

export const ticketsByGroupAtom = atom((get) => {
  const tickets = get(filteredTicketsAtom);
  const groupBy = get(groupByAtom);
  const columns = get(groupColumnsAtom);

  const grouped = new Map<string, Ticket[]>();

  columns.forEach((column) => {
    grouped.set(column.id, []);
  });

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
        groupKey = ticket.labels.length > 0 ? ticket.labels[0].id : "no-labels";
        break;

      default:
        groupKey = ticket.status;
    }

    const groupTickets = grouped.get(groupKey) || [];
    groupTickets.push(ticket);
    grouped.set(groupKey, groupTickets);
  });

  // Don't sort here - let the Column component handle sorting based on columnSort state
  // This allows for both manual ordering (by ticket.order) and priority sorting

  return grouped;
});

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

  // Don't sort here - let the Column component handle sorting based on columnSort state
  // This allows for both manual ordering (by ticket.order) and priority sorting

  return grouped;
});

export const updateTicketStatusAtom = atom(
  null,
  (get, set, { ticketId, newStatus }: { ticketId: string; newStatus: string }) => {
    const tickets = get(ticketsAtom);
    const updatedTickets = tickets.map((ticket) =>
      ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket
    );
    set(ticketsAtom, updatedTickets);
  }
);

export const addTicketAtom = atom(
  null,
  (get, set, newTicket: Omit<Ticket, "id" | "createdAt">) => {
    const tickets = get(ticketsAtom);
    const ticket: Ticket = {
      ...newTicket,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    set(ticketsAtom, [...tickets, ticket]);
  }
);

export const updateTicketAtom = atom(null, (get, set, updatedTicket: Ticket) => {
  const tickets = get(ticketsAtom);
  const updatedTickets = tickets.map((ticket) =>
    ticket.id === updatedTicket.id ? updatedTicket : ticket
  );
  set(ticketsAtom, updatedTickets);
});

export const deleteTicketAtom = atom(null, (get, set, ticketId: string) => {
  const tickets = get(ticketsAtom);
  const filteredTickets = tickets.filter((ticket) => ticket.id !== ticketId);
  set(ticketsAtom, filteredTickets);
});

// this is most likely gonna be ripped out because we have actual sorting by priority now
export const reorderTicketsAtom = atom(
  null,
  (
    get,
    set,
    {
      ticketId,
      newStatus,
      newOrder,
    }: {
      ticketId: string;
      newStatus: string;
      newOrder: number;
    }
  ) => {
    const tickets = get(ticketsAtom);
    const ticket = tickets.find((t) => t.id === ticketId);

    if (!ticket) return;

    const oldStatus = ticket.status;
    const oldOrder = ticket.order;

    let updatedTickets = [...tickets];

    // If moving within the same column
    if (oldStatus === newStatus) {
      updatedTickets = updatedTickets.map((t) => {
        if (t.id === ticketId) {
          return { ...t, order: newOrder };
        }
        if (t.status === newStatus) {
          // Adjust orders for other tickets in the same column
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
      // Moving between columns
      updatedTickets = updatedTickets.map((t) => {
        if (t.id === ticketId) {
          return { ...t, status: newStatus, order: newOrder };
        }
        // Decrement order for tickets in old column after the moved ticket
        if (t.status === oldStatus && t.order > oldOrder) {
          return { ...t, order: t.order - 1 };
        }
        // Increment order for tickets in new column at or after the new position
        if (t.status === newStatus && t.order >= newOrder) {
          return { ...t, order: t.order + 1 };
        }
        return t;
      });
    }

    set(ticketsAtom, updatedTickets);
  }
);

export const reorderStatusesAtom = atom(
  null,
  (get, set, { fromIndex, toIndex }: { fromIndex: number; toIndex: number }) => {
    const statuses = get(statusesAtom);
    const reordered = [...statuses];
    const [removed] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, removed);

    const updated = reordered.map((status, index) => ({
      ...status,
      order: index,
    }));

    set(statusesAtom, updated);
  }
);

export const addLabelAtom = atom(null, (get, set, newLabel: Omit<Label, "id">) => {
  const labels = get(labelsAtom);
  const label: Label = {
    ...newLabel,
    id: newLabel.name.toLowerCase().replace(/\s+/g, "-"),
  };
  set(labelsAtom, [...labels, label]);
  return label.id;
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
