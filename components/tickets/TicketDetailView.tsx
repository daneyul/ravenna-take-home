"use client";

import { ArrowLeftIcon, PersonIcon } from "@radix-ui/react-icons";
import { useAtomValue, useSetAtom } from "jotai";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { statusesAtom, assigneesAtom, updateTicketAtom } from "@/atoms/tickets";
import type { Ticket, Requester } from "@/types/ticket";
import { StatusDropdown } from "./StatusDropdown";
import { AssigneeDropdown } from "./AssigneeDropdown";
import { Label } from "../Label";
import { PriorityIcon } from "../PriorityIcon";
import { BORDER_STYLES } from "@/lib/styles";

interface TicketDetailViewProps {
  ticket: Ticket;
}

export function TicketDetailView({ ticket }: TicketDetailViewProps) {
  const router = useRouter();
  const statuses = useAtomValue(statusesAtom);
  const assignees = useAtomValue(assigneesAtom);
  const updateTicket = useSetAtom(updateTicketAtom);
  const currentStatus = statuses.find((s) => s.id === ticket.status);

  const [description, setDescription] = useState(ticket.description || "");
  const debounceTimerRef = useRef<NodeJS.Timeout>();

  // Update local state when ticket changes
  useEffect(() => {
    setDescription(ticket.description || "");
  }, [ticket.description]);

  const handleStatusChange = (newStatus: string) => {
    updateTicket({
      ...ticket,
      status: newStatus,
    });
    toast.success("Status updated");
  };

  const handleAssigneeChange = (newAssignee: Requester | undefined) => {
    updateTicket({
      ...ticket,
      assignee: newAssignee,
    });
    toast.success(newAssignee ? `Assigned to ${newAssignee.name}` : "Unassigned");
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newDescription = e.target.value;
    setDescription(newDescription);

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer for debounced save
    debounceTimerRef.current = setTimeout(() => {
      updateTicket({
        ...ticket,
        description: newDescription,
      });
      toast.success("Description saved");
    }, 1000);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="flex items-center gap-4 px-6 py-4 border-b border-stone-200">
        <button
          onClick={() => router.push("/tickets")}
          className={clsx(
            "p-1.5 rounded hover:shadow-xs transition-colors duration-150 group cursor-pointer bg-white",
            BORDER_STYLES.interactive
          )}
          aria-label="Back to board"
        >
          <ArrowLeftIcon className="w-4 h-4 opacity-70 group-hover:-translate-x-[25%] transition-transform duration-150" />
        </button>
        <span className="text-sm font-medium">Ticket {ticket.id}</span>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-8">
          {/* Title */}
          <div className="flex items-center gap-2 mb-6">
          <PriorityIcon priority={ticket.priority} size="lg" interactive ticket={ticket} />
          <h1 className="text-2xl font-medium">{ticket.title}</h1>
          </div>

          {/* Metadata grid */}
          <div className="grid grid-cols-2 gap-6 mb-8 pb-8 border-b border-stone-200">
            {/* Status */}
            <div>
              <DetailLabel>Status</DetailLabel>
              <StatusDropdown
                currentStatus={currentStatus}
                statuses={statuses}
                onStatusChange={handleStatusChange}
              />
            </div>

            {/* Assignee */}
            <div>
              <DetailLabel>Assignee</DetailLabel>
              <AssigneeDropdown
                currentAssignee={ticket.assignee}
                assignees={assignees}
                onAssigneeChange={handleAssigneeChange}
              />
            </div>

            {/* Requester */}
            <div>
              <DetailLabel>Requester</DetailLabel>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-stone-200 flex items-center justify-center">
                  <PersonIcon className="w-3 h-3 opacity-70" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm">
                    {ticket.requester.name}
                  </span>
                  <span className="text-xs opacity-70">
                    {ticket.requester.email}
                  </span>
                </div>
              </div>
            </div>

            {/* Request For */}
            <div>
              <DetailLabel>
                Request For
              </DetailLabel>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center">
                  <PersonIcon className="w-3 h-3 opacity-70" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm">
                    {ticket.requestFor.name}
                  </span>
                  <span className="text-xs opacity-70">
                    {ticket.requestFor.email}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Created At */}
          <div className="mb-6">
            <DetailLabel>Created</DetailLabel>
            <div className="text-sm opacity-70">
              {new Date(ticket.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <label className="text-sm block mb-3 font-medium">
              Description
            </label>
            <textarea
              value={description}
              onChange={handleDescriptionChange}
              placeholder="Add a description..."
              className={clsx(
                "w-full min-h-[120px] px-3 py-2 text-sm rounded-md bg-white resize-y",
                BORDER_STYLES.input,
                "transition-all duration-150"
              )}
            />
          </div>

          {/* Labels */}
          {ticket.labels && ticket.labels.length > 0 && (
            <div>
              <DetailLabel>Labels</DetailLabel>
              <div className="flex flex-wrap gap-1.5">
                {ticket.labels.map((label) => (
                  <Label key={label.id} label={label} ticket={ticket} interactive />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-sm block mb-3 font-medium">
      {children}
    </label>
  )
}
