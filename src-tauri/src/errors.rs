use thiserror::Error;

#[derive(Debug, Error)]
pub enum VaultError {
    #[error("vault already exists")]
    VaultExists,
    #[error("invalid password")]
    InvalidPassword,
    #[error("vault not unlocked")]
    NotUnlocked,
    #[error("vault mismatch")]
    VaultMismatch,
    #[error("invalid key")]
    InvalidKey,
    #[error("invalid ciphertext")]
    InvalidCiphertext,
    #[error("crypto init failed")]
    CryptoInit,
    #[error("path unavailable")]
    PathUnavailable,
    #[error("io error")]
    Io(#[from] std::io::Error),
    #[error("serde error")]
    Serde(#[from] serde_json::Error),
    #[error("argon2 error")]
    Argon2(#[from] argon2::password_hash::Error),
    #[error("sqlite error")]
    Sqlite(#[from] rusqlite::Error),
    #[error("base64 error")]
    Base64(#[from] base64::DecodeError)
}
