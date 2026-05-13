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
          <p className="text-xs text-ink-600 uppercase tracking-[0.2em]">Create note</p>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="retro-input text-base font-semibold outline-none w-full px-2 py-1"
          />
        </div>
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          className="retro-input p-3 min-h-[260px] text-sm outline-none"
        />
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={tags}
            onChange={(event) => setTags(event.target.value)}
            placeholder="tags, comma, separated"
            className="retro-input px-2 py-1 text-xs outline-none"
          />
          <button
            onClick={() => onCreate(title, content, tags.split(",").map((tag) => tag.trim()).filter(Boolean))}
            className="retro-button px-3 py-2 text-xs"
          >
            Save note
          </button>
        </div>
      </GlassCard>
      <GlassCard>
        <h3 className="text-xs text-ink-600 uppercase tracking-[0.2em]">Preview</h3>
        <div
          className="prose prose-invert mt-4 max-w-none"
          dangerouslySetInnerHTML={{ __html: preview }}
        />
      </GlassCard>
      <GlassCard className="xl:col-span-2">
        <h3 className="text-xs text-ink-600 uppercase tracking-[0.2em]">Recent notes</h3>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {notes.map((note) => (
            <div key={note.id} className="p-3 retro-inset">
              <h4 className="font-semibold truncate">{note.filename}</h4>
              <p className="text-xs text-ink-600 mt-2">{new Date(note.createdAt).toLocaleString()}</p>
              <p className="text-xs text-ink-600 mt-3">Encrypted note</p>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
