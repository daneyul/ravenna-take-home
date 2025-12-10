import { Cross2Icon } from "@radix-ui/react-icons";
import * as Popover from "@radix-ui/react-popover";
import { clsx } from "clsx";
import { motion } from "motion/react";
import { BORDER_STYLES } from "@/lib/styles";

interface PopoverContentProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  sideOffset?: number;
  onClose?: () => void;
}

export function PopoverContent({
  children,
  title,
  className,
  side = "bottom",
  align = "start",
  sideOffset = 4,
  onClose,
}: PopoverContentProps) {
  return (
    <Popover.Portal>
      <Popover.Content asChild side={side} align={align} sideOffset={sideOffset}>
        <motion.div
          initial={{ scale: 0.97, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.97, opacity: 0 }}
          transition={{
            duration: 0.15,
            ease: "easeOut",
          }}
          style={{ transformOrigin: align === "center" ? "top center" : "top left" }}
          className={clsx(
            "bg-white rounded-md shadow-xs p-2 z-50",
            BORDER_STYLES.base,
            className
          )}
        >
          {title && (
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs opacity-70">{title}</div>
              <Popover.Close asChild>
                <button
                  type="button"
                  onClick={onClose}
                  className="h-5 w-5 rounded hover:bg-stone-100 flex items-center justify-center transition-colors duration-150"
                  aria-label="Close"
                >
                  <Cross2Icon className="h-3 w-3 opacity-50" />
                </button>
              </Popover.Close>
            </div>
          )}
          {children}
        </motion.div>
      </Popover.Content>
    </Popover.Portal>
  );
}
