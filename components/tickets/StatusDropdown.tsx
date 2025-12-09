import { Status } from "@/types/ticket";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { clsx } from "clsx";
import { StatusIcon } from "../StatusIcon";
import { motion } from "motion/react";
import { BORDER_STYLES } from "@/lib/styles";

export function StatusDropdown({
  currentStatus,
  statuses,
  onStatusChange,
}: {
  currentStatus: Status | undefined;
  statuses?: Status[] | undefined;
  onStatusChange: (status: string) => void;
}) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className={clsx(
            "flex items-center gap-2 px-3 py-2 rounded-md bg-white",
            BORDER_STYLES.interactive,
            "transition-all duration-150 text-xs cursor-pointer"
          )}
        >
          <StatusIcon
            statusId={currentStatus?.id || ""}
            color={currentStatus?.color}
            size="sm"
          />
          {currentStatus?.name}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content asChild sideOffset={4}>
          <motion.div
            initial={{ scale: 0.97, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.97, opacity: 0 }}
            transition={{
              duration: 0.15,
              ease: "easeOut",
            }}
            style={{ transformOrigin: "top left" }}
            className={clsx("bg-white rounded-md shadow-xs py-1 min-w-[200px] z-50", BORDER_STYLES.base)}
          >
            {statuses?.map((status) => (
              <DropdownMenu.Item
                key={status.id}
                onSelect={() => onStatusChange(status.id)}
                className={clsx(
                  "flex items-center gap-2 px-3 py-2 text-sm",
                  "hover:bg-stone-100 cursor-pointer outline-none"
                )}
              >
                <StatusIcon statusId={status.id} color={status.color} size="sm" />
                {status.name}
              </DropdownMenu.Item>
            ))}
          </motion.div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}