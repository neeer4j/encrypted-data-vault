interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="glass-panel rounded-full px-4 py-2 w-80 flex items-center gap-3">
      <span className="text-ink-200">Search</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search notes, files, tags"
        className="bg-transparent border-0 outline-none text-sm text-white w-full"
      />
    </div>
  );
}
