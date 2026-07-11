import { AgentEvent } from "../core/events";
import { Logger } from "../core/logger";
import { INotificationService } from "./notificationService";

export class NotifierManager {
    private readonly logger = Logger.getInstance();
    private readonly services = new Map<string, INotificationService>();

    public register(service: INotificationService): void {
        if (this.services.has(service.id)) {
            throw new Error(`Notification service '${service.id}' already registered.`);
        }

        this.services.set(service.id, service);
        this.logger.info(`Notification service registered: ${service.displayName}`);
    }

    public async notifyAll(event: AgentEvent): Promise<void> {
        for (const service of this.services.values()) {
            try {
                await service.notify(event);
            } catch (error) {
                this.logger.error(
                    `Notification service failed: ${service.displayName} - ${String(error)}`
                );
            }
        }
    }

    public dispose(): void {
        for (const service of this.services.values()) {
            service.dispose?.();
        }

        this.services.clear();
    }

    public count(): number {
        return this.services.size;
    }
}