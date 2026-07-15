# AgentPulse

> 当 Claude Code 或 Codex 需要授权、完成、失败或取消时，向本机桌面发送通知的 VS Code 扩展。

[English](README.md) | [简体中文](README.zh-CN.md) | [Français](README.fr.md) | [Русский](README.ru.md) | [Español](README.es.md)

AgentPulse 让你离开编辑器或在处理其他工作时，也能及时知道 AI Agent 是否需要你的操作。它只在本机处理 Hook 事件，不会把事件内容发送到网络。

## 工作方式

```text
Claude Code / Codex Hook
            ↓
~/.agentpulse/signals/*.signal.json
            ↓
AgentPulse Detector → EventBus → Notification Service → 操作系统桌面通知
```

## 功能

- 支持 Claude Code 和 Codex。
- 提醒授权请求、任务完成、失败与取消事件。
- 首次启用时自动安装 Hook；不需要手动修改 Hook 代码。
- 按平台使用原生通知方式，通知失败时回退到 VS Code 提示。
- 每个平台包只包含本平台需要的文件。

## 平台支持

| 平台 | 通知方式 | 状态 |
| --- | --- | --- |
| Windows x64 | 随扩展提供的原生 Windows Toast Helper | 已在 Windows 验证 |
| macOS Intel / Apple Silicon | 系统自带 `osascript` / 通知中心 | 已实现，待真实 Mac 验证 |
| Ubuntu 及其他图形化 Linux | 随扩展提供的 Helper，通过当前图形会话的 D-Bus 通知服务 | 已实现，待真实 Linux 验证 |

不需要额外安装 .NET Runtime 或 `notify-send`。Hook 脚本需要系统中可用的 `node` 命令；安装 Claude Code 或 Codex 时通常已具备该条件。

目前扩展只支持本机 VS Code UI Host。Remote SSH、Dev Containers、WSL 和 Codespaces 中的本地桌面通知尚未支持。

## 安装

### 从 Open VSX 安装（当前可用）

AgentPulse 当前已发布到 [Open VSX](https://open-vsx.org/extension/xuicst/AgentPulse)。兼容 Open VSX 的编辑器可在扩展视图中直接安装。

AgentPulse **尚未发布到 Visual Studio Marketplace**。标准版 VS Code 用户目前请安装与系统匹配的 VSIX 包。

### 从 VSIX 安装

1. 下载与你的系统和 CPU 架构匹配的 VSIX：`win32-x64`、`darwin-x64`、`darwin-arm64`、`linux-x64` 或 `linux-arm64`。
2. 在 VS Code 打开 Extensions（扩展）视图，点击右上角 `...`。
3. 选择 **Install from VSIX...**，选中下载的文件。
4. 按提示重新加载 VS Code。

也可以在命令行执行：

```bash
code --install-extension AgentPulse-<platform>-<version>.vsix
```

`win32-x64` 代表 **64 位 Windows**；`win32` 是 VS Code 对 Windows 平台沿用的历史名称，并不表示这是仅支持 32 位的包。

## 首次使用

1. 安装扩展并重新加载 VS Code。
2. 启动时出现提示后，分别为你使用的 Agent 选择 **Enable**；也可从命令面板手动执行下列命令。
3. AgentPulse 会把自己的 Hook 脚本复制到 `~/.agentpulse/hooks`，并仅向相应 Agent 的用户配置加入自己的 Hook 项。
4. 重启 Codex；若 Codex 提示 Hook 变更，按提示确认。Claude Code 通常会自动识别设置更新。

无需编辑任何源代码或配置文件。

### 命令面板

- `AgentPulse: Enable Codex Notifications`
- `AgentPulse: Enable Claude Notifications`
- `AgentPulse: Test Notification`
- `AgentPulse: Show Output`
- `AgentPulse: Restart`

## 配置

在 VS Code Settings 中搜索 `AgentPulse`，或在 `settings.json` 中配置。例如只保留授权与完成提醒：

```json
{
  "agentPulse.notifications.permission": true,
  "agentPulse.notifications.completed": true,
  "agentPulse.notifications.failed": false,
  "agentPulse.notifications.cancelled": false
}
```

| 设置项 | 默认值 | 作用 |
| --- | --- | --- |
| `agentPulse.enabled` | `true` | 总开关 |
| `agentPulse.debug` | `false` | 输出调试日志 |
| `agentPulse.statusBar.enabled` | `true` | 显示状态栏 |
| `agentPulse.notifications.desktop` | `true` | 启用系统桌面通知 |
| `agentPulse.notifications.level` | `important` | 通知级别：`all`、`important`、`none` |
| `agentPulse.notifications.permission` | `true` | 授权请求提醒 |
| `agentPulse.notifications.completed` | `true` | 完成提醒 |
| `agentPulse.notifications.failed` | `true` | 失败提醒 |
| `agentPulse.notifications.cancelled` | `true` | 取消或拒绝提醒 |
| `agentPulse.detectors.codex` | `true` | 启用 Codex 检测器 |
| `agentPulse.detectors.claude` | `true` | 启用 Claude 检测器 |

## 隐私与系统影响

- Hook 事件写入本机的 `~/.agentpulse/signals`，仅用于生成本机通知。
- AgentPulse 不会上传 Hook 数据，也不包含遥测或网络请求。
- Codex Hook 出错时会在本地扩展输出中记录错误，但不会记录 Hook 的原始输入。
- Windows 只在当前用户的注册表中注册一个通知应用标识，无需管理员权限；不会修改全局通知策略、不会常驻后台进程。
- macOS 使用系统自带脚本；Linux 使用当前图形会话的通知服务。是否显示横幅、播放声音由用户的操作系统通知设置决定。

## 开发与打包

前置条件：Node.js 22+；构建 Windows 或 Linux 原生 Helper 时还需要 Rust 工具链。macOS 包只使用系统自带通知方式，不需要编译原生 Helper。

```bash
npm ci
npm run check
npm run compile
```

构建各平台包：

```bash
npm run package:win32-x64
npm run package:darwin-x64
npm run package:darwin-arm64
npm run package:linux-x64
npm run package:linux-arm64
```

GitHub Actions 会在对应的原生 runner 上构建五种平台包。打包输出的 `.vsix`、Rust `target` 目录和旧版 .NET 构建产物均已被 Git 忽略，不会进入源码仓库。

## 参与贡献

欢迎提交 issue、复现步骤和 pull request。涉及通知行为的改动请说明测试的操作系统、架构、VS Code 版本与 Agent 版本。macOS 和图形化 Linux 的实机验证尤其需要社区反馈。

## 许可证

本项目采用 [MIT License](LICENSE)。
