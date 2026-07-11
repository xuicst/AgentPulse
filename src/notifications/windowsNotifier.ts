import * as path from "path";
import { execFile } from "child_process";
import { EventFormatter } from "../core/eventFormatter";
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

        const formatted =
            EventFormatter.format(event);
        const title = formatted.title;
        const message = formatted.message;

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
}