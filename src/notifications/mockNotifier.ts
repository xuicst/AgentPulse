import { AgentEvent } from "../core/events";
import { Logger } from "../core/logger";
import { INotificationService } from "./NotificationService";

export class MockNotifier implements INotificationService {
    public readonly id = "mock";
    public readonly displayName = "Mock Notification Service";

    private readonly logger = Logger.getInstance();

    public async notify(event: AgentEvent): Promise<void> {
        this.logger.info(
            `MockNotificationService received event: [${event.source}] ${event.type}`
        );
    }
}