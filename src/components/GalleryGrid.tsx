import { motion } from "framer-motion";
import type { VaultItem } from "../lib/types";
import { TagPills } from "./TagPills";

interface GalleryGridProps {
  items: VaultItem[];
}

export function GalleryGrid({ items }: GalleryGridProps) {
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
          <div className="h-40 bg-ink-800 flex items-center justify-center text-ink-300">
            {item.kind === "image" && item.previewData ? (
              <img
                src={`data:${item.mime};base64,${item.previewData}`}
                alt={item.filename}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-sm uppercase tracking-[0.2em]">{item.kind}</span>
            )}
          </div>
          <div className="p-5 space-y-3">
            <div>
              <h4 className="font-semibold truncate">{item.filename}</h4>
              <p className="text-xs text-ink-300">{new Date(item.createdAt).toLocaleString()}</p>
            </div>
            <TagPills tags={item.tags} />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
