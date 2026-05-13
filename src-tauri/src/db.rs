use crate::errors::VaultError;
use crate::models::VaultItem;
use chrono::Utc;
use rusqlite::{params, Connection};
use std::path::Path;

pub fn init_db(path: &Path) -> Result<(), VaultError> {
    let conn = Connection::open(path)?;
    conn.execute_batch(
        "
        CREATE TABLE IF NOT EXISTS items (
            id TEXT PRIMARY KEY,
            filename TEXT NOT NULL,
            mime TEXT NOT NULL,
            kind TEXT NOT NULL,
            tags TEXT NOT NULL,
            folder TEXT,
            favorite INTEGER NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            encrypted_path TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_items_kind ON items(kind);
        CREATE INDEX IF NOT EXISTS idx_items_folder ON items(folder);
        CREATE INDEX IF NOT EXISTS idx_items_favorite ON items(favorite);
        CREATE INDEX IF NOT EXISTS idx_items_created ON items(created_at);
        "
    )?;
    Ok(())
}

pub fn insert_item(path: &Path, item: &VaultItem) -> Result<(), VaultError> {
    let conn = Connection::open(path)?;
    conn.execute(
        "INSERT INTO items (id, filename, mime, kind, tags, folder, favorite, created_at, updated_at, encrypted_path)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
        params![
            item.id,
            item.filename,
            item.mime,
            item.kind,
            item.tags.join(","),
            item.folder,
            item.favorite as i32,
            item.created_at,
            item.updated_at,
            item.encrypted_path
        ],
    )?;
    Ok(())
}

pub fn list_items(path: &Path) -> Result<Vec<VaultItem>, VaultError> {
    let conn = Connection::open(path)?;
    let mut stmt = conn.prepare(
        "SELECT id, filename, mime, kind, tags, folder, favorite, created_at, updated_at, encrypted_path
         FROM items ORDER BY created_at DESC"
    )?;
    let rows = stmt.query_map([], |row| {
        let tags: String = row.get(4)?;
        Ok(VaultItem {
            id: row.get(0)?,
            filename: row.get(1)?,
            mime: row.get(2)?,
            kind: row.get(3)?,
            tags: tags.split(',').filter(|tag| !tag.is_empty()).map(|t| t.to_string()).collect(),
            folder: row.get(5)?,
            favorite: row.get::<_, i32>(6)? != 0,
            created_at: row.get(7)?,
            updated_at: row.get(8)?,
            encrypted_path: row.get(9)?
        })
    })?;
    let mut items = Vec::new();
    for item in rows {
        items.push(item?);
    }
    Ok(items)
}

pub fn get_item(path: &Path, item_id: &str) -> Result<VaultItem, VaultError> {
    let conn = Connection::open(path)?;
    let mut stmt = conn.prepare(
        "SELECT id, filename, mime, kind, tags, folder, favorite, created_at, updated_at, encrypted_path
         FROM items WHERE id = ?1"
    )?;
    let item = stmt.query_row(params![item_id], |row| {
        let tags: String = row.get(4)?;
        Ok(VaultItem {
            id: row.get(0)?,
            filename: row.get(1)?,
            mime: row.get(2)?,
            kind: row.get(3)?,
            tags: tags.split(',').filter(|tag| !tag.is_empty()).map(|t| t.to_string()).collect(),
            folder: row.get(5)?,
            favorite: row.get::<_, i32>(6)? != 0,
            created_at: row.get(7)?,
            updated_at: row.get(8)?,
            encrypted_path: row.get(9)?
        })
    })?;
    Ok(item)
}

pub fn now_iso() -> String {
    Utc::now().to_rfc3339()
}
