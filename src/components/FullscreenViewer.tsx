import { useMemo } from "react";
import { motion } from "framer-motion";
import type { VaultItem } from "../lib/types";

interface FullscreenViewerProps {
  item: VaultItem;
  data: string | null;
  onClose: () => void;
}

export function FullscreenViewer({ item, data, onClose }: FullscreenViewerProps) {
  const noteText = useMemo(() => {
    if (!data || item.kind !== "note") return "";
    try {
      const binary = atob(data);
      const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
      return new TextDecoder().decode(bytes);
    } catch {
      return "";
    }
  }, [data, item.kind]);

  return (
    <div className="fixed inset-0 z-50 bg-[#2c3b52]/80 flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel w-full h-full flex flex-col"
      >
        <div className="retro-titlebar flex items-center justify-between">
          <span>Preview</span>
          <button onClick={onClose} className="retro-button px-2 py-1 text-xs">
            Close
          </button>
        </div>
        <div className="p-4 flex-1">
          <div className="retro-inset h-full flex items-center justify-center overflow-hidden">
            {!data && <p className="text-ink-600">Decrypting...</p>}
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
          {data && item.kind === "note" && (
            <div className="w-full h-full overflow-auto p-4">
              <h3 className="font-semibold mb-3">{item.filename}</h3>
              <pre className="text-sm whitespace-pre-wrap">{noteText || "Unable to render note."}</pre>
            </div>
          )}
          {data && item.kind === "document" && (
            <p className="text-ink-600">Document preview not available yet.</p>
          )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
