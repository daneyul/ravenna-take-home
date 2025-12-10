/**
 * Centralized atom exports
 * Import from '@/atoms' or '@/atoms/tickets' for backwards compatibility
 */

// Base state
export {
  ticketsAtom,
  statusesAtom,
  labelsAtom,
  assigneesAtom,
  requestersAtom,
  dataDensityAtom,
  columnSortAtom,
} from "./state";
export type { DataDensity, SortDirection } from "./state";

// Filters
export {
  ticketFiltersAtom,
  filteredTicketsAtom,
} from "./filters";

// Grouping
export {
  groupByAtom,
  groupColumnsAtom,
  ticketsByGroupAtom,
  ticketsByStatusAtom,
  updateTicketGroupAtom,
} from "./grouping";
export type { GroupBy, GroupColumn } from "./grouping";

// Actions
export {
  updateTicketStatusAtom,
  addTicketAtom,
  updateTicketAtom,
  deleteTicketAtom,
  reorderTicketsAtom,
  reorderStatusesAtom,
  addLabelAtom,
} from "./actions";
