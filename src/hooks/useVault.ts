import { useCallback, useEffect, useMemo, useState } from "react";
import {
  checkAutoLock,
  createVault,
  createFolder,
  decryptPreview,
  encryptAndStore,
  fileToBase64,
  textToBase64,
  isUnlocked,
  listFolders,
  listItems,
  lockVault,
  setFolderHidden,
  setFolderLocked,
  secureDeleteItem,
  searchItems,
  touchActivity,
  unlockFolder,
  unlockVault
} from "../lib/api";
import type { VaultFolder, VaultItem, VaultItemKind } from "../lib/types";
import { VAULT_IDLE_TIMEOUT } from "../lib/constants";

export function useVault() {
  const [vaultId, setVaultId] = useState<string | null>(null);
  const [items, setItems] = useState<VaultItem[]>([]);
  const [folders, setFolders] = useState<VaultFolder[]>([]);
  const [unlockedFolders, setUnlockedFolders] = useState<string[]>([]);
  const [unlocked, setUnlocked] = useState(false);
  const [busy, setBusy] = useState(false);

  const refreshItems = useCallback(async (id = vaultId) => {
    if (!id) return;
    const next = await listItems(id);
    let previewCount = 0;
    const withPreviews = await Promise.all(
      next.map(async (item) => {
        if (item.kind === "image" && previewCount < 12) {
          previewCount += 1;
          try {
            const previewData = await decryptPreview(id, item.id);
            return { ...item, previewData };
          } catch {
            return item;
          }
        }
        return item;
      })
    );
    setItems(withPreviews);
  }, [vaultId]);

  const refreshFolders = useCallback(async (id = vaultId) => {
    if (!id) return;
    const next = await listFolders(id);
    setFolders(next);
  }, [vaultId]);

  const unlock = useCallback(async (id: string, password: string) => {
    setBusy(true);
    await unlockVault(id, password, VAULT_IDLE_TIMEOUT);
    setVaultId(id);
    setUnlocked(true);
    setUnlockedFolders([]);
    await refreshItems(id);
    await refreshFolders(id);
    setBusy(false);
  }, [refreshItems, refreshFolders]);

  const create = useCallback(async (id: string, password: string) => {
    setBusy(true);
    await createVault(id, password, VAULT_IDLE_TIMEOUT);
    await unlock(id, password);
    setBusy(false);
  }, [unlock]);

  const lock = useCallback(async () => {
    await lockVault();
    setUnlocked(false);
    setUnlockedFolders([]);
  }, []);

  const addFiles = useCallback(async (files: File[], folder: string | null, tags: string[]) => {
    if (!vaultId) return;
    setBusy(true);
    for (const file of files) {
      const dataBase64 = await fileToBase64(file);
      const kind: VaultItemKind = file.type.startsWith("image")
        ? "image"
        : file.type.startsWith("video")
        ? "video"
        : "document";
      await encryptAndStore({
        vaultId,
        filename: file.name,
        mime: file.type,
        kind,
        tags,
        folder,
        favorite: false,
        dataBase64
      });
    }
    await refreshItems();
    setBusy(false);
  }, [refreshItems, vaultId]);

  const addNote = useCallback(async (title: string, markdown: string, tags: string[]) => {
    if (!vaultId) return;
    setBusy(true);
    const dataBase64 = textToBase64(markdown);
    await encryptAndStore({
      vaultId,
      filename: title,
      mime: "text/markdown",
      kind: "note",
      tags,
      folder: "Notes",
      favorite: false,
      dataBase64
    });
    await refreshItems();
    setBusy(false);
  }, [refreshItems, vaultId]);

  const deleteItem = useCallback(async (itemId: string) => {
    if (!vaultId) return;
    setBusy(true);
    await secureDeleteItem(vaultId, itemId);
    await refreshItems();
    setBusy(false);
  }, [refreshItems, vaultId]);

  const createVaultFolder = useCallback(async (name: string, hidden: boolean, locked: boolean) => {
    if (!vaultId) return;
    setBusy(true);
    await createFolder(vaultId, name, hidden, locked);
    await refreshFolders();
    setBusy(false);
  }, [refreshFolders, vaultId]);

  const toggleFolderHidden = useCallback(async (name: string, hidden: boolean) => {
    if (!vaultId) return;
    setBusy(true);
    await setFolderHidden(vaultId, name, hidden);
    await refreshFolders();
    setBusy(false);
  }, [refreshFolders, vaultId]);

  const toggleFolderLocked = useCallback(async (name: string, locked: boolean) => {
    if (!vaultId) return;
    setBusy(true);
    await setFolderLocked(vaultId, name, locked);
    if (!locked) {
      setUnlockedFolders((prev) => prev.filter((folder) => folder !== name));
    }
    await refreshFolders();
    setBusy(false);
  }, [refreshFolders, vaultId]);

  const unlockVaultFolder = useCallback(async (name: string, password: string) => {
    if (!vaultId) return false;
    setBusy(true);
    const ok = await unlockFolder(vaultId, name, password);
    if (ok) {
      setUnlockedFolders((prev) => (prev.includes(name) ? prev : [...prev, name]));
    }
    setBusy(false);
    return ok;
  }, [vaultId]);

  const search = useCallback(async (query: string) => {
    if (!vaultId) return [];
    return searchItems(vaultId, query);
  }, [vaultId]);

  const getPreview = useCallback(async (item: VaultItem) => {
    if (!vaultId) return null;
    if (item.kind !== "image") return null;
    return decryptPreview(vaultId, item.id);
  }, [vaultId]);

  const decryptItem = useCallback(async (itemId: string) => {
    if (!vaultId) return null;
    return decryptPreview(vaultId, itemId);
  }, [vaultId]);

  useEffect(() => {
    const init = async () => {
      const status = await isUnlocked();
      setUnlocked(status);
    };
    init();
  }, []);

  useEffect(() => {
    if (!unlocked) return;
    const interval = setInterval(async () => {
      const locked = await checkAutoLock();
      if (locked) {
        setUnlocked(false);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [unlocked]);

  useEffect(() => {
    if (!unlocked) return;
    const handler = () => {
      touchActivity();
    };
    window.addEventListener("mousemove", handler);
    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("mousemove", handler);
      window.removeEventListener("keydown", handler);
    };
  }, [unlocked]);

  return useMemo(() => ({
    vaultId,
    unlocked,
    busy,
    items,
    folders,
    unlockedFolders,
    unlock,
    create,
    lock,
    addFiles,
    addNote,
    deleteItem,
    createVaultFolder,
    toggleFolderHidden,
    toggleFolderLocked,
    unlockVaultFolder,
    refreshItems,
    refreshFolders,
    search,
    getPreview,
    decryptItem,
    setVaultId
  }), [
    vaultId,
    unlocked,
    busy,
    items,
    folders,
    unlockedFolders,
    unlock,
    create,
    lock,
    addFiles,
    addNote,
    deleteItem,
    createVaultFolder,
    toggleFolderHidden,
    toggleFolderLocked,
    unlockVaultFolder,
    refreshItems,
    refreshFolders,
    search,
    getPreview,
    decryptItem
  ]);
}
