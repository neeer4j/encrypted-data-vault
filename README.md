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
2. Install Tauri CLI with Cargo: `cargo install tauri-cli`.
3. Install dependencies: `npm install`.
4. Run the app: `npm run tauri dev`.

## Build
- `npm run tauri build`

## Notes
- Encrypted files are stored under `vault-storage` inside the app data directory.
- Metadata lives in a SQLite database in the same vault directory.
- Passwords are never stored. Only an Argon2id verifier is persisted.
- Vault auto-lock is enforced after inactivity.
- Hidden folders stay off the UI unless explicitly shown.
- Locked folders require re-authentication per session.

## Security
- Uses Argon2id for password key derivation.
- Uses XChaCha20-Poly1305 for authenticated encryption.
- Generates a unique nonce per encrypted file.
- Securely clears in-memory session keys on lock.
- Secure delete is best-effort and may not guarantee erasure on SSDs.

## Project layout
- `src` contains the React UI
- `src-tauri` contains the Rust backend

## Development tips
- Unlock to access the dashboard.
- Drag and drop files into the vault area to encrypt and store.
- Notes are stored encrypted like other items.
- Use folders to group files, and lock them for extra protection.
- Click a media card to open a fullscreen preview.

## Next steps
- Implement encrypted search index for full-text note search.
- Add backup/export workflows.
- Add video transcoding previews.
