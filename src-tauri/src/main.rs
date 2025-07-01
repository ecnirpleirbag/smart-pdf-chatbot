#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use base64::{Engine as _, engine::general_purpose::STANDARD as BASE64};
use std::fs;
use std::path::PathBuf;
use tauri::Manager;

#[tauri::command]
async fn process_pdf(content: String, filename: String) -> Result<String, String> {
    // Create temp directory if it doesn't exist
    let temp_dir = PathBuf::from("temp");
    if !temp_dir.exists() {
        fs::create_dir(&temp_dir).map_err(|e| e.to_string())?;
    }

    // Decode base64 content
    let pdf_content = BASE64.decode(content).map_err(|e| e.to_string())?;
    
    // Save PDF to temp directory
    let pdf_path = temp_dir.join(filename);
    fs::write(&pdf_path, pdf_content).map_err(|e| e.to_string())?;

    // Process PDF using the backend
    // This will be handled by the FastAPI backend
    Ok("PDF processed successfully".to_string())
}

#[tauri::command]
async fn chat_with_pdf(message: String, pdf_path: String) -> Result<String, String> {
    // Send message to backend for processing
    let client = reqwest::Client::new();
    let response = client
        .post("http://localhost:8000/chat")
        .json(&serde_json::json!({
            "message": message,
            "pdf_path": pdf_path
        }))
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let response_text = response.text().await.map_err(|e| e.to_string())?;
    Ok(response_text)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![process_pdf, chat_with_pdf])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
} 