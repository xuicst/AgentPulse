# Changelog

All notable changes to AgentPulse are documented in this file.

## 2.0.0 - 2026-07-15

### Added

- Desktop notification support for Windows, macOS, and graphical Linux desktops.
- Platform-specific VSIX packages for Windows x64, macOS Intel, macOS Apple Silicon, Linux x64, and Linux ARM64.
- Automatic first-run installation for Claude Code and Codex Hooks.
- A VS Code notification fallback when an operating-system notification cannot be delivered.
- English, Simplified Chinese, French, Russian, and Spanish documentation.
- GitHub Actions packaging for all supported platform targets.

### Changed

- Replaced the Windows .NET/Windows App SDK Toast Bridge with a small native Helper.
- macOS uses the built-in Notification Center through `osascript`; Linux uses the graphical session's D-Bus notification service.
- The Windows x64 VSIX is reduced from 27.9 MB in v1.0.0 to approximately 202 KB in v2.0.0.
- Published packages are now platform-targeted. Download the VSIX matching your operating system and CPU architecture.

### Removed

- The legacy C# Toast Bridge, its Windows App SDK payload, and tracked build output.

See the [v2.0.0 release notes](docs/releases/v2.0.0.md) for the user-facing release summary.

## 1.0.0 - 2026-07-11

- First public release with a Windows-specific VSIX package.
