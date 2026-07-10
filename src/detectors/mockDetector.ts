import { BaseDetector } from "./base/baseDetector";
import { AgentEventType } from "../core/events";
import { Logger } from "../core/logger";

export class MockDetector extends BaseDetector {
    public readonly id = "mock";
    public readonly displayName = "Mock Detector";

    private readonly logger = Logger.getInstance();

    public async activate(): Promise<void> {
        this.logger.info("MockDetector activated.");

        this.publish(AgentEventType.Started);
    }

    public async deactivate(): Promise<void> {
        this.logger.info("MockDetector deactivated.");
    }
}