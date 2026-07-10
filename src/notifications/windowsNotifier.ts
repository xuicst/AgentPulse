import * as path from "path";
import { execFile } from "child_process";
import * as vscode from "vscode";
import { AgentEvent, AgentEventType } from "../core/events";
import { Logger } from "../core/logger";
import { INotificationService } from "./NotificationService";

export class WindowsNotifier implements INotificationService {
    public readonly id = "windows";
    public readonly displayName = "Windows App SDK Toast";

    private readonly logger = Logger.getInstance();

    public constructor(
        private readonly extensionPath: string
    ) {}

    public async notify(event: AgentEvent): Promise<void> {
        const executable = path.join(
            this.extensionPath,
            "resources",
            "toast-bridge",
            "AgentPulse.ToastBridge.exe"
        );

        const title = `AgentPulse · ${event.source}`;
        const message = this.getMessage(event);

        await new Promise<void>((resolve, reject) => {
            execFile(executable, [title, message], (error, stdout, stderr) => {
                if (error) {
                    this.logger.error(`Toast Bridge failed: ${error.message}`);
                    reject(error);
                    return;
                }

                if (stderr.trim()) {
                    this.logger.warn(`Toast Bridge stderr: ${stderr.trim()}`);
                }

                this.logger.debug(`Toast Bridge response: ${stdout.trim()}`);
                resolve();
            });
        });
    }

    private getMessage(event: AgentEvent): string {
        switch (event.type) {
            case AgentEventType.WaitingPermission:
                return "需要你的授权。";
            case AgentEventType.WaitingInput:
                return "等待你的输入。";
            case AgentEventType.Finished:
                return "任务已完成。";
            case AgentEventType.Error:
                return "任务执行失败。";
            case AgentEventType.Started:
                return "任务已开始。";
            default:
                return `事件：${event.type}`;
        }
    }
}