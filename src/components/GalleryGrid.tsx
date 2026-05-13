import { motion } from "framer-motion";
import type { VaultItem } from "../lib/types";
import { TagPills } from "./TagPills";

interface GalleryGridProps {
  items: VaultItem[];
  onDelete: (itemId: string) => void;
  onOpen: (item: VaultItem) => void;
}

export function GalleryGrid({ items, onDelete, onOpen }: GalleryGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.04 }}
          className="glass-panel rounded-2xl overflow-hidden"
        >
          <button
            type="button"
            onClick={() => onOpen(item)}
            className="h-40 bg-ink-800 flex items-center justify-center text-ink-300 w-full"
          >
            {item.kind === "image" && item.previewData ? (
              <img
                src={`data:${item.mime};base64,${item.previewData}`}
                alt={item.filename}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-sm uppercase tracking-[0.2em]">{item.kind}</span>
            )}
          </button>
          <div className="p-5 space-y-3">
            <div>
              <h4 className="font-semibold truncate">{item.filename}</h4>
              <p className="text-xs text-ink-300">{new Date(item.createdAt).toLocaleString()}</p>
            </div>
            <TagPills tags={item.tags} />
            <button
              onClick={() => onOpen(item)}
              className="text-xs text-ink-200 hover:text-white transition"
            >
              Open fullscreen
            </button>
            <button
              onClick={() => {
                if (window.confirm("Securely delete this item? This cannot be undone.")) {
                  onDelete(item.id);
                }
              }}
              className="text-xs text-ink-200 hover:text-white transition"
            >
              Secure delete
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
