
export interface Requester {
  name: string;
  email: string;
}

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface Ticket {
  id: string;
  title: string;
  description?: string;
  status: string;
  requester: Requester;
  requestFor: Requester;
  assignee?: Requester;
  labels: Label[];
  order: number;
  createdAt: Date;
}

export interface Status {
  id: string;
  name: string;
  color: string;
  order: number;
}

export interface TicketFilters {
  search?: string;
  status?: string;
  labels?: string[];
  assignee?: string;
}

export const TICKET_TYPE = "ticket";
export const COLUMN_TYPE = "column";