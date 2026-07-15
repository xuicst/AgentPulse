import * as vscode from "vscode";
import { EventFormatter } from "../core/eventFormatter";
import { AgentEvent } from "../core/events";
import { INotificationService } from "./notificationService";

export class VsCodeNotifier implements INotificationService {
    public readonly id = "vscode";
    public readonly displayName = "VS Code Notification";

    public async notify(event: AgentEvent): Promise<void> {
        const formatted = EventFormatter.format(event);
        await vscode.window.showInformationMessage(
            `${formatted.title}: ${formatted.message}`
        );
    }
}
