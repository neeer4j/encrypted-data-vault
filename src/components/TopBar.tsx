import { SearchBar } from "./SearchBar";

interface TopBarProps {
  query: string;
  onQueryChange: (value: string) => void;
}

export function TopBar({ query, onQueryChange }: TopBarProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm text-ink-200">Secure library</p>
        <h2 className="text-2xl font-semibold">Your encrypted space</h2>
      </div>
      <SearchBar value={query} onChange={onQueryChange} />
    </div>
  );
}
