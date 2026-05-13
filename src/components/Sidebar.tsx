import clsx from "clsx";
import { NAV_ITEMS } from "../lib/constants";
import type { VaultFolder } from "../lib/types";

interface SidebarProps {
  active: string;
  onSelect: (id: string) => void;
  onLock: () => void;
  folders: VaultFolder[];
  activeFolder: string | null;
  unlockedFolders: string[];
  onSelectFolder: (name: string | null) => void;
}

export function Sidebar({
  active,
  onSelect,
  onLock,
  folders,
  activeFolder,
  unlockedFolders,
  onSelectFolder
}: SidebarProps) {
  return (
    <aside className="glass-panel rounded-2xl p-6 h-full flex flex-col gap-8">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-ink-300">Personal Data Vault</p>
        <h1 className="text-2xl font-semibold mt-2">Vault</h1>
      </div>
      <nav className="flex flex-col gap-3">
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
      <div className="flex-1">
        <p className="text-xs uppercase tracking-[0.3em] text-ink-300 mb-3">Folders</p>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => onSelectFolder(null)}
            className={clsx(
              "text-left px-4 py-2 rounded-xl text-sm transition",
              activeFolder === null
                ? "bg-glass-100 text-white"
                : "text-ink-200 hover:bg-glass-300"
            )}
          >
            All files
          </button>
          {folders.map((folder) => {
            const locked = folder.locked && !unlockedFolders.includes(folder.name);
            return (
              <button
                key={folder.name}
                onClick={() => onSelectFolder(folder.name)}
                className={clsx(
                  "text-left px-4 py-2 rounded-xl text-sm transition flex items-center justify-between",
                  activeFolder === folder.name
                    ? "bg-glass-100 text-white"
                    : "text-ink-200 hover:bg-glass-300"
                )}
              >
                <span className="truncate">{folder.name}</span>
                {locked ? <span className="text-xs text-ink-400">Locked</span> : null}
              </button>
            );
          })}
        </div>
      </div>
      <button
        onClick={onLock}
        className="text-left px-4 py-3 rounded-xl border border-white/10 text-ink-100 hover:bg-white/10 transition"
      >
        Lock vault
      </button>
    </aside>
  );
}
