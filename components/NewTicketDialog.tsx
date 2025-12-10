"use client";

import * as Dialog from "@radix-ui/react-dialog";
import * as Popover from "@radix-ui/react-popover";
import { Cross2Icon, PlusIcon, Cross1Icon } from "@radix-ui/react-icons";
import { useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { clsx } from "clsx";
import { toast } from "sonner";
import { motion } from "motion/react";
import {
  addTicketAtom,
  statusesAtom,
  labelsAtom,
  assigneesAtom,
  requestersAtom,
} from "@/atoms/tickets";
import type { Priority, Requester, Label } from "@/types/ticket";
import { BORDER_STYLES } from "@/lib/styles";
import { PriorityIcon } from "./PriorityIcon";
import { StatusDropdown } from "./tickets/StatusDropdown";
import { AssigneeDropdown } from "./tickets/AssigneeDropdown";
import { RequesterCombobox } from "./RequesterCombobox";
import Button from "./Button";

interface NewTicketDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewTicketDialog({ open, onOpenChange }: NewTicketDialogProps) {
  const statuses = useAtomValue(statusesAtom);
  const labels = useAtomValue(labelsAtom);
  const assignees = useAtomValue(assigneesAtom);
  const requesters = useAtomValue(requestersAtom);
  const addTicket = useSetAtom(addTicketAtom);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState(statuses[0]?.id || "");
  const [priority, setPriority] = useState<Priority>("medium");
  const [selectedAssignee, setSelectedAssignee] = useState<Requester | undefined>();
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [requesterName, setRequesterName] = useState("");
  const [requesterEmail, setRequesterEmail] = useState("");

  const currentStatus = statuses.find((s) => s.id === status);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (!requesterName.trim() || !requesterEmail.trim()) {
      toast.error("Requester information is required");
      return;
    }

    const requester: Requester = {
      name: requesterName,
      email: requesterEmail,
    };

    const ticketLabels = selectedLabels
      .map((labelId) => labels.find((l) => l.id === labelId))
      .filter((l): l is Label => l !== undefined);

    addTicket({
      title: title.trim(),
      description: description.trim() || undefined,
      status,
      priority,
      requester,
      requestFor: requester, // Using same as requester for now
      assignee: selectedAssignee,
      labels: ticketLabels,
      order: 0,
    });

    toast.success("Ticket created");

    // Reset form
    setTitle("");
    setDescription("");
    setStatus(statuses[0]?.id || "");
    setPriority("medium");
    setSelectedAssignee(undefined);
    setSelectedLabels([]);
    setRequesterName("");
    setRequesterEmail("");

    onOpenChange(false);
  };

  const toggleLabel = (labelId: string) => {
    setSelectedLabels((prev) =>
      prev.includes(labelId)
        ? prev.filter((id) => id !== labelId)
        : [...prev, labelId]
    );
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-white/50 backdrop-blur-md z-50" />
        <Dialog.Content asChild>
          <motion.div
            initial={{ scale: 0.97 }}
            animate={{ scale: 1 }}
            transition={{
              duration: 0.2,
              ease: "easeOut",
            }}
            className={clsx(
              "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
              "bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto z-50",
              BORDER_STYLES.base
            )}
          >
          {/* Header */}
          <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-4 border-b border-stone-200">
            <Dialog.Title className="font-medium">
              New Ticket
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                className="h-6 w-6 rounded hover:bg-stone-100 flex items-center justify-center transition-colors duration-150"
                aria-label="Close"
              >
                <Cross2Icon className="h-4 w-4 opacity-50" />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="p-4">
            {/* Title with Priority Icon */}
            <div className="flex items-center gap-3 mb-6">
              <PriorityIcon
                priority={priority}
                size="lg"
                interactive
                onPriorityChange={setPriority}
              />
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={clsx(
                  "flex-1 text-2xl font-medium outline-none",
                  "placeholder:opacity-40"
                )}
                placeholder="Ticket title"
                autoFocus
              />
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-6 mb-8 pb-8 border-b border-stone-200">
              {/* Status */}
              <div>
                <FormLabel>Status</FormLabel>
                <StatusDropdown
                  currentStatus={currentStatus}
                  statuses={statuses}
                  onStatusChange={setStatus}
                />
              </div>

              {/* Assignee */}
              <div>
                <FormLabel>Assignee</FormLabel>
                <AssigneeDropdown
                  currentAssignee={selectedAssignee}
                  assignees={assignees}
                  onAssigneeChange={setSelectedAssignee}
                />
              </div>

              {/* Requester Name */}
              <div>
                <FormLabel>
                  Requester Name <span className="text-red-500">*</span>
                </FormLabel>
                <RequesterCombobox
                  requesters={requesters}
                  value={requesterName}
                  onChange={(value, requester) => {
                    setRequesterName(value);
                    if (requester) {
                      setRequesterEmail(requester.email);
                    }
                  }}
                  placeholder="Enter name"
                  type="name"
                />
              </div>

              {/* Requester Email */}
              <div>
                <FormLabel>
                  Requester Email <span className="text-red-500">*</span>
                </FormLabel>
                <RequesterCombobox
                  requesters={requesters}
                  value={requesterEmail}
                  onChange={(value, requester) => {
                    setRequesterEmail(value);
                    if (requester) {
                      setRequesterName(requester.name);
                    }
                  }}
                  placeholder="Enter email"
                  type="email"
                />
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <FormLabel>Description</FormLabel>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={clsx(
                  "w-full min-h-[120px] px-3 py-2 text-sm rounded-md bg-white resize-y",
                  BORDER_STYLES.input
                )}
                placeholder="Add a description..."
              />
            </div>

            {/* Labels */}
            <div className="mb-8">
              <FormLabel>Labels</FormLabel>
              <div className="flex flex-wrap gap-1.5">
                {/* Selected Labels */}
                {selectedLabels.map((labelId) => {
                  const label = labels.find((l) => l.id === labelId);
                  if (!label) return null;
                  return (
                    <button
                      key={label.id}
                      type="button"
                      onClick={() => toggleLabel(label.id)}
                      className={clsx(
                        "rounded-sm flex items-center px-2 py-1.5 bg-white group transition-all duration-150 hover:opacity-80",
                        BORDER_STYLES.base
                      )}
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: label.color }}
                      />
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs">
                        {label.name}
                      </span>
                      <Cross1Icon className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity duration-150 -ml-1" />
                    </button>
                  );
                })}

                {/* Add Label Button */}
                <Popover.Root>
                  <Popover.Trigger asChild>
                    <button
                      type="button"
                      className={clsx(
                        "rounded-sm flex items-center justify-center cursor-pointer px-2 py-1.5 bg-white transition-all duration-150 hover:bg-stone-50",
                        BORDER_STYLES.interactive
                      )}
                      aria-label="Add label"
                    >
                      <PlusIcon className="w-3 h-3 opacity-50" />
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
                          {labels.map((label) => {
                            const isSelected = selectedLabels.includes(label.id);
                            return (
                              <button
                                key={label.id}
                                type="button"
                                onClick={() => toggleLabel(label.id)}
                                className={clsx(
                                  "w-full px-2 py-1.5 text-sm flex items-center gap-2 hover:bg-stone-100 rounded transition-colors duration-150",
                                  isSelected && "bg-stone-50"
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

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="px-4 py-2 text-sm rounded-md hover:bg-stone-100 transition-colors duration-150"
                >
                  Cancel
                </button>
              </Dialog.Close>
              <Button
                icon={<PlusIcon />}
                onClick={() => handleSubmit()}
              >
                Create Ticket
              </Button>
            </div>
          </form>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function FormLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-sm block mb-3 font-medium">
      {children}
    </label>
  );
}
