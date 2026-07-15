import { execFile } from "child_process";
import { EventFormatter } from "../core/eventFormatter";
import { AgentEvent } from "../core/events";
import { Logger } from "../core/logger";
import { INotificationService } from "./notificationService";

function escapeAppleScript(value: string): string {
    return value
        .replace(/\\/g, "\\\\")
        .replace(/\"/g, "\\\"")
        .replace(/[\r\n]+/g, " ");
}

export class MacOsNotifier implements INotificationService {
    public readonly id = "macos";
    public readonly displayName = "macOS Notification Center";

    private readonly logger = Logger.getInstance();

    public async notify(event: AgentEvent): Promise<void> {
        const formatted = EventFormatter.format(event);
        const title = escapeAppleScript(formatted.title);
        const message = escapeAppleScript(formatted.message);
        const script =
            `display notification "${message}" with title "${title}"`;

        await new Promise<void>((resolve, reject) => {
            execFile(
                "/usr/bin/osascript",
                ["-e", script],
                error => {
                    if (error) {
                        this.logger.error(
                            `macOS notification failed: ${error.message}`
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
