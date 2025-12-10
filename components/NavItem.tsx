import { clsx } from "clsx";

export default function NavItem({
  icon,
  label,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      className={clsx(
        "flex items-center gap-3 px-3 py-2 rounded-sm text-sm",
        "transition-colors duration-150",
        active
          ? "bg-stone-200 "
          : "text-stone-900 opacity-70 hover:bg-stone-100 hover:opacity-100"
      )}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}
