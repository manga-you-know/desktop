use tauri_plugin_http::reqwest;

#[tauri::command]
pub async fn get_aniplay_chapters(anime_id: &str) -> Result<String, String> {
	let params = [anime_id];
	let client = reqwest::Client::new();
	let res = client.post(&format!("https://aniplaynow.live/anime/watch/{}", anime_id))
		.header("Next-Action", "f3422af67c84852f5e63d50e1f51718f1c0225c4")
		.header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36")
		.header("Origin", "https://aniplaynow.live")
		.json(&params)
		.send()
		.await.map_err(|e| e.to_string())?; // Handle request error
	Ok(res.text().await.map_err(|e| e.to_string())?) // Handle response error
}
 
#[tauri::command]
pub async fn get_aniplay_episode(anime_id: &str, provider_id: &str, episode_id: &str, episode_number: &str, episode_type: &str) -> Result<String, String> {
	let params = [anime_id, provider_id, episode_id, episode_number, episode_type];
	let client = reqwest::Client::new();
	let res = client.post(&format!("https://aniplaynow.live/anime/info/{}", anime_id))
		.header("Next-Action", "5dbcd21c7c276c4d15f8de29d9ef27aef5ea4a5e")
		.header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36")
		.header("Origin", "https://aniplaynow.live")
		.json(&params)
		.send()
		.await.map_err(|e| e.to_string())?; // Handle request error
	Ok(res.text().await.map_err(|e| e.to_string())?) // Handle response error
}