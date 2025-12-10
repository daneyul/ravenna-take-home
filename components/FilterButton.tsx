import * as Popover from "@radix-ui/react-popover";
import { motion, AnimatePresence } from "motion/react";
import * as Select from "@radix-ui/react-select";
import { ChevronDownIcon, MixerHorizontalIcon, Cross2Icon, ArrowLeftIcon, ResetIcon } from "@radix-ui/react-icons";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useState, useEffect } from "react";
import { clsx } from "clsx";
import { statusesAtom, ticketFiltersAtom, labelsAtom, addLabelAtom, assigneesAtom, requestersAtom } from "@/atoms/tickets";
import { getStatusColor } from "@/utils/status";
import { ProgressRing } from "./ProgressRing";
import { BORDER_STYLES, BUTTON_STYLES } from "@/lib/styles";
import Button from "./Button";

const LABEL_COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#ec4899", // pink
  "#8b5cf6", // purple
  "#ef4444", // red
  "#06b6d4", // cyan
  "#6366f1", // indigo
];

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
  const labels = useAtomValue(labelsAtom);
  const assignees = useAtomValue(assigneesAtom);
  const requesters = useAtomValue(requestersAtom);
  const addLabel = useSetAtom(addLabelAtom);
  const [filters, setFilters] = useAtom(ticketFiltersAtom);
  const [open, setOpen] = useState(false);
  const [selectOpen, setSelectOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [labelInputValue, setLabelInputValue] = useState("");
  const [labelDropdownOpen, setLabelDropdownOpen] = useState(false);
  const [creatingLabelName, setCreatingLabelName] = useState<string | null>(null);
  const selectedColor = getStatusColor(filters.status || "all", statuses);

  const placeholders = [
    "Search tickets...",
    "Search by label...",
    `Search by assignee...`,
    `Search by status...`,
    "Search by description..."
  ];

  const [currentPlaceholderIndex, setCurrentPlaceholderIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [placeholders.length]);

  const filteredLabels = labels.filter((label) =>
    label.name.toLowerCase().includes(labelInputValue.toLowerCase())
  );

  const selectedLabels = labels.filter((label) =>
    filters.labels?.includes(label.id)
  );

  const handleLabelSelect = (labelId: string) => {
    const currentLabels = filters.labels || [];
    const isSelected = currentLabels.includes(labelId);
    const newLabels = isSelected
      ? currentLabels.filter((id) => id !== labelId)
      : [...currentLabels, labelId];
    setFilters({
      ...filters,
      labels: newLabels.length > 0 ? newLabels : undefined,
    });
  };

  const handleRemoveLabel = (labelId: string) => {
    const currentLabels = filters.labels || [];
    const newLabels = currentLabels.filter((id) => id !== labelId);
    setFilters({
      ...filters,
      labels: newLabels.length > 0 ? newLabels : undefined,
    });
  };

  const handleCreateLabel = (color: string) => {
    if (!creatingLabelName) return;

    const newLabelId = addLabel({
      name: creatingLabelName,
      color,
    });

    handleLabelSelect(newLabelId);
    setCreatingLabelName(null);
    setLabelInputValue("");
  };

  const handleClearAll = () => {
    setFilters({
      search: "",
      status: undefined,
      labels: undefined,
      assignee: undefined,
      requester: undefined,
      requestFor: undefined,
    });
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          className={clsx(
            "p-2.5 rounded cursor-pointer bg-white",
            BUTTON_STYLES.base,
            "transition-all duration-150",
            "hover:bg-stone-100",
            "focus:outline-none focus:ring-1 focus:ring-blue-400"
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
            className={clsx("bg-white rounded-sm shadow-md p-4 w-64 z-50 relative", BORDER_STYLES.base)}
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
                <div className="relative">
                  <input
                    type="text"
                    value={filters.search || ""}
                    onChange={(e) =>
                      setFilters({ ...filters, search: e.target.value })
                    }
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className={clsx("w-full px-3 py-2 rounded-sm text-sm", BORDER_STYLES.input)}
                  />
                  {!filters.search && !isFocused && (
                    <div className="absolute inset-0 px-3 py-2 pointer-events-none overflow-hidden">
                      <AnimatePresence mode="popLayout">
                        <motion.span
                          key={currentPlaceholderIndex}
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 0.5 }}
                          exit={{ y: -20, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                          className="text-sm block"
                        >
                          {placeholders[currentPlaceholderIndex]}
                        </motion.span>
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm  block mb-1">Status</label>
                <Select.Root
                  value={filters.status || "all"}
                  onValueChange={(value) =>
                    setFilters({ ...filters, status: value === "all" ? undefined : value })
                  }
                  open={selectOpen}
                  onOpenChange={setSelectOpen}
                >
                  <Select.Trigger className={clsx("w-full px-3 py-2 rounded-sm text-sm flex items-center justify-between", BORDER_STYLES.input)}>
                    <div className="flex items-center gap-2">
                      {selectedColor && filters.status && filters.status !== "all" && (() => {
                        const statusId = filters.status === "waiting-for-vendor" ? "waiting-vendor" : filters.status === "waiting-for-requester" ? "waiting-requester" : filters.status;
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
                          "w-3 h-3 transition-transform duration-150 opacity-70",
                          selectOpen && "rotate-180"
                        )}
                      />
                    </Select.Icon>
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content
                      position="popper"
                      sideOffset={4}
                      className={clsx("bg-white rounded-sm min-w-(--radix-select-trigger-width)] z-50 border border-stone-300 shadow-md")}
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
              <div>
                <label className="text-sm block mb-1">Labels</label>
                {selectedLabels.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {selectedLabels.map((label) => (
                      <div
                        key={label.id}
                        className="px-2 py-1 rounded-sm text-xs font-medium border border-stone-300 flex items-center gap-1.5"
                        style={{
                          backgroundColor: `${label.color}15`,
                          color: label.color,
                        }}
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: label.color }}
                        />
                        {label.name}
                        <button
                          type="button"
                          onClick={() => handleRemoveLabel(label.id)}
                          className="ml-0.5 hover:opacity-70"
                        >
                          <Cross2Icon className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Type to search labels..."
                    value={labelInputValue}
                    onChange={(e) => setLabelInputValue(e.target.value)}
                    onFocus={() => setLabelDropdownOpen(true)}
                    onBlur={(e) => {
                      // Don't close if clicking inside the dropdown
                      if (!e.relatedTarget || !e.currentTarget.parentElement?.contains(e.relatedTarget as Node)) {
                        setTimeout(() => {
                          setLabelDropdownOpen(false);
                          setCreatingLabelName(null);
                        }, 200);
                      }
                    }}
                    className={clsx("w-full px-3 py-2 rounded-sm text-sm", BORDER_STYLES.input)}
                  />
                  {labelDropdownOpen && (
                    <div
                      className={clsx("absolute top-full left-0 right-0 mt-1 bg-white rounded-sm shadow-xs max-h-48 overflow-y-auto z-50", BORDER_STYLES.base)}
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      {creatingLabelName ? (
                        <div className="p-3 relative">
                          <button
                            type="button"
                            onClick={() => setCreatingLabelName(null)}
                            className="absolute top-2 left-2 p-1 hover:bg-stone-100 rounded transition-colors duration-150 z-10"
                            aria-label="Back to labels"
                          >
                            <ArrowLeftIcon className="w-3.5 h-3.5" />
                          </button>
                          <div className="text-xs opacity-70 mb-2 text-center">
                            Choose a color for "{creatingLabelName}"
                          </div>
                          <div className="grid grid-cols-4 gap-2">
                            {LABEL_COLORS.map((color) => (
                              <button
                                key={color}
                                type="button"
                                onClick={() => handleCreateLabel(color)}
                                className="w-8 h-8 rounded-full transition-transform duration-150 hover:scale-110"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>
                      ) : (
                        <>
                          {filteredLabels.length > 0 ? (
                            filteredLabels.map((label) => {
                              const isSelected = filters.labels?.includes(label.id);
                              return (
                                <button
                                  key={label.id}
                                  type="button"
                                  onClick={() => {
                                    handleLabelSelect(label.id);
                                    setLabelInputValue("");
                                  }}
                                  className={clsx(
                                    "w-full px-3 py-2 text-sm flex items-center gap-2 hover:bg-stone-100 transition-colors duration-150",
                                    isSelected && "bg-stone-50"
                                  )}
                                >
                                  <span
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: label.color }}
                                  />
                                  <span>{label.name}</span>
                                  {isSelected && (
                                    <span className="ml-auto text-xs opacity-50">✓</span>
                                  )}
                                </button>
                              );
                            })
                          ) : (
                            <div className="px-3 py-2 text-sm opacity-50">
                              No labels found
                            </div>
                          )}
                          {labelInputValue && (
                            <button
                              type="button"
                              onClick={() => setCreatingLabelName(labelInputValue)}
                              className="w-full px-3 py-2 text-sm flex items-center gap-2 hover:bg-stone-100 transition-colors duration-150 border-t border-stone-300"
                            >
                              <span className="opacity-50">Create label</span>
                              <span className="ml-auto text-xs font-medium">
                                "{labelInputValue}"
                              </span>
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm block mb-1">Assignee</label>
                <Select.Root
                  value={filters.assignee || "all"}
                  onValueChange={(value) =>
                    setFilters({ ...filters, assignee: value === "all" ? undefined : value })
                  }
                >
                  <Select.Trigger className={clsx("w-full px-3 py-2 rounded-sm text-sm flex items-center justify-between", BORDER_STYLES.input)}>
                    <Select.Value placeholder="All assignees" />
                    <Select.Icon>
                      <ChevronDownIcon className="w-3 h-3 opacity-70" />
                    </Select.Icon>
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content
                      position="popper"
                      sideOffset={4}
                      className={clsx("bg-white rounded-sm min-w-(--radix-select-trigger-width)] z-50 border border-stone-300 shadow-md")}
                    >
                      <Select.Viewport className="p-1">
                        <Select.Item value="all" className="px-3 py-2 text-sm rounded cursor-pointer outline-none hover:bg-stone-100 focus:bg-stone-100">
                          <Select.ItemText>All assignees</Select.ItemText>
                        </Select.Item>
                        {assignees.map((assignee) => (
                          <Select.Item key={assignee.email} value={assignee.email} className="px-3 py-2 text-sm rounded cursor-pointer outline-none hover:bg-stone-100 focus:bg-stone-100">
                            <Select.ItemText>{assignee.name}</Select.ItemText>
                          </Select.Item>
                        ))}
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
              </div>
              <div>
                <label className="text-sm block mb-1">Requester</label>
                <Select.Root
                  value={filters.requester || "all"}
                  onValueChange={(value) =>
                    setFilters({ ...filters, requester: value === "all" ? undefined : value })
                  }
                >
                  <Select.Trigger className={clsx("w-full px-3 py-2 rounded-sm text-sm flex items-center justify-between", BORDER_STYLES.input)}>
                    <Select.Value placeholder="All requesters" />
                    <Select.Icon>
                      <ChevronDownIcon className="w-3 h-3 opacity-70" />
                    </Select.Icon>
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content
                      position="popper"
                      sideOffset={4}
                      className={clsx("bg-white rounded-sm min-w-(--radix-select-trigger-width)] z-50 border border-stone-300 shadow-md")}
                    >
                      <Select.Viewport className="p-1">
                        <Select.Item value="all" className="px-3 py-2 text-sm rounded cursor-pointer outline-none hover:bg-stone-100 focus:bg-stone-100">
                          <Select.ItemText>All requesters</Select.ItemText>
                        </Select.Item>
                        {requesters.map((requester) => (
                          <Select.Item key={requester.email} value={requester.email} className="px-3 py-2 text-sm rounded cursor-pointer outline-none hover:bg-stone-100 focus:bg-stone-100">
                            <Select.ItemText>{requester.name}</Select.ItemText>
                          </Select.Item>
                        ))}
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
              </div>
              <div>
                <label className="text-sm block mb-1">Request For</label>
                <Select.Root
                  value={filters.requestFor || "all"}
                  onValueChange={(value) =>
                    setFilters({ ...filters, requestFor: value === "all" ? undefined : value })
                  }
                >
                  <Select.Trigger className={clsx("w-full px-3 py-2 rounded-sm text-sm flex items-center justify-between", BORDER_STYLES.input)}>
                    <Select.Value placeholder="All recipients" />
                    <Select.Icon>
                      <ChevronDownIcon className="w-3 h-3 opacity-70" />
                    </Select.Icon>
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content
                      position="popper"
                      sideOffset={4}
                      className={clsx("bg-white rounded-sm min-w-(--radix-select-trigger-width)] z-50 border border-stone-300 shadow-md")}
                    >
                      <Select.Viewport className="p-1">
                        <Select.Item value="all" className="px-3 py-2 text-sm rounded cursor-pointer outline-none hover:bg-stone-100 focus:bg-stone-100">
                          <Select.ItemText>All recipients</Select.ItemText>
                        </Select.Item>
                        {requesters.map((requester) => (
                          <Select.Item key={requester.email} value={requester.email} className="px-3 py-2 text-sm rounded cursor-pointer outline-none hover:bg-stone-100 focus:bg-stone-100">
                            <Select.ItemText>{requester.name}</Select.ItemText>
                          </Select.Item>
                        ))}
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
              </div>
              <div className="pt-2">
                <Button
                  onClick={handleClearAll}
                  className="w-full justify-center border border-stone-300"
                >
                  Clear all filters
                </Button>
              </div>
            </div>
          </motion.div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
