/**
 * Ticket detail view component
 * Displays full ticket information in a dedicated page
 */

"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ArrowLeftIcon, PersonIcon } from "@radix-ui/react-icons";
import { useAtomValue, useSetAtom } from "jotai";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import { statusesAtom, updateTicketStatusAtom } from "@/atoms/tickets";
import type { Status, Ticket } from "@/types/ticket";
import { StatusIcon } from "./StatusIcon";

interface TicketDetailViewProps {
  ticket: Ticket;
}

export function TicketDetailView({ ticket }: TicketDetailViewProps) {
  const router = useRouter();
  const statuses = useAtomValue(statusesAtom);
  const updateTicketStatus = useSetAtom(updateTicketStatusAtom);
  const currentStatus = statuses.find((s) => s.id === ticket.status);

  const handleStatusChange = (newStatus: string) => {
    updateTicketStatus({ ticketId: ticket.id, newStatus });
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="flex items-center gap-4 px-6 py-4 border-b border-black/5">
        <button
          onClick={() => router.push("/tickets")}
          className="p-1.5 rounded hover:bg-black/5 transition-colors duration-150"
          aria-label="Back to board"
        >
          <ArrowLeftIcon className="w-4 h-4 opacity-60" />
        </button>
        <span className="text-sm opacity-60">Ticket {ticket.id}</span>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-8">
          {/* Title */}
          <h1 className="text-2xl font-medium mb-6">{ticket.title}</h1>

          {/* Metadata grid */}
          <div className="grid grid-cols-2 gap-6 mb-8 pb-8 border-b border-black/5">
            {/* Status */}
            <div>
              <label className="text-sm opacity-70 block mb-2">Status</label>
              <StatusDropdown
                currentStatus={currentStatus}
                statuses={statuses}
                onStatusChange={handleStatusChange}
              />
            </div>

            {/* Created */}
            <div>
              <label className="text-sm opacity-70 block mb-2">Created</label>
              <div className="text-sm">
                {new Date(ticket.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </div>
            </div>

            {/* Requester */}
            <div>
              <label className="text-sm opacity-70 block mb-2">Requester</label>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center">
                  <PersonIcon className="w-3 h-3 opacity-60" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {ticket.requester.name}
                  </span>
                  <span className="text-xs opacity-40">
                    {ticket.requester.email}
                  </span>
                </div>
              </div>
            </div>

            {/* Request For */}
            <div>
              <label className="text-sm opacity-70 block mb-2">
                Request For
              </label>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center">
                  <PersonIcon className="w-3 h-3 opacity-60" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {ticket.requestFor.name}
                  </span>
                  <span className="text-xs opacity-40">
                    {ticket.requestFor.email}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {ticket.description && (
            <div className="mb-8">
              <label className="text-sm opacity-70 block mb-3">
                Description
              </label>
              <div className="prose prose-sm max-w-none">
                <p className="text-sm leading-relaxed">{ticket.description}</p>
              </div>
            </div>
          )}

          {/* Labels */}
          {ticket.labels && ticket.labels.length > 0 && (
            <div>
              <label className="text-sm opacity-70 block mb-3">Labels</label>
              <div className="flex flex-wrap gap-2">
                {ticket.labels.map((label) => (
                  <span
                    key={label.id}
                    className="inline-flex items-center px-3 py-1.5 rounded text-sm font-medium"
                    style={{
                      backgroundColor: `${label.color}15`,
                      color: label.color,
                    }}
                  >
                    {label.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusDropdown({
  currentStatus,
  statuses,
  onStatusChange,
}: {
  currentStatus: Status;
  statuses: Status[];
  onStatusChange: (status: string) => void;
}) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className={clsx(
            "flex items-center gap-2 px-3 py-2 rounded-md border border-black/10",
            "hover:border-black/20 transition-all duration-150 text-sm cursor-pointer"
          )}
        >
          <StatusIcon
            statusId={currentStatus?.id}
            color={currentStatus?.color}
            size="sm"
          />
          {currentStatus?.name}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content asChild sideOffset={4}>
          <motion.div
            initial={{ scale: 0.97, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.97, opacity: 0 }}
            transition={{
              duration: 0.15,
              ease: "easeOut",
            }}
            style={{ transformOrigin: "top left" }}
            className="bg-white border border-sand-200 rounded-md hover:shadow-lg py-1 min-w-[200px] z-50"
          >
            {statuses.map((status) => (
              <DropdownMenu.Item
                key={status.id}
                onSelect={() => onStatusChange(status.id)}
                className={clsx(
                  "flex items-center gap-2 px-3 py-2 text-sm",
                  "hover:bg-sand-100 cursor-pointer outline-none"
                )}
              >
                <StatusIcon statusId={status.id} color={status.color} size="sm" />
                {status.name}
              </DropdownMenu.Item>
            ))}
          </motion.div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
