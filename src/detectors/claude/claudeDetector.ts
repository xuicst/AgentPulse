import * as fs from "fs";
import { Logger } from "../../core/logger";
import { SignalWatcher } from "../../hooks/signalWatcher";
import { SignalFileEvent } from "../../hooks/signalTypes";
import { BaseDetector } from "../base/baseDetector";
import { mapClaudeHookToAgentEventType } from "./claudeEventMapper";
import { ClaudeHookPayload } from "./claudeHookTypes";

export class ClaudeDetector extends BaseDetector {
    public readonly id = "claude";
    public readonly displayName = "Claude Detector";

    private readonly logger = Logger.getInstance();
    private watcher?: SignalWatcher;
    private lastSignalId?: string;
    private lastChecksum?: string;

    public constructor(private readonly signalPath: string) {
        super();
    }

    public async activate(): Promise<void> {
        this.logger.info(`Activating Claude detector: ${this.signalPath}`);

        this.watcher = new SignalWatcher(
            this.signalPath,
            () => {
                void this.handleSignal();
            }
        );

        this.watcher.start();

        // 启动时读取一次已有文件
        // await this.handleSignal();
    }

    public async deactivate(): Promise<void> {
        this.watcher?.stop();
        this.watcher = undefined;

        this.logger.info("ClaudeDetector deactivated.");
    }

    private async handleSignal(): Promise<void> {
        try {
            const content = await fs.promises.readFile(
                this.signalPath,
                "utf8"
            );

            const signal = JSON.parse(content) as SignalFileEvent;
            const checksum = JSON.stringify(signal);

            if (checksum === this.lastChecksum) {
                return;
            }

            this.lastChecksum = checksum;

            // 防止同一个文件变更事件被重复处理
            if (signal.id === this.lastSignalId) {
                return;
            }

            this.lastSignalId = signal.id;

            const payload = signal.payload as ClaudeHookPayload;

            const eventType = mapClaudeHookToAgentEventType(payload);

            this.logger.info(
                `hook_event_name = ${payload.hook_event_name}`
            );

            if (!eventType) {
                this.logger.info(
                    `Ignored Claude hook: ${payload.hook_event_name}`
                );
                return;
            }
            
            this.logger.info(
                `Claude hook received: ${payload.hook_event_name}`
            );      
            
            this.publish(eventType, payload);
        } catch (error) {
            this.logger.warn(
                `Claude signal temporarily unavailable: ${String(error)}`
            );
        }
    }
}