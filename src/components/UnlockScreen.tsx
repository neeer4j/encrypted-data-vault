import { motion } from "framer-motion";
import { useState } from "react";

interface UnlockScreenProps {
  busy: boolean;
  onCreate: (vaultId: string, password: string) => void;
  onUnlock: (vaultId: string, password: string) => void;
}

export function UnlockScreen({ busy, onCreate, onUnlock }: UnlockScreenProps) {
  const [mode, setMode] = useState<"unlock" | "create">("unlock");
  const [vaultId, setVaultId] = useState("primary");
  const [password, setPassword] = useState("");

  const handleSubmit = () => {
    if (!password || !vaultId) return;
    if (mode === "create") {
      onCreate(vaultId, password);
    } else {
      onUnlock(vaultId, password);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel max-w-md w-full"
      >
        <div className="retro-titlebar">Personal Data Vault</div>
        <div className="p-6">
          <h1 className="text-xl font-semibold">{mode === "create" ? "Create vault" : "Unlock vault"}</h1>
          <p className="text-ink-600 mt-2 text-sm">
          {mode === "create"
            ? "Initialize a new encrypted vault."
            : "Enter your password to decrypt locally."}
          </p>
          <div className="mt-6 space-y-3">
            <input
              value={vaultId}
              onChange={(event) => setVaultId(event.target.value)}
              placeholder="Vault ID"
              className="w-full retro-input px-3 py-2 outline-none"
            />
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              className="w-full retro-input px-3 py-2 outline-none"
            />
            <button
              onClick={handleSubmit}
              disabled={busy}
              className="w-full retro-button px-3 py-2 text-sm disabled:opacity-60"
            >
              {busy ? "Working..." : mode === "create" ? "Create vault" : "Unlock"}
            </button>
          </div>
          <div className="mt-5 text-xs text-ink-600 flex items-center justify-between">
            <span>{mode === "create" ? "Already have a vault?" : "New here?"}</span>
            <button
              onClick={() => setMode(mode === "create" ? "unlock" : "create")}
              className="retro-button px-2 py-1 text-xs"
            >
              {mode === "create" ? "Unlock" : "Create"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
