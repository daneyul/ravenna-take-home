import * as Popover from "@radix-ui/react-popover";
import { useState } from "react";
import { useSetAtom } from "jotai";
import { clsx } from "clsx";
import { toast } from "sonner";
import type { Priority, Ticket } from "@/types/ticket";
import { updateTicketAtom } from "@/atoms/tickets";
import HighPriority from "./icons/HighPriority";
import MediumPriority from "./icons/MediumPriority";
import LowPriority from "./icons/LowPriority";
import SeverePriority from "./icons/SeverePriority";
import { PopoverContent } from "./PopoverContent";

interface PriorityIconProps {
  priority: Priority;
  ticket?: Ticket;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: "severe", label: "Severe" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
  { value: "none", label: "None" },
];

function PriorityIconContent({ priority, size = "sm" }: { priority: Priority; size?: "sm" | "md" | "lg" }) {
  const sizeClass = size === "sm" ? "w-4 h-4" : size === "md" ? "w-5 h-5" : "w-6 h-6";

  if (priority === "none") {
    return (
      <div
        className={clsx(
          sizeClass,
          "flex items-center justify-center",
          "border border-stone-300 rounded-sm bg-stone-100"
        )}
      />
    );
  }

  return (
    <div
      className={clsx(
        sizeClass,
        "flex items-center justify-center",
        "border border-stone-300 rounded-sm p-px"
      )}
    >
      {priority === "severe" && <SeverePriority />}
      {priority === "high" && <HighPriority />}
      {priority === "medium" && <MediumPriority />}
      {priority === "low" && <LowPriority />}
    </div>
  );
}

export function PriorityIcon({ priority, ticket, size = "sm", interactive = false, onClick }: PriorityIconProps) {
  const [open, setOpen] = useState(false);
  const updateTicket = useSetAtom(updateTicketAtom);

  const handleChangePriority = (newPriority: Priority) => {
    if (ticket) {
      updateTicket({
        ...ticket,
        priority: newPriority,
      });
      const priorityLabel = PRIORITY_OPTIONS.find(p => p.value === newPriority)?.label || newPriority;
      toast.success(`Priority changed to ${priorityLabel}`);
      setOpen(false);
    }
  };

  const content = <PriorityIconContent priority={priority} size={size} />;

  if (!interactive || !ticket) {
    return content;
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="inline-flex items-center transition-all duration-150 opacity-80 hover:opacity-100 hover:shadow-xs cursor-pointer"
          onClick={onClick}
        >
          {content}
        </button>
      </Popover.Trigger>

      <PopoverContent title="Change priority" className="w-40">
        <div className="space-y-1">
          {PRIORITY_OPTIONS.map((option) => {
            const isSelected = priority === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleChangePriority(option.value)}
                className={clsx(
                  "w-full px-2 py-1.5 text-sm flex items-center gap-2 hover:bg-stone-100 rounded transition-colors duration-150",
                  isSelected && "bg-stone-50"
                )}
              >
                <PriorityIconContent priority={option.value} size="sm" />
                <span className="text-sm">{option.label}</span>
                {isSelected && (
                  <span className="ml-auto text-sm opacity-50">✓</span>
                )}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover.Root>
  );
}
