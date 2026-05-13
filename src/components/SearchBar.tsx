interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="retro-inset px-3 py-1 w-72 flex items-center gap-2">
      <span className="text-xs text-ink-600">Find</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search notes, files, tags"
        className="bg-transparent border-0 outline-none text-sm w-full"
      />
    </div>
  );
}
