use std::{env, error::Error, process::ExitCode};

#[cfg(windows)]
const APP_ID: &str = "AgentPulse.DesktopNotifications";
const APP_NAME: &str = "AgentPulse";

fn main() -> ExitCode {
    let mut args = env::args().skip(1);
    let Some(title) = args.next() else {
        print_usage();
        return ExitCode::from(64);
    };
    let Some(message) = args.next() else {
        print_usage();
        return ExitCode::from(64);
    };

    if args.next().is_some() {
        print_usage();
        return ExitCode::from(64);
    }

    match notify(&title, &message) {
        Ok(()) => ExitCode::SUCCESS,
        Err(error) => {
            eprintln!("AgentPulse notification failed: {error}");
            ExitCode::from(1)
        }
    }
}

fn print_usage() {
    eprintln!("Usage: agentpulse-notify <title> <message>");
}

#[cfg(windows)]
fn notify(title: &str, message: &str) -> Result<(), Box<dyn Error>> {
    use winrt_toast::{Toast, ToastManager};

    register_windows_aumid()?;

    let manager = ToastManager::new(APP_ID);
    let mut toast = Toast::new();
    toast.text1(title).text2(message);
    manager.show(&toast)?;
    Ok(())
}

#[cfg(windows)]
fn register_windows_aumid() -> Result<(), Box<dyn Error>> {
    use std::process::Command;

    let registry_key = format!(r"HKCU\Software\Classes\AppUserModelId\{APP_ID}");
    let query = Command::new("reg.exe")
        .args(["query", &registry_key, "/v", "DisplayName"])
        .output()?;

    if query.status.success() {
        return Ok(());
    }

    // The registration is per-user and does not require administrator rights.
    // winrt-toast's transaction-based helper requests KEY_ALL_ACCESS, which is
    // blocked by some managed Windows policies even for HKCU.
    let status = Command::new("reg.exe")
        .args([
            "add",
            &registry_key,
            "/v",
            "DisplayName",
            "/t",
            "REG_SZ",
            "/d",
            APP_NAME,
            "/f",
        ])
        .output()?;

    if status.status.success() {
        Ok(())
    } else {
        Err(format!(
            "could not register Windows AUMID (reg.exe exited with {})",
            status.status
        )
        .into())
    }
}

#[cfg(target_os = "linux")]
fn notify(title: &str, message: &str) -> Result<(), Box<dyn Error>> {
    use std::collections::HashMap;
    use zbus::{blocking::Connection, zvariant::OwnedValue};

    let connection = Connection::session()?;
    let reply = connection.call_method(
        Some("org.freedesktop.Notifications"),
        "/org/freedesktop/Notifications",
        Some("org.freedesktop.Notifications"),
        "Notify",
        &(
            APP_NAME,
            0_u32,
            "",
            title,
            message,
            Vec::<String>::new(),
            HashMap::<String, OwnedValue>::new(),
            5_000_i32,
        ),
    )?;
    let _: u32 = reply.body().deserialize()?;
    Ok(())
}

#[cfg(not(any(windows, target_os = "linux")))]
fn notify(_title: &str, _message: &str) -> Result<(), Box<dyn Error>> {
    Err("desktop notifications are not supported on this platform".into())
}
