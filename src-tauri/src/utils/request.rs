use base64::{engine::general_purpose::STANDARD as BASE64, Engine as _};

#[tauri::command(async)]
pub async fn get_base64_image(url: &str, referer: &str) -> Result<String, String> {
    Ok(String::from("nada"))
}
