use tauri_plugin_http::reqwest;

#[tauri::command]
pub async fn get_aniplay_chapters(anime_id: &str) -> Result<String, String> {
	let params = [anime_id];
	let client = reqwest::Client::new();
	let res = client.post(&format!("https://aniplaynow.live/anime/watch/{}", anime_id))
		.header("Next-Action", "f3422af67c84852f5e63d50e1f51718f1c0225c4")
		.json(&params)
		.send()
		.await.map_err(|e| e.to_string())?; // Handle request error
	Ok(res.text().await.map_err(|e| e.to_string())?) // Handle response error
}

#[tauri::command]
pub async fn get_aniplay_episode(anime_id: &str, provider_id: &str, episode_id: &str) -> Result<String, String> {
	let params = [anime_id, provider_id, episode_id, "1", "sub"];
	let client = reqwest::Client::new();
	let res = client.post(&format!("https://aniplaynow.live/anime/info/{}", anime_id))
		.header("Next-Action", "5dbcd21c7c276c4d15f8de29d9ef27aef5ea4a5e")
		.json(&params)
		.send()
		.await.map_err(|e| e.to_string())?; // Handle request error
	Ok(res.text().await.map_err(|e| e.to_string())?) // Handle response error
}