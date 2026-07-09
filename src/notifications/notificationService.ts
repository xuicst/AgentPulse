import { AgentEvent } from "../core/events";

export interface INotificationService {
    readonly id: string;
    readonly displayName: string;

    notify(event: AgentEvent): Promise<void>;
    dispose?(): void;
}