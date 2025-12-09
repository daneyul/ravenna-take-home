export default function NavItem({
  icon,
  label,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  const activeButtonClasses = "bg-black/5";
  const hoverButtonClasses = "hover:bg-black/3";

  const activeTextClasses = "opacity-100";
  const inactiveTextClasses = "opacity-60";

  return (
    <button
      className={`
        flex items-center gap-3 px-3 py-2 rounded-sm text-sm
        transition-colors duration-150
        ${
          active
            ? activeButtonClasses
            : hoverButtonClasses
        }
      `}
    >
      <span className={active ? activeTextClasses : inactiveTextClasses}>{icon}</span>
      <span className={active ? activeTextClasses : inactiveTextClasses}>{label}</span>
    </button>
  );
}