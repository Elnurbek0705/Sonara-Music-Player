use tauri::Manager;
use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
};
use tauri_plugin_shell::ShellExt;

#[derive(serde::Serialize, serde::Deserialize, Debug)]
struct SearchResult {
    id: String,
    title: String,
    duration: u64,
    thumbnail: String,
    channel: String,
}

#[derive(serde::Serialize, serde::Deserialize, Debug)]
struct AudioInfo {
    url: String,
    title: String,
    duration: u64,
    thumbnail: String,
}

#[tauri::command]
async fn search_youtube(app: tauri::AppHandle, query: String) -> Result<Vec<SearchResult>, String> {
    let output = app
        .shell()
        .sidecar("yt-dlp")
        .map_err(|e| e.to_string())?
        .args([
            &format!("ytsearch10:{}", query),
            "--dump-json",
            "--flat-playlist",
            "--no-warnings",
            "--quiet",
        ])
        .output()
        .await
        .map_err(|e| e.to_string())?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    let results: Vec<SearchResult> = stdout
        .lines()
        .filter(|line| !line.is_empty())
        .filter_map(|line| {
            let v: serde_json::Value = serde_json::from_str(line).ok()?;
            Some(SearchResult {
                id: v["id"].as_str()?.to_string(),
                title: v["title"].as_str()?.to_string(),
                duration: v["duration"].as_u64().unwrap_or(0),
                thumbnail: v["thumbnail"].as_str().unwrap_or("").to_string(),
                channel: v["channel"]
                    .as_str()
                    .or(v["uploader"].as_str())
                    .unwrap_or("Unknown")
                    .to_string(),
            })
        })
        .collect();

    Ok(results)
}

#[tauri::command]
async fn get_audio_url(app: tauri::AppHandle, video_id: String) -> Result<AudioInfo, String> {
    let url = format!("https://www.youtube.com/watch?v={}", video_id);

    let output = app
        .shell()
        .sidecar("yt-dlp")
        .map_err(|e| e.to_string())?
        .args([
            &url,
            "--dump-json",
            "--no-warnings",
            "--quiet",
            "-f",
            "bestaudio[ext=m4a]/bestaudio/best",
        ])
        .output()
        .await
        .map_err(|e| e.to_string())?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    let v: serde_json::Value =
        serde_json::from_str(stdout.trim()).map_err(|e| e.to_string())?;

    let audio_url = v["url"]
        .as_str()
        .or_else(|| {
            v["requested_formats"]
                .as_array()?
                .iter()
                .find(|f| f["vcodec"].as_str() == Some("none"))?["url"]
                .as_str()
        })
        .ok_or("Audio URL topilmadi")?
        .to_string();

    Ok(AudioInfo {
        url: audio_url,
        title: v["title"].as_str().unwrap_or("Unknown").to_string(),
        duration: v["duration"].as_u64().unwrap_or(0),
        thumbnail: v["thumbnail"].as_str().unwrap_or("").to_string(),
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            // Tray menu
            let show = MenuItem::with_id(app, "show", "Show", true, None::<&str>)?;
            let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show, &quit])?;

            TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .on_menu_event(|app: &tauri::AppHandle, event| {
                    match event.id.as_ref() {
                        "show" => {
                            if let Some(win) = app.get_webview_window("main") {
                                let _ = win.show();
                                let _ = win.set_focus();
                            }
                        }
                        "quit" => app.exit(0),
                        _ => {}
                    }
                })
                .on_tray_icon_event(|tray: &tauri::tray::TrayIcon, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        if let Some(win) = app.get_webview_window("main") {
                            if win.is_visible().unwrap_or(false) {
                                let _ = win.hide();
                            } else {
                                let _ = win.show();
                                let _ = win.set_focus();
                            }
                        }
                    }
                })
                .build(app)?;

            // Windows specific
            let window = app.get_webview_window("main").unwrap();
            #[cfg(target_os = "windows")]
            {
                let _ = window.set_shadow(false);
                let _ = window.set_decorations(false);
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![search_youtube, get_audio_url])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}