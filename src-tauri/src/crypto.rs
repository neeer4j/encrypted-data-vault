use crate::errors::VaultError;
use argon2::{
    password_hash::{PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Algorithm, Argon2, Params, Version
};
use rand::rngs::OsRng;
use rand::RngCore;
use sodiumoxide::crypto::aead::xchacha20poly1305_ietf as xchacha;

const MAGIC: &[u8; 4] = b"PDV1";

pub fn init_crypto() -> Result<(), VaultError> {
    if sodiumoxide::init().is_err() {
        return Err(VaultError::CryptoInit);
    }
    Ok(())
}

pub fn derive_key(password: &str, salt: &[u8]) -> Result<Vec<u8>, VaultError> {
    let mut key = vec![0u8; xchacha::KEYBYTES];
    let params = Params::new(65536, 3, 1, Some(xchacha::KEYBYTES as u32))?;
    let argon2 = Argon2::new(Algorithm::Argon2id, Version::V0x13, params);
    argon2.hash_password_into(password.as_bytes(), salt, &mut key)?;
    Ok(key)
}

pub fn hash_password(password: &str, salt: &[u8]) -> Result<String, VaultError> {
    let salt_string = SaltString::b64_encode(salt)?;
    let params = Params::new(65536, 3, 1, None)?;
    let argon2 = Argon2::new(Algorithm::Argon2id, Version::V0x13, params);
    let hash = argon2.hash_password(password.as_bytes(), &salt_string)?;
    Ok(hash.to_string())
}

pub fn verify_password(password: &str, verifier_hash: &str) -> Result<bool, VaultError> {
    let parsed = PasswordHash::new(verifier_hash)?;
    let params = Params::new(65536, 3, 1, None)?;
    let argon2 = Argon2::new(Algorithm::Argon2id, Version::V0x13, params);
    Ok(argon2.verify_password(password.as_bytes(), &parsed).is_ok())
}

pub fn encrypt_bytes(key: &[u8], plaintext: &[u8]) -> Result<Vec<u8>, VaultError> {
    init_crypto()?;
    let key = xchacha::Key::from_slice(key).ok_or(VaultError::InvalidKey)?;
    let nonce = xchacha::gen_nonce();
    let ciphertext = xchacha::seal(plaintext, None, &nonce, &key);
    let mut out = Vec::with_capacity(MAGIC.len() + xchacha::NONCEBYTES + ciphertext.len());
    out.extend_from_slice(MAGIC);
    out.extend_from_slice(&nonce.0);
    out.extend_from_slice(&ciphertext);
    Ok(out)
}

pub fn decrypt_bytes(key: &[u8], data: &[u8]) -> Result<Vec<u8>, VaultError> {
    init_crypto()?;
    if data.len() < MAGIC.len() + xchacha::NONCEBYTES {
        return Err(VaultError::InvalidCiphertext);
    }
    if &data[0..4] != MAGIC {
        return Err(VaultError::InvalidCiphertext);
    }
    let nonce_start = MAGIC.len();
    let nonce_end = nonce_start + xchacha::NONCEBYTES;
    let nonce = xchacha::Nonce::from_slice(&data[nonce_start..nonce_end])
        .ok_or(VaultError::InvalidCiphertext)?;
    let key = xchacha::Key::from_slice(key).ok_or(VaultError::InvalidKey)?;
    let ciphertext = &data[nonce_end..];
    let plaintext = xchacha::open(ciphertext, None, &nonce, &key)
        .map_err(|_| VaultError::InvalidCiphertext)?;
    Ok(plaintext)
}

pub fn random_salt() -> Vec<u8> {
    let mut salt = vec![0u8; 16];
    OsRng.fill_bytes(&mut salt);
    salt
}
