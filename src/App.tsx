import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useVault } from "./hooks/useVault";
import { useHotkeys } from "./hooks/useHotkeys";
import { ExplorerPanel } from "./components/ExplorerPanel";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { UnlockScreen } from "./components/UnlockScreen";
import { FullscreenViewer } from "./components/FullscreenViewer";
import type { VaultFolder, VaultItem } from "./lib/types";

export default function App() {
  const {
    unlocked,
    busy,
    items,
    folders,
    unlock,
    create,
    lock,
    addFiles,
    moveItem,
    renameVaultItem,
    createVaultFolder,
    search,
    decryptItem
  } = useVault();
  const [activeView, setActiveView] = useState("drive");
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filtered, setFiltered] = useState<VaultItem[]>([]);
  const [viewMode, setViewMode] = useState<"details" | "thumbnails">("details");
  const [viewerItem, setViewerItem] = useState<VaultItem | null>(null);
  const [viewerData, setViewerData] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useHotkeys({
    "mod+k": () => setQuery(""),
    "mod+l": () => lock()
  });

  const folderMap = useMemo(() => {
    return new Map<string, VaultFolder>(folders.map((folder) => [folder.name, folder]));
  }, [folders]);

  const visibleItems = useMemo(() => {
    const base = !query ? items : filtered.length ? filtered : items;
    return base.filter((item) => (activeFolder ? item.folder === activeFolder : true));
  }, [items, filtered, query, activeFolder]);

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    if (files.length) {
      await addFiles(files, activeFolder, []);
    }
  };

  const handleSelectFolder = (name: string | null) => {
    setActiveFolder(name);
  };

  useEffect(() => {
    if (!activeFolder) return;
    const folder = folderMap.get(activeFolder);
    if (folder?.hidden) {
      setActiveFolder(null);
    }
  }, [activeFolder, folderMap]);

  const handleSearch = async (value: string) => {
    setQuery(value);
    if (!value) {
      setFiltered([]);
      return;
    }
    const next = await search(value);
    setFiltered(next);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelection = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    if (files.length) {
      await addFiles(files, activeFolder, []);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleOpenItem = async (item: VaultItem) => {
    setViewerItem(item);
    setViewerData(null);
    const data = await decryptItem(item.id);
    setViewerData(data);
  };

  const handleCloseViewer = () => {
    setViewerItem(null);
    setViewerData(null);
  };

  if (!unlocked) {
    return <UnlockScreen busy={busy} onCreate={create} onUnlock={unlock} />;
  }

  const handleCreateFolder = async (name: string) => {
    if (!name.trim()) return;
    await createVaultFolder(name.trim(), false, false);
  };

  return (
    <div
      className="min-h-screen px-8 py-6"
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileSelection}
      />
      <div className="grid grid-cols-[260px_1fr] gap-6 min-h-[calc(100vh-48px)]">
        <Sidebar
          active={activeView}
          onSelect={setActiveView}
          onLock={lock}
        />
        <main className="flex flex-col gap-6">
          <TopBar
            query={query}
            onQueryChange={handleSearch}
            onUploadClick={handleUploadClick}
            activeFolderLabel={activeFolder ? `Folder: ${activeFolder}` : "Vault Drive"}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="flex-1"
          >
            <ExplorerPanel
              folders={folders}
              items={visibleItems}
              activeFolder={activeFolder}
              onSelectFolder={handleSelectFolder}
              onCreateFolder={handleCreateFolder}
              onMoveItem={moveItem}
              onRenameItem={renameVaultItem}
              onOpenItem={handleOpenItem}
              viewMode={viewMode}
            />
          </motion.div>
        </main>
      </div>
      {viewerItem && (
        <FullscreenViewer
          item={viewerItem}
          data={viewerData}
          onClose={handleCloseViewer}
        />
      )}
    </div>
  );
}
