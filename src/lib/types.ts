export type VaultItemKind = "image" | "video" | "document" | "note";

export interface VaultItem {
  id: string;
  filename: string;
  mime: string;
  kind: VaultItemKind;
  tags: string[];
  folder: string | null;
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
  encryptedPath: string;
  previewData?: string | null;
}

export interface VaultStatus {
  unlocked: boolean;
  vaultId: string | null;
}

export interface VaultFolder {
  name: string;
  hidden: boolean;
  locked: boolean;
}
