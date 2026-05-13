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
        className="glass-panel rounded-2xl p-10 max-w-md w-full glow-border"
      >
        <p className="text-xs uppercase tracking-[0.4em] text-ink-300">Personal Data Vault</p>
        <h1 className="text-3xl font-semibold mt-4">{mode === "create" ? "Create vault" : "Unlock vault"}</h1>
        <p className="text-ink-200 mt-3">
          {mode === "create"
            ? "Initialize a new encrypted vault."
            : "Enter your password to decrypt locally."}
        </p>
        <div className="mt-8 space-y-4">
          <input
            value={vaultId}
            onChange={(event) => setVaultId(event.target.value)}
            placeholder="Vault ID"
            className="w-full bg-ink-800/40 border border-white/10 rounded-xl px-4 py-3 outline-none"
          />
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            className="w-full bg-ink-800/40 border border-white/10 rounded-xl px-4 py-3 outline-none"
          />
          <button
            onClick={handleSubmit}
            disabled={busy}
            className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 transition disabled:opacity-50"
          >
            {busy ? "Working..." : mode === "create" ? "Create vault" : "Unlock"}
          </button>
        </div>
        <div className="mt-6 text-sm text-ink-200 flex items-center justify-between">
          <span>{mode === "create" ? "Already have a vault?" : "New here?"}</span>
          <button
            onClick={() => setMode(mode === "create" ? "unlock" : "create")}
            className="text-ink-50"
          >
            {mode === "create" ? "Unlock" : "Create"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
