import { atom } from "jotai";
import { TicketFilters } from "@/types/ticket";
import { ticketsAtom } from "./state";
import { mapValueToStatusId } from "@/utils/status";

export const ticketFiltersAtom = atom<TicketFilters>({
  search: "",
  status: undefined,
  labels: undefined,
  assignee: undefined,
  requester: undefined,
  requestFor: undefined,
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
    filtered = filtered.filter(
      (ticket) => ticket.assignee?.email === filters.assignee
    );
  }

  if (filters.requester) {
    filtered = filtered.filter(
      (ticket) => ticket.requester.email === filters.requester
    );
  }

  if (filters.requestFor) {
    filtered = filtered.filter(
      (ticket) => ticket.requestFor.email === filters.requestFor
    );
  }

  return filtered;
});
