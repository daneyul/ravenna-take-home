import * as Select from "@radix-ui/react-select";
import { ChevronDownIcon, CheckIcon } from "@radix-ui/react-icons";
import { useAtom } from "jotai";
import { clsx } from "clsx";
import { groupByAtom, type GroupBy } from "@/atoms/tickets";
import { BORDER_STYLES, BUTTON_STYLES } from "@/lib/styles";
import { ProgressRing } from "./ProgressRing";
import { PersonIcon } from "@radix-ui/react-icons";
import { PriorityIcon } from "./PriorityIcon";
import { motion } from "motion/react";

const GROUP_OPTIONS: { value: GroupBy; label: string; icon: React.ReactNode }[] = [
  {
    value: "status",
    label: "Status",
    icon: <ProgressRing color="#2563eb" fill={50} dashed={false} size="sm" />,
  },
  {
    value: "assignee",
    label: "Assignee",
    icon: <PersonIcon className="w-4 h-4" />,
  },
  {
    value: "priority",
    label: "Priority",
    icon: <PriorityIcon priority="high" size="sm" />,
  },
  {
    value: "label",
    label: "Label",
    icon: (
      <div className="flex gap-0.5">
        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
      </div>
    ),
  },
];

export function GroupButton() {
  const [groupBy, setGroupBy] = useAtom(groupByAtom);
  const currentOption = GROUP_OPTIONS.find((opt) => opt.value === groupBy);

  return (
    <Select.Root value={groupBy} onValueChange={(value) => setGroupBy(value as GroupBy)}>
      <Select.Trigger asChild>
        <button
          className={clsx(
            "p-2 rounded cursor-pointer bg-white flex items-center gap-2",
            BUTTON_STYLES.base,
            "transition-all duration-150",
            "focus:outline-none focus:ring-1 focus:ring-blue-400",
            "hover:bg-stone-100",
          )}
          aria-label="Group by"
        >
          {currentOption?.icon}
          <span className="text-sm font-medium">{currentOption?.label}</span>
          <ChevronDownIcon className="w-3 h-3 ml-1 opacity-50" />
        </button>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          position="popper"
          sideOffset={4}
          className="bg-white rounded-md shadow-lg border border-stone-200 overflow-hidden z-50"
        >
            <motion.div
            initial={{ scale: 0.97, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.97, opacity: 0 }}
            transition={{
              duration: 0.15,
              ease: "easeOut",
            }}
            style={{ transformOrigin: "top center" }}
          >
          <Select.Viewport className="p-1">
            {GROUP_OPTIONS.map((option) => (
              <Select.Item
                key={option.value}
                value={option.value}
                className={clsx(
                  "px-3 py-2 text-sm rounded cursor-pointer outline-none",
                  "hover:bg-stone-100 focus:bg-stone-100",
                  "flex items-center gap-2 relative pr-8"
                )}
              >
                {option.icon}
                <Select.ItemText>{option.label}</Select.ItemText>
                <Select.ItemIndicator className="absolute right-2">
                  <CheckIcon className="w-4 h-4" />
                </Select.ItemIndicator>
              </Select.Item>
          ))}
          </Select.Viewport>
          </motion.div>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
