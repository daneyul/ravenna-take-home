"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { clsx } from "clsx";
import Link from "next/link";
import type { Ticket } from "@/types/ticket";
import { TICKET_TYPE } from "@/types/ticket";
import { Separator } from "@radix-ui/react-separator";

interface CardProps {
  ticket: Ticket;
  isPreview?: boolean;
}

function CardContent({ ticket, isDragging = false, isPreview = false }: { ticket: Ticket; isDragging?: boolean; isPreview?: boolean }) {
  return (
    <Link
      href={`/tickets/${ticket.id}`}
      style={{ cursor: isPreview ? "grabbing" : (isDragging ? "grabbing" : "default") }}
      className={clsx(
        "block w-full",
        "bg-white",
        "border border-stone-200 hover:border-stone-300 rounded-md hover:shadow-xs",
        "p-4",
        "transition-all duration-150",
        "select-none",
      )}
    >
      <h3 className="font-medium mb-2 text-sm leading-snug">
        {ticket.title}
      </h3>

      {ticket.description && (
        <p className="text-sm opacity-70 line-clamp-2">
          {ticket.description}
        </p>
      )}

      <Separator className="bg-stone-200 h-px my-4 -mx-4" />

      <div className="flex items-center gap-2 text-sm opacity-70">
        <span>Requested by {ticket.requester.name}</span>
      </div>

      {ticket.requestFor.email !== ticket.requester.email && (
        <div className="flex items-center mt-1 text-sm opacity-70">
          <span>Requested for {ticket.requestFor.name}</span>
        </div>
      )}

      {ticket.labels && ticket.labels.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {ticket.labels.map((label) => (
            <div key={label.id} className="rounded-sm border border-stone-200 flex items-center px-2 py-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: label.color }} />
              <span
                key={label.id}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
              >
                {label.name}
              </span>
            </div>
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
