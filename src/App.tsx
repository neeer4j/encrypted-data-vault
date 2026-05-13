import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useVault } from "./hooks/useVault";
import { useHotkeys } from "./hooks/useHotkeys";
import { GalleryGrid } from "./components/GalleryGrid";
import { NotesPanel } from "./components/NotesPanel";
import { SettingsPanel } from "./components/SettingsPanel";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { UnlockScreen } from "./components/UnlockScreen";
import { EmptyState } from "./components/EmptyState";
import type { VaultItem } from "./lib/types";

export default function App() {
  const {
    unlocked,
    busy,
    items,
    unlock,
    create,
    lock,
    addFiles,
    addNote,
    search
  } = useVault();
  const [activeView, setActiveView] = useState("dashboard");
  const [query, setQuery] = useState("");
  const [filtered, setFiltered] = useState<VaultItem[]>([]);

  useHotkeys({
    "mod+k": () => setQuery(""),
    "mod+l": () => lock()
  });

  const visibleItems = useMemo(() => {
    if (!query) return items;
    return filtered.length ? filtered : items;
  }, [items, query, filtered]);

  const noteItems = useMemo(() => items.filter((item) => item.kind === "note"), [items]);
  const mediaItems = useMemo(() => items.filter((item) => item.kind !== "note"), [items]);

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    if (files.length) {
      await addFiles(files, null, []);
    }
  };

  const handleSearch = async (value: string) => {
    setQuery(value);
    if (!value) {
      setFiltered([]);
      return;
    }
    const next = await search(value);
    setFiltered(next);
  };

  if (!unlocked) {
    return <UnlockScreen busy={busy} onCreate={create} onUnlock={unlock} />;
  }

  return (
    <div
      className="min-h-screen px-8 py-6"
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
    >
      <div className="grid grid-cols-[260px_1fr] gap-6 min-h-[calc(100vh-48px)]">
        <Sidebar active={activeView} onSelect={setActiveView} onLock={lock} />
        <main className="flex flex-col gap-6">
          <TopBar query={query} onQueryChange={handleSearch} />
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="flex-1"
          >
            {activeView === "dashboard" && (
              <div className="space-y-6">
                {visibleItems.length === 0 ? (
                  <EmptyState
                    title="Drop files to encrypt"
                    description="Drag images, videos, documents, or create notes. Everything is encrypted before it touches disk."
                  />
                ) : (
                  <GalleryGrid items={visibleItems.slice(0, 6)} />
                )}
              </div>
            )}
            {activeView === "gallery" && (
              <div className="space-y-6">
                {mediaItems.length === 0 ? (
                  <EmptyState
                    title="Your gallery is empty"
                    description="Upload images, videos, or documents. Previews are decrypted in memory only."
                  />
                ) : (
                  <GalleryGrid items={mediaItems} />
                )}
              </div>
            )}
            {activeView === "notes" && <NotesPanel notes={noteItems} onCreate={addNote} />}
            {activeView === "settings" && <SettingsPanel />}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
