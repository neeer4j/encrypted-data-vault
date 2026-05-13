# Personal Data Vault

Private, offline-first encrypted vault for files and notes. Everything is encrypted locally and never stored in plaintext on disk.

## Tech stack
- Tauri + Rust backend
- React + TypeScript frontend
- TailwindCSS styling
- SQLite metadata database
- libsodium encryption (XChaCha20-Poly1305)
- Argon2id password key derivation

## Setup
1. Install Node.js (LTS) and Rust.
2. Install Tauri CLI with Cargo.
3. Install dependencies: `npm install`.
4. Run the app: `npm run tauri dev`.

## Build
- `npm run tauri build`

## Notes
- Encrypted files are stored under `vault-storage` inside the app data directory.
- Metadata lives in a SQLite database in the same vault directory.
- Passwords are never stored. Only an Argon2id verifier is persisted.
- Vault auto-lock is enforced after inactivity.

## Security
- Uses Argon2id for password key derivation.
- Uses XChaCha20-Poly1305 for authenticated encryption.
- Generates a unique nonce per encrypted file.
- Securely clears in-memory session keys on lock.

## Project layout
- `src` contains the React UI
- `src-tauri` contains the Rust backend

## Development tips
- Unlock to access the dashboard.
- Drag and drop files into the vault area to encrypt and store.
- Notes are stored encrypted like other items.

## Next steps
- Implement encrypted search index for full-text note search.
- Add backup/export and secure delete workflows.
- Add video transcoding previews.
