import clsx from "clsx";
import { NAV_ITEMS } from "../lib/constants";

interface SidebarProps {
  active: string;
  onSelect: (id: string) => void;
  onLock: () => void;
}

export function Sidebar({ active, onSelect, onLock }: SidebarProps) {
  return (
    <aside className="glass-panel rounded-2xl p-6 h-full flex flex-col gap-8">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-ink-300">Personal Data Vault</p>
        <h1 className="text-2xl font-semibold mt-2">Vault</h1>
      </div>
      <nav className="flex-1 flex flex-col gap-3">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={clsx(
              "text-left px-4 py-3 rounded-xl transition",
              active === item.id
                ? "bg-glass-100 text-white shadow-glow"
                : "text-ink-200 hover:bg-glass-300"
            )}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <button
        onClick={onLock}
        className="text-left px-4 py-3 rounded-xl border border-white/10 text-ink-100 hover:bg-white/10 transition"
      >
        Lock vault
      </button>
    </aside>
  );
}
