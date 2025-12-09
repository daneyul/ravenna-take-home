import clsx from "clsx";

export default function Button({
  children,
  onClick,
  icon,
  className,
}: {
  children: React.ReactNode;
  onClick: () => void;
  icon: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      className={clsx(
        "flex items-center gap-2 px-4 py-2",
        "rounded-sm border border-stone-200",
        "transition-all duration-150",
        "text-sm font-medium",
        "cursor-pointer",
        "hover:border-stone-300",
        "bg-white",
        "shadow-xs",
        className
      )}
      onClick={onClick}
    >
      {icon}
      {children}
    </button>
  );
}
