import { execFile } from "child_process";
import { EventFormatter } from "../core/eventFormatter";
import { AgentEvent } from "../core/events";
import { Logger } from "../core/logger";
import { INotificationService } from "./notificationService";

export class LinuxNotifier implements INotificationService {
    public readonly id = "linux";
    public readonly displayName = "Linux Desktop Notifications";

    private readonly logger = Logger.getInstance();

    public async notify(event: AgentEvent): Promise<void> {
        const formatted = EventFormatter.format(event);

        await new Promise<void>((resolve, reject) => {
            execFile(
                "notify-send",
                [
                    "--app-name=AgentPulse",
                    formatted.title,
                    formatted.message
                ],
                error => {
                    if (error) {
                        this.logger.error(
                            `Linux notification failed: ${error.message}`
                        );
                        reject(error);
                        return;
                    }

                    resolve();
                }
            );
        });
    }
}
