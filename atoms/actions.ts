import { atom } from "jotai";
import type { Label, Ticket } from "@/types/ticket";
import { labelsAtom, ticketsAtom } from "./state";

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

export const addLabelAtom = atom(null, (get, set, newLabel: Omit<Label, "id">) => {
  const labels = get(labelsAtom);
  const label: Label = {
    ...newLabel,
    id: newLabel.name.toLowerCase().replace(/\s+/g, "-"),
  };
  set(labelsAtom, [...labels, label]);
  return label.id;
});
