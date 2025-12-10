"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Separator } from "@radix-ui/react-separator";
import { clsx } from "clsx";
import { useAtomValue, useSetAtom } from "jotai";
import { motion } from "motion/react";
import Link from "next/link";
import { toast } from "sonner";
import { assigneesAtom, updateTicketAtom } from "@/atoms";
import { BORDER_STYLES } from "@/lib/styles";
import type { Ticket } from "@/types/ticket";
import { TICKET_TYPE } from "@/types/ticket";
import { Label } from "./Label";
import { PriorityIcon } from "./PriorityIcon";

interface CardProps {
  ticket: Ticket;
  isPreview?: boolean;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function CardContent({
  ticket,
  isDragging = false,
  isPreview = false,
}: {
  ticket: Ticket;
  isDragging?: boolean;
  isPreview?: boolean;
}) {
  const assignees = useAtomValue(assigneesAtom);
  const updateTicket = useSetAtom(updateTicketAtom);

  const handleAssigneeChange = (newAssignee: typeof ticket.assignee) => {
    updateTicket({
      ...ticket,
      assignee: newAssignee,
    });
    toast.success(newAssignee ? `Assigned to ${newAssignee.name}` : "Unassigned");
  };

  return (
    <Link
      href={`/tickets/${ticket.id}`}
      style={{
        cursor: isPreview ? "grabbing" : isDragging ? "grabbing" : "default",
      }}
      className={clsx(
        "block w-full",
        "bg-white",
        BORDER_STYLES.interactive,
        "rounded-md hover:shadow-sm",
        "pl-4 pr-4 py-4 pt-2",
        "transition-all duration-150",
        "select-none"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className="inline-flex"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <PriorityIcon priority={ticket.priority} ticket={ticket} interactive />
          </div>
          <span className="text-xs font-medium opacity-50">TICKET-{ticket.id}</span>
        </div>
        <div>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                type="button"
                className={clsx(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-150",
                  ticket.assignee
                    ? "bg-stone-200 hover:bg-stone-300"
                    : "border border-stone-300 hover:bg-stone-100"
                )}
                title={
                  ticket.assignee ? `Assigned to ${ticket.assignee.name}` : "Unassigned"
                }
              >
                {ticket.assignee ? getInitials(ticket.assignee.name) : "?"}
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
                  className={clsx(
                    "bg-white rounded-md shadow-xs py-1 min-w-[200px] z-50",
                    BORDER_STYLES.base
                  )}
                >
                  <DropdownMenu.Item
                    onSelect={() => handleAssigneeChange(undefined)}
                    className={clsx(
                      "flex items-center gap-2 px-3 py-2 text-sm",
                      "hover:bg-stone-100 cursor-pointer outline-none"
                    )}
                  >
                    <div className="w-5 h-5 border border-stone-300 rounded-full" />
                    <span>Unassign</span>
                  </DropdownMenu.Item>
                  {assignees.map((assignee) => (
                    <DropdownMenu.Item
                      key={assignee.email}
                      onSelect={() => handleAssigneeChange(assignee)}
                      className={clsx(
                        "flex items-center gap-2 px-3 py-2 text-sm",
                        "hover:bg-stone-100 cursor-pointer outline-none"
                      )}
                    >
                      <div className="w-5 h-5 rounded-full bg-stone-200 flex items-center justify-center text-xs font-medium">
                        {getInitials(assignee.name)}
                      </div>
                      <div className="flex flex-col">
                        <span>{assignee.name}</span>
                        <span className="text-xs opacity-50">{assignee.email}</span>
                      </div>
                    </DropdownMenu.Item>
                  ))}
                </motion.div>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>

      <Separator className="bg-stone-200 h-px mb-3 -mx-4" />

      {/* Title */}
      <h3 className="font-medium mb-2 text-sm leading-snug">{ticket.title}</h3>

      {/* Description */}
      {ticket.description && (
        <p className="text-sm opacity-70 line-clamp-2 mb-3">{ticket.description}</p>
      )}

      <Separator className="bg-stone-200 h-px my-3 -mx-4" />

      {/* Requester info */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-sm font-medium mb-1">Requested By</div>
          <div className="opacity-70">{ticket.requester.name}</div>
        </div>
      </div>

      {/* Labels */}
      {ticket.labels && ticket.labels.length > 0 && (
        <div
          className="flex flex-wrap gap-1.5 mt-3"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          {ticket.labels.map((label) => (
            <Label key={label.id} label={label} ticket={ticket} interactive />
          ))}
        </div>
      )}
    </Link>
  );
}

export function Card({ ticket, isPreview = false }: CardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: ticket.id,
      data: {
        type: TICKET_TYPE,
        ticket,
      },
      disabled: isPreview,
    });

  if (isPreview) {
    return (
      <div className="w-full">
        <CardContent ticket={ticket} isPreview />
      </div>
    );
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="transition-all duration-150 w-full"
    >
      <CardContent ticket={ticket} isDragging={isDragging} />
    </div>
  );
}
