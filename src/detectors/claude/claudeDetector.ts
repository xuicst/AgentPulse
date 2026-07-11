import * as fs from "fs";
import { Logger } from "../../core/logger";
import { AgentEventType } from "../../core/events";
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

    public constructor(
        private readonly signalPath: string
    ) {
        super();
    }

    public async activate(): Promise<void> {
        this.logger.info(
            `Activating Claude detector: ${this.signalPath}`
        );

        this.watcher = new SignalWatcher(
            this.signalPath,
            () => void this.handleSignal()
        );

        this.watcher.start();
    }

    public async deactivate(): Promise<void> {
        this.watcher?.stop();
        this.watcher = undefined;

        this.logger.info(
            "ClaudeDetector deactivated."
        );
    }

    private async handleSignal(): Promise<void> {
        try {
            const content = await fs.promises.readFile(
                this.signalPath,
                "utf8"
            );

            const signal =
                JSON.parse(content) as SignalFileEvent;

            if (signal.id === this.lastSignalId) {
                return;
            }

            this.lastSignalId = signal.id;

            const payload =
                signal.payload as ClaudeHookPayload;

            const eventType =
                mapClaudeHookToAgentEventType(payload);

            if (!eventType) {
                this.logger.debug(
                    `Ignored Claude hook: ${payload.hook_event_name}`
                );
                return;
            }

            this.logger.info(
                `Claude hook received: ${payload.hook_event_name}`
            );

            const event = this.createEvent(eventType, {
                agent: "claude",
                sessionId: payload.session_id,
                toolName: payload.tool_name,
                payload
            });

            this.publish(event);
        } catch (error) {
            this.logger.warn(
                `Claude signal temporarily unavailable: ${String(
                    error
                )}`
            );
        }
    }
}