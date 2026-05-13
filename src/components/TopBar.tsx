import { SearchBar } from "./SearchBar";

interface TopBarProps {
  query: string;
  onQueryChange: (value: string) => void;
  onUploadClick: () => void;
  activeFolderLabel: string;
}

export function TopBar({ query, onQueryChange, onUploadClick, activeFolderLabel }: TopBarProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-xs text-ink-600 uppercase tracking-[0.2em]">Secure library</p>
        <h2 className="text-2xl font-semibold">Your encrypted space</h2>
        <p className="text-xs text-ink-600 mt-1">{activeFolderLabel}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onUploadClick}
          className="retro-button px-3 py-2 text-sm"
        >
          Upload files
        </button>
        <SearchBar value={query} onChange={onQueryChange} />
      </div>
    </div>
  );
}
