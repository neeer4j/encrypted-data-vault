import { useState } from "react";
import type { VaultFolder } from "../lib/types";
import { GlassCard } from "./GlassCard";

interface SettingsPanelProps {
  folders: VaultFolder[];
  showHidden: boolean;
  onToggleShowHidden: (next: boolean) => void;
  onCreateFolder: (name: string, hidden: boolean, locked: boolean) => void;
  onToggleFolderHidden: (name: string, hidden: boolean) => void;
  onToggleFolderLocked: (name: string, locked: boolean) => void;
}

export function SettingsPanel({
  folders,
  showHidden,
  onToggleShowHidden,
  onCreateFolder,
  onToggleFolderHidden,
  onToggleFolderLocked
}: SettingsPanelProps) {
  const [name, setName] = useState("");
  const [hidden, setHidden] = useState(false);
  const [locked, setLocked] = useState(false);

  const handleCreate = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onCreateFolder(trimmed, hidden, locked);
    setName("");
    setHidden(false);
    setLocked(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <GlassCard className="space-y-4">
        <h3 className="text-sm uppercase tracking-[0.2em] text-ink-600">Vault settings</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Auto-lock</p>
            <p className="text-xs text-ink-600">Locks after inactivity</p>
          </div>
          <button className="retro-button px-3 py-2 text-xs">5 minutes</button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Hidden folders</p>
            <p className="text-xs text-ink-600">Mask sensitive collections</p>
          </div>
          <button
            onClick={() => onToggleShowHidden(!showHidden)}
            className="retro-button px-3 py-2 text-xs"
          >
            {showHidden ? "Showing" : "Hidden"}
          </button>
        </div>
        <div className="pt-2">
          <p className="text-xs uppercase tracking-[0.2em] text-ink-600">Create folder</p>
          <div className="mt-3 flex flex-col gap-3">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Folder name"
              className="retro-input px-2 py-1 text-sm outline-none"
            />
            <div className="flex items-center gap-4 text-xs text-ink-600">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={hidden}
                  onChange={(event) => setHidden(event.target.checked)}
                />
                Hidden
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={locked}
                  onChange={(event) => setLocked(event.target.checked)}
                />
                Locked
              </label>
            </div>
            <button
              onClick={handleCreate}
              className="retro-button px-3 py-2 text-xs"
            >
              Add folder
            </button>
          </div>
        </div>
      </GlassCard>
      <GlassCard className="space-y-4">
        <h3 className="text-sm uppercase tracking-[0.2em] text-ink-600">Security</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Session cleanup</p>
            <p className="text-xs text-ink-600">Secure memory zeroization</p>
          </div>
          <span className="text-xs text-ink-600">Enabled</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Backup/export</p>
            <p className="text-xs text-ink-600">Encrypted vault archive</p>
          </div>
          <button className="retro-button px-3 py-2 text-xs">Create</button>
        </div>
      </GlassCard>
      <GlassCard className="lg:col-span-2 space-y-4">
        <h3 className="text-sm uppercase tracking-[0.2em] text-ink-600">Folder controls</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {folders.map((folder) => (
            <div key={folder.name} className="p-3 retro-inset">
              <h4 className="font-semibold truncate">{folder.name}</h4>
              <div className="mt-3 flex items-center gap-3 text-xs text-ink-600">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={folder.hidden}
                    onChange={(event) => onToggleFolderHidden(folder.name, event.target.checked)}
                  />
                  Hidden
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={folder.locked}
                    onChange={(event) => onToggleFolderLocked(folder.name, event.target.checked)}
                  />
                  Locked
                </label>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
