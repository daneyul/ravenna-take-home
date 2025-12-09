import * as Popover from "@radix-ui/react-popover";
import { motion } from "motion/react";
import * as Select from "@radix-ui/react-select";
import { ChevronDownIcon, MixerHorizontalIcon, Cross2Icon } from "@radix-ui/react-icons";
import { useAtomValue } from "jotai";
import { useState } from "react";
import { clsx } from "clsx";
import { statusesAtom } from "@/atoms/tickets";
import { getStatusColor } from "@/utils/status";
import { ProgressRing } from "./ProgressRing";

interface SelectItemWrapperProps {
  value: string;
  label: string;
  color?: string;
}

function getStatusProgressStyle(statusId: string) {
  switch (statusId) {
    case "new":
      return { fill: 0, dashed: true };
    case "in-progress":
      return { fill: 50, dashed: false };
    case "waiting-vendor":
    case "waiting-requester":
      return { fill: 50, dashed: false };
    case "done":
      return { fill: 100, dashed: false };
    default:
      return { fill: 0, dashed: true };
  }
}

function SelectItemWrapper({ value, label, color }: SelectItemWrapperProps) {
  const statusId = value === "all" ? undefined : value === "waiting-for-vendor" ? "waiting-vendor" : value === "waiting-for-requester" ? "waiting-requester" : value;
  const progressStyle = statusId ? getStatusProgressStyle(statusId) : null;

  return (
    <Select.Item
      value={value}
      className="px-3 py-2 text-sm rounded cursor-pointer outline-none hover:bg-stone-100 focus:bg-stone-100 flex items-center gap-2"
    >
      {color && progressStyle ? (
        <ProgressRing
          color={color}
          fill={progressStyle.fill}
          dashed={progressStyle.dashed}
          size="sm"
        />
      ) : null}
      <Select.ItemText>{label}</Select.ItemText>
    </Select.Item>
  );
}

export function FilterButton() {
  const statuses = useAtomValue(statusesAtom);
  const [selectedValue, setSelectedValue] = useState("all");
  const [open, setOpen] = useState(false);
  const [selectOpen, setSelectOpen] = useState(false);
  const selectedColor = getStatusColor(selectedValue, statuses);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          className={clsx(
            "p-2.5 rounded border cursor-pointer",
            "bg-white border-stone-200 shadow-xs",
            "hover:border-stone-300",
            "transition-all duration-150 active:scale-97"
          )}
          aria-label="Filter tickets"
        >
          <MixerHorizontalIcon className="w-4 h-4 opacity-70" />
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content asChild sideOffset={8}>
          <motion.div
            initial={{ scale: 0.97, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.97, opacity: 0 }}
            transition={{
              duration: 0.15,
              ease: "easeOut",
            }}
            style={{ transformOrigin: "top center" }}
            className="bg-white border border-stone-200 rounded-md shadow-lg p-4 w-64 z-50 relative"
          >
            <Popover.Close asChild>
              <button
                className={clsx(
                  "absolute top-3 right-3 p-1 rounded",
                  "hover:bg-stone-100 transition-colors duration-150",
                  "outline-none focus:ring-1 focus:ring-blue-400"
                )}
                aria-label="Close filter"
              >
                <Cross2Icon className="w-3.5 h-3.5 opacity-60" />
              </button>
            </Popover.Close>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-sm  block mb-1">Search</label>
                <input
                  type="text"
                  placeholder="Search tickets..."
                  className="w-full px-3 py-2 border border-stone-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="text-sm  block mb-1">Status</label>
                <Select.Root
                  value={selectedValue}
                  onValueChange={setSelectedValue}
                  open={selectOpen}
                  onOpenChange={setSelectOpen}
                >
                  <Select.Trigger className="w-full px-3 py-2 border border-stone-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {selectedColor && selectedValue !== "all" && (() => {
                        const statusId = selectedValue === "waiting-for-vendor" ? "waiting-vendor" : selectedValue === "waiting-for-requester" ? "waiting-requester" : selectedValue;
                        const progressStyle = getStatusProgressStyle(statusId);
                        return (
                          <ProgressRing
                            color={selectedColor}
                            fill={progressStyle.fill}
                            dashed={progressStyle.dashed}
                            size="sm"
                          />
                        );
                      })()}
                      <Select.Value placeholder="All statuses" />
                    </div>
                    <Select.Icon className="transition-transform duration-150">
                      <ChevronDownIcon 
                        className={clsx(
                          "w-3 h-3 transition-transform duration-150",
                          selectOpen && "rotate-180"
                        )}
                      />
                    </Select.Icon>
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content
                      position="popper"
                      sideOffset={4}
                      className="bg-white border border-stone-200 rounded-md shadow-lg min-w-(--radix-select-trigger-width)] z-50"
                    >
                      <Select.Viewport className="p-1">
                        <SelectItemWrapper value="all" label="All statuses" />
                        <SelectItemWrapper
                          value="new"
                          label="New"
                          color={getStatusColor("new", statuses)}
                        />
                        <SelectItemWrapper
                          value="in-progress"
                          label="In Progress"
                          color={getStatusColor("in-progress", statuses)}
                        />
                        <SelectItemWrapper
                          value="waiting-for-vendor"
                          label="Waiting for Vendor"
                          color={getStatusColor("waiting-for-vendor", statuses)}
                        />
                        <SelectItemWrapper
                          value="waiting-for-requester"
                          label="Waiting for Requester"
                          color={getStatusColor(
                            "waiting-for-requester",
                            statuses
                          )}
                        />
                        <SelectItemWrapper
                          value="done"
                          label="Done"
                          color={getStatusColor("done", statuses)}
                        />
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
              </div>
            </div>
          </motion.div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
