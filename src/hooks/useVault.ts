import { useCallback, useEffect, useMemo, useState } from "react";
import {
  checkAutoLock,
  createVault,
  decryptPreview,
  encryptAndStore,
  fileToBase64,
  textToBase64,
  isUnlocked,
  listItems,
  lockVault,
  searchItems,
  touchActivity,
  unlockVault
} from "../lib/api";
import type { VaultItem, VaultItemKind } from "../lib/types";
import { VAULT_IDLE_TIMEOUT } from "../lib/constants";

export function useVault() {
  const [vaultId, setVaultId] = useState<string | null>(null);
  const [items, setItems] = useState<VaultItem[]>([]);
  const [unlocked, setUnlocked] = useState(false);
  const [busy, setBusy] = useState(false);

  const refreshItems = useCallback(async (id = vaultId) => {
    if (!id) return;
    const next = await listItems(id);
    setItems(next);
  }, [vaultId]);

  const unlock = useCallback(async (id: string, password: string) => {
    setBusy(true);
    await unlockVault(id, password, VAULT_IDLE_TIMEOUT);
    setVaultId(id);
    setUnlocked(true);
    await refreshItems(id);
    setBusy(false);
  }, [refreshItems]);

  const create = useCallback(async (id: string, password: string) => {
    setBusy(true);
    await createVault(id, password, VAULT_IDLE_TIMEOUT);
    await unlock(id, password);
    setBusy(false);
  }, [unlock]);

  const lock = useCallback(async () => {
    await lockVault();
    setUnlocked(false);
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

  const search = useCallback(async (query: string) => {
    if (!vaultId) return [];
    return searchItems(vaultId, query);
  }, [vaultId]);

  const getPreview = useCallback(async (item: VaultItem) => {
    if (!vaultId) return null;
    if (item.kind !== "image") return null;
    return decryptPreview(vaultId, item.id);
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
    unlock,
    create,
    lock,
    addFiles,
    addNote,
    refreshItems,
    search,
    getPreview,
    setVaultId
  }), [vaultId, unlocked, busy, items, unlock, create, lock, addFiles, addNote, refreshItems, search, getPreview]);
}
