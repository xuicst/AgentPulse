import { EventBus } from "../../core/eventBus";
import { AgentEvent, AgentEventType } from "../../core/events";
import { IDetector } from "../../types";

export abstract class BaseDetector implements IDetector {
    public abstract readonly id: string;
    public abstract readonly displayName: string;

    protected readonly eventBus = EventBus.getInstance();

    public abstract activate(): Promise<void>;
    public abstract deactivate(): Promise<void>;

    protected publish(
        type: AgentEventType,
        payload?: unknown
    ): void {
        const event: AgentEvent = {
            source: this.id,
            type,
            timestamp: Date.now(),
            payload
        };

        this.eventBus.publish(event);
    }
}