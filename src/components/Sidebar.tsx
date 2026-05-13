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
  const orderedFolders = [...folders].sort((a, b) => a.name.localeCompare(b.name));

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
      <div className="flex-1">
        <p className="text-xs uppercase tracking-[0.3em] text-ink-600 mb-3">Folders</p>
        <div className="flex flex-col gap-2">
          {orderedFolders.map((folder) => {
            const locked = folder.locked && !unlockedFolders.includes(folder.name);
            return (
              <button
                key={folder.name}
                onClick={() => onSelectFolder(folder.name)}
                className={clsx(
                  "text-left px-3 py-2 text-sm retro-button flex items-center justify-between",
                  activeFolder === folder.name
                    ? "outline outline-2 outline-black"
                    : ""
                )}
              >
                <span className="truncate">{folder.name}</span>
                {locked ? <span className="text-xs text-ink-600">Locked</span> : null}
              </button>
            );
          })}
        </div>
      </div>
      <button
        onClick={onLock}
        className="text-left px-3 py-2 retro-button text-sm"
      >
        Lock vault
      </button>
    </aside>
  );
}
