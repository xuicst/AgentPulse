export enum ClaudeHookEventName {
    Stop = "Stop",
    Notification = "Notification",
    PermissionRequest = "PermissionRequest"
}

export interface ClaudeHookPayload {
    event: ClaudeHookEventName;
    sessionId?: string;
    transcriptPath?: string;
    cwd?: string;
    message?: string;
    timestamp?: number;
}