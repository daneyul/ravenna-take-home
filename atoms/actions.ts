import { atom } from "jotai";
import type { Label, Ticket } from "@/types/ticket";
import { labelsAtom, statusesAtom, ticketsAtom } from "./state";

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

export const addLabelAtom = atom(null, (get, set, newLabel: Omit<Label, "id">) => {
  const labels = get(labelsAtom);
  const label: Label = {
    ...newLabel,
    id: newLabel.name.toLowerCase().replace(/\s+/g, "-"),
  };
  set(labelsAtom, [...labels, label]);
  return label.id;
});
