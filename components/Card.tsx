"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { clsx } from "clsx";
import Link from "next/link";
import type { Ticket } from "@/types/ticket";
import { TICKET_TYPE } from "@/types/ticket";
import { Separator } from "@radix-ui/react-separator";
import { Label } from "./Label";
import { PriorityIcon } from "./PriorityIcon";
import { BORDER_STYLES } from "@/lib/styles";

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
        "rounded-md hover:shadow-xs",
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
            <PriorityIcon
              priority={ticket.priority}
              ticket={ticket}
              interactive
            />
          </div>
          <span className="text-xs font-medium opacity-50">TICKET-{ticket.id}</span>
        </div>
        {ticket.assignee && (
          <div
            className="w-6 h-6 rounded-full bg-stone-200 flex items-center justify-center text-xs font-medium"
            title={`Assigned to ${ticket.assignee.name}`}
          >
            {getInitials(ticket.assignee.name)}
          </div>
        )}
      </div>

      <Separator className="bg-stone-200 h-px mb-3 -mx-4" />

      {/* Title */}
      <h3 className="font-medium mb-2 text-sm leading-snug">
        {ticket.title}
      </h3>

      {/* Description */}
      {ticket.description && (
        <p className="text-sm opacity-70 line-clamp-2 mb-3">{ticket.description}</p>
      )}

      <Separator className="bg-stone-200 h-px my-3 -mx-4" />

      {/* Requester info */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-sm font-medium mb-1">Requester</div>
          <div className="opacity-70">{ticket.requester.name}</div>
        </div>
        <div>
          <div className="text-sm font-medium mb-1">For</div>
          <div className="opacity-70">{ticket.requestFor.name}</div>
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
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
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
