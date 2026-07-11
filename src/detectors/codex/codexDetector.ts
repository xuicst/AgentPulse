import * as fs from "fs";
import { Logger } from "../../core/logger";
import { SignalWatcher } from "../../hooks/signalWatcher";
import { SignalFileEvent } from "../../hooks/signalTypes";
import { BaseDetector } from "../base/baseDetector";
import { mapCodexHookToAgentEventType } from "./codexEventMapper";
import { CodexHookPayload } from "./codexHookTypes";

export class CodexDetector extends BaseDetector {
    public readonly id = "codex";
    public readonly displayName = "Codex Detector";

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
            `Activating Codex detector: ${this.signalPath}`
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
            "CodexDetector deactivated."
        );
    }

    private async handleSignal(): Promise<void> {
        try {
            const signal = await this.readSignal();

            if (signal.id === this.lastSignalId) {
                return;
            }

            this.lastSignalId = signal.id;

            const payload =
                signal.payload as CodexHookPayload;

            if (!payload) {
                this.logger.warn(
                    "Invalid Codex hook payload."
                );
                return;
            }

            const eventType =
                mapCodexHookToAgentEventType(payload);

            if (!eventType) {
                this.logger.debug(
                    `Ignored Codex hook: ${signal.event}`
                );
                return;
            }

            this.logger.info(
                `Codex signal received: ${signal.event}`
            );
            
            const event = this.createEvent(eventType, {
                agent: "codex",
                payload
            });
            
            this.publish(event);
        } catch (error) {
            this.logger.warn(
                `Failed to process Codex signal: ${String(error)}`
            );
        }
    }

    private async readSignal(): Promise<SignalFileEvent> {
        for (let i = 0; i < 3; i++) {
            try {
                const content =
                    await fs.promises.readFile(
                        this.signalPath,
                        "utf8"
                    );

                return JSON.parse(
                    content
                ) as SignalFileEvent;
            } catch {
                await new Promise(resolve =>
                    setTimeout(resolve, 20)
                );
            }
        }

        throw new Error(
            "Unable to read Codex signal file."
        );
    }
}