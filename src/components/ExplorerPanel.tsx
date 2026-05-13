import type { VaultFolder, VaultItem } from "../lib/types";

interface ExplorerPanelProps {
  folders: VaultFolder[];
  items: VaultItem[];
  activeFolder: string | null;
  onSelectFolder: (name: string | null) => void;
  onCreateFolder: (name: string) => void;
  onMoveItem: (itemId: string, folder: string | null) => void;
  onRenameItem: (itemId: string, filename: string) => void;
}

export function ExplorerPanel({
  folders,
  items,
  activeFolder,
  onSelectFolder,
  onCreateFolder,
  onMoveItem,
  onRenameItem
}: ExplorerPanelProps) {
  const orderedFolders = [...folders].sort((a, b) => a.name.localeCompare(b.name));
  const unassignedItems = items.filter((item) => !item.folder);

  const handleCreateFolder = () => {
    const name = window.prompt("New folder name");
    if (!name) return;
    onCreateFolder(name.trim());
  };

  return (
    <div className="grid grid-cols-[220px_1fr] gap-4">
      <div className="glass-panel p-3">
        <div className="retro-titlebar">Vault Drive</div>
        <div className="mt-3 flex flex-col gap-2">
          <button
            onClick={() => onSelectFolder(null)}
            className={
              `retro-button px-2 py-1 text-xs ${activeFolder === null ? "outline outline-2 outline-black" : ""}`
            }
          >
            Vault Drive
          </button>
          {orderedFolders.map((folder) => (
            <button
              key={folder.name}
              onClick={() => onSelectFolder(folder.name)}
              className={
                `retro-button px-2 py-1 text-xs flex items-center justify-between ${
                  activeFolder === folder.name ? "outline outline-2 outline-black" : ""
                }`
              }
            >
              <span className="truncate">{folder.name}</span>
              {folder.locked ? <span className="text-[10px]">Locked</span> : null}
            </button>
          ))}
        </div>
        <button onClick={handleCreateFolder} className="retro-button px-2 py-1 text-xs mt-3">
          New folder
        </button>
      </div>
      <div className="glass-panel p-3">
        <div className="retro-titlebar">Files</div>
        <div className="retro-inset mt-3">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left">
                <th className="p-2">Name</th>
                <th className="p-2">Type</th>
                <th className="p-2">Folder</th>
                <th className="p-2">Updated</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const updated = new Date(item.updatedAt);
                const updatedLabel = Number.isNaN(updated.getTime())
                  ? "Unknown"
                  : updated.toLocaleString();
                return (
                  <tr key={item.id} className="border-t border-black/10">
                    <td className="p-2 font-semibold">{item.filename}</td>
                    <td className="p-2 capitalize">{item.kind}</td>
                    <td className="p-2">{item.folder ?? "Drive"}</td>
                    <td className="p-2">{updatedLabel}</td>
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      <select
                        className="retro-input text-xs px-1 py-0.5"
                        value={item.folder ?? ""}
                        onChange={(event) => {
                          const next = event.target.value || null;
                          onMoveItem(item.id, next);
                        }}
                      >
                        <option value="">Drive</option>
                        {orderedFolders.map((folder) => (
                          <option key={folder.name} value={folder.name}>
                            {folder.name}
                          </option>
                        ))}
                      </select>
                      <button
                        className="retro-button px-2 py-1 text-xs"
                        onClick={() => {
                          const next = window.prompt("Rename file", item.filename);
                          if (!next) return;
                          onRenameItem(item.id, next.trim());
                        }}
                      >
                        Rename
                      </button>
                    </div>
                  </td>
                  </tr>
                );
              })}
              {items.length === 0 && (
                <tr>
                  <td className="p-3 text-ink-600" colSpan={5}>
                    No files in this view.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {unassignedItems.length > 0 && (
          <p className="text-xs text-ink-600 mt-2">
            {unassignedItems.length} item(s) stored at Drive root.
          </p>
        )}
      </div>
    </div>
  );
}
