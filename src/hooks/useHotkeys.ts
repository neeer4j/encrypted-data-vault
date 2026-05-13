import { useEffect } from "react";

type HotkeyMap = Record<string, () => void>;

export function useHotkeys(hotkeys: HotkeyMap) {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const key = `${event.ctrlKey || event.metaKey ? "mod+" : ""}${event.key.toLowerCase()}`;
      if (hotkeys[key]) {
        event.preventDefault();
        hotkeys[key]();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [hotkeys]);
}
