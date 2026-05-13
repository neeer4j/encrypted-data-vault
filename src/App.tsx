import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useVault } from "./hooks/useVault";
import { useHotkeys } from "./hooks/useHotkeys";
import { GalleryGrid } from "./components/GalleryGrid";
import { FullscreenViewer } from "./components/FullscreenViewer";
import { ExplorerPanel } from "./components/ExplorerPanel";
import { NotesPanel } from "./components/NotesPanel";
import { DashboardPanel } from "./components/DashboardPanel";
import { SettingsPanel } from "./components/SettingsPanel";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { UnlockScreen } from "./components/UnlockScreen";
import { EmptyState } from "./components/EmptyState";
import type { VaultFolder, VaultItem } from "./lib/types";

export default function App() {
  const {
    unlocked,
    busy,
    items,
    folders,
    unlockedFolders,
    unlock,
    create,
    lock,
    addFiles,
    addNote,
    deleteItem,
    moveItem,
    renameVaultItem,
    createVaultFolder,
    toggleFolderHidden,
    toggleFolderLocked,
    unlockVaultFolder,
    decryptItem,
    search
  } = useVault();
  const [activeView, setActiveView] = useState("dashboard");
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filtered, setFiltered] = useState<VaultItem[]>([]);
  const [showHidden, setShowHidden] = useState(false);
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
    return base.filter((item) => {
      if (activeFolder && item.folder !== activeFolder) {
        return false;
      }
      if (item.folder) {
        const folder = folderMap.get(item.folder);
        if (folder?.hidden && !showHidden) {
          return false;
        }
        if (folder?.locked && !unlockedFolders.includes(folder.name)) {
          return false;
        }
      }
      return true;
    });
  }, [items, filtered, query, activeFolder, folderMap, showHidden, unlockedFolders]);

  const noteItems = useMemo(() => visibleItems.filter((item) => item.kind === "note"), [visibleItems]);
  const mediaItems = useMemo(() => visibleItems.filter((item) => item.kind !== "note"), [visibleItems]);

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    if (files.length) {
      await addFiles(files, activeFolder, []);
    }
  };

  const handleOpenItem = async (item: VaultItem) => {
    setViewerItem(item);
    setViewerData(null);
    if (item.kind === "image" || item.kind === "video" || item.kind === "document") {
      const data = await decryptItem(item.id);
      setViewerData(data);
    }
  };

  const handleCloseViewer = () => {
    setViewerItem(null);
    setViewerData(null);
  };

  const handleUnlockFolder = async (folderName: string) => {
    const password = window.prompt("Enter your vault password to unlock this folder");
    if (!password) return;
    const ok = await unlockVaultFolder(folderName, password);
    if (!ok) {
      window.alert("Invalid password.");
    }
  };

  const handleSelectFolder = (name: string | null) => {
    setActiveFolder(name);
    setActiveView("drive");
  };

  const visibleFolders = useMemo(
    () => (showHidden ? folders : folders.filter((folder) => !folder.hidden)),
    [folders, showHidden]
  );

  const activeFolderLocked = useMemo(() => {
    if (!activeFolder) return false;
    const folder = folderMap.get(activeFolder);
    if (!folder) return false;
    return folder.locked && !unlockedFolders.includes(activeFolder);
  }, [activeFolder, folderMap, unlockedFolders]);

  useEffect(() => {
    if (!activeFolder) return;
    const folder = folderMap.get(activeFolder);
    if (folder?.hidden && !showHidden) {
      setActiveFolder(null);
    }
  }, [activeFolder, folderMap, showHidden]);

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
          folders={visibleFolders}
          activeFolder={activeFolder}
          unlockedFolders={unlockedFolders}
          onSelectFolder={handleSelectFolder}
        />
        <main className="flex flex-col gap-6">
          <TopBar
            query={query}
            onQueryChange={handleSearch}
            onUploadClick={handleUploadClick}
            activeFolderLabel={activeFolder ? `Folder: ${activeFolder}` : "Vault Drive"}
          />
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="flex-1"
          >
            {activeView === "dashboard" && (
              <DashboardPanel />
            )}
            {activeView === "drive" && (
              <div className="space-y-6">
                {activeFolderLocked ? (
                  <EmptyState
                    title="Folder locked"
                    description="Unlock this folder with your vault password to view its contents."
                  />
                ) : (
                  <ExplorerPanel
                    folders={visibleFolders}
                    items={visibleItems}
                    activeFolder={activeFolder}
                    onSelectFolder={handleSelectFolder}
                    onCreateFolder={handleCreateFolder}
                    onMoveItem={moveItem}
                    onRenameItem={renameVaultItem}
                  />
                )}
                {activeFolderLocked && activeFolder && (
                  <button
                    onClick={() => handleUnlockFolder(activeFolder)}
                    className="retro-button px-3 py-2 text-sm"
                  >
                    Unlock folder
                  </button>
                )}
              </div>
            )}
            {activeView === "gallery" && (
              <div className="space-y-6">
                {activeFolder === null && (
                  <EmptyState
                    title="Select a folder"
                    description="Choose a folder from Vault Drive to view media files, or switch to Dashboard for the full drive view."
                  />
                )}
                {activeFolderLocked ? (
                  <EmptyState
                    title="Folder locked"
                    description="Unlock this folder with your vault password to view its contents."
                  />
                ) : activeFolder === null ? null : mediaItems.length === 0 ? (
                  <EmptyState
                    title="No media yet"
                    description="Upload images, videos, or documents. Previews are decrypted in memory only."
                  />
                ) : (
                  <GalleryGrid
                    items={mediaItems}
                    onDelete={deleteItem}
                    onOpen={handleOpenItem}
                  />
                )}
                {activeFolderLocked && activeFolder && (
                  <button
                    onClick={() => handleUnlockFolder(activeFolder)}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition"
                  >
                    Unlock folder
                  </button>
                )}
              </div>
            )}
            {activeView === "notes" && (
              activeFolder === null ? (
                <EmptyState
                  title="Select a folder"
                  description="Choose a folder from Vault Drive to view notes, or switch to Dashboard for the full drive view."
                />
              ) : activeFolderLocked ? (
                <EmptyState
                  title="Folder locked"
                  description="Unlock this folder with your vault password to view its contents."
                />
              ) : (
                <NotesPanel notes={noteItems} onCreate={addNote} />
              )
            )}
            {activeView === "settings" && (
              <SettingsPanel
                folders={folders}
                showHidden={showHidden}
                onToggleShowHidden={setShowHidden}
                onCreateFolder={createVaultFolder}
                onToggleFolderHidden={toggleFolderHidden}
                onToggleFolderLocked={toggleFolderLocked}
              />
            )}
          </motion.div>
        </main>
      </div>
      {viewerItem && (
        <FullscreenViewer item={viewerItem} data={viewerData} onClose={handleCloseViewer} />
      )}
    </div>
  );
}
