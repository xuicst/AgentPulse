export enum AgentEventType {
    Started = "started",
    Thinking = "thinking",
    WaitingPermission = "waitingPermission",
    WaitingInput = "waitingInput",
    Finished = "finished",
    Error = "error",
    Cancelled = "cancelled"
}

export interface AgentEvent {
    source: string;
    type: AgentEventType;
    timestamp: number;
    payload?: unknown;
}