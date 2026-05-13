use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VaultItem {
    pub id: String,
    pub filename: String,
    pub mime: String,
    pub kind: String,
    pub tags: Vec<String>,
    pub folder: Option<String>,
    pub favorite: bool,
    pub created_at: String,
    pub updated_at: String,
    pub encrypted_path: String
}
