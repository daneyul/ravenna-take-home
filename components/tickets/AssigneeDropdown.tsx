import { Requester } from "@/types/ticket";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { clsx } from "clsx";
import { PersonIcon } from "@radix-ui/react-icons";
import { motion } from "motion/react";
import { BORDER_STYLES } from "@/lib/styles";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function AssigneeDropdown({
  currentAssignee,
  assignees,
  onAssigneeChange,
}: {
  currentAssignee: Requester | undefined;
  assignees?: Requester[] | undefined;
  onAssigneeChange: (assignee: Requester | undefined) => void;
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
          {currentAssignee ? (
            <>
              <div className="w-5 h-5 rounded-full bg-stone-200 flex items-center justify-center text-xs font-medium">
                {getInitials(currentAssignee.name)}
              </div>
              <span>{currentAssignee.name}</span>
            </>
          ) : (
            <>
              <PersonIcon className="w-4 h-4 opacity-50" />
              <span className="opacity-50">Unassigned</span>
            </>
          )}
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
            <DropdownMenu.Item
              onSelect={() => onAssigneeChange(undefined)}
              className={clsx(
                "flex items-center gap-2 px-3 py-2 text-sm",
                "hover:bg-stone-100 cursor-pointer outline-none"
              )}
            >
              <div className="w-5 h-5 border border-stone-300 rounded-full" />
              <span>Unassign</span>
            </DropdownMenu.Item>
            {assignees?.map((assignee) => (
              <DropdownMenu.Item
                key={assignee.email}
                onSelect={() => onAssigneeChange(assignee)}
                className={clsx(
                  "flex items-center gap-2 px-3 py-2 text-sm",
                  "hover:bg-stone-100 cursor-pointer outline-none"
                )}
              >
                <div className="w-5 h-5 rounded-full bg-stone-200 flex items-center justify-center text-xs font-medium">
                  {getInitials(assignee.name)}
                </div>
                <div className="flex flex-col">
                  <span>{assignee.name}</span>
                  <span className="text-xs opacity-50">{assignee.email}</span>
                </div>
              </DropdownMenu.Item>
            ))}
          </motion.div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
