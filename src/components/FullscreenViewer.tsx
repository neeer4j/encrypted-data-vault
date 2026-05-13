import { motion } from "framer-motion";
import type { VaultItem } from "../lib/types";

interface FullscreenViewerProps {
  item: VaultItem;
  data: string | null;
  onClose: () => void;
}

export function FullscreenViewer({ item, data, onClose }: FullscreenViewerProps) {
  return (
    <div className="fixed inset-0 z-50 bg-ink-900/90 backdrop-blur-sm flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel rounded-2xl w-full h-full p-6 flex flex-col"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-ink-300">Fullscreen preview</p>
            <h3 className="text-lg font-semibold">{item.filename}</h3>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition"
          >
            Close
          </button>
        </div>
        <div className="flex-1 mt-6 bg-ink-900/60 rounded-2xl flex items-center justify-center overflow-hidden">
          {!data && <p className="text-ink-300">Decrypting...</p>}
          {data && item.kind === "image" && (
            <img
              src={`data:${item.mime};base64,${data}`}
              alt={item.filename}
              className="max-w-full max-h-full object-contain"
            />
          )}
          {data && item.kind === "video" && (
            <video
              src={`data:${item.mime};base64,${data}`}
              controls
              className="max-w-full max-h-full"
            />
          )}
          {data && item.kind === "document" && (
            <p className="text-ink-200">Document preview not available yet.</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
