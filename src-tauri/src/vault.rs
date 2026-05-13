use crate::crypto::{hash_password, verify_password};
use crate::db::init_db;
use crate::errors::VaultError;
use base64::{engine::general_purpose, Engine as _};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use tauri::Manager;

#[derive(Debug, Serialize, Deserialize)]
pub struct VaultConfig {
    pub salt_b64: String,
    pub verifier_hash: String
}

pub struct VaultPaths {
    pub root: PathBuf,
    pub storage_dir: PathBuf,
    pub db_path: PathBuf,
    pub config_path: PathBuf
}

pub fn vault_paths(app: &tauri::AppHandle, vault_id: &str) -> Result<VaultPaths, VaultError> {
    let base = app
        .path()
        .app_data_dir()
        .ok_or(VaultError::PathUnavailable)?
        .join("vaults")
        .join(vault_id);

    Ok(VaultPaths {
        root: base.clone(),
        storage_dir: base.join("vault-storage"),
        db_path: base.join("vault.db"),
        config_path: base.join("vault.json")
    })
}

pub fn ensure_vault_dirs(paths: &VaultPaths) -> Result<(), VaultError> {
    fs::create_dir_all(&paths.root)?;
    fs::create_dir_all(&paths.storage_dir)?;
    Ok(())
}

pub fn create_vault_config(paths: &VaultPaths, password: &str, salt: &[u8]) -> Result<(), VaultError> {
    if paths.config_path.exists() {
        return Err(VaultError::VaultExists);
    }
    let verifier_hash = hash_password(password, salt)?;
    let config = VaultConfig {
        salt_b64: general_purpose::STANDARD.encode(salt),
        verifier_hash
    };
    fs::write(&paths.config_path, serde_json::to_vec_pretty(&config)?)?;
    init_db(&paths.db_path)?;
    Ok(())
}

pub fn load_vault_config(paths: &VaultPaths) -> Result<VaultConfig, VaultError> {
    let data = fs::read(&paths.config_path)?;
    let config: VaultConfig = serde_json::from_slice(&data)?;
    Ok(config)
}

pub fn verify_vault_password(config: &VaultConfig, password: &str) -> Result<(), VaultError> {
    let verified = verify_password(password, &config.verifier_hash)?;
    if !verified {
        return Err(VaultError::InvalidPassword);
    }
    Ok(())
}

pub fn parse_salt(config: &VaultConfig) -> Result<Vec<u8>, VaultError> {
    let salt = general_purpose::STANDARD.decode(&config.salt_b64)?;
    Ok(salt)
}

pub fn ensure_db(paths: &VaultPaths) -> Result<(), VaultError> {
    if !Path::new(&paths.db_path).exists() {
        init_db(&paths.db_path)?;
    }
    Ok(())
}
