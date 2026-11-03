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

/// True when running from an MSIX package, which on this app means the Microsoft Store build. The check
/// is on the running process rather than a build flag, so the same answer holds however it was built.
#[cfg(windows)]
fn is_packaged() -> bool {
    use windows_sys::Win32::Foundation::APPMODEL_ERROR_NO_PACKAGE;
    use windows_sys::Win32::Storage::Packaging::Appx::GetCurrentPackageFullName;

    let mut length = 0u32;
    // Asking only for the name's length: any answer but "no package" means the process has an identity.
    unsafe { GetCurrentPackageFullName(&mut length, std::ptr::null_mut()) != APPMODEL_ERROR_NO_PACKAGE }
}

#[cfg(not(windows))]
fn is_packaged() -> bool {
    false
}

/// Tells the frontend the Store handles updates, so it hides "Check for updates".
#[tauri::command]
fn is_store_package() -> bool {
    is_packaged()
}

/// Windows 11 includes WebView2 and nearly every Windows 10 PC has it, but an MSIX can't install it. On a
/// PC without it the app couldn't open a window and would just fail, so explain what's needed instead.
#[cfg(windows)]
fn stop_if_webview2_missing() {
    use windows_sys::Win32::UI::WindowsAndMessaging::{IDOK, MB_ICONERROR, MB_OKCANCEL, MessageBoxW};

    if tauri::webview_version().is_ok() {
        return;
    }
    let wide = |text: &str| text.encode_utf16().chain(Some(0)).collect::<Vec<u16>>();
    let message = wide(
        "README Templates needs the Microsoft Edge WebView2 Runtime, which isn't installed on this PC.\n\nSelect OK to open Microsoft's download page. Install the runtime, then open the app again.",
    );
    let title = wide("README Templates");
    let choice = unsafe { MessageBoxW(std::ptr::null_mut(), message.as_ptr(), title.as_ptr(), MB_OKCANCEL | MB_ICONERROR) };
    if choice == IDOK {
        let _ = std::process::Command::new("explorer")
            .arg("https://developer.microsoft.com/microsoft-edge/webview2/consumer/")
            .spawn();
    }
    std::process::exit(1);
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    #[cfg(windows)]
    stop_if_webview2_missing();

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![is_store_package])
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
            // "Check for updates" in the top bar: signed releases from GitHub, then a restart. The Store
            // updates its own packages, and a packaged app couldn't run the installer anyway.
            #[cfg(desktop)]
            {
                if !is_packaged() {
                    app.handle().plugin(tauri_plugin_updater::Builder::new().build())?;
                }
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
