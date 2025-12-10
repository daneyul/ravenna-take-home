import * as Popover from "@radix-ui/react-popover";
import { clsx } from "clsx";
import { useAtomValue, useSetAtom } from "jotai";
import { useState } from "react";
import { toast } from "sonner";
import { labelsAtom, updateTicketAtom } from "@/atoms";
import { BORDER_STYLES } from "@/lib/styles";
import type { Label as LabelType, Ticket } from "@/types/ticket";
import { PopoverContent } from "./PopoverContent";

interface LabelProps {
  label: LabelType;
  ticket: Ticket;
  interactive?: boolean;
}

export function Label({ label, ticket, interactive = false }: LabelProps) {
  const [open, setOpen] = useState(false);
  const allLabels = useAtomValue(labelsAtom);
  const updateTicket = useSetAtom(updateTicketAtom);

  const handleToggleLabel = (labelId: string) => {
    const currentLabelIds = ticket.labels.map((l) => l.id);
    const hasLabel = currentLabelIds.includes(labelId);
    const labelName = allLabels.find((l) => l.id === labelId)?.name;

    const newLabels = hasLabel
      ? ticket.labels.filter((l) => l.id !== labelId)
      : [...ticket.labels, allLabels.find((l) => l.id === labelId)!];

    updateTicket({
      ...ticket,
      labels: newLabels,
    });

    toast.success(hasLabel ? `Removed ${labelName} label` : `Added ${labelName} label`);
  };

  const content = (
    <div
      className={clsx(
        "rounded-sm flex items-center px-2 py-1.5 hover:bg-stone-100 transition-all duration-150",
        BORDER_STYLES.interactive
      )}
    >
      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: label.color }} />
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs">
        {label.name}
      </span>
    </div>
  );

  if (!interactive) {
    return content;
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="transition-all duration-150 cursor-pointer bg-white hover:bg-stone-100"
        >
          {content}
        </button>
      </Popover.Trigger>

      <PopoverContent title="Change labels" className="w-48">
        <div className="max-h-48 overflow-y-auto">
          {allLabels.map((l) => {
            const isSelected = ticket.labels.some((tl) => tl.id === l.id);
            return (
              <button
                key={l.id}
                type="button"
                onClick={() => handleToggleLabel(l.id)}
                className={clsx(
                  "w-full px-2 py-1.5 text-sm flex items-center gap-2 hover:bg-stone-100 rounded transition-colors duration-150",
                  isSelected && "bg-stone-100"
                )}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: l.color }}
                />
                <span className="text-xs">{l.name}</span>
                {isSelected && <span className="ml-auto text-xs opacity-70">✓</span>}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover.Root>
  );
}
