// use base64::{engine::general_purpose::STANDARD as BASE64, Engine as _};
// use tauri_plugin_http::reqwest;

#[tauri::command(async)]
pub async fn get_base64_image(url: &str, referer: &str) -> Result<String, String> {
    // if referer == "https://mangadex.org" {
    //     let client = reqwest::Client::builder()
    //         .user_agent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36")
    //         .build()
    //         .map_err(|e| e.to_string())?;
    //     let res = client.get(url).send().await.map_err(|e| e.to_string())?;
    //     let bytes = res.bytes().await.map_err(|e| e.to_string())?;
    //     let base64_string = BASE64.encode(&bytes);
    //     Ok(base64_string)
    // } else if referer == "https://mangapark.io" {
    //     let client = reqwest::Client::builder()
    //         .build()
    //         .map_err(|e| e.to_string())?;
    //     let res = client.get(url).send().await.map_err(|e| e.to_string())?;
    //     let bytes = res.bytes().await.map_err(|e| e.to_string())?;
    //     let base64_string = BASE64.encode(&bytes);
    //     Ok(base64_string)
    // } else {
    //     let client = reqwest::Client::builder()
    //         .build()
    //         .map_err(|e| e.to_string())?;
    //     let res = client
    //         .get(url)
    //         .header("Accept", "*/*")
    //         .header("Referer", referer)
    //         .header("Origin", referer)
    //         .send()
    //         .await
    //         .map_err(|e| e.to_string())?;
    //     let bytes = res.bytes().await.map_err(|e| e.to_string())?;
    //     let base64_string = BASE64.encode(&bytes);
    let base64_string = String::new() + url + referer;
    Ok(base64_string)
    // }
}
