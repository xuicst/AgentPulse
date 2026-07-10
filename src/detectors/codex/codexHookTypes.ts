export enum CodexHookEventName {
    SessionStart = "SessionStart",
    PermissionRequest = "PermissionRequest",
    Stop = "Stop"
}

export interface CodexHookPayload {
    session_id: string;
    transcript_path?: string | null;
    cwd: string;
    hook_event_name: CodexHookEventName;
    model?: string;
    turn_id?: string;
    permission_mode?: string;

    tool_name?: string;
    tool_input?: {
        command?: string;
        description?: string | null;
        [key: string]: unknown;
    };

    last_assistant_message?: string | null;
    stop_hook_active?: boolean;
}