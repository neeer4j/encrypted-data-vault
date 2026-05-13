import { invoke } from "@tauri-apps/api/core";
import type { VaultFolder, VaultItem, VaultItemKind } from "./types";

export async function createVault(vaultId: string, password: string, idleTimeout: number) {
  return invoke<void>("create_vault", { vaultId, password, idleTimeout });
}

export async function unlockVault(vaultId: string, password: string, idleTimeout: number) {
  return invoke<void>("unlock_vault", { vaultId, password, idleTimeout });
}

export async function lockVault() {
  return invoke<void>("lock_vault");
}

export async function isUnlocked() {
  return invoke<boolean>("is_unlocked");
}

export async function touchActivity() {
  return invoke<void>("touch_activity");
}

export async function checkAutoLock() {
  return invoke<boolean>("check_autolock");
}

export async function listItems(vaultId: string) {
  return invoke<VaultItem[]>("list_items", { vaultId });
}

export async function listFolders(vaultId: string) {
  return invoke<VaultFolder[]>("list_folders", { vaultId });
}

export async function createFolder(
  vaultId: string,
  name: string,
  hidden: boolean,
  locked: boolean
) {
  return invoke<void>("create_folder", { vaultId, name, hidden, locked });
}

export async function setFolderHidden(vaultId: string, name: string, hidden: boolean) {
  return invoke<void>("set_folder_hidden", { vaultId, name, hidden });
}

export async function setFolderLocked(vaultId: string, name: string, locked: boolean) {
  return invoke<void>("set_folder_locked", { vaultId, name, locked });
}

export async function unlockFolder(vaultId: string, name: string, password: string) {
  return invoke<boolean>("unlock_folder", { vaultId, name, password });
}

export async function searchItems(vaultId: string, query: string) {
  return invoke<VaultItem[]>("search_items", { vaultId, query });
}

export async function decryptPreview(vaultId: string, itemId: string) {
  return invoke<string>("decrypt_preview", { vaultId, itemId });
}

export async function setItemFolder(
  vaultId: string,
  itemId: string,
  folder: string | null
) {
  return invoke<void>("set_item_folder", { vaultId, itemId, folder });
}

export async function renameItem(
  vaultId: string,
  itemId: string,
  filename: string
) {
  return invoke<void>("rename_item", { vaultId, itemId, filename });
}

export async function secureDeleteItem(vaultId: string, itemId: string) {
  return invoke<void>("secure_delete_item", { vaultId, itemId });
}


export async function encryptAndStore(params: {
  vaultId: string;
  filename: string;
  mime: string;
  kind: VaultItemKind;
  tags: string[];
  folder: string | null;
  favorite: boolean;
  dataBase64: string;
}) {
  return invoke<void>("encrypt_and_store", params);
}

export async function fileToBase64(file: File) {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  bytes.forEach((value) => {
    binary += String.fromCharCode(value);
  });
  return btoa(binary);
}

export function textToBase64(text: string) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  bytes.forEach((value) => {
    binary += String.fromCharCode(value);
  });
  return btoa(binary);
}
