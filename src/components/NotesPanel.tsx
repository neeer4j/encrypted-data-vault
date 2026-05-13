import { useMemo, useState } from "react";
import DOMPurify from "dompurify";
import { marked } from "marked";
import type { VaultItem } from "../lib/types";
import { GlassCard } from "./GlassCard";

interface NotesPanelProps {
  notes: VaultItem[];
  onCreate: (title: string, content: string, tags: string[]) => void;
}

export function NotesPanel({ notes, onCreate }: NotesPanelProps) {
  const [title, setTitle] = useState("Untitled note");
  const [content, setContent] = useState("# New note\nStart writing...");
  const [tags, setTags] = useState("personal");

  const preview = useMemo(() => {
    const html = marked.parse(content, { breaks: true });
    return DOMPurify.sanitize(html as string);
  }, [content]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <GlassCard className="space-y-4">
        <div>
          <p className="text-xs text-ink-300">Create note</p>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="bg-transparent text-xl font-semibold outline-none w-full"
          />
        </div>
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          className="bg-ink-800/40 border border-white/10 rounded-xl p-4 min-h-[260px] text-sm outline-none"
        />
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={tags}
            onChange={(event) => setTags(event.target.value)}
            placeholder="tags, comma, separated"
            className="bg-ink-800/40 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none"
          />
          <button
            onClick={() => onCreate(title, content, tags.split(",").map((tag) => tag.trim()).filter(Boolean))}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition"
          >
            Save note
          </button>
        </div>
      </GlassCard>
      <GlassCard>
        <h3 className="text-sm text-ink-300">Preview</h3>
        <div
          className="prose prose-invert mt-4 max-w-none"
          dangerouslySetInnerHTML={{ __html: preview }}
        />
      </GlassCard>
      <GlassCard className="xl:col-span-2">
        <h3 className="text-sm text-ink-300">Recent notes</h3>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {notes.map((note) => (
            <div key={note.id} className="p-4 rounded-xl border border-white/10 bg-white/5">
              <h4 className="font-semibold truncate">{note.filename}</h4>
              <p className="text-xs text-ink-300 mt-2">{new Date(note.createdAt).toLocaleString()}</p>
              <p className="text-xs text-ink-200 mt-3">Encrypted note</p>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
