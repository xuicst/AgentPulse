import { EventBus } from "../../core/eventBus";
import { AgentEvent, AgentEventType } from "../../core/events";
import { IDetector } from "../../types";

export abstract class BaseDetector implements IDetector {
    public abstract readonly id: string;
    public abstract readonly displayName: string;

    protected readonly eventBus = EventBus.getInstance();

    public abstract activate(): Promise<void>;

    public abstract deactivate(): Promise<void>;

    protected publish(event: AgentEvent): void {
        this.eventBus.publish(event);
    }

    protected createEvent(
        type: AgentEventType,
        payload: {
            agent?: string;
            sessionId?: string;
            toolName?: string;
            payload?: unknown;
        } = {}
    ): AgentEvent {
        return {
            source: this.id,
            agent: payload.agent ?? this.id,
            type,
            timestamp: Date.now(),
            sessionId: payload.sessionId,
            toolName: payload.toolName,
            payload: payload.payload
        };
    }
}