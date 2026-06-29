import { AgentEvent } from "../core/events";
import { Logger } from "../core/logger";
import { INotifier } from "../types";

export class MockNotifier implements INotifier {
    public readonly id = "mock";
    public readonly displayName = "Mock Notifier";
    private readonly logger = Logger.getInstance();

    public async notify(event: AgentEvent): Promise<void> {
        this.logger.info(
            `MockNotifier received event: [${event.source}] ${event.type}`
        );
    }
}