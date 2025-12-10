"use client";

import {
  ArrowLeftIcon,
  DotsVerticalIcon,
  EnvelopeClosedIcon,
  PlusIcon,
  TrashIcon,
} from "@radix-ui/react-icons";
import * as Popover from "@radix-ui/react-popover";
import { clsx } from "clsx";
import { useAtomValue, useSetAtom } from "jotai";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { startTransition, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  assigneesAtom,
  deleteTicketAtom,
  labelsAtom,
  requestersAtom,
  statusesAtom,
  updateTicketAtom,
} from "@/atoms";
import { BORDER_STYLES } from "@/lib/styles";
import type { Requester, Ticket } from "@/types/ticket";
import { Label } from "../Label";
import { PriorityIcon } from "../PriorityIcon";
import { RequesterCombobox } from "../RequesterCombobox";
import { AssigneeDropdown } from "./AssigneeDropdown";
import { StatusDropdown } from "./StatusDropdown";

interface TicketDetailViewProps {
  ticket: Ticket;
}

export function TicketDetailView({ ticket }: TicketDetailViewProps) {
  const router = useRouter();
  const statuses = useAtomValue(statusesAtom);
  const assignees = useAtomValue(assigneesAtom);
  const allLabels = useAtomValue(labelsAtom);
  const requesters = useAtomValue(requestersAtom);
  const updateTicket = useSetAtom(updateTicketAtom);
  const deleteTicket = useSetAtom(deleteTicketAtom);
  const currentStatus = statuses.find((s) => s.id === ticket.status);

  const [description, setDescription] = useState(ticket.description || "");
  const [requesterEmail, setRequesterEmail] = useState(ticket.requester.email);
  const [requestForEmail, setRequestForEmail] = useState(ticket.requestFor.email);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [shouldAnimateDelete, setShouldAnimateDelete] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const prevTicketIdRef = useRef<string>(ticket.id);

  // Reset local state when ticket ID changes
  useEffect(() => {
    if (prevTicketIdRef.current !== ticket.id) {
      prevTicketIdRef.current = ticket.id;
      startTransition(() => {
        setDescription(ticket.description || "");
        setRequesterEmail(ticket.requester.email);
        setRequestForEmail(ticket.requestFor.email);
      });
    }
  }, [ticket.id, ticket.description, ticket.requester, ticket.requestFor]);

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

  const handleToggleLabel = (labelId: string) => {
    const currentLabelIds = ticket.labels.map((l) => l.id);
    const hasLabel = currentLabelIds.includes(labelId);
    const labelName = allLabels.find((l) => l.id === labelId)?.name;

    const newLabels = hasLabel
      ? ticket.labels.filter((l) => l.id !== labelId)
      : [...ticket.labels, allLabels.find((l) => l.id === labelId)!].filter(Boolean);

    updateTicket({
      ...ticket,
      labels: newLabels,
    });

    toast.success(hasLabel ? `Removed ${labelName} label` : `Added ${labelName} label`);
  };

  const handleRequesterChange = (value: string, requester?: Requester) => {
    setRequesterEmail(value);
    if (requester) {
      updateTicket({
        ...ticket,
        requester: { name: requester.name, email: requester.email },
      });
      toast.success("Requester updated");
    }
  };

  const handleRequestForChange = (value: string, requester?: Requester) => {
    setRequestForEmail(value);
    if (requester) {
      updateTicket({
        ...ticket,
        requestFor: { name: requester.name, email: requester.email },
      });
      toast.success("Requested for updated");
    }
  };

  const handleDeleteTicket = () => {
    if (!deleteConfirm) {
      setShouldAnimateDelete(true);
      setDeleteConfirm(true);
      return;
    }

    deleteTicket(ticket.id);
    toast.success("Ticket deleted");
    router.push("/tickets");
  };

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center gap-4 px-6 py-4 border-b border-stone-200">
        <button
          type="button"
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

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-8 pb-16">
          <div className="flex items-center gap-2 mb-6">
            <PriorityIcon
              priority={ticket.priority}
              size="lg"
              interactive
              ticket={ticket}
            />
            <h1 className="text-2xl font-medium">{ticket.title}</h1>
            <Popover.Root
              onOpenChange={(open) => {
                if (!open) {
                  setDeleteConfirm(false);
                  setShouldAnimateDelete(false);
                }
              }}
            >
              <Popover.Trigger asChild>
                <button
                  type="button"
                  className="w-[24px] h-[24px] bg-white p-1 cursor-pointer border border-stone-300 rounded-sm hover:border-stone-300 hover:shadow-sm transition-colors duration-150 ml-auto flex items-center justify-center"
                  aria-label="Ticket options"
                >
                  <DotsVerticalIcon className="w-4 h-4" />
                </button>
              </Popover.Trigger>

              <Popover.Portal>
                <Popover.Content
                  align="end"
                  sideOffset={4}
                  className={clsx(
                    "bg-white rounded-md shadow-lg z-50",
                    BORDER_STYLES.base
                  )}
                >
                  <div className="p-1">
                    <motion.button
                      layout
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      type="button"
                      onClick={handleDeleteTicket}
                      className={clsx(
                        "w-48 px-3 py-2 text-sm text-left rounded flex items-center gap-2 transition-colors duration-150",
                        "hover:bg-red-50 text-red-600 cursor-pointer"
                      )}
                    >
                      <TrashIcon className="w-4 h-4 shrink-0" />
                      <div className="relative overflow-hidden">
                        <AnimatePresence mode="wait" initial={false}>
                          <motion.span
                            key={deleteConfirm ? "confirm" : "delete"}
                            {...(shouldAnimateDelete && {
                              initial: { opacity: 0, y: 10 },
                              exit: { opacity: 0, y: -10 },
                            })}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.15, ease: "easeInOut" }}
                            className="inline-block"
                          >
                            {deleteConfirm ? "Click again to confirm" : "Delete ticket"}
                          </motion.span>
                        </AnimatePresence>
                      </div>
                    </motion.button>
                  </div>
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8 pb-8 border-b border-stone-200">
            <div>
              <DetailLabel>Status</DetailLabel>
              <StatusDropdown
                currentStatus={currentStatus}
                statuses={statuses}
                onStatusChange={handleStatusChange}
              />
            </div>

            <div>
              <DetailLabel>Assignee</DetailLabel>
              <AssigneeDropdown
                currentAssignee={ticket.assignee}
                assignees={assignees}
                onAssigneeChange={handleAssigneeChange}
              />
            </div>

            <div>
              <DetailLabel>Requested By</DetailLabel>
              <RequesterCombobox
                requesters={requesters}
                value={requesterEmail}
                onChange={handleRequesterChange}
                placeholder="Enter email"
                type="email"
              />
            </div>

            <div>
              <DetailLabel>Requested For</DetailLabel>
              <RequesterCombobox
                requesters={requesters}
                value={requestForEmail}
                onChange={handleRequestForChange}
                placeholder="Enter email"
                type="email"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <DetailLabel>Created At</DetailLabel>
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
            <div>
              <DetailLabel>Created By</DetailLabel>
              <button
                type="button"
                className={clsx(
                  "flex items-center gap-2 px-3 py-2 rounded-md bg-white text-sm",
                  BORDER_STYLES.interactive,
                  "transition-all duration-150 hover:bg-stone-50"
                )}
              >
                <EnvelopeClosedIcon className="w-4 h-4 opacity-70" />
                <span>Subject: Issue</span>
              </button>
            </div>
          </div>

          <div className="mb-8">
            <label htmlFor="description" className="text-sm block mb-3 font-medium">
              Description
            </label>
            <textarea
              id="description"
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

          <div>
            <DetailLabel>Labels</DetailLabel>
            <div className="flex flex-wrap gap-1.5">
              {ticket.labels.map((label) => (
                <Label key={label.id} label={label} ticket={ticket} interactive />
              ))}

              {/* Add Label Button */}
              <Popover.Root>
                <Popover.Trigger asChild>
                  <button
                    type="button"
                    className={clsx(
                      "rounded-sm flex cursor-pointer items-center justify-center px-2 py-1.5 bg-white transition-all duration-150 hover:bg-stone-100",
                      BORDER_STYLES.base
                    )}
                    aria-label="Add label"
                  >
                    <PlusIcon className="w-3 h-3 opacity-70" />
                  </button>
                </Popover.Trigger>

                <Popover.Portal>
                  <Popover.Content
                    align="start"
                    sideOffset={4}
                    className={clsx(
                      "bg-white rounded-md shadow-lg w-48 z-50",
                      BORDER_STYLES.base
                    )}
                  >
                    <div className="p-2">
                      <div className="text-xs opacity-70 mb-2 px-2">Add labels</div>
                      <div className="max-h-48 overflow-y-auto">
                        {allLabels.map((label) => {
                          const isSelected = ticket.labels.some((l) => l.id === label.id);
                          return (
                            <button
                              key={label.id}
                              type="button"
                              onClick={() => handleToggleLabel(label.id)}
                              className={clsx(
                                "w-full px-2 py-1.5 text-sm flex items-center gap-2 hover:bg-stone-100 rounded transition-colors duration-150",
                                isSelected && "bg-stone-100"
                              )}
                            >
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: label.color }}
                              />
                              <span className="text-xs">{label.name}</span>
                              {isSelected && (
                                <span className="ml-auto text-xs opacity-50">✓</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </Popover.Content>
                </Popover.Portal>
              </Popover.Root>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-sm block mb-3 font-medium">{children}</div>;
}
