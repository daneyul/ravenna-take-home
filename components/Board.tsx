"use client";

import {
  closestCorners,
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useAtomValue, useSetAtom } from "jotai";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  statusesAtom,
  ticketsByStatusAtom,
  reorderTicketsAtom,
} from "@/atoms/tickets";
import type { Ticket } from "@/types/ticket";
import { COLUMN_TYPE, TICKET_TYPE } from "@/types/ticket";
import { Card } from "./Card";
import { Column } from "./Column";

export function Board() {
  const statuses = useAtomValue(statusesAtom);
  const ticketsByStatus = useAtomValue(ticketsByStatusAtom);
  const reorderTickets = useSetAtom(reorderTicketsAtom);
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const dragSensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (active.data.current?.type === TICKET_TYPE) {
      setActiveTicket(active.data.current.ticket);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    setOverId(over?.id as string | null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTicket(null);
    setOverId(null);

    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (activeData?.type !== TICKET_TYPE) return;

    const ticketId = active.id as string;
    const ticket = activeData.ticket as Ticket;

    // Dropped over a column
    if (overData?.type === COLUMN_TYPE) {
      const newStatus = over.id as string;
      const ticketsInColumn = ticketsByStatus.get(newStatus) || [];

      // Add to end of column
      const newOrder = ticket.status === newStatus
        ? ticket.order  // Same column, keep order
        : ticketsInColumn.length;  // New column, add to end

      if (ticket.status !== newStatus || ticket.order !== newOrder) {
        reorderTickets({ ticketId, newStatus, newOrder });
      }
    }

    // Dropped over another ticket
    if (overData?.type === TICKET_TYPE) {
      const overTicket = overData.ticket as Ticket;
      const newStatus = overTicket.status;
      const newOrder = overTicket.order;

      // Only reorder if position changed
      if (ticket.status !== newStatus || ticket.order !== newOrder) {
        reorderTickets({ ticketId, newStatus, newOrder });
      }
    }
  };

  if (!isMounted) {
    return (
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-x-auto overflow-y-auto">
          <div className="flex gap-4 p-6 min-h-full">
            {statuses.map((status) => {
              const tickets = ticketsByStatus.get(status.id) || [];
              return (
                <div key={status.id} className="shrink-0 w-80 flex flex-col opacity-0">
                  <div className="flex items-center gap-2 mb-4 px-1">
                    <h2 className="font-medium text-sm">{status.name}</h2>
                  </div>
                </div>
              );
            })}
            <div className="shrink-0 w-2" aria-hidden="true" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={dragSensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-x-auto overflow-y-auto">
          <div className="flex gap-4 p-6 min-h-full">
            {statuses.map((status, columnIndex) => {
              const tickets = ticketsByStatus.get(status.id) || [];
              const isOver = overId === status.id || tickets.some(t => t.id === overId);
              return (
                <motion.div
                  key={status.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.2,
                    delay: columnIndex * 0.1,
                    ease: "easeOut",
                  }}
                >
                  <Column status={status} tickets={tickets} isOver={isOver} columnIndex={columnIndex} />
                </motion.div>
              );
            })}
            {/* spacer to ensure padding after last column when scrolling */}
            <div className="shrink-0 w-2" aria-hidden="true" />
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeTicket ? (
          <div
            style={{ transform: "scale(0.95)", cursor: "grabbing" }}
          >
            <Card ticket={activeTicket} isPreview />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
