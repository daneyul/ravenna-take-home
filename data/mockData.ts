/**
 * Mock data for the ITSM ticketing system
 * This data is used to populate the initial state
 */

import { Status, Ticket, Label, Requester } from "@/types/ticket";

export const MOCK_LABELS: Label[] = [
  {
    id: "it",
    name: "IT",
    color: "#3b82f6", // blue
  },
  {
    id: "hr",
    name: "HR",
    color: "#10b981", // green
  },
  {
    id: "finance",
    name: "Finance",
    color: "#f59e0b", // amber
  },
  {
    id: "design",
    name: "Design",
    color: "#ec4899", // pink
  },
  {
    id: "engineering",
    name: "Engineering",
    color: "#8b5cf6", // purple
  },
  {
    id: "operations",
    name: "Operations",
    color: "#ef4444", // red
  },
  {
    id: "hardware",
    name: "Hardware",
    color: "#06b6d4", // cyan
  },
  {
    id: "software",
    name: "Software",
    color: "#6366f1", // indigo
  },
];

export const MOCK_STATUSES: Status[] = [
  {
    id: "new",
    name: "New",
    color: "#2563eb", // blue - more vibrant
    order: 0,
  },
  {
    id: "in-progress",
    name: "In Progress",
    color: "#f97316", // amber - more vibrant
    order: 1,
  },
  {
    id: "waiting-vendor",
    name: "Waiting for Vendor",
    color: "#d97706", // amber - changed from purple
    order: 2,
  },
  {
    id: "waiting-requester",
    name: "Waiting for Requester",
    color: "#f59e0b", // amber - changed from pink
    order: 3,
  },
  {
    id: "done",
    name: "Done",
    color: "#059669", // green - more vibrant
    order: 4,
  },
];

export const MOCK_ASSIGNEES: Requester[] = [
  {
    name: "Alex Thompson",
    email: "alex.thompson@company.com",
  },
  {
    name: "David Kim",
    email: "david.kim@company.com",
  },
  {
    name: "Lisa Anderson",
    email: "lisa.anderson@company.com",
  },
  {
    name: "Ryan Martinez",
    email: "ryan.martinez@company.com",
  },
];

export const MOCK_TICKETS: Ticket[] = [
  {
    id: "1",
    title: "Password reset for accounting system",
    description: "Need to reset password for QuickBooks access",
    status: "new",
    requester: {
      name: "Sarah Chen",
      email: "sarah.chen@company.com",
    },
    requestFor: {
      name: "Sarah Chen",
      email: "sarah.chen@company.com",
    },
    assignee: {
      name: "Alex Thompson",
      email: "alex.thompson@company.com",
    },
    labels: [MOCK_LABELS[2], MOCK_LABELS[7]], // Finance, Software
    priority: "high",
    order: 0,
    createdAt: new Date("2025-12-01T09:00:00"),
  },
  {
    id: "2",
    title: "New laptop for developer",
    description: "MacBook Pro 16-inch for new engineering hire",
    status: "in-progress",
    requester: {
      name: "Michael Park",
      email: "michael.park@company.com",
    },
    requestFor: {
      name: "Jessica Liu",
      email: "jessica.liu@company.com",
    },
    assignee: {
      name: "David Kim",
      email: "david.kim@company.com",
    },
    labels: [MOCK_LABELS[4], MOCK_LABELS[6]], // Engineering, Hardware
    priority: "medium",
    order: 0,
    createdAt: new Date("2025-11-28T14:30:00"),
  },
  {
    id: "3",
    title: "VPN connection issues",
    description: "Cannot connect to company VPN from home office",
    status: "new",
    requester: {
      name: "David Kim",
      email: "david.kim@company.com",
    },
    requestFor: {
      name: "David Kim",
      email: "david.kim@company.com",
    },
    assignee: {
      name: "Alex Thompson",
      email: "alex.thompson@company.com",
    },
    labels: [MOCK_LABELS[0]], // IT
    priority: "severe",
    order: 1,
    createdAt: new Date("2025-12-03T11:15:00"),
  },
  {
    id: "4",
    title: "Software license renewal",
    description: "Adobe Creative Cloud licenses expiring end of month",
    status: "waiting-vendor",
    requester: {
      name: "Emma Rodriguez",
      email: "emma.rodriguez@company.com",
    },
    requestFor: {
      name: "Design Team",
      email: "design@company.com",
    },
    assignee: {
      name: "Lisa Anderson",
      email: "lisa.anderson@company.com",
    },
    labels: [MOCK_LABELS[3], MOCK_LABELS[7]], // Design, Software
    priority: "high",
    order: 0,
    createdAt: new Date("2025-11-25T10:00:00"),
  },
  {
    id: "5",
    title: "Email signature update",
    description: "Need to add new phone number to email signature",
    status: "waiting-requester",
    requester: {
      name: "James Wilson",
      email: "james.wilson@company.com",
    },
    requestFor: {
      name: "James Wilson",
      email: "james.wilson@company.com",
    },
    assignee: {
      name: "Alex Thompson",
      email: "alex.thompson@company.com",
    },
    labels: [MOCK_LABELS[0]], // IT
    priority: "low",
    order: 0,
    createdAt: new Date("2025-11-30T16:45:00"),
  },
  {
    id: "6",
    title: "Printer setup in conference room",
    description: "Install network printer in Conference Room B",
    status: "done",
    requester: {
      name: "Lisa Anderson",
      email: "lisa.anderson@company.com",
    },
    requestFor: {
      name: "Operations",
      email: "ops@company.com",
    },
    assignee: {
      name: "Ryan Martinez",
      email: "ryan.martinez@company.com",
    },
    labels: [MOCK_LABELS[5], MOCK_LABELS[6]], // Operations, Hardware
    priority: "medium",
    order: 0,
    createdAt: new Date("2025-11-20T09:30:00"),
  },
  {
    id: "7",
    title: "Slack workspace access",
    description: "Add new team member to engineering channel",
    status: "in-progress",
    requester: {
      name: "Alex Thompson",
      email: "alex.thompson@company.com",
    },
    requestFor: {
      name: "Jordan Lee",
      email: "jordan.lee@company.com",
    },
    assignee: {
      name: "David Kim",
      email: "david.kim@company.com",
    },
    labels: [MOCK_LABELS[0], MOCK_LABELS[4]], // IT, Engineering
    priority: "severe",
    order: 1,
    createdAt: new Date("2025-12-02T13:20:00"),
  },
  {
    id: "8",
    title: "Monitor replacement",
    description: "External monitor flickering, needs replacement",
    status: "new",
    requester: {
      name: "Ryan Martinez",
      email: "ryan.martinez@company.com",
    },
    requestFor: {
      name: "Ryan Martinez",
      email: "ryan.martinez@company.com",
    },
    assignee: {
      name: "Lisa Anderson",
      email: "lisa.anderson@company.com",
    },
    labels: [MOCK_LABELS[6]], // Hardware
    priority: "low",
    order: 2,
    createdAt: new Date("2025-12-04T08:00:00"),
  },
];
