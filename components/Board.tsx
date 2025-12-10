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
  groupColumnsAtom,
  ticketsByGroupAtom,
  updateTicketGroupAtom,
  groupByAtom,
} from "@/atoms/tickets";
import type { Ticket } from "@/types/ticket";
import { COLUMN_TYPE, TICKET_TYPE } from "@/types/ticket";
import { Card } from "./Card";
import { Column } from "./Column";
import { EmptyState } from "./EmptyState";

export function Board() {
  const groupColumns = useAtomValue(groupColumnsAtom);
  const ticketsByGroup = useAtomValue(ticketsByGroupAtom);
  const updateTicketGroup = useSetAtom(updateTicketGroupAtom);
  const groupBy = useAtomValue(groupByAtom);
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setIsMounted(true);
    }, 100);
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

    // Get current group value for the ticket
    let currentGroupValue: string;
    switch (groupBy) {
      case "status":
        currentGroupValue = ticket.status;
        break;
      case "assignee":
        currentGroupValue = ticket.assignee?.email || "unassigned";
        break;
      case "priority":
        currentGroupValue = ticket.priority;
        break;
      case "label":
        currentGroupValue = ticket.labels.length > 0 ? ticket.labels[0].id : "no-labels";
        break;
      default:
        currentGroupValue = ticket.status;
    }

    // Dropped over a column
    if (overData?.type === COLUMN_TYPE) {
      const newGroupValue = over.id as string;
      const ticketsInColumn = ticketsByGroup.get(newGroupValue) || [];

      // Add to end of column
      const newOrder = currentGroupValue === newGroupValue
        ? ticket.order  // Same column, keep order
        : ticketsInColumn.length;  // New column, add to end

      if (currentGroupValue !== newGroupValue || ticket.order !== newOrder) {
        updateTicketGroup({ ticketId, groupValue: newGroupValue, newOrder });
      }
    }

    // Dropped over another ticket
    if (overData?.type === TICKET_TYPE) {
      const overTicket = overData.ticket as Ticket;

      // Get target group value
      let newGroupValue: string;
      switch (groupBy) {
        case "status":
          newGroupValue = overTicket.status;
          break;
        case "assignee":
          newGroupValue = overTicket.assignee?.email || "unassigned";
          break;
        case "priority":
          newGroupValue = overTicket.priority;
          break;
        case "label":
          newGroupValue = overTicket.labels.length > 0 ? overTicket.labels[0].id : "no-labels";
          break;
        default:
          newGroupValue = overTicket.status;
      }

      const newOrder = overTicket.order;

      // Only reorder if position changed
      if (currentGroupValue !== newGroupValue || ticket.order !== newOrder) {
        updateTicketGroup({ ticketId, groupValue: newGroupValue, newOrder });
      }
    }
  };

  if (!isMounted) {
    return (
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-x-auto overflow-y-auto">
          <div className="flex gap-4 p-6 pb-8 min-h-full">
            {groupColumns
              .filter((column) => {
                const tickets = ticketsByGroup.get(column.id) || [];
                return tickets.length > 0;
              })
              .map((column) => {
                return (
                  <div key={column.id} className="shrink-0 w-80 flex flex-col opacity-0">
                    <div className="flex items-center gap-2 mb-4 px-1">
                      <h2 className="font-medium text-sm">{column.name}</h2>
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

  // Check if there are any tickets at all
  const hasAnyTickets = Array.from(ticketsByGroup.values()).some(
    (tickets) => tickets.length > 0
  );

  return (
    <DndContext
      sensors={dragSensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex-1 overflow-hidden">
        {!hasAnyTickets ? (
          <EmptyState />
        ) : (
          <div className="h-full overflow-x-auto overflow-y-auto">
            <div className="flex gap-4 p-6 pb-8 min-h-full">
              {groupColumns
                .filter((column) => {
                  const tickets = ticketsByGroup.get(column.id) || [];
                  return tickets.length > 0;
                })
                .map((column, columnIndex) => {
                  const tickets = ticketsByGroup.get(column.id) || [];
                  const isOver = overId === column.id || tickets.some(t => t.id === overId);
                  return (
                    <motion.div
                      key={column.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.2,
                        delay: columnIndex * 0.1,
                        ease: "easeOut",
                      }}
                    >
                      <Column column={column} tickets={tickets} isOver={isOver} columnIndex={columnIndex} />
                    </motion.div>
                  );
                })}
              {/* spacer to ensure padding after last column when scrolling */}
              <div className="shrink-0 w-2" aria-hidden="true" />
            </div>
          </div>
        )}
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
