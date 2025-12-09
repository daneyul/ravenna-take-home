import { atom } from "jotai";
import { Ticket, Status, TicketFilters } from "@/types/ticket";
import { MOCK_TICKETS, MOCK_STATUSES } from "@/data/mockData";

export const ticketsAtom = atom<Ticket[]>(MOCK_TICKETS);
export const statusesAtom = atom<Status[]>(MOCK_STATUSES);

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
        ticket.labels.some((label) =>
          label.name.toLowerCase().includes(searchLower)
        )
    );
  }

  if (filters.status && filters.status !== "all") {
    filtered = filtered.filter((ticket) => ticket.status === filters.status);
  }

  if (filters.labels && filters.labels.length > 0) {
    filtered = filtered.filter((ticket) =>
      filters.labels?.some((labelId) =>
        ticket.labels.some((label) => label.id === labelId)
      )
    );
  }

  if (filters.assignee) {
    filtered = filtered.filter(
      (ticket) => ticket.assignee?.email === filters.assignee
    );
  }

  return filtered;
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

  // Sort tickets within each status by order
  grouped.forEach((tickets, status) => {
    tickets.sort((a, b) => a.order - b.order);
  });

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

export const updateTicketAtom = atom(
  null,
  (get, set, updatedTicket: Ticket) => {
    const tickets = get(ticketsAtom);
    const updatedTickets = tickets.map((ticket) =>
      ticket.id === updatedTicket.id ? updatedTicket : ticket
    );
    set(ticketsAtom, updatedTickets);
  }
);

export const deleteTicketAtom = atom(
  null,
  (get, set, ticketId: string) => {
    const tickets = get(ticketsAtom);
    const filteredTickets = tickets.filter((ticket) => ticket.id !== ticketId);
    set(ticketsAtom, filteredTickets);
  }
);

// Reorder tickets within or between columns
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
