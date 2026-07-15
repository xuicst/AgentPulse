import { execFile } from "child_process";
import { existsSync } from "fs";
import { join } from "path";
import { EventFormatter } from "../core/eventFormatter";
import { AgentEvent } from "../core/events";
import { Logger } from "../core/logger";
import { INotificationService } from "./notificationService";

const targetByPlatform: Record<string, Record<string, string>> = {
    win32: { x64: "win32-x64" },
    linux: { x64: "linux-x64", arm64: "linux-arm64" }
};

export class NativeHelperNotifier implements INotificationService {
    public readonly id = "native-helper";
    public readonly displayName = "Native Desktop Notifications";

    private readonly logger = Logger.getInstance();

    private constructor(private readonly executable: string) {}

    public static create(
        extensionPath: string,
        platform = process.platform,
        architecture = process.arch
    ): NativeHelperNotifier | undefined {
        const target = targetByPlatform[platform]?.[architecture];
        if (!target) {
            return undefined;
        }

        const extension = platform === "win32" ? ".exe" : "";
        const executable = join(
            extensionPath,
            "resources",
            target,
            `agentpulse-notify${extension}`
        );

        return existsSync(executable)
            ? new NativeHelperNotifier(executable)
            : undefined;
    }

    public async notify(event: AgentEvent): Promise<void> {
        const formatted = EventFormatter.format(event);

        await new Promise<void>((resolve, reject) => {
            execFile(
                this.executable,
                [formatted.title, formatted.message],
                (error, stdout, stderr) => {
                    if (error) {
                        this.logger.error(
                            `Native notification Helper failed: ${error.message}`
                        );
                        reject(error);
                        return;
                    }

                    if (stderr.trim()) {
                        this.logger.warn(
                            `Native notification Helper stderr: ${stderr.trim()}`
                        );
                    }

                    this.logger.debug(
                        `Native notification Helper response: ${stdout.trim()}`
                    );
                    resolve();
                }
            );
        });
    }
}
