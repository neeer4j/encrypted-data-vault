use chrono::{DateTime, Utc};
use std::sync::Mutex;
use zeroize::Zeroize;

pub struct SessionState {
    pub vault_id: String,
    pub key: Vec<u8>,
    pub last_activity: DateTime<Utc>,
    pub idle_timeout_secs: u64
}

impl SessionState {
    pub fn touch(&mut self) {
        self.last_activity = Utc::now();
    }

    pub fn should_lock(&self) -> bool {
        let elapsed = Utc::now()
            .signed_duration_since(self.last_activity)
            .num_seconds();
        elapsed >= self.idle_timeout_secs as i64
    }

    pub fn clear(&mut self) {
        self.key.zeroize();
    }
}

pub struct AppState {
    pub session: Mutex<Option<SessionState>>
}
