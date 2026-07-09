// import { execFile } from "child_process";
// import { AgentEvent, AgentEventType } from "../core/events";
// import { INotifier } from "../types";

// export class WindowsNotifier implements INotifier {
//     public readonly id = "windows";
//     public readonly displayName = "Windows Native Toast";

//     public async notify(event: AgentEvent): Promise<void> {
//         const title = `AgentPulse · ${event.source}`;
//         const message = this.getMessage(event);

//         const script = `
// [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] > $null
// [Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] > $null

// $template = @"
// <toast>
//   <visual>
//     <binding template="ToastGeneric">
//       <text>${this.escapeXml(title)}</text>
//       <text>${this.escapeXml(message)}</text>
//     </binding>
//   </visual>
// </toast>
// "@

// $xml = New-Object Windows.Data.Xml.Dom.XmlDocument
// $xml.LoadXml($template)

// $toast = [Windows.UI.Notifications.ToastNotification]::new($xml)
// $notifier = [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier("Visual Studio Code")
// $notifier.Show($toast)
// `;

//         execFile(
//             "powershell.exe",
//             ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", script],
//             (error, stdout, stderr) => {
//                 if (error) {
//                     console.error("PowerShell toast failed:", error);
//                 }

//                 if (stdout) {
//                     console.log("PowerShell toast stdout:", stdout);
//                 }

//                 if (stderr) {
//                     console.error("PowerShell toast stderr:", stderr);
//                 }
//             }
//             // (error) => {
//             //     if (error) {
//             //         console.error("PowerShell toast failed:", error);
//             //     }
//             // }
//         );
//     }

//     private getMessage(event: AgentEvent): string {
//         switch (event.type) {
//             case AgentEventType.WaitingPermission:
//                 return "需要你的授权。";
//             case AgentEventType.Finished:
//                 return "任务已完成。";
//             case AgentEventType.Error:
//                 return "任务执行失败。";
//             case AgentEventType.WaitingInput:
//                 return "等待你的输入。";
//             case AgentEventType.Started:
//                 return "任务已开始。";
//             default:
//                 return `事件：${event.type}`;
//         }
//     }

//     private escapeXml(value: string): string {
//         return value
//             .replace(/&/g, "&amp;")
//             .replace(/</g, "&lt;")
//             .replace(/>/g, "&gt;")
//             .replace(/"/g, "&quot;")
//             .replace(/'/g, "&apos;");
//     }
// }