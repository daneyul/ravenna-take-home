import clsx from "clsx";
import { BUTTON_STYLES } from "@/lib/styles";

export default function Button({
  children,
  onClick,
  icon,
  className,
}: {
  children: React.ReactNode;
  onClick: () => void;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      className={clsx(
        "flex items-center gap-2 px-4 py-2",
        "rounded-sm",
        "transition-all duration-150",
        "text-sm font-medium",
        "cursor-pointer",
        "bg-white",
        "hover:bg-stone-100",
        BUTTON_STYLES.base,
        className
      )}
      onClick={onClick}
    >
      {icon && icon}
      {children}
    </button>
  );
}
