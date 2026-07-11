export enum AgentEventType {
    Started = "started",
    ToolStarted = "toolStarted",
    ToolFinished = "toolFinished",
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
    agent?: string;          // Claude、Codex
    sessionId?: string;
    toolName?: string;
    payload?: unknown;
}