"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { motion } from "motion/react";
import { useAtomValue, useAtom } from "jotai";
import type { Ticket, Priority } from "@/types/ticket";
import { COLUMN_TYPE } from "@/types/ticket";
import { groupByAtom, type GroupColumn } from "@/atoms/tickets";
import { columnSortAtom, type SortDirection } from "@/atoms";
import { sortTicketsByPriority } from "@/utils/sorting";
import { Card } from "./Card";
import { StatusIcon } from "./StatusIcon";
import { PriorityIcon } from "./PriorityIcon";
import { CaretUpIcon, CaretDownIcon, PersonIcon } from "@radix-ui/react-icons";

interface ColumnProps {
  column: GroupColumn;
  tickets: Ticket[];
  isOver?: boolean;
  columnIndex: number;
}

function ColumnHeader({
  column,
  groupBy,
  ticketCount,
  sortDirection,
  onSortClick,
}: {
  column: GroupColumn;
  groupBy: string;
  ticketCount: number;
  sortDirection: SortDirection;
  onSortClick: () => void;
}) {
  return (
    <div className="flex items-center gap-2 mb-2 px-1">
      {groupBy === "status" && column.color && (
        <StatusIcon statusId={column.id} color={column.color} size="sm" />
      )}
      {groupBy === "priority" && (
        <PriorityIcon priority={column.id as Priority} size="sm" />
      )}
      {groupBy === "assignee" && (
        column.id === "unassigned" ? (
          <div className="w-4 h-4 border border-stone-300 rounded-full" />
        ) : (
          <div className="w-5 h-5 rounded-full bg-stone-200 flex items-center justify-center">
            <PersonIcon className="w-3 h-3 opacity-70" />
          </div>
        )
      )}
      {groupBy === "label" && (
        column.id === "no-labels" ? (
          <div className="w-3 h-3 border border-stone-300 rounded-sm" />
        ) : (
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: column.color }}
          />
        )
      )}
      <h2 className="font-medium text-sm">{column.name}<sup className="text-xs opacity-70 ml-1">{ticketCount}</sup></h2>
      <button
        type="button"
        onClick={onSortClick}
        className="ml-auto w-6 h-6 flex items-center justify-center rounded-sm hover:bg-stone-100 transition-colors duration-150 cursor-pointer border border-stone-200 hover:border-stone-300 bg-white shadow-xs"
        aria-label="Sort by priority"
      >
        {sortDirection === "desc" ? (
          <CaretDownIcon />
        ) : (
          <CaretUpIcon />
        )}
      </button>
    </div>
  );
}

export function Column({ column, tickets, isOver = false, columnIndex }: ColumnProps) {
  const groupBy = useAtomValue(groupByAtom);
  const [columnSort, setColumnSort] = useAtom(columnSortAtom);

  const sortDirection = columnSort[column.id] || "asc";

  const handleSortClick = () => {
    setColumnSort((prev) => {
      const currentSort = prev[column.id] || "asc";
      const newSort: SortDirection = currentSort === "asc" ? "desc" : "asc";

      return {
        ...prev,
        [column.id]: newSort,
      };
    });
  };

  // Apply sorting to tickets
  const sortedTickets = sortTicketsByPriority(tickets, sortDirection);

  const { setNodeRef } = useDroppable({
    id: column.id,
    data: {
      type: COLUMN_TYPE,
      column,
    },
  });

  return (
    <div className="shrink-0 w-80 flex flex-col">
      <ColumnHeader
        column={column}
        groupBy={groupBy}
        ticketCount={tickets.length}
        sortDirection={sortDirection}
        onSortClick={handleSortClick}
      />

      <div
        ref={setNodeRef}
        className={`
          flex flex-col gap-3 min-h-[200px] p-1
          rounded-md transition-all duration-150
          ${isOver ? "bg-stone-100" : ""}
        `}
      >
        <SortableContext
          items={sortedTickets.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {sortedTickets.map((ticket, index) => (
            <motion.div
              key={ticket.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.2,
                delay: columnIndex * 0.1 + 0.15 + index * 0.05,
                ease: "easeOut",
              }}
            >
              <Card ticket={ticket} />
            </motion.div>
          ))}
        </SortableContext>

        {tickets.length === 0 && !isOver && (
          <div className="flex items-center justify-center h-32 opacity-70 text-sm">
            No tickets
          </div>
        )}
      </div>
    </div>
  );
}
