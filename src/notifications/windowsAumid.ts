import { execFile } from "child_process";

export const AGENTPULSE_AUMID = "AgentPulse";

export function registerWindowsAumid(): Promise<void> {
    const script = `
$ShortcutPath = "$env:APPDATA\\Microsoft\\Windows\\Start Menu\\Programs\\AgentPulse.lnk"
$TargetPath = "$env:WINDIR\\System32\\WindowsPowerShell\\v1.0\\powershell.exe"
$AppId = "${AGENTPULSE_AUMID}"

$Shell = New-Object -ComObject WScript.Shell
$Shortcut = $Shell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = $TargetPath
$Shortcut.Arguments = "-NoProfile"
$Shortcut.Description = "AgentPulse Notification Bridge"
$Shortcut.Save()

$bytes = [System.Text.Encoding]::Unicode.GetBytes($AppId)
$propertyKey = "{9F4C2855-9F79-4B39-A8D0-E1D42DE1D5F3},5"

$shellApp = New-Object -ComObject Shell.Application
$folder = $shellApp.Namespace((Split-Path $ShortcutPath))
$item = $folder.ParseName((Split-Path $ShortcutPath -Leaf))
$item.ExtendedProperty($propertyKey) > $null
`;

    return new Promise((resolve, reject) => {
        execFile(
            "powershell.exe",
            ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", script],
            (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                    return;
                }

                if (stderr) {
                    console.error(stderr);
                }

                resolve();
            }
        );
    });
}