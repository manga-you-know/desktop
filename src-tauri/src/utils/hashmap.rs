use once_cell::sync::Lazy;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Mutex;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Chapter {
    number: String,
    title: String,
    chapter_id: String,
    source: String,
    language: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Data {
    user_id: usize,
    favorite_id: usize,
    chapter_index: usize,
    chapters: Vec<Chapter>,
}

static GLOBAL_HASHMAP: Lazy<Mutex<HashMap<String, Data>>> =
    Lazy::new(|| Mutex::new(HashMap::new()));

#[tauri::command]
pub fn set_data(key: &str, value: Data) {
    let mut map = GLOBAL_HASHMAP.lock().unwrap();
    map.insert(key.to_string(), value);
}

#[tauri::command]
pub fn get_data(key: String) -> Result<Data, String> {
    let mut map = GLOBAL_HASHMAP.lock().unwrap();
    if let Some(data) = map.get(&key) {
        let result = data.clone();
        map.remove(&key);
        Ok(result)
    } else {
        Err(format!("key '{}' not found.", key))
    }
}
