import { AgentEvent } from "../core/events";
import { Logger } from "../core/logger";
import { INotificationService } from "./notificationService";

export class FallbackNotifier implements INotificationService {
    public readonly id: string;
    public readonly displayName: string;

    private readonly logger = Logger.getInstance();

    public constructor(
        private readonly primary: INotificationService,
        private readonly fallback: INotificationService
    ) {
        this.id = primary.id;
        this.displayName = primary.displayName;
    }

    public async notify(event: AgentEvent): Promise<void> {
        try {
            await this.primary.notify(event);
        } catch (error) {
            this.logger.warn(
                `${this.primary.displayName} failed; using ${this.fallback.displayName}: ${String(error)}`
            );
            await this.fallback.notify(event);
        }
    }

    public dispose(): void {
        this.primary.dispose?.();
        this.fallback.dispose?.();
    }
}
