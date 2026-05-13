import clsx from "clsx";
import { NAV_ITEMS } from "../lib/constants";

interface SidebarProps {
  active: string;
  onSelect: (id: string) => void;
  onLock: () => void;
}

export function Sidebar({
  active,
  onSelect,
  onLock
}: SidebarProps) {
  return (
    <aside className="glass-panel p-4 h-full flex flex-col gap-4">
      <div className="retro-titlebar">Personal Data Vault</div>
      <div className="px-1">
        <h1 className="text-lg font-semibold">Vault</h1>
      </div>
      <nav className="flex flex-col gap-3">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={clsx(
              "text-left px-3 py-2 text-sm retro-button",
              active === item.id
                ? "outline outline-2 outline-black"
                : ""
            )}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <button
        onClick={onLock}
        className="text-left px-3 py-2 retro-button text-sm"
      >
        Lock vault
      </button>
    </aside>
  );
}
