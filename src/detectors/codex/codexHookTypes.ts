export enum CodexHookEventName {
    SessionStart = "SessionStart",
    PermissionRequest = "PermissionRequest",
    Stop = "Stop",

    PreToolUse = "PreToolUse",
    PostToolUse = "PostToolUse",

    UserPromptSubmit = "UserPromptSubmit",

    PreCompact = "PreCompact",
    PostCompact = "PostCompact",

    SubagentStart = "SubagentStart",
    SubagentStop = "SubagentStop"
}

export interface CodexHookPayload {
    // Common
    session_id: string;
    cwd: string;
    hook_event_name: CodexHookEventName;

    transcript_path?: string | null;
    model?: string;
    turn_id?: string;
    permission_mode?: string;

    // Permission / Tool
    tool_name?: string;
    tool_input?: Record<string, unknown>;

    // Stop
    last_assistant_message?: string | null;

    // Future hooks
    [key: string]: unknown;
}