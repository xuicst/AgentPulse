import * as fs from "fs";
import { AgentEventType } from "../../core/events";
import { Logger } from "../../core/logger";
import { SignalWatcher } from "../../hooks/signalWatcher";
import { SignalFileEvent } from "../../hooks/signalTypes";
import { BaseDetector } from "../base/baseDetector";
import { mapCodexHookToAgentEvent } from "./codexEventMapper";
import { CodexHookPayload } from "./codexHookTypes";

export class CodexDetector extends BaseDetector {
    public readonly id = "codex";
    public readonly displayName = "Codex Detector";

    private readonly logger = Logger.getInstance();
    private watcher?: SignalWatcher;
    private lastSignalId?: string;

    public constructor(private readonly signalPath: string) {
        super();
    }

    public async activate(): Promise<void> {
        this.logger.info(`Activating Codex detector: ${this.signalPath}`);

        this.watcher = new SignalWatcher(
            this.signalPath,
            () => void this.handleSignal()
        );

        this.watcher.start();

        // 启动时读取一次已有文件
        // await this.handleSignal();
    }

    public async deactivate(): Promise<void> {
        this.watcher?.stop();
        this.watcher = undefined;

        this.logger.info("CodexDetector deactivated.");
    }

    private async handleSignal(): Promise<void> {
        try {
            const content = await fs.promises.readFile(
                this.signalPath,
                "utf8"
            );

            const signal = JSON.parse(content) as SignalFileEvent;

            // 防止同一个文件变更事件被重复处理
            if (signal.id === this.lastSignalId) {
                return;
            }

            this.lastSignalId = signal.id;

            const payload = signal.payload as CodexHookPayload;
            const event = mapCodexHookToAgentEvent(payload);

            this.logger.info(
                `Codex signal received: ${signal.event}`
            );

            this.eventBus.publish(event);
        } catch (error) {
            this.logger.warn(
                `Codex signal temporarily unavailable: ${String(error)}`
            );
        }
        // } catch (error) {
        //     this.logger.error(
        //         `Failed to process Codex signal: ${String(error)}`
        //     );

        //     this.publish(AgentEventType.Error, {
        //         error: String(error)
        //     });
        // }
    }
}