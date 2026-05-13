mod crypto;
mod db;
mod errors;
mod models;
mod state;
mod vault;

use crate::crypto::{decrypt_bytes, derive_key, encrypt_bytes, random_salt};
use crate::db::{
    delete_item,
    get_item,
    insert_item,
    list_folders,
    list_items,
    now_iso,
    set_folder_hidden,
    set_folder_locked,
    upsert_folder
};
use crate::errors::VaultError;
use crate::models::{VaultFolder, VaultItem};
use crate::state::{AppState, SessionState};
use crate::vault::{create_vault_config, ensure_db, ensure_vault_dirs, load_vault_config, parse_salt, verify_vault_password, vault_paths};
use base64::{engine::general_purpose, Engine as _};
use chrono::Utc;
use std::fs;
use std::io::{Seek, SeekFrom, Write};
use uuid::Uuid;

#[tauri::command]
fn create_vault(
    app: tauri::AppHandle,
    vault_id: String,
    password: String,
    idle_timeout: u64
) -> Result<(), VaultError> {
    let paths = vault_paths(&app, &vault_id)?;
    ensure_vault_dirs(&paths)?;
    let salt = random_salt();
    create_vault_config(&paths, &password, &salt)?;
    ensure_db(&paths)?;
    let default_folder = VaultFolder {
        name: "Notes".to_string(),
        hidden: false,
        locked: false
    };
    upsert_folder(&paths.db_path, &default_folder)?;
    let mut session = app.state::<AppState>().session.lock().unwrap();
    let key = derive_key(&password, &salt)?;
    *session = Some(SessionState {
        vault_id,
        key,
        last_activity: Utc::now(),
        idle_timeout_secs: idle_timeout
    });
    Ok(())
}

#[tauri::command]
fn unlock_vault(
    app: tauri::AppHandle,
    vault_id: String,
    password: String,
    idle_timeout: u64
) -> Result<(), VaultError> {
    let paths = vault_paths(&app, &vault_id)?;
    let config = load_vault_config(&paths)?;
    verify_vault_password(&config, &password)?;
    let salt = parse_salt(&config)?;
    let key = derive_key(&password, &salt)?;
    ensure_db(&paths)?;
    let default_folder = VaultFolder {
        name: "Notes".to_string(),
        hidden: false,
        locked: false
    };
    upsert_folder(&paths.db_path, &default_folder)?;
    let mut session = app.state::<AppState>().session.lock().unwrap();
    *session = Some(SessionState {
        vault_id,
        key,
        last_activity: Utc::now(),
        idle_timeout_secs: idle_timeout
    });
    Ok(())
}

#[tauri::command]
fn lock_vault(app: tauri::AppHandle) -> Result<(), VaultError> {
    let mut session = app.state::<AppState>().session.lock().unwrap();
    if let Some(mut state) = session.take() {
        state.clear();
    }
    Ok(())
}

#[tauri::command]
fn is_unlocked(app: tauri::AppHandle) -> Result<bool, VaultError> {
    let session = app.state::<AppState>().session.lock().unwrap();
    Ok(session.is_some())
}

#[tauri::command]
fn touch_activity(app: tauri::AppHandle) -> Result<(), VaultError> {
    let mut session = app.state::<AppState>().session.lock().unwrap();
    if let Some(state) = session.as_mut() {
        state.touch();
    }
    Ok(())
}

#[tauri::command]
fn check_autolock(app: tauri::AppHandle) -> Result<bool, VaultError> {
    let mut session = app.state::<AppState>().session.lock().unwrap();
    if let Some(state) = session.as_mut() {
        if state.should_lock() {
            state.clear();
            *session = None;
            return Ok(true);
        }
    }
    Ok(false)
}

#[tauri::command]
fn encrypt_and_store(
    app: tauri::AppHandle,
    vault_id: String,
    filename: String,
    mime: String,
    kind: String,
    tags: Vec<String>,
    folder: Option<String>,
    favorite: bool,
    data_base64: String
) -> Result<(), VaultError> {
    let paths = vault_paths(&app, &vault_id)?;
    ensure_vault_dirs(&paths)?;
    ensure_db(&paths)?;

    let session = app.state::<AppState>().session.lock().unwrap();
    let state = session.as_ref().ok_or(VaultError::NotUnlocked)?;
    if state.vault_id != vault_id {
        return Err(VaultError::VaultMismatch);
    }

    let plaintext = general_purpose::STANDARD.decode(data_base64)?;
    let encrypted = encrypt_bytes(&state.key, &plaintext)?;
    let id = Uuid::new_v4().to_string();
    let file_name = format!("{}.enc", id);
    let encrypted_path = paths.storage_dir.join(file_name);
    fs::write(&encrypted_path, encrypted)?;

    let now = now_iso();
    let item = VaultItem {
        id: id.clone(),
        filename,
        mime,
        kind,
        tags,
        folder,
        favorite,
        created_at: now.clone(),
        updated_at: now,
        encrypted_path: encrypted_path.to_string_lossy().to_string()
    };
    insert_item(&paths.db_path, &item)?;
    Ok(())
}

#[tauri::command]
fn list_items(app: tauri::AppHandle, vault_id: String) -> Result<Vec<VaultItem>, VaultError> {
    let paths = vault_paths(&app, &vault_id)?;
    let session = app.state::<AppState>().session.lock().unwrap();
    let state = session.as_ref().ok_or(VaultError::NotUnlocked)?;
    if state.vault_id != vault_id {
        return Err(VaultError::VaultMismatch);
    }
    list_items(&paths.db_path)
}

#[tauri::command]
fn list_folders(app: tauri::AppHandle, vault_id: String) -> Result<Vec<VaultFolder>, VaultError> {
    let paths = vault_paths(&app, &vault_id)?;
    ensure_db(&paths)?;
    let session = app.state::<AppState>().session.lock().unwrap();
    let state = session.as_ref().ok_or(VaultError::NotUnlocked)?;
    if state.vault_id != vault_id {
        return Err(VaultError::VaultMismatch);
    }
    list_folders(&paths.db_path)
}

#[tauri::command]
fn create_folder(
    app: tauri::AppHandle,
    vault_id: String,
    name: String,
    hidden: bool,
    locked: bool
) -> Result<(), VaultError> {
    let paths = vault_paths(&app, &vault_id)?;
    ensure_db(&paths)?;
    let session = app.state::<AppState>().session.lock().unwrap();
    let state = session.as_ref().ok_or(VaultError::NotUnlocked)?;
    if state.vault_id != vault_id {
        return Err(VaultError::VaultMismatch);
    }
    let folder = VaultFolder { name, hidden, locked };
    upsert_folder(&paths.db_path, &folder)?;
    Ok(())
}

#[tauri::command]
fn set_folder_hidden(
    app: tauri::AppHandle,
    vault_id: String,
    name: String,
    hidden: bool
) -> Result<(), VaultError> {
    let paths = vault_paths(&app, &vault_id)?;
    ensure_db(&paths)?;
    let session = app.state::<AppState>().session.lock().unwrap();
    let state = session.as_ref().ok_or(VaultError::NotUnlocked)?;
    if state.vault_id != vault_id {
        return Err(VaultError::VaultMismatch);
    }
    set_folder_hidden(&paths.db_path, &name, hidden)?;
    Ok(())
}

#[tauri::command]
fn set_folder_locked(
    app: tauri::AppHandle,
    vault_id: String,
    name: String,
    locked: bool
) -> Result<(), VaultError> {
    let paths = vault_paths(&app, &vault_id)?;
    ensure_db(&paths)?;
    let session = app.state::<AppState>().session.lock().unwrap();
    let state = session.as_ref().ok_or(VaultError::NotUnlocked)?;
    if state.vault_id != vault_id {
        return Err(VaultError::VaultMismatch);
    }
    set_folder_locked(&paths.db_path, &name, locked)?;
    Ok(())
}

#[tauri::command]
fn unlock_folder(
    app: tauri::AppHandle,
    vault_id: String,
    _name: String,
    password: String
) -> Result<bool, VaultError> {
    let paths = vault_paths(&app, &vault_id)?;
    let session = app.state::<AppState>().session.lock().unwrap();
    let state = session.as_ref().ok_or(VaultError::NotUnlocked)?;
    if state.vault_id != vault_id {
        return Err(VaultError::VaultMismatch);
    }
    let config = load_vault_config(&paths)?;
    Ok(verify_vault_password(&config, &password).is_ok())
}

#[tauri::command]
fn search_items(app: tauri::AppHandle, vault_id: String, query: String) -> Result<Vec<VaultItem>, VaultError> {
    let paths = vault_paths(&app, &vault_id)?;
    let session = app.state::<AppState>().session.lock().unwrap();
    let state = session.as_ref().ok_or(VaultError::NotUnlocked)?;
    if state.vault_id != vault_id {
        return Err(VaultError::VaultMismatch);
    }
    let query = query.to_lowercase();
    let all_items = list_items(&paths.db_path)?;
    let mut matches = Vec::new();
    for item in all_items {
        let mut matched = item.filename.to_lowercase().contains(&query)
            || item.tags.iter().any(|tag| tag.to_lowercase().contains(&query));
        if !matched && item.kind == "note" {
            let data = fs::read(&item.encrypted_path)?;
            let plaintext = decrypt_bytes(&state.key, &data)?;
            if let Ok(text) = String::from_utf8(plaintext) {
                matched = text.to_lowercase().contains(&query);
            }
        }
        if matched {
            matches.push(item);
        }
    }
    Ok(matches)
}

#[tauri::command]
fn decrypt_preview(app: tauri::AppHandle, vault_id: String, item_id: String) -> Result<String, VaultError> {
    let paths = vault_paths(&app, &vault_id)?;
    let session = app.state::<AppState>().session.lock().unwrap();
    let state = session.as_ref().ok_or(VaultError::NotUnlocked)?;
    if state.vault_id != vault_id {
        return Err(VaultError::VaultMismatch);
    }
    let item = get_item(&paths.db_path, &item_id)?;
    let data = fs::read(item.encrypted_path)?;
    let plaintext = decrypt_bytes(&state.key, &data)?;
    Ok(general_purpose::STANDARD.encode(plaintext))
}

fn secure_delete_file(path: &std::path::Path) -> Result<(), VaultError> {
    if !path.exists() {
        return Ok(());
    }
    let size = fs::metadata(path)?.len();
    let mut file = fs::OpenOptions::new().write(true).open(path)?;
    file.seek(SeekFrom::Start(0))?;
    let buffer = vec![0u8; 8192];
    let mut remaining = size;
    while remaining > 0 {
        let chunk = std::cmp::min(remaining, buffer.len() as u64) as usize;
        file.write_all(&buffer[..chunk])?;
        remaining -= chunk as u64;
    }
    file.sync_all()?;
    drop(file);
    fs::remove_file(path)?;
    Ok(())
}

#[tauri::command]
fn secure_delete_item(app: tauri::AppHandle, vault_id: String, item_id: String) -> Result<(), VaultError> {
    let paths = vault_paths(&app, &vault_id)?;
    let session = app.state::<AppState>().session.lock().unwrap();
    let state = session.as_ref().ok_or(VaultError::NotUnlocked)?;
    if state.vault_id != vault_id {
        return Err(VaultError::VaultMismatch);
    }
    let item = get_item(&paths.db_path, &item_id)?;
    let encrypted_path = std::path::Path::new(&item.encrypted_path);
    secure_delete_file(encrypted_path)?;
    delete_item(&paths.db_path, &item_id)?;
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .manage(AppState { session: std::sync::Mutex::new(None) })
        .invoke_handler(tauri::generate_handler![
            create_vault,
            unlock_vault,
            lock_vault,
            is_unlocked,
            touch_activity,
            check_autolock,
            encrypt_and_store,
            list_items,
            list_folders,
            create_folder,
            set_folder_hidden,
            set_folder_locked,
            unlock_folder,
            search_items,
            decrypt_preview,
            secure_delete_item
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
