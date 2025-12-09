"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { Status, Ticket } from "@/types/ticket";
import { COLUMN_TYPE } from "@/types/ticket";
import { Card } from "./Card";
import { StatusIcon } from "./StatusIcon";

interface ColumnProps {
  status: Status;
  tickets: Ticket[];
  isOver?: boolean;
}

export function Column({ status, tickets, isOver = false }: ColumnProps) {
  const { setNodeRef } = useDroppable({
    id: status.id,
    data: {
      type: COLUMN_TYPE,
      status,
    },
  });

  return (
    <div className="shrink-0 w-80 flex flex-col">
      <div className="flex items-center gap-2 mb-4 px-1">
        <StatusIcon statusId={status.id} color={status.color} size="sm" />
        <h2 className="font-medium text-sm">{status.name}</h2>
        <span className="text-xs opacity-40 ml-auto">{tickets.length}</span>
      </div>

      <div
        ref={setNodeRef}
        className={`
          flex flex-col gap-3 min-h-[200px] h-screen p-1
          rounded-md transition-all duration-150
          ${isOver ? "bg-stone-100" : ""}
        `}
      >
        <SortableContext
          items={tickets.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tickets.map((ticket) => (
            <Card key={ticket.id} ticket={ticket} />
          ))}
        </SortableContext>

        {tickets.length === 0 && !isOver && (
          <div className="flex items-center justify-center h-32 opacity-20 text-xs">
            No tickets
          </div>
        )}
      </div>
    </div>
  );
}
