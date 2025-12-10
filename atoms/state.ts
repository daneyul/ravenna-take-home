import { atom } from "jotai";
import {
  DENSE_MOCK_TICKETS,
  MOCK_ASSIGNEES,
  MOCK_LABELS,
  MOCK_STATUSES,
  MOCK_TICKETS,
} from "@/data/mockData";
import type { Label, Requester, Status, Ticket } from "@/types/ticket";

export type DataDensity = "empty" | "normal" | "dense";

export const dataDensityAtom = atom<DataDensity>("normal");

// Store for current ticket state per density
const densityTicketsAtom = atom<Record<DataDensity, Ticket[]>>({
  empty: [],
  normal: MOCK_TICKETS,
  dense: DENSE_MOCK_TICKETS,
});

// Main tickets atom that reads/writes based on current density
export const ticketsAtom = atom(
  (get) => {
    const density = get(dataDensityAtom);
    const densityTickets = get(densityTicketsAtom);
    return densityTickets[density];
  },
  (get, set, newTickets: Ticket[]) => {
    const density = get(dataDensityAtom);
    const densityTickets = get(densityTicketsAtom);
    set(densityTicketsAtom, {
      ...densityTickets,
      [density]: newTickets,
    });
  }
);

export const statusesAtom = atom<Status[]>(MOCK_STATUSES);
export const labelsAtom = atom<Label[]>(MOCK_LABELS);
export const assigneesAtom = atom<Requester[]>(MOCK_ASSIGNEES);

// Derived atom - unique requesters from all tickets
export const requestersAtom = atom((get) => {
  const tickets = get(ticketsAtom);
  const requestersMap = new Map<string, Requester>();

  tickets.forEach((ticket) => {
    requestersMap.set(ticket.requester.email, ticket.requester);
  });

  return Array.from(requestersMap.values());
});

// Sort state - stores which columns are sorted and direction
export type SortDirection = "asc" | "desc" | null;
export const columnSortAtom = atom<Record<string, SortDirection>>({});
