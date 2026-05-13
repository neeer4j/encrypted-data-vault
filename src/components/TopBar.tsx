import { SearchBar } from "./SearchBar";

type ViewMode = "details" | "thumbnails";

interface TopBarProps {
  query: string;
  onQueryChange: (value: string) => void;
  onUploadClick: () => void;
  activeFolderLabel: string;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function TopBar({
  query,
  onQueryChange,
  onUploadClick,
  activeFolderLabel,
  viewMode,
  onViewModeChange
}: TopBarProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-xs text-ink-600 uppercase tracking-[0.2em]">Secure library</p>
        <h2 className="text-2xl font-semibold">Your encrypted space</h2>
        <p className="text-xs text-ink-600 mt-1">{activeFolderLabel}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onViewModeChange("details")}
            className={
              `retro-button px-2 py-1 text-xs ${
                viewMode === "details" ? "outline outline-2 outline-black" : ""
              }`
            }
            aria-pressed={viewMode === "details"}
          >
            Details
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("thumbnails")}
            className={
              `retro-button px-2 py-1 text-xs ${
                viewMode === "thumbnails" ? "outline outline-2 outline-black" : ""
              }`
            }
            aria-pressed={viewMode === "thumbnails"}
          >
            Thumbnails
          </button>
        </div>
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
