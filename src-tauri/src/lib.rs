use tauri::Url;
use tauri_plugin_opener::OpenerExt;

/// The studio's own pages: the Vite dev server in `tauri dev`, the bundled assets otherwise
/// (`http://tauri.localhost` on Windows, `tauri://localhost` on Linux and macOS).
fn is_app_url(url: &Url) -> bool {
    if tauri::is_dev() {
        return url.host_str() == Some("localhost");
    }
    url.scheme() == "tauri" || url.host_str() == Some("tauri.localhost")
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        // Also opens `target="_blank"` links in the system browser.
        .plugin(tauri_plugin_opener::init())
        // Plain links (README preview, project URLs) would otherwise replace the studio with that
        // page and leave no way back, so they go to the system browser too.
        .plugin(
            tauri::plugin::Builder::<tauri::Wry>::new("external-links")
                .on_navigation(|webview, url| {
                    if is_app_url(url) {
                        return true;
                    }
                    if matches!(url.scheme(), "http" | "https" | "mailto") {
                        if let Err(err) = webview.opener().open_url(url.as_str(), None::<&str>) {
                            log::warn!("could not open {url}: {err}");
                        }
                    }
                    false
                })
                .build(),
        )
        .setup(|app| {
            // "Check for updates" in the top bar: signed releases from GitHub, then a restart.
            #[cfg(desktop)]
            {
                app.handle().plugin(tauri_plugin_updater::Builder::new().build())?;
                app.handle().plugin(tauri_plugin_process::init())?;
            }
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while building tauri application");
}
