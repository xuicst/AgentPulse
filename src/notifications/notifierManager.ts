import { AgentEvent } from "../core/events";
import { Logger } from "../core/logger";
import { INotifier } from "../types";

export class NotifierManager {
    private readonly logger = Logger.getInstance();
    private readonly notifiers = new Map<string, INotifier>();

    public register(notifier: INotifier): void {
        if (this.notifiers.has(notifier.id)) {
            throw new Error(`Notifier '${notifier.id}' already registered.`);
        }
        this.notifiers.set(notifier.id, notifier);
        this.logger.info(`Notifier registered: ${notifier.displayName}`);
    }

    public async notifyAll(event: AgentEvent): Promise<void> {
        for (const notifier of this.notifiers.values()) {
            try {
                await notifier.notify(event);
            } catch (error) {
                this.logger.error(
                    `Notifier failed: ${notifier.displayName} - ${String(error)}`
                );
            }
        }
    }

    public dispose(): void {
        for (const notifier of this.notifiers.values()) {
            notifier.dispose?.();
        }
        this.notifiers.clear();
    }
}