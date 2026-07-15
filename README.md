# AgentPulse

> A VS Code extension that sends local desktop notifications when Claude Code or Codex needs permission, finishes, fails, or is cancelled.

[English](README.md) | [简体中文](README.zh-CN.md) | [Français](README.fr.md) | [Русский](README.ru.md) | [Español](README.es.md)

AgentPulse helps you stay aware of your AI Agent while you work elsewhere. It processes Hook events locally and never sends their contents over the network.

## How it works

```text
Claude Code / Codex Hook
            ↓
~/.agentpulse/signals/*.signal.json
            ↓
AgentPulse Detector → EventBus → Notification Service → OS desktop notification
```

## Features

- Supports Claude Code and Codex.
- Notifies for permission requests, completion, failures, and cancellations.
- Installs Hooks on first enable; no manual Hook code editing is required.
- Uses a native notification mechanism on each platform and falls back to a VS Code message if it fails.
- Platform-specific packages include only the files needed by that platform.

## Platform support

| Platform | Notification mechanism | Status |
| --- | --- | --- |
| Windows x64 | Bundled native Windows Toast Helper | Verified on Windows |
| macOS Intel / Apple Silicon | Built-in `osascript` and Notification Center | Implemented; awaiting physical Mac verification |
| Ubuntu and other graphical Linux desktops | Bundled Helper using the current graphical session's D-Bus notification service | Implemented; awaiting physical Linux verification |

No separate .NET Runtime or `notify-send` installation is needed. The Hook scripts require the `node` command on `PATH`; it is normally available with Claude Code or Codex.

AgentPulse currently runs in the local VS Code UI host. Local desktop notifications are not yet supported for Remote SSH, Dev Containers, WSL, or Codespaces.

## Installation

### Open VSX (available now)

AgentPulse is currently published on [Open VSX](https://open-vsx.org/extension/xuicst/AgentPulse). Open VSX-compatible editors can install it from their extension view.

AgentPulse is **not yet published to the Visual Studio Marketplace**. Standard VS Code users should install the matching VSIX package for now.

### From a VSIX file

1. Download the VSIX that matches your system and CPU: `win32-x64`, `darwin-x64`, `darwin-arm64`, `linux-x64`, or `linux-arm64`.
2. In VS Code, open the Extensions view and select `...`.
3. Choose **Install from VSIX...** and select the downloaded file.
4. Reload VS Code when prompted.

Or run:

```bash
code --install-extension AgentPulse-<platform>-<version>.vsix
```

`win32-x64` means **64-bit Windows**. `win32` is VS Code's historical platform identifier for Windows; it does not mean a 32-bit-only package.

## First use

1. Install the extension and reload VS Code.
2. At startup, choose **Enable** for each Agent you use, or run the commands below from the Command Palette.
3. AgentPulse copies its Hook scripts to `~/.agentpulse/hooks` and adds only its own Hook entries to the relevant Agent user configuration.
4. Restart Codex and approve the Hook update if Codex asks. Claude Code normally detects the settings update automatically.

No source-code or configuration-file editing is required.

### Command Palette commands

- `AgentPulse: Enable Codex Notifications`
- `AgentPulse: Enable Claude Notifications`
- `AgentPulse: Test Notification`
- `AgentPulse: Show Output`
- `AgentPulse: Restart`

## Configuration

Search for `AgentPulse` in VS Code Settings, or edit `settings.json`. For example, to keep only permission and completion notifications:

```json
{
  "agentPulse.notifications.permission": true,
  "agentPulse.notifications.completed": true,
  "agentPulse.notifications.failed": false,
  "agentPulse.notifications.cancelled": false
}
```

| Setting | Default | Purpose |
| --- | --- | --- |
| `agentPulse.enabled` | `true` | Main switch |
| `agentPulse.debug` | `false` | Enable debug logs |
| `agentPulse.statusBar.enabled` | `true` | Show the status bar item |
| `agentPulse.notifications.desktop` | `true` | Enable OS desktop notifications |
| `agentPulse.notifications.level` | `important` | Notification level: `all`, `important`, or `none` |
| `agentPulse.notifications.permission` | `true` | Notify for permission requests |
| `agentPulse.notifications.completed` | `true` | Notify when work completes |
| `agentPulse.notifications.failed` | `true` | Notify when work fails |
| `agentPulse.notifications.cancelled` | `true` | Notify for cancellation or denial |
| `agentPulse.detectors.codex` | `true` | Enable the Codex detector |
| `agentPulse.detectors.claude` | `true` | Enable the Claude detector |

## Privacy and system impact

- Hook events are written to `~/.agentpulse/signals` and used only for local notifications.
- AgentPulse does not upload Hook data and contains no telemetry or network requests.
- Codex Hook errors are logged to the local extension output, but raw Hook input is not logged.
- On Windows, AgentPulse registers one notification application identifier in the current user's registry. It needs no administrator rights, does not change global notification policy, and does not run a persistent background process.
- On macOS, it uses a built-in system script. On Linux, it uses the current graphical session's notification service. Banner and sound behavior remain under the operating system's notification settings.

## Development and packaging

Prerequisites: Node.js 22+. Building the native Windows or Linux Helper also needs the Rust toolchain. The macOS package uses the built-in notification mechanism and does not need a native Helper.

```bash
npm ci
npm run check
npm run compile
```

Build a platform package:

```bash
npm run package:win32-x64
npm run package:darwin-x64
npm run package:darwin-arm64
npm run package:linux-x64
npm run package:linux-arm64
```

GitHub Actions builds the five platform packages on matching native runners. Generated `.vsix` files, Rust `target` folders, and legacy .NET build output are ignored by Git and are not included in the source repository.

## Contributing

Issues, reproduction steps, and pull requests are welcome. For notification-related changes, please state the operating system, architecture, VS Code version, and Agent version you tested. Real-device macOS and graphical Linux feedback is especially useful.

## License

This project is licensed under the [MIT License](LICENSE).
