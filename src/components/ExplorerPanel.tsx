import { useEffect, useMemo, useRef, useState } from "react";
import type { VaultFolder, VaultItem } from "../lib/types";

type ViewMode = "details" | "thumbnails";

interface ExplorerPanelProps {
  folders: VaultFolder[];
  items: VaultItem[];
  activeFolder: string | null;
  onSelectFolder: (name: string | null) => void;
  onCreateFolder: (name: string) => void;
  onMoveItem: (itemId: string, folder: string | null) => void;
  onRenameItem: (itemId: string, filename: string) => void;
  onOpenItem: (item: VaultItem) => void;
  viewMode: ViewMode;
}

export function ExplorerPanel({
  folders,
  items,
  activeFolder,
  onSelectFolder,
  onCreateFolder,
  onMoveItem,
  onRenameItem,
  onOpenItem,
  viewMode
}: ExplorerPanelProps) {
  const orderedFolders = useMemo(
    () => [...folders].sort((a, b) => a.name.localeCompare(b.name)),
    [folders]
  );
  const unassignedItems = useMemo(
    () => items.filter((item) => !item.folder),
    [items]
  );
  const [treeOpen, setTreeOpen] = useState(true);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    item: VaultItem;
  } | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const handleCreateFolder = () => {
    const name = window.prompt("New folder name");
    if (!name) return;
    onCreateFolder(name.trim());
  };

  const handleContextMenu = (event: React.MouseEvent, item: VaultItem) => {
    event.preventDefault();
    const bounds = panelRef.current?.getBoundingClientRect();
    if (!bounds) return;
    setContextMenu({
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
      item
    });
  };

  useEffect(() => {
    if (!contextMenu) return;
    const handleClose = () => setContextMenu(null);
    window.addEventListener("click", handleClose);
    window.addEventListener("contextmenu", handleClose);
    window.addEventListener("scroll", handleClose, true);
    return () => {
      window.removeEventListener("click", handleClose);
      window.removeEventListener("contextmenu", handleClose);
      window.removeEventListener("scroll", handleClose, true);
    };
  }, [contextMenu]);

  const renderThumbnail = (item: VaultItem, sizeClass: string, labelClass: string) => {
    if (item.kind === "image" && item.previewData) {
      return (
        <img
          src={`data:${item.mime};base64,${item.previewData}`}
          alt={item.filename}
          className={`${sizeClass} object-cover`}
        />
      );
    }

    if (item.kind === "note") {
      return (
        <div className={`${sizeClass} flex flex-col items-center justify-center bg-[#f0e3c0]`}>
          <span className="text-[10px] tracking-[0.2em]">NOTE</span>
        </div>
      );
    }

    return (
      <div className={`${sizeClass} flex items-center justify-center bg-[#d8d8d8]`}>
        <span className={labelClass}>{item.kind.toUpperCase()}</span>
      </div>
    );
  };

  const formatDate = (value: string) => {
    const updated = new Date(value);
    return Number.isNaN(updated.getTime()) ? "Unknown" : updated.toLocaleString();
  };

  return (
    <div className="grid grid-cols-[220px_1fr] gap-4">
      <div className="glass-panel p-3">
        <div className="retro-titlebar">Vault Drive</div>
        <div className="mt-3 flex flex-col gap-1 text-xs">
          <button
            type="button"
            onClick={() => setTreeOpen((prev) => !prev)}
            className="flex items-center gap-2 px-1 py-1"
          >
            <span className="w-4 text-center">{treeOpen ? "v" : ">"}</span>
            <span className="font-semibold">Vault Drive</span>
          </button>
          {treeOpen && (
            <div className="ml-5 flex flex-col gap-1">
              <button
                onClick={() => onSelectFolder(null)}
                className={
                  `retro-button px-2 py-1 text-xs text-left ${
                    activeFolder === null ? "outline outline-2 outline-black" : ""
                  }`
                }
              >
                This PC
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
          )}
        </div>
        <button onClick={handleCreateFolder} className="retro-button px-2 py-1 text-xs mt-3">
          New folder
        </button>
      </div>
      <div ref={panelRef} className="glass-panel p-3 relative">
        <div className="retro-titlebar">Files</div>
        {viewMode === "details" ? (
          <div className="retro-inset mt-3">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left">
                  <th className="p-2">Preview</th>
                  <th className="p-2">Name</th>
                  <th className="p-2">Type</th>
                  <th className="p-2">Folder</th>
                  <th className="p-2">Updated</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t border-black/10 hover:bg-black/5"
                    onDoubleClick={() => onOpenItem(item)}
                    onContextMenu={(event) => handleContextMenu(event, item)}
                  >
                    <td className="p-2">
                      {renderThumbnail(item, "w-12 h-12", "text-[9px]")}
                    </td>
                    <td className="p-2 font-semibold">{item.filename}</td>
                    <td className="p-2 capitalize">{item.kind}</td>
                    <td className="p-2">{item.folder ?? "Drive"}</td>
                    <td className="p-2">{formatDate(item.updatedAt)}</td>
                  </tr>
                ))}
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
        ) : (
          <div className="retro-inset mt-3 p-4">
            {items.length === 0 ? (
              <p className="text-xs text-ink-600">No files in this view.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onOpenItem(item)}
                    onContextMenu={(event) => handleContextMenu(event, item)}
                    className="retro-button p-2 text-left"
                  >
                    <div className="retro-inset flex items-center justify-center mb-2">
                      {renderThumbnail(item, "w-24 h-24", "text-xs")}
                    </div>
                    <p className="text-xs font-semibold truncate">{item.filename}</p>
                    <p className="text-[10px] text-ink-600">{formatDate(item.updatedAt)}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        {unassignedItems.length > 0 && (
          <p className="text-xs text-ink-600 mt-2">
            {unassignedItems.length} item(s) stored at Drive root.
          </p>
        )}
        {contextMenu && (
          <div
            className="context-menu"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button type="button" onClick={() => onOpenItem(contextMenu.item)}>
              Open
            </button>
            <button
              type="button"
              onClick={() => {
                const next = window.prompt("Rename file", contextMenu.item.filename);
                if (!next) return;
                onRenameItem(contextMenu.item.id, next.trim());
              }}
            >
              Rename
            </button>
            <div className="context-separator" />
            <button
              type="button"
              onClick={() => onMoveItem(contextMenu.item.id, null)}
            >
              Move to Drive
            </button>
            {orderedFolders.map((folder) => (
              <button
                key={folder.name}
                type="button"
                onClick={() => onMoveItem(contextMenu.item.id, folder.name)}
              >
                Move to {folder.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
